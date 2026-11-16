const express = require('express')
const router = express.Router()

//connect to PostgreSQL
const pool = require('../db')

// Temporary event ID, for testing
const TEST_EVENT_ID = 1

//TEST: Get all categories for the test event
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories
       WHERE event_id = $1
       ORDER BY id ASC`,
      [TEST_EVENT_ID]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error retrieving categories:', error)
    res.status(500).json({
      message: 'Failed to retrieve categories.'
    })
  }
})

//add new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Category name is required.'
      })
    }
    const trimmedName = name.trim()
    const result = await pool.query(
      `INSERT INTO categories (event_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [TEST_EVENT_ID, trimmedName]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    //error code 23505 means a constraint was violated
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'This category already exists.'
      })
    }
    console.error('Error adding category:', error)
    res.status(500).json({
      message: 'Failed to add category.'
    })
  }
})

//delete category
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id

    //find the category
    const categoryResult = await pool.query(
      `SELECT * FROM categories
       WHERE id = $1 AND event_id = $2`,
      [categoryId, TEST_EVENT_ID]
    )

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Category not found.'
      })
    }

    const categoryName = categoryResult.rows[0].name

    //check if its empty
    //if any supplies use the category, not empty, dont delete
    const suppliesResult = await pool.query(
      `SELECT COUNT(*) FROM supplies
       WHERE event_id = $1 AND category = $2`,
      [TEST_EVENT_ID, categoryName]
    )

    if (Number(suppliesResult.rows[0].count) > 0) {
      return res.status(409).json({
        message: 'Cannot delete a category that still contains supplies.'
      })
    }

    //delete the category
    await pool.query(
      `DELETE FROM categories
       WHERE id = $1 AND event_id = $2`,
      [categoryId, TEST_EVENT_ID]
    )

    res.json({
      message: 'Category deleted successfully.'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({
      message: 'Failed to delete category.'
    })
  }
})


module.exports = router