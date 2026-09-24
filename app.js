const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection
// NOTE: Developer uses env vars — they don't know WHERE the DB is yet.
// That's YOUR job as DevOps to provide these.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is alive' });
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(result.rows);
});

// Create a task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.status(201).json(result.rows[0]);
});

// Mark task as done
app.patch('/tasks/:id', async (req, res) => {
  const result = await pool.query(
    'UPDATE tasks SET done = true WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  res.json(result.rows[0]);
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
