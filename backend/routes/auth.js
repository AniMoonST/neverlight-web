const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });
  if (username.length < 3) return res.status(400).json({ error: 'Никнейм минимум 3 символа' });
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const uuid = uuidv4();
    await db.execute(
      'INSERT INTO users (username, email, password_hash, uuid) VALUES (?, ?, ?, ?)',
      [username, email || null, hash, uuid]
    );
    res.json({ success: true, message: 'Аккаунт создан' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Имя или email уже заняты' });
    console.error(e);
    res.status(500).json({ error: 'Ошибка сервера' });
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
