const express = require('express');
const cookieParser = require('cookie-parser')
const suppliesRouter = require('./routes/supplies')
const categoriesRouter = require('./routes/categories')
const itineraryRouter = require('./routes/itinerary')
const planningTasksRouter = require('./routes/planningTasks')
const budgetRouter = require('./routes/budget')
const authRouter = require('./routes/auth')
const eventsRouter = require('./routes/events')
const invitationsRouter = require('./routes/invitations')

const app = express();
const PORT = 3000;

//connect postgres
const pool = require('./db');

app.use(express.json());
app.use(cookieParser()) // reads the login cookie
app.use('/api/supplies', suppliesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/itinerary', itineraryRouter)
app.use('/api/planning-tasks', planningTasksRouter)
app.use('/api/budget', budgetRouter)
app.use('/api/auth', authRouter) // Story 1: register, log in, log out
app.use('/api/events', eventsRouter) // Story 2: event workspaces
app.use('/api', invitationsRouter) // Story 3: invite event collaborators

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Welcome to your Event Planner!' });
});

//TEST: Test PostgreSQL connection
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