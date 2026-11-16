//supply list page
import { useEffect, useState } from 'react'
import './SupplyList.css'

function SupplyList() {
  //store categories 
  const [categories, setCategories] = useState([])

  //store all supplies in one array
  const [supplies, setSupplies] = useState([])
  //connect to databse, load supplies and categories when page opens
  useEffect(() => {
    // Load supplies
    fetch('/api/supplies')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load supplies')
        }
        return response.json()
      })
      .then(data => {
        setSupplies(data.map(supply => ({
          ...supply,
          notes: supply.notes ?? '',
          savedNotes: supply.notes ?? ''
        })))
      })
      .catch(error => {
        console.error('Error loading supplies:', error)
      })

    // Load categories
    fetch('/api/categories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load categories')
        }
        return response.json()
      })
      .then(data => { setCategories(data)
        if (data.length > 0) {
          setCategory(data[0].name)
        }
      })
      .catch(error => {
        console.error('Error loading categories:', error)
      })
  }, [])

  //new supply form state
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('Equipment')

  //add new category state
  const [newCategory, setNewCategory] = useState('')

  //exand/collapse supply notes
  const [expandedSupplyId, setExpandedSupplyId] = useState(null)
  //edit an existing supply
    //track which supply is currently being edited
    const [editingSupplyId, setEditingSupplyId] = useState(null)

    //store temporary name and quantity while editing
    const [editName, setEditName] = useState('')
    const [editQuantity, setEditQuantity] = useState(1)

  //add supply to overall list
  async function addSupply(e) {
    e.preventDefault()

    if (!name.trim()) return

    try {
      const response = await fetch('/api/supplies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          quantity: Number(quantity),
          category
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add supply')
      }

      const newSupply = await response.json()

      // Add the database result to React state
      setSupplies(prevSupplies => [ ...prevSupplies,
        {
        ...newSupply,
        notes: newSupply.notes ?? '',
        savedNotes: newSupply.notes ?? ''
        }
      ])
      // Reset the form
      setName('')
      setQuantity(1)

    } catch (error) {
      console.error('Error adding supply:', error)
    }
  }

  //add new category
  async function addCategory(event) {
    event.preventDefault()

    const trimmedCategory = newCategory.trim()
    if (!trimmedCategory) return

    //check for duplicate category name
    const alreadyExists = categories.some(existing =>
      existing.name.toLowerCase() === trimmedCategory.toLowerCase()
    )

    if (alreadyExists) return
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: trimmedCategory
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add category')
      }

      const newCategoryData = await response.json()

      //update state with the category from database
      setCategories(prevCategories => [
        ...prevCategories,
        newCategoryData
      ])
      setCategory(newCategoryData.name)

      //clear input
      setNewCategory('')

    } catch (error) {
      console.error('Error adding category:', error)
      alert(error.message)
    }
  }
  

  //mark supply as done
  async function toggleSupply(id) {
    //find supply to update
    const supply = supplies.find(supply => supply.id === id)
    if (!supply) return

    //toggle completion status
    const updatedCompleted = !supply.completed

    try {
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: updatedCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update supply')
      }

      const updatedSupply = await response.json()

      //update state with database result
      setSupplies(prevSupplies =>
        prevSupplies.map(supply =>
          supply.id === id
            ? {
                ...updatedSupply,
                notes: updatedSupply.notes ?? '',
                savedNotes: updatedSupply.notes ?? ''
              }
            : supply
        )
      )
    } catch (error) {
      console.error('Error updating supply:', error)
    }
  }

  //add/edit notes for a supply
  function updateSupplyNotes(id, notes) {
    setSupplies(
      supplies.map(supply =>
        supply.id === id
          ? { ...supply, notes: notes }
          : supply
      )
    )
  }

  //save notes (to database)
  async function saveSupplyNotes(id) {
    const supply = supplies.find(supply => supply.id === id)

    if (!supply) return

    try {
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: supply.notes ?? ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      const updatedSupply = await response.json()

      //update state with the database result
      setSupplies(prevSupplies =>
        prevSupplies.map(supply =>
          supply.id === id
            ? {
                ...updatedSupply,
                notes: updatedSupply.notes ?? '',
                savedNotes: updatedSupply.notes ?? ''
              }
            : supply
        )
      )

      //collapse notes section after saving
      setExpandedSupplyId(null)

    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  //start editing a supply
  function startEditing(supply) {
    setEditingSupplyId(supply.id)
    setEditName(supply.name)
    setEditQuantity(supply.quantity)
  }

  //cancel editing
  function cancelEditing() {
    setEditingSupplyId(null)
    setEditName('')
    setEditQuantity(1)
  }

  //save edited supply to database
  async function saveSupplyEdit(id) {
    if (!editName.trim()) {
      alert('Supply name cannot be empty.')
      return
    }

    const parsedQuantity = Number(editQuantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      alert('Quantity must be a positive integer.')
      return
    }

    try {
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editName.trim(),
          quantity: parsedQuantity
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update supply')
      }

      const updatedSupply = await response.json()

      setSupplies(prevSupplies =>
        prevSupplies.map(supply =>
          supply.id === id
            ? {
                ...supply,
                ...updatedSupply
              }
            : supply
        )
      )

      //exit edit mode
      cancelEditing()

    } catch (error) {
      console.error('Error editing supply:', error)
      alert('Failed to save supply changes.')
    }
  }

  //delete supply (from databse)
  async function deleteSupply(id) {
    try {
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete supply')
      }

      //remove supply from React state
      setSupplies(prevSupplies =>
        prevSupplies.filter(supply => supply.id !== id)
      )

      //close notes section 
      if (expandedSupplyId === id) {
        setExpandedSupplyId(null)
      }

    } catch (error) {
      console.error('Error deleting supply:', error)
    }
  }

  //delete category
  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Delete the "${category.name}" category?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to delete category.')
        return
      }

      // Remove the deleted category from the frontend
      setCategories(prevCategories =>
        prevCategories.filter(item => item.id !== category.id)
      )
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category.')
    }
  }


  //overall progress
  const completedCount = supplies.filter(
    supply => supply.completed
  ).length

  return (
    <div className="page-container supply-page">
      <div className="supply-header">
        <div>
          <h1>Supply List</h1>
        </div>

        <p className="supply-count">
          {completedCount} / {supplies.length} ready
        </p>
      </div>

      {/* progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: supplies.length === 0
              ? '0%'
              : `${(completedCount / supplies.length) * 100}%`
          }}
        />
      </div>

      {/* add a supply */}
      <form className="add-supply-form" onSubmit={addSupply}>
        <h2>Add a Supply</h2>

        <div className="form-fields">
          <label>
            Item
            <input
              type="text"
              placeholder="e.g. Napkins"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={event => setQuantity(event.target.value)}
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
            >
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
            </select>
          </label>

          <button type="submit" className="add-button">
            Add
          </button>
        </div>
      </form>

      {/* create a category */}
      <form className="add-category-form" onSubmit={addCategory}>
        <input
          type="text"
          placeholder="Create new category"
          value={newCategory}
          onChange={event => setNewCategory(event.target.value)}
        />

        <button type="submit" className="category-button">
          + Add category
        </button>
      </form>

      {/* group by category */}
     <div className="supply-list">
      {categories.map(cat => {
        const categorySupplies = supplies.filter(
          supply => supply.category === cat.name
        )

        const categoryCompleted = categorySupplies.filter(
          supply => supply.completed
        ).length

        return (
          <section className="supply-category" key={cat.id}>
            <div className="category-header">
              <h2>{cat.name}</h2>

              <div className="category-header-actions">
                <span>
                  {categoryCompleted} / {categorySupplies.length}
                </span>

                {categorySupplies.length === 0 && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteCategory(cat)}
                    title="Delete category"
                    aria-label={`Delete ${cat.name} category`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {categorySupplies.length === 0 ? (
              <p className="empty-category">
                No supplies yet
              </p>
            ) : (
              categorySupplies.map(supply => {
                const isExpanded = expandedSupplyId === supply.id
                const hasUnsavedChanges = (supply.notes ?? '') !== (supply.savedNotes ?? '')
                return (
                  <div className="supply-entry" key={supply.id}>
                    <div className="supply-item">
                      <input
                        type="checkbox"
                        checked={supply.completed}
                        onChange={() => toggleSupply(supply.id)}
                      />

                      {editingSupplyId === supply.id ? (
                        <>
                          <input
                            type="text"
                            className="edit-supply-name"
                            value={editName}
                            onChange={event => setEditName(event.target.value)}
                            placeholder="Supply name"
                          />

                          <input
                            type="number"
                            className="edit-supply-quantity"
                            min="1"
                            value={editQuantity}
                            onChange={event => setEditQuantity(event.target.value)}
                          />

                          <button
                            type="button"
                            className="save-edit-button"
                            onClick={() => saveSupplyEdit(supply.id)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="cancel-edit-button"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* clicking the name expands/collapses notes */}
                          <button
                            type="button"
                            className="supply-name-toggle"
                            onClick={() =>
                              setExpandedSupplyId(isExpanded ? null : supply.id)
                            }
                            aria-expanded={isExpanded}
                            aria-controls={`supply-notes-${supply.id}`}
                          >
                            <span
                              className={
                                supply.completed
                                  ? 'supply-name completed'
                                  : 'supply-name'
                              }
                            >
                              {supply.name}
                            </span>

                            <span className="expand-indicator">
                              {isExpanded ? '−' : '+'}
                            </span>
                          </button>

                          <span className="supply-quantity">
                            Qty: {supply.quantity}
                          </span>

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => startEditing(supply)}
                            aria-label={`Edit ${supply.name}`}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => deleteSupply(supply.id)}
                            aria-label={`Delete ${supply.name}`}
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                    {/* expanded notes */}
                    {isExpanded && (
                      <div
                        className="supply-notes"
                        id={`supply-notes-${supply.id}`}
                      >
                        <label htmlFor={`notes-${supply.id}`}>
                          Notes
                        </label>

                        <textarea
                          id={`notes-${supply.id}`}
                          placeholder="Add details about type, source, etc"
                          value={supply.notes}
                          onChange={event =>
                            updateSupplyNotes(supply.id, event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={`save-notes-button ${
                            hasUnsavedChanges ? 'has-changes' : 'no-changes'
                          }`}
                          onClick={() => saveSupplyNotes(supply.id)}
                        >
                          Save
                        </button>
                      </div>
                    )}
                    </div>
                  )
                })
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default SupplyList
