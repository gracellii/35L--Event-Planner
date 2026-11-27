// Story 3: invite event collaborators
const express = require('express')
const router = express.Router()
const pool = require('../db')
const { requireAuth } = require('../middleware/auth')

// The user's role in an event ('host', 'collaborator', ...), or null if not a member
async function roleIn(eventId, userId) {
  const result = await pool.query(
    'SELECT role FROM event_members WHERE event_id = $1 AND user_id = $2',
    [eventId, userId]
  )
  return result.rows.length ? result.rows[0].role : null
}

// POST: the host invites a registered user by email
router.post('/events/:id/invites', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id)
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!Number.isInteger(eventId)) return res.status(404).json({ message: 'Event not found.' })
  if (!email) return res.status(400).json({ message: 'Enter an email address.' })

  try {
    const role = await roleIn(eventId, req.user.id)
    if (!role) return res.status(404).json({ message: 'Event not found.' })
    if (role !== 'host') return res.status(403).json({ message: 'Only the host can send invites.' })

    const found = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email])
    if (found.rows.length === 0) {
      return res.status(400).json({ message: 'No account uses that email.' })
    }
    const inviteeId = found.rows[0].id

    if (await roleIn(eventId, inviteeId)) {
      return res.status(409).json({ message: 'That person is already on the planning team.' })
    }

    const created = await pool.query(
      `INSERT INTO invitations (event_id, invitee_id, invited_by)
       VALUES ($1, $2, $3) RETURNING id`,
      [eventId, inviteeId, req.user.id]
    )
    res.status(201).json({ invite: { id: created.rows[0].id, email, status: 'pending' } })
  } catch (error) {
    // 23505 = unique violation: the one_pending_invite index caught a duplicate
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An invite is already pending for that person.' })
    }
    console.error('Error sending invite:', error)
    res.status(500).json({ message: 'Failed to send invite.' })
  }
})

// GET: an event's planning team and pending invites (members only)
router.get('/events/:id/invites', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id)
  if (!Number.isInteger(eventId)) return res.status(404).json({ message: 'Event not found.' })
  try {
    if (!(await roleIn(eventId, req.user.id))) {
      return res.status(404).json({ message: 'Event not found.' })
    }
    const members = await pool.query(
      `SELECT u.email, m.role FROM event_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.event_id = $1 ORDER BY m.added_at`,
      [eventId]
    )
    const pending = await pool.query(
      `SELECT i.id, u.email FROM invitations i
       JOIN users u ON u.id = i.invitee_id
       WHERE i.event_id = $1 AND i.status = 'pending' ORDER BY i.created_at`,
      [eventId]
    )
    res.json({ members: members.rows, pending: pending.rows })
  } catch (error) {
    console.error('Error retrieving team:', error)
    res.status(500).json({ message: 'Failed to retrieve the planning team.' })
  }
})

// GET: invites waiting for the logged-in user
router.get('/invites', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, e.name AS "eventName", u.email AS "fromEmail"
       FROM invitations i
       JOIN events e ON e.id = i.event_id
       JOIN users u ON u.id = i.invited_by
       WHERE i.invitee_id = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [req.user.id]
    )
    res.json({ invites: result.rows })
  } catch (error) {
    console.error('Error retrieving invites:', error)
    res.status(500).json({ message: 'Failed to retrieve invites.' })
  }
})

// POST: accept an invite. Both steps happen together or not at all
router.post('/invites/:inviteId/accept', requireAuth, async (req, res) => {
  const inviteId = Number(req.params.inviteId)
  if (!Number.isInteger(inviteId)) return res.status(404).json({ message: 'Invite not found.' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const updated = await client.query(
      `UPDATE invitations SET status = 'accepted'
       WHERE id = $1 AND invitee_id = $2 AND status = 'pending'
       RETURNING event_id`,
      [inviteId, req.user.id]
    )
    if (updated.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Invite not found.' })
    }
    const eventId = updated.rows[0].event_id
    await client.query(
      `INSERT INTO event_members (event_id, user_id, role)
       VALUES ($1, $2, 'collaborator') ON CONFLICT DO NOTHING`,
      [eventId, req.user.id]
    )
    await client.query('COMMIT')
    res.json({ eventId })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error accepting invite:', error)
    res.status(500).json({ message: 'Failed to accept invite.' })
  } finally {
    client.release()
  }
})

// POST: decline an invite
router.post('/invites/:inviteId/decline', requireAuth, async (req, res) => {
  const inviteId = Number(req.params.inviteId)
  if (!Number.isInteger(inviteId)) return res.status(404).json({ message: 'Invite not found.' })
  try {
    const result = await pool.query(
      `UPDATE invitations SET status = 'declined'
       WHERE id = $1 AND invitee_id = $2 AND status = 'pending' RETURNING id`,
      [inviteId, req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Invite not found.' })
    res.json({ ok: true })
  } catch (error) {
    console.error('Error declining invite:', error)
    res.status(500).json({ message: 'Failed to decline invite.' })
  }
})

module.exports = router