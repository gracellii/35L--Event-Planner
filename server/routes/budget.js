
const express = require('express')
const router = express.Router()
const pool = require('../db')

// Temporary event ID, matching the existing Supply List setup
const TEST_EVENT_ID = 1

// Get the event budget and all budget participants
router.get('/', async (req, res) => {
  try {
    const budgetResult = await pool.query(
      `SELECT total_amount
       FROM event_budgets
       WHERE event_id = $1`,
      [TEST_EVENT_ID]
    )

    const participantsResult = await pool.query(
      `SELECT *
       FROM budget_participants
       WHERE event_id = $1
       ORDER BY id ASC`,
      [TEST_EVENT_ID]
    )

    res.json({
      totalAmount: budgetResult.rows.length > 0
        ? Number(budgetResult.rows[0].total_amount)
        : 0,
      participants: participantsResult.rows
    })
  } catch (error) {
    console.error('Error retrieving budget:', error)
    res.status(500).json({
      message: 'Failed to retrieve budget.'
    })
  }
})

// Save or update the total budget
router.put('/', async (req, res) => {
  try {
    const { totalAmount } = req.body || {}

    // Reject non-numeric, negative, or invalid amounts
    if (
      totalAmount === '' ||
      totalAmount === null ||
      totalAmount === undefined ||
      typeof totalAmount === 'boolean' ||
      !Number.isFinite(Number(totalAmount)) ||
      Number(totalAmount) < 0
    ) {
      return res.status(400).json({
        message: 'Budget must be a valid, non-negative number.'
      })
    }

    const amount = Number(totalAmount)

    // Store the new budget, or update the existing one
    const result = await pool.query(
      `INSERT INTO event_budgets (event_id, total_amount)
       VALUES ($1, $2)
       ON CONFLICT (event_id)
       DO UPDATE SET
         total_amount = EXCLUDED.total_amount,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [TEST_EVENT_ID, amount]
    )

    res.json({
      message: 'Budget saved successfully.',
      totalAmount: Number(result.rows[0].total_amount)
    })
  } catch (error) {
    console.error('Error saving budget:', error)
    res.status(500).json({
      message: 'Failed to save budget.'
    })
  }
})

// Add a participant to the budget split
router.post('/participants', async (req, res) => {
  try {
    const { name } = req.body || {}

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Participant name is required.'
      })
    }

    const result = await pool.query(
      `INSERT INTO budget_participants (event_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [TEST_EVENT_ID, name.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding budget participant:', error)
    res.status(500).json({
      message: 'Failed to add participant.'
    })
  }
})

// Include or exclude a participant from the split
router.put('/participants/:id', async (req, res) => {
  try {
    const participantId = Number(req.params.id)
    const { included } = req.body || {}

    if (!Number.isInteger(participantId) || participantId < 1) {
      return res.status(400).json({
        message: 'Invalid participant ID.'
      })
    }

    if (typeof included !== 'boolean') {
      return res.status(400).json({
        message: 'Included must be true or false.'
      })
    }

    const result = await pool.query(
      `UPDATE budget_participants
       SET included = $1
       WHERE id = $2 AND event_id = $3
       RETURNING *`,
      [included, participantId, TEST_EVENT_ID]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Participant not found.'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating budget participant:', error)
    res.status(500).json({
      message: 'Failed to update participant.'
    })
  }
})

// Delete a participant
router.delete('/participants/:id', async (req, res) => {
  try {
    const participantId = Number(req.params.id)

    if (!Number.isInteger(participantId) || participantId < 1) {
      return res.status(400).json({
        message: 'Invalid participant ID.'
      })
    }

    const result = await pool.query(
      `DELETE FROM budget_participants
       WHERE id = $1 AND event_id = $2
       RETURNING *`,
      [participantId, TEST_EVENT_ID]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Participant not found.'
      })
    }

    res.json({
      message: 'Participant deleted successfully.',
      participant: result.rows[0]
    })
  } catch (error) {
    console.error('Error deleting budget participant:', error)
    res.status(500).json({
      message: 'Failed to delete participant.'
    })
  }
})

module.exports = router
