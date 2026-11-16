const express = require('express');

const app = express();
const PORT = 3000;

//connect postgres
const pool = require('./db');

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Welcome to your Event Planner!' });
});


// Test PostgreSQL connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'Database connection successful!',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});