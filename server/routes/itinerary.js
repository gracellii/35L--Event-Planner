
const express = require('express')
const router = express.Router()

// Connect to PostgreSQL
const pool = require('../db')

// Temporary event ID, following the Supply List convention
const TEST_EVENT_ID = 1

// GET: Retrieve all itinerary activities for the test event
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM itinerary
       WHERE event_id = $1
       ORDER BY activity_time ASC, id ASC`,
      [TEST_EVENT_ID]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error retrieving itinerary:', error)
    res.status(500).json({
      message: 'Failed to retrieve itinerary.'
    })
  }
})


// POST: Create a new itinerary activity
router.post('/', async (req, res) => {
  try {
    const { title, activity_time, description } = req.body

    // Validate title
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'Activity title is required.'
      })
    }

    // Validate time
    if (
      typeof activity_time !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(activity_time)
    ) {
      return res.status(400).json({
        message: 'A valid activity time is required.'
      })
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== 'string'
    ) {
      return res.status(400).json({
        message: 'Description must be text.'
      })
    }

    const result = await pool.query(
      `INSERT INTO itinerary
       (event_id, title, activity_time, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        TEST_EVENT_ID,
        title.trim(),
        activity_time,
        description?.trim() || ''
      ]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.error('Error adding itinerary activity:', error)
    res.status(500).json({
      message: 'Failed to add itinerary activity.'
    })
  }
})


// PUT: Update an existing itinerary activity
router.put('/:id', async (req, res) => {
  try {
    const activityId = Number(req.params.id)
    const { title, activity_time, description } = req.body || {}

    if (!Number.isInteger(activityId) || activityId < 1) {
      return res.status(400).json({
        message: 'Invalid activity ID.'
      })
    }

    const updates = []
    const values = []

    // Update title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Activity title is required.'
        })
      }

      values.push(title.trim())
      updates.push(`title = $${values.length}`)
    }

    // Update time if provided
    if (activity_time !== undefined) {
      if (
        typeof activity_time !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(activity_time)
      ) {
        return res.status(400).json({
          message: 'A valid activity time is required.'
        })
      }

      values.push(activity_time)
      updates.push(`activity_time = $${values.length}`)
    }

    // Update description if provided
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          message: 'Description must be text.'
        })
      }

      values.push(description.trim())
      updates.push(`description = $${values.length}`)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided to update.'
      })
    }

    values.push(activityId, TEST_EVENT_ID)

    const result = await pool.query(
      `UPDATE itinerary
       SET ${updates.join(', ')}
       WHERE id = $${values.length - 1}
       AND event_id = $${values.length}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Itinerary activity not found.'
      })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error('Error updating itinerary:', error)
    res.status(500).json({
      message: 'Failed to update itinerary activity.'
    })
  }
})


// DELETE: Remove an itinerary activity
router.delete('/:id', async (req, res) => {
  try {
    const activityId = Number(req.params.id)

    if (!Number.isInteger(activityId) || activityId < 1) {
      return res.status(400).json({
        message: 'Invalid activity ID.'
      })
    }

    const result = await pool.query(
      `DELETE FROM itinerary
       WHERE id = $1 AND event_id = $2
       RETURNING *`,
      [activityId, TEST_EVENT_ID]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Itinerary activity not found.'
      })
    }

    res.json({
      message: 'Activity deleted successfully.',
      activity: result.rows[0]
    })

  } catch (error) {
    console.error('Error deleting itinerary activity:', error)
    res.status(500).json({
      message: 'Failed to delete itinerary activity.'
    })
  }
})

// Export router
module.exports = router
