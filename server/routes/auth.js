// Story 1 (Ananya): register, log in, log out.
//   POST /api/auth/register   { email, password, name? }
//   POST /api/auth/login      { email, password }
//   POST /api/auth/logout
//   GET  /api/auth/me         who is logged in

const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()

const pool = require('../db')
const { validateRegistration, validateLogin, hasErrors } = require('../validation')
const { requireAuth, issueSession, clearSession } = require('../middleware/auth')

const publicUser = ({ id, email, name, created_at }) => ({ id, email, name, createdAt: created_at })

const DUPLICATE_EMAIL = {
  message: 'An account with this email already exists.',
  fields: { email: 'An account with this email already exists. Try logging in instead.' },
}

router.post('/register', async (req, res) => {
  const { value, errors } = validateRegistration(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [value.email])
    if (existing.rows.length > 0) return res.status(409).json(DUPLICATE_EMAIL)

    const passwordHash = await bcrypt.hash(value.password, 10)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [value.email, passwordHash, value.name || null]
    )
    // Registration only creates the account; the user logs in next.
    res.status(201).json({ message: 'Account created! You can now log in.', user: publicUser(result.rows[0]) })
  } catch (error) {
    // 23505 = unique constraint, e.g. two sign-ups with the same email at once
    if (error.code === '23505') return res.status(409).json(DUPLICATE_EMAIL)
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Failed to create account.' })
  }
})

router.post('/login', async (req, res) => {
  const { value, errors } = validateLogin(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at, password_hash FROM users WHERE email = $1',
      [value.email]
    )
    const user = result.rows[0]
    // Same message whether the email or the password is wrong, so nobody can
    // use the login form to find out which emails have accounts.
    const ok = user && user.password_hash && (await bcrypt.compare(value.password, user.password_hash))
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password.' })

    issueSession(res, user.id)
    res.json({ user: publicUser(user) })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Failed to log in.' })
  }
})

router.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ message: 'Logged out.' })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

module.exports = router
