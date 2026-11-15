//suppy list page
import { useState } from 'react'
import './SupplyList.css'

function SupplyList() {
  //store categories 
  const [categories, setCategories] = useState([
    'Equipment',
    'Food/Drink',
    'Decorations',
    'Other'
  ])

  //store all supplies in one array
  const [supplies, setSupplies] = useState([])

  //new supply form state
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('Equipment')

  //add new category state
  const [newCategory, setNewCategory] = useState('')

  //add supply to overall list
  function addSupply(event) {
    event.preventDefault()

    if (!name.trim()) return

    if (Number(quantity) < 1) {
      alert('Quantity must be greater than or equal to 1.')
      return
    }
    const newSupply = {
      id: Date.now(),
      name: name.trim(),
      quantity: Number(quantity),
      category: category,
      completed: false
    }

    setSupplies([...supplies, newSupply])

    //reset 
    setName('')
    setQuantity(1)
  }

  //add new category
  function addCategory(event) {
    event.preventDefault()

    const trimmedCategory = newCategory.trim()

    if (!trimmedCategory) return

    //no duplicate category names
    const alreadyExists = categories.some(
      existing =>
        existing.toLowerCase() === trimmedCategory.toLowerCase()
    )

    if (alreadyExists) return

    setCategories([...categories, trimmedCategory])
    setCategory(trimmedCategory)
    setNewCategory('')
  }

  //mark supply as done
  function toggleSupply(id) {
    setSupplies(
      supplies.map(supply =>
        supply.id === id
          ? { ...supply, completed: !supply.completed }
          : supply
      )
    )
  }

  //delete supply
  function deleteSupply(id) {
    setSupplies(
      supplies.filter(supply => supply.id !== id)
    )
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
                <option key={cat} value={cat}>
                  {cat}
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
            supply => supply.category === cat
          )

          const categoryCompleted = categorySupplies.filter(
            supply => supply.completed
          ).length

          return (

            <section className="supply-category" key={cat}>
              <div className="category-header">
                <h2>{cat}</h2>
                <span>
                  {categoryCompleted} / {categorySupplies.length}
                </span>
              </div>

              {categorySupplies.length === 0 ? (
                <p className="empty-category">
                  No supplies yet
                </p>
              ) : (
                categorySupplies.map(supply => (
                  <div className="supply-item" key={supply.id}>
                    <input
                      type="checkbox"
                      checked={supply.completed}
                      onChange={() => toggleSupply(supply.id)}
                    />

                    <span
                      className={
                        supply.completed
                          ? 'supply-name completed'
                          : 'supply-name'
                      }
                    >
                      {supply.name}
                    </span>

                    <span className="supply-quantity">
                      Qty: {supply.quantity}
                    </span>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteSupply(supply.id)}
                      aria-label={`Delete ${supply.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default SupplyList
