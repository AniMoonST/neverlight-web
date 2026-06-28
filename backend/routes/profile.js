const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Профиль по никнейму
router.get('/:username', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, role, balance_rubins, skin_url, cosmetics, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    if (!rows.length) return res.status(404).json({ error: 'Пользователь не найден' });
    const u = rows[0];
    const [[{ posts }]] = await db.execute('SELECT COUNT(*) as posts FROM forum_posts WHERE user_id = ?', [u.id]);
    const [[{ topics }]] = await db.execute('SELECT COUNT(*) as topics FROM forum_topics WHERE user_id = ?', [u.id]);
    res.json({ ...u, posts_count: posts, topics_count: topics });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

// Обновить косметику
router.put('/me/cosmetics', auth, async (req, res) => {
  try {
    const { cosmetics } = req.body;
    await db.execute('UPDATE users SET cosmetics = ? WHERE id = ?', [JSON.stringify(cosmetics), req.user.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

module.exports = router;
