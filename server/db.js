// Load environment variables
require('dotenv').config()

// Import PostgreSQL connection pool
const { Pool } = require('pg')

// Create connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
})

// Export pool so other files can use it
module.exports = pool