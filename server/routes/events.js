// Story 2 (Ananya): event workspaces. Every route requires login, and a user
// only sees events they are a member of, so events never mix.
//   GET  /api/events        the logged-in user's events
//   POST /api/events        create an event { name, date?, startTime?, endTime?, location?, description? }
//   GET  /api/events/:id    one event (404 if it isn't yours)
//
// Teammates: to protect your own event routes, use canAccessEvent() below.

const express = require('express')
const router = express.Router()

const pool = require('../db')
const { validateEvent, hasErrors } = require('../validation')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

// Columns returned to the client, with dates/times as plain strings so time
// zones never shift the day ("2027-04-17", "19:00").
const EVENT_COLUMNS = `
  e.id,
  e.name,
  e.description,
  e.location,
  to_char(e.event_date, 'YYYY-MM-DD') AS date,
  to_char(e.start_time, 'HH24:MI') AS "startTime",
  to_char(e.end_time, 'HH24:MI') AS "endTime",
  e.user_id AS "ownerId",
  e.created_at AS "createdAt",
  m.role
`

// Returns the user's role in the event ('host', 'co-host', 'collaborator'),
// or null if they don't have access. Teammates can reuse this.
async function canAccessEvent(eventId, userId) {
  const result = await pool.query(
    'SELECT role FROM event_members WHERE event_id = $1 AND user_id = $2',
    [eventId, userId]
  )
  return result.rows[0]?.role ?? null
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${EVENT_COLUMNS}
       FROM events e
       JOIN event_members m ON m.event_id = e.id AND m.user_id = $1
       ORDER BY e.event_date ASC NULLS LAST, e.start_time ASC NULLS LAST, e.created_at DESC`,
      [req.user.id]
    )
    res.json({ events: result.rows })
  } catch (error) {
    console.error('Error retrieving events:', error)
    res.status(500).json({ message: 'Failed to retrieve events.' })
  }
})

router.post('/', async (req, res) => {
  const { value, errors } = validateEvent(req.body)
  if (hasErrors(errors)) {
    return res.status(400).json({ message: 'Please fix the errors below.', fields: errors })
  }

  // Create the event and make its creator the host in one transaction, so an
  // event can never exist without a host.
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
    const result = await client.query(
      `SELECT ${EVENT_COLUMNS}
       FROM events e JOIN event_members m ON m.event_id = e.id AND m.user_id = $2
       WHERE e.id = $1`,
      [eventId, req.user.id]
    )
    await client.query('COMMIT')
    res.status(201).json({ event: result.rows[0] })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating event:', error)
    res.status(500).json({ message: 'Failed to create event.' })
  } finally {
    client.release()
  }
})

router.get('/:id', async (req, res) => {
  const eventId = Number(req.params.id)
  // 404 (not 403) for anything that isn't yours, so nobody can probe which IDs exist
  if (!Number.isInteger(eventId) || eventId < 1) return res.status(404).json({ message: 'Event not found.' })

  try {
    const result = await pool.query(
      `SELECT ${EVENT_COLUMNS}
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
module.exports.canAccessEvent = canAccessEvent
