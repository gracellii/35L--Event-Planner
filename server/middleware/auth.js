// Login sessions (Story 1)
// The login token is kept in an httpOnly cookie so browser JS can't read it.
// Use requireAuth on any route that needs a logged-in user (sets req.user).

require('dotenv').config()
const jwt = require('jsonwebtoken')
const pool = require('../db')

const SECRET = process.env.JWT_SECRET || 'dev-secret'
const COOKIE = 'ep_session'
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}

function issueSession(res, userId) {
  const token = jwt.sign({ sub: userId }, SECRET, { expiresIn: '7d' })
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function clearSession(res) {
  res.clearCookie(COOKIE, cookieOptions)
}

async function requireAuth(req, res, next) {
  let userId
  try {
    userId = jwt.verify(req.cookies[COOKIE], SECRET).sub
  } catch {
    return res.status(401).json({ message: 'Please log in to continue.' })
  }

  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [userId])
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Please log in to continue.' })
    }
    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Error checking login:', error)
    res.status(500).json({ message: 'Failed to check login.' })
  }
}

module.exports = { requireAuth, issueSession, clearSession }
