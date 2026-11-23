
const express = require('express')
const router = express.Router()

// Connect to PostgreSQL
const pool = require('../db')

// Temporary event ID, following your Supply List convention
const TEST_EVENT_ID = 1

// GET: Retrieve all planning tasks for the event
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM planning_tasks
       WHERE event_id = $1
       ORDER BY created_at ASC, id ASC`,
      [TEST_EVENT_ID]
    )

    res.json(result.rows)

  } catch (error) {
    console.error('Error retrieving planning tasks:', error)
    res.status(500).json({
      message: 'Failed to retrieve planning tasks.'
    })
  }
})

// POST: Create a new planning task
router.post('/', async (req, res) => {
  try {
    const { title } = req.body

    // Validate task title
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required.'
      })
    }

    const result = await pool.query(
      `INSERT INTO planning_tasks
       (event_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [
        TEST_EVENT_ID,
        title.trim()
      ]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.error('Error adding planning task:', error)
    res.status(500).json({
      message: 'Failed to add planning task.'
    })
  }
})


// PUT: Update a planning task's title or completion status
router.put('/:id', async (req, res) => {
  try {
    const taskId = Number(req.params.id)
    const { title, completed } = req.body || {}

    if (!Number.isInteger(taskId) || taskId < 1) {
      return res.status(400).json({
        message: 'Invalid task ID.'
      })
    }

    const updates = []
    const values = []

    // Update title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Task title is required.'
        })
      }

      values.push(title.trim())
      updates.push(`title = $${values.length}`)
    }

    // Update completion status if provided
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          message: 'Completed must be true or false.'
        })
      }

      values.push(completed)
      updates.push(`completed = $${values.length}`)
    }

    // Check that something was provided to update
    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided to update.'
      })
    }

    values.push(taskId, TEST_EVENT_ID)

    const result = await pool.query(
      `UPDATE planning_tasks
       SET ${updates.join(', ')}
       WHERE id = $${values.length - 1}
       AND event_id = $${values.length}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Planning task not found.'
      })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error('Error updating planning task:', error)
    res.status(500).json({
      message: 'Failed to update planning task.'
    })
  }
})


// DELETE: Remove a planning task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = Number(req.params.id)

    if (!Number.isInteger(taskId) || taskId < 1) {
      return res.status(400).json({
        message: 'Invalid task ID.'
      })
    }

    const result = await pool.query(
      `DELETE FROM planning_tasks
       WHERE id = $1 AND event_id = $2
       RETURNING *`,
      [taskId, TEST_EVENT_ID]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Planning task not found.'
      })
    }

    res.json({
      message: 'Planning task deleted successfully.',
      task: result.rows[0]
    })

  } catch (error) {
    console.error('Error deleting planning task:', error)
    res.status(500).json({
      message: 'Failed to delete planning task.'
    })
  }
})

// Export router
module.exports = router
