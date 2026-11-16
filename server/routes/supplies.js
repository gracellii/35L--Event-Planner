const express = require('express')
const router = express.Router()

//connect to postgres
const pool = require('../db')

//TEST: Temporary event ID for testing
const TEST_EVENT_ID = 1

//get all supplies (for test event)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM supplies WHERE event_id = $1 ORDER BY id ASC',
      [TEST_EVENT_ID]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error retrieving supplies:', error)
    res.status(500).json({
      message: 'Failed to retrieve supplies.'
    })
  }
})

//create a new supply
router.post('/', async (req, res) => {
  try {
    const { name, quantity, category } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Supply name is required.'
      })
    }
    const parsedQuantity = Number(quantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer.'
      })
    }

    const result = await pool.query(
      `INSERT INTO supplies (event_id, name, quantity, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        TEST_EVENT_ID,
        name.trim(),
        parsedQuantity,
        category || 'Equipment'
      ]
    )
    res.status(201).json(result.rows[0])
  }catch (error) {
    console.error('Error adding supply:', error)
    res.status(500).json({
      message: 'Failed to add supply.'
    })
  }
})

//update supply name, quantity, completion, or notes
router.put('/:id', async (req, res) => {
  try {
    const supplyId = Number(req.params.id)
    const { completed, notes, name, quantity } = req.body || {}

    if (!Number.isInteger(supplyId) || supplyId < 1) {
      return res.status(400).json({
        message: 'Invalid supply ID.'
      })
    }

    const updates = []
    const values = []
    //error handling
        if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
            return res.status(400).json({
            message: 'Completed must be true or false.'
            })
        }
        values.push(completed)
        updates.push(`completed = $${values.length}`)
        }

        if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
            message: 'Supply name is required.'
            })
        }
        values.push(name.trim())
        updates.push(`name = $${values.length}`)
        }

        if (quantity !== undefined) {
        const parsedQuantity = Number(quantity)
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
            message: 'Quantity must be a positive integer.'
            })
        }
        values.push(parsedQuantity)
        updates.push(`quantity = $${values.length}`)
        }

        if (notes !== undefined) {
        if (typeof notes !== 'string') {
            return res.status(400).json({
            message: 'Notes must be a string.'
            })
        }

        values.push(notes)
        updates.push(`notes = $${values.length}`)
        }

    //if nothing to update
    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided to update.'
      })
    }
    values.push(supplyId, TEST_EVENT_ID)

    //update database
    const result = await pool.query(
      `UPDATE supplies
       SET ${updates.join(', ')}
       WHERE id = $${values.length - 1}
       AND event_id = $${values.length}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Supply not found.'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating supply:', error)
    res.status(500).json({
      message: 'Failed to update supply.'
    })
  }
})

//delete supply
router.delete('/:id', async (req, res) => {
  try {
    const supplyId = Number(req.params.id)

    if (!Number.isInteger(supplyId) || supplyId < 1) {
      return res.status(400).json({
        message: 'Invalid supply ID.'
      })
    }

    //delete from database
    const result = await pool.query(
      `DELETE FROM supplies
       WHERE id = $1 AND event_id = $2
       RETURNING *`,
      [supplyId, TEST_EVENT_ID]
    )
    //error handling
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Supply not found.'
      })
    }
    
    res.json({
      message: 'Supply deleted successfully.',
      supply: result.rows[0]
    })
  } catch (error) {
    console.error('Error deleting supply:', error)
    res.status(500).json({
      message: 'Failed to delete supply.'
    })
  }
})

module.exports = router