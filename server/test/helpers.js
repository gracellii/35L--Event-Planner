// Test setup for Stories 1 and 2.
// Tests use a separate database (create it once with: createdb event_planner_test)
// and wipe it before each test, so they never touch your real data.

const path = require('node:path')
const fs = require('node:fs')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true })
process.env.PGDATABASE = process.env.TEST_PGDATABASE || 'event_planner_test'
if (!process.env.PGDATABASE.endsWith('_test')) {
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

// Empty database with schema.sql + the migration applied
async function resetDb() {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public')
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'))
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_accounts_and_workspaces.sql'), 'utf8'))
}

// Signs up and logs in; the returned agent keeps the login cookie
async function loggedInAgent(app, email = 'host@example.com', password = 'party2026') {
  const agent = request.agent(app)
  await agent.post('/api/auth/register').send({ email, password, name: 'Host' }).expect(201)
  await agent.post('/api/auth/login').send({ email, password }).expect(200)
  return agent
}

module.exports = { makeApp, resetDb, loggedInAgent, pool }
