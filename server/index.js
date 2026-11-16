const express = require('express');

const app = express();
const PORT = 3000;

//connect postgres
const pool = require('./db');

//TEST: Temporary event ID for testing
const TEST_EVENT_ID = 1

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Welcome to your Event Planner!' });
});


//TEST: Test PostgreSQL connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'Database connection successful!',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed.'
    });
  }
});
//TEST: Get supplies for the test event
app.get('/api/supplies', async (req, res) => {
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
//TEST: Get all categories for the test event
app.get('/api/categories', async (req, res) => {
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
app.post('/api/categories', async (req, res) => {
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

//add new supply (to database)
app.post('/api/supplies', async (req, res) => {
  try {
    const { name, quantity, category } = req.body

    //error check supply name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Supply name is required.'
      })
    }

    //error check quantity
    const parsedQuantity = Number(quantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer.'
      })
    }

    //insert new supply to database
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
    //respond with new supply
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding supply:', error)

    res.status(500).json({
      message: 'Failed to add supply.'
    })
  }
})

//Update supply's completion status, notes
app.put('/api/supplies/:id', async (req, res) => {
  try {
    const supplyId = Number(req.params.id)
    const { completed, notes } = req.body || {}

    //validate ID
    if (!Number.isInteger(supplyId) || supplyId < 1) {
      return res.status(400).json({
        message: 'Invalid supply ID.'
      })
    }

    const updates = []
    const values = []

    //toggle completion status
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          message: 'Completed must be true or false.'
        })
      }

      values.push(completed)
      updates.push(`completed = $${values.length}`)
    }

    //update notes
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return res.status(400).json({
          message: 'Notes must be a string.'
        })
      }

      values.push(notes)
      updates.push(`notes = $${values.length}`)
    }

    // Make sure there is something to update
    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided to update.'
      })
    }

    // Add the supply ID and event ID to the query parameters
    values.push(supplyId, TEST_EVENT_ID)

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

//delete supply (from database)
app.delete('/api/supplies/:id', async (req, res) => {
  try {
    const supplyId = Number(req.params.id)

    // Validate the ID
    if (!Number.isInteger(supplyId) || supplyId < 1) {
      return res.status(400).json({
        message: 'Invalid supply ID.'
      })
    }

    const result = await pool.query(
      `DELETE FROM supplies
       WHERE id = $1 AND event_id = $2
       RETURNING *`,
      [supplyId, TEST_EVENT_ID]
    )

    // Check whether the supply exists
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

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});