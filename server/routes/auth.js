// Story 1: register, log in, log out
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const pool = require('../db')
const { validateRegistration, validateLogin, hasErrors } = require('../validation')
const { requireAuth, issueSession, clearSession } = require('../middleware/auth')

const duplicateEmail = {
  message: 'An account with this email already exists.',
  fields: { email: 'An account with this email already exists.' },
}

// POST: Create an account
router.post('/register', async (req, res) => {
  const { value, errors } = validateRegistration(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [value.email])
    if (existing.rows.length > 0) return res.status(409).json(duplicateEmail)

    const passwordHash = await bcrypt.hash(value.password, 10)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [value.email, passwordHash, value.name || null]
    )
    res.status(201).json({ message: 'Account created! You can now log in.', user: result.rows[0] })
  } catch (error) {
    // 23505 = email already taken (two sign-ups at the same moment)
    if (error.code === '23505') return res.status(409).json(duplicateEmail)
    console.error('Error creating account:', error)
    res.status(500).json({ message: 'Failed to create account.' })
  }
})

// POST: Log in
router.post('/login', async (req, res) => {
  const { value, errors } = validateLogin(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  try {
    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [value.email]
    )
    const user = result.rows[0]
    const correct = user?.password_hash && (await bcrypt.compare(value.password, user.password_hash))

    // Same message for a wrong email or a wrong password
    if (!correct) return res.status(401).json({ message: 'Incorrect email or password.' })

    issueSession(res, user.id)
    res.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Failed to log in.' })
  }
})

// POST: Log out
router.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ message: 'Logged out.' })
})

// GET: The logged-in user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
