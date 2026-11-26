// Test setup for Stories 1 & 2 (Ananya).
// Tests run against a SEPARATE database so they never touch your real data:
//   createdb event_planner_test        (one time)
// It uses the same login details as your .env, with the database name swapped.
// Override the name with TEST_PGDATABASE in .env if you want a different one.

const path = require('node:path')
const fs = require('node:fs')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true })
process.env.PGDATABASE = process.env.TEST_PGDATABASE || 'event_planner_test'
if (!process.env.PGDATABASE.endsWith('_test')) {
  // Tests wipe their database, so never let them point at a real one
  throw new Error(`Test database name must end in "_test" (got "${process.env.PGDATABASE}")`)
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

const express = require('express')
const cookieParser = require('cookie-parser')
const request = require('supertest')
const pool = require('../db')

function makeApp() {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/auth', require('../routes/auth'))
  app.use('/api/events', require('../routes/events'))
  return app
}

// Fresh, empty tables before each test: schema.sql, then the migration.
async function resetDb() {
  // Only ever runs on the separate test database (see top of file)
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public')
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'))
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_accounts_and_workspaces.sql'), 'utf8'))
}

// Registers + logs in a user; returns an agent that keeps the login cookie.
async function loggedInAgent(app, email = 'host@example.com', password = 'party2026') {
  const agent = request.agent(app)
  await agent.post('/api/auth/register').send({ email, password, name: 'Host' }).expect(201)
  await agent.post('/api/auth/login').send({ email, password }).expect(200)
  return agent
}

module.exports = { makeApp, resetDb, loggedInAgent, pool }
