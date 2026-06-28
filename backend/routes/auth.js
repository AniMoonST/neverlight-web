const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../mailer');

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) return res.status(400).json({ error: 'Заполните все поля' });
  if (username.length < 3) return res.status(400).json({ error: 'Никнейм минимум 3 символа' });
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return res.status(400).json({ error: 'Неверный формат email' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    const code = genCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await db.execute(
      'INSERT INTO users (username, email, password_hash, uuid, verify_code, verify_code_expires) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hash, uuid, code, codeExpires]
    );
    await sendVerificationEmail(email, username, code);
    res.json({ success: true, message: 'Код отправлен на почту' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Никнейм или email уже заняты' });
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подтверждение email
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Нет данных' });
  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND verify_code = ? AND verify_code_expires > NOW()',
      [email, code]
    );
    if (!rows.length) return res.status(400).json({ error: 'Неверный или просроченный код' });
    await db.execute(
      'UPDATE users SET email_verified = 1, verify_code = NULL, verify_code_expires = NULL WHERE email = ?',
      [email]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Повторная отправка кода
router.post('/resend-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Нет email' });
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND email_verified = 0', [email]);
    if (!rows.length) return res.status(400).json({ error: 'Пользователь не найден или уже подтверждён' });
    const code = genCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await db.execute('UPDATE users SET verify_code = ?, verify_code_expires = ? WHERE email = ?', [code, expires, email]);
    await sendVerificationEmail(email, rows[0].username, code);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });
  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Пользователь не найден' });
    const user = rows[0];
    if (!await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email не подтверждён', needVerify: true, email: user.email });
    }
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, uuid: user.uuid },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, uuid: user.uuid, balance_rubins: user.balance_rubins }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запрос сброса пароля
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Введите email' });
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.json({ success: true }); // не раскрываем что email не найден
    const code = genCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await db.execute('UPDATE users SET verify_code = ?, verify_code_expires = ? WHERE email = ?', [code, expires, email]);
    await sendPasswordResetEmail(email, rows[0].username, code);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Сброс пароля
router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) return res.status(400).json({ error: 'Нет данных' });
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND verify_code = ? AND verify_code_expires > NOW()',
      [email, code]
    );
    if (!rows.length) return res.status(400).json({ error: 'Неверный или просроченный код' });
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'UPDATE users SET password_hash = ?, verify_code = NULL, verify_code_expires = NULL WHERE email = ?',
      [hash, email]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Текущий пользователь
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const [rows] = await db.execute(
    'SELECT id, username, email, uuid, balance_rubins, skin_url, cosmetics, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Не найден' });
  res.json(rows[0]);
});

module.exports = router;
