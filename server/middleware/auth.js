// Login sessions (Story 1, Ananya).
// A signed token (JWT) is stored in an httpOnly cookie, so browser JavaScript
// can't read it. Logging out clears the cookie.
//
// Other routes can require login with:
//   const { requireAuth } = require('../middleware/auth')
//   router.use(requireAuth)          // then req.user = { id, email, name }

require('dotenv').config()
const jwt = require('jsonwebtoken')
const pool = require('../db')

const COOKIE_NAME = 'ep_session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in .env (see .env.example)')
  }
  if (!getSecret.warned) {
    console.warn('JWT_SECRET is not set in .env, so a dev-only secret is being used.')
    getSecret.warned = true
  }
  return 'dev-only-secret-change-me'
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

function issueSession(res, userId) {
  const token = jwt.sign({ sub: userId }, getSecret(), { expiresIn: Math.floor(MAX_AGE_MS / 1000) })
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: MAX_AGE_MS })
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions())
}

// Rejects the request with 401 unless the session cookie is valid.
async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' })

  let userId
  try {
    userId = jwt.verify(token, getSecret()).sub
  } catch {
    clearSession(res)
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }

  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    )
    if (result.rows.length === 0) {
      clearSession(res)
      return res.status(401).json({ message: 'Please log in to continue.' })
    }
    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Error checking session:', error)
    res.status(500).json({ message: 'Failed to check your session.' })
  }
}

module.exports = { requireAuth, issueSession, clearSession, COOKIE_NAME }
