const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Все категории со счётчиками
router.get('/categories', async (req, res) => {
  try {
    const [cats] = await db.execute(`
      SELECT c.*,
        COUNT(DISTINCT t.id) as topic_count,
        COUNT(p.id) as post_count,
        MAX(t.updated_at) as last_activity
      FROM forum_categories c
      LEFT JOIN forum_topics t ON t.category_id = c.id
      LEFT JOIN forum_posts p ON p.topic_id = t.id
      GROUP BY c.id
      ORDER BY c.display_order
    `);
    res.json(cats);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

// Темы категории
router.get('/categories/:id/topics', async (req, res) => {
  try {
    const [topics] = await db.execute(`
      SELECT t.*, u.username,
        COUNT(p.id) as reply_count
      FROM forum_topics t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN forum_posts p ON p.topic_id = t.id
      WHERE t.category_id = ?
      GROUP BY t.id
      ORDER BY t.is_pinned DESC, t.updated_at DESC
    `, [req.params.id]);
    res.json(topics);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

// Одна тема с постами
router.get('/topics/:id', async (req, res) => {
  try {
    await db.execute('UPDATE forum_topics SET views = views + 1 WHERE id = ?', [req.params.id]);
    const [[topic]] = await db.execute(`
      SELECT t.*, u.username, c.name as category_name, c.id as category_id
      FROM forum_topics t
      JOIN users u ON u.id = t.user_id
      JOIN forum_categories c ON c.id = t.category_id
      WHERE t.id = ?
    `, [req.params.id]);
    if (!topic) return res.status(404).json({ error: 'Тема не найдена' });
    const [posts] = await db.execute(`
      SELECT p.*, u.username, u.role, u.created_at as user_since
      FROM forum_posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.topic_id = ?
      ORDER BY p.created_at
    `, [req.params.id]);
    res.json({ topic, posts });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

// Создать тему
router.post('/categories/:id/topics', auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Заполните все поля' });
  try {
    const [r] = await db.execute(
      'INSERT INTO forum_topics (category_id, user_id, title) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, title]
    );
    await db.execute(
      'INSERT INTO forum_posts (topic_id, user_id, content) VALUES (?, ?, ?)',
      [r.insertId, req.user.id, content]
    );
    res.json({ success: true, topic_id: r.insertId });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

// Ответить в теме
router.post('/topics/:id/posts', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Пустой ответ' });
  try {
    await db.execute(
      'INSERT INTO forum_posts (topic_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    await db.execute('UPDATE forum_topics SET updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Ошибка' }); }
});

module.exports = router;
