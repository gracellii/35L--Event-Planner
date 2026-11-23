
import { useEffect, useState } from 'react'
import './Budget.css'

function Budget() {
  // Store the saved total budget
  const [totalAmount, setTotalAmount] = useState(0)

  // Store the amount currently being entered
  const [budgetInput, setBudgetInput] = useState('')

  // Store participants
  const [participants, setParticipants] = useState([])

  // Store the new participant's name
  const [newParticipant, setNewParticipant] = useState('')

  // Store error and success messages
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load the budget and participants when the page opens
  useEffect(() => {
    async function loadBudget() {
      try {
        const response = await fetch('/api/budget')

        if (!response.ok) {
          throw new Error('Failed to load budget')
        }

        const data = await response.json()

        setTotalAmount(data.totalAmount)
        setBudgetInput(String(data.totalAmount))
        setParticipants(data.participants)
      } catch (error) {
        console.error('Error loading budget:', error)
        setError('Could not load the budget. Please try again.')
      }
    }

    loadBudget()
  }, [])

  // Save the total budget
  async function saveBudget(event) {
    event.preventDefault()

    const amount = Number(budgetInput)

    // Validate before sending to the server
    if (
      budgetInput.trim() === '' ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setError('Please enter a valid, non-negative budget amount.')
      setSuccess('')
      return
    }

    try {
      const response = await fetch('/api/budget', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalAmount: amount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save budget')
      }

      // Update the saved amount only after the server confirms
      setTotalAmount(data.totalAmount)
      setBudgetInput(String(data.totalAmount))
      setError('')
      setSuccess('Budget saved successfully!')
    } catch (error) {
      console.error('Error saving budget:', error)
      setError(error.message)
      setSuccess('')
    }
  }

  // Add a participant
  async function addParticipant(event) {
    event.preventDefault()

    if (!newParticipant.trim()) {
      setError('Please enter a participant name.')
      return
    }

    try {
      const response = await fetch('/api/budget/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newParticipant.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add participant')
      }

      setParticipants(previous => [...previous, data])
      setNewParticipant('')
      setError('')
      setSuccess('')
    } catch (error) {
      console.error('Error adding participant:', error)
      setError(error.message)
    }
  }

  // Toggle whether a participant is included in the split
  async function toggleParticipant(id) {
    const participant = participants.find(person => person.id === id)

    if (!participant) return

    try {
      const response = await fetch(`/api/budget/participants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          included: !participant.included
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update participant')
      }

      setParticipants(previous =>
        previous.map(person =>
          person.id === id ? data : person
        )
      )

      setError('')
      setSuccess('')
    } catch (error) {
      console.error('Error updating participant:', error)
      setError(error.message)
    }
  }

  // Delete a participant
  async function deleteParticipant(id) {
    try {
      const response = await fetch(`/api/budget/participants/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete participant')
      }

      setParticipants(previous =>
        previous.filter(person => person.id !== id)
      )

      setError('')
      setSuccess('')
    } catch (error) {
      console.error('Error deleting participant:', error)
      setError(error.message)
    }
  }

  // Calculate the split using only included participants
  const includedParticipants = participants.filter(
    person => person.included
  )

  const participantCount = includedParticipants.length

  const perPersonAmount = participantCount > 0
    ? totalAmount / participantCount
    : 0

  // Format amounts as currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="budget-page">
      <div className="budget-header">
        <div>
          <h1>Budget Tracker</h1>
          <p>Set your event budget and split expenses between participants.</p>
        </div>
      </div>

      {error && (
        <p className="budget-message error-message" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="budget-message success-message" role="status">
          {success}
        </p>
      )}

      {/* Total budget form */}
      <section className="budget-card">
        <h2>Total Event Budget</h2>

        <form onSubmit={saveBudget} className="budget-form">
          <label htmlFor="budget-amount">
            Enter your total budget ($)
          </label>

          <div className="budget-input-row">
            <input
              id="budget-amount"
              type="number"
              min="0"
              step="0.01"
              value={budgetInput}
              onChange={event => setBudgetInput(event.target.value)}
              placeholder="Enter budget amount"
            />

            <button type="submit" className="budget-button">
              Save Budget
            </button>
          </div>
        </form>

        <div className="total-budget-display">
          <span>Current saved budget</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </section>

      {/* Participant form */}
      <section className="budget-card">
        <h2>People Sharing the Budget</h2>

        <p className="budget-description">
          Add your co-hosts or other participants, then choose who is
          included in the equal split.
        </p>

        <form onSubmit={addParticipant} className="participant-form">
          <input
            type="text"
            value={newParticipant}
            onChange={event => setNewParticipant(event.target.value)}
            placeholder="Enter participant name"
            aria-label="Participant name"
          />

          <button type="submit" className="budget-button">
            Add Person
          </button>
        </form>

        <div className="participant-list">
          {participants.length === 0 ? (
            <p className="empty-budget">
              No participants added yet.
            </p>
          ) : (
            participants.map(person => (
              <div className="participant-row" key={person.id}>
                <label className="participant-label">
                  <input
                    type="checkbox"
                    checked={person.included}
                    onChange={() => toggleParticipant(person.id)}
                  />

                  <span className={!person.included ? 'excluded-person' : ''}>
                    {person.name}
                  </span>
                </label>

                <div className="participant-actions">
                  <span>
                    {person.included ? 'Included' : 'Excluded'}
                  </span>

                  <button
                    type="button"
                    className="remove-participant-button"
                    onClick={() => deleteParticipant(person.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Equal split calculation */}
      <section className="budget-card split-card">
        <h2>Equal Cost Split</h2>

        <div className="split-summary">
          <div>
            <span>Total Budget</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <div>
            <span>People Included</span>
            <strong>{participantCount}</strong>
          </div>

          <div>
            <span>Contribution Per Person</span>
            <strong>
              {formatCurrency(perPersonAmount)}
            </strong>
          </div>
        </div>

        {participantCount === 0 ? (
          <p className="empty-budget">
            Add and include at least one participant to calculate the split.
          </p>
        ) : (
          <div className="split-results">
            <h3>Each Person's Contribution</h3>

            {includedParticipants.map(person => (
              <div className="split-person" key={person.id}>
                <span>{person.name}</span>
                <strong>{formatCurrency(perPersonAmount)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Budget
