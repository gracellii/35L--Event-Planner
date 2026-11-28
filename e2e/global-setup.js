// Runs once before the E2E tests: empties the E2E database and creates the tables.
const path = require('node:path')
const fs = require('node:fs')
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true })
const { Client } = require('pg')

module.exports = async function globalSetup() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: 'event_planner_e2e',
  })
  await client.connect()
  try {
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public')
    await client.query(fs.readFileSync(path.join(__dirname, '..', 'server', 'schema.sql'), 'utf8'))
    await client.query(
      fs.readFileSync(path.join(__dirname, '..', 'server', 'migrations', '001_accounts_and_workspaces.sql'), 'utf8')
    )
  } finally {
    await client.end()
  }
}