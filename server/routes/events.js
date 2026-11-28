// Story 2: event workspaces
// Users only see events they are a member of (event_members table).
const express = require('express')
const router = express.Router()
const pool = require('../db')
const { validateEvent, hasErrors } = require('../validation')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

// Dates and times are sent as plain text ("2027-04-17", "19:00") so the
// browser's time zone can't shift the day
const EVENT_FIELDS = `
  e.id, e.name, e.description, e.location,
  to_char(e.event_date, 'YYYY-MM-DD') AS date,
  to_char(e.start_time, 'HH24:MI') AS "startTime",
  to_char(e.end_time, 'HH24:MI') AS "endTime",
  m.role
`


const MAX_SEARCH_LENGTH = 100

// % and _ are wildcards in ILIKE, so escape them to search for them literally
function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&')
}

// GET: All of the user's events, soonest first.
// Optional ?q= keeps only events whose name, location or description contains it.
router.get('/', async (req, res) => {
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (search.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({ message: `Search can be at most ${MAX_SEARCH_LENGTH} characters.` })
  }

  const params = [req.user.id]
  let searchFilter = ''
  if (search) {
    params.push(`%${escapeLike(search)}%`)
    searchFilter = 'WHERE e.name ILIKE $2 OR e.location ILIKE $2 OR e.description ILIKE $2'
  }

  try {
    const result = await pool.query(
      `SELECT ${EVENT_FIELDS}
       FROM events e
       JOIN event_members m ON m.event_id = e.id AND m.user_id = $1
       ${searchFilter}
       ORDER BY e.event_date ASC NULLS LAST, e.start_time ASC NULLS LAST, e.created_at DESC`,
      params
    )
    res.json({ events: result.rows })
  } catch (error) {
    console.error('Error retrieving events:', error)
    res.status(500).json({ message: 'Failed to retrieve events.' })
  }
})

// POST: Create an event, with the creator as host
router.post('/', async (req, res) => {
  const { value, errors } = validateEvent(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  // Both inserts happen together or not at all, so every event has a host
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const created = await client.query(
      `INSERT INTO events (user_id, name, description, location, event_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [req.user.id, value.name, value.description, value.location, value.date, value.startTime, value.endTime]
    )
    const eventId = created.rows[0].id
    await client.query(
      `INSERT INTO event_members (event_id, user_id, role) VALUES ($1, $2, 'host')`,
      [eventId, req.user.id]
    )
    await client.query('COMMIT')
    res.status(201).json({ event: { id: eventId, ...value, role: 'host' } })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating event:', error)
    res.status(500).json({ message: 'Failed to create event.' })
  } finally {
    client.release()
  }
})

// GET: One event (404 if it doesn't exist or isn't the user's)
router.get('/:id', async (req, res) => {
  const eventId = Number(req.params.id)
  if (!Number.isInteger(eventId)) return res.status(404).json({ message: 'Event not found.' })

  try {
    const result = await pool.query(
      `SELECT ${EVENT_FIELDS}
       FROM events e
       JOIN event_members m ON m.event_id = e.id AND m.user_id = $2
       WHERE e.id = $1`,
      [eventId, req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found.' })
    res.json({ event: result.rows[0] })
  } catch (error) {
    console.error('Error retrieving event:', error)
    res.status(500).json({ message: 'Failed to retrieve event.' })
  }
})

module.exports = router
