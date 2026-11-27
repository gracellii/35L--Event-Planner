// Story 11: export an event as an .ics file for Google / Apple Calendar
const express = require('express')
const router = express.Router()
const pool = require('../db')
const { requireAuth } = require('../middleware/auth')

// .ics text must escape backslashes, commas, semicolons and newlines
function esc(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n')
}

// "2026-11-27" + "16:07" -> "20261127T160700"
function stamp(date, time) {
  return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00'
}

router.get('/events/:id/calendar.ics', requireAuth, async (req, res) => {
  const eventId = Number(req.params.id)
  if (!Number.isInteger(eventId)) return res.status(404).json({ message: 'Event not found.' })

  try {
    // Members only: the JOIN returns nothing if the user isn't on the event
    const result = await pool.query(
      `SELECT e.id, e.name, e.description, e.location,
              to_char(e.event_date, 'YYYY-MM-DD') AS date,
              to_char(e.start_time, 'HH24:MI') AS "startTime",
              to_char(e.end_time, 'HH24:MI') AS "endTime"
       FROM events e
       JOIN event_members m ON m.event_id = e.id AND m.user_id = $2
       WHERE e.id = $1`,
      [eventId, req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found.' })

    const ev = result.rows[0]
    if (!ev.date) {
      return res.status(400).json({ message: 'Add a date to this event before exporting it.' })
    }

    // With times: a timed event. Without: an all-day event
    let when
    if (ev.startTime) {
      const end = ev.endTime || ev.startTime
      when = [`DTSTART:${stamp(ev.date, ev.startTime)}`, `DTEND:${stamp(ev.date, end)}`]
    } else {
      when = [`DTSTART;VALUE=DATE:${ev.date.replace(/-/g, '')}`]
    }

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//35L Event Planner//EN',
      'BEGIN:VEVENT',
      `UID:event-${ev.id}@event-planner`,
      `DTSTAMP:${now}`,
      ...when,
      `SUMMARY:${esc(ev.name)}`,
      ev.location ? `LOCATION:${esc(ev.location)}` : null,
      ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean)

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="event-${ev.id}.ics"`)
    res.send(lines.join('\r\n') + '\r\n')
  } catch (error) {
    console.error('Error exporting event:', error)
    res.status(500).json({ message: 'Failed to export event.' })
  }
})

module.exports = router