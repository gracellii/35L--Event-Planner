
import { useEffect, useState } from 'react'
import './Itinerary.css'

function Itinerary() {
  // Store all itinerary activities
  const [activities, setActivities] = useState([])

  // Form state for adding activities
  const [title, setTitle] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [description, setDescription] = useState('')

  // Error message
  const [error, setError] = useState('')

  // Track which activity is being edited
  const [editingId, setEditingId] = useState(null)

  // Temporary values for editing
  const [editTitle, setEditTitle] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Loading state
  const [loading, setLoading] = useState(true)

  // Load itinerary when page opens
  useEffect(() => {
    async function loadItinerary() {
      try {
        const response = await fetch('/api/itinerary')

        if (!response.ok) {
          throw new Error('Failed to load itinerary.')
        }

        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error('Error loading itinerary:', error)
        setError('Unable to load itinerary.')
      } finally {
        setLoading(false)
      }
    }

    loadItinerary()
  }, [])

  // Add a new activity
  async function addActivity(event) {
    event.preventDefault()
    setError('')

    // Validate required fields
    if (!title.trim()) {
      setError('Please enter an activity title.')
      return
    }

    if (!activityTime) {
      setError('Please select an activity time.')
      return
    }

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          activity_time: activityTime,
          description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add activity.')
      }

      // Add the saved activity to React state
      setActivities(prevActivities =>
        [...prevActivities, data].sort((a, b) =>
          a.activity_time.localeCompare(b.activity_time) ||
          a.id - b.id
        )
      )

      // Reset form
      setTitle('')
      setActivityTime('')
      setDescription('')

    } catch (error) {
      console.error('Error adding activity:', error)
      setError(error.message)
    }
  }

  // Start editing an activity
  function startEditing(activity) {
    setEditingId(activity.id)
    setEditTitle(activity.title)
    setEditTime(activity.activity_time.slice(0, 5))
    setEditDescription(activity.description || '')
    setError('')
  }

  // Cancel editing
  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setEditTime('')
    setEditDescription('')
    setError('')
  }

  // Save changes to an activity
  async function saveEdit(id) {
    setError('')

    if (!editTitle.trim()) {
      setError('Activity title is required.')
      return
    }

    if (!editTime) {
      setError('Activity time is required.')
      return
    }

    try {
      const response = await fetch(`/api/itinerary/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          activity_time: editTime,
          description: editDescription
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update activity.')
      }

      // Update activity in React state
      setActivities(prevActivities =>
        prevActivities
          .map(activity =>
            activity.id === id ? data : activity
          )
          .sort((a, b) =>
            a.activity_time.localeCompare(b.activity_time) ||
            a.id - b.id
          )
      )

      cancelEditing()

    } catch (error) {
      console.error('Error updating activity:', error)
      setError(error.message)
    }
  }

  // Delete an activity
  async function deleteActivity(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this activity?'
    )

    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`/api/itinerary/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete activity.')
      }

      // Remove activity from React state
      setActivities(prevActivities =>
        prevActivities.filter(activity => activity.id !== id)
      )

      if (editingId === id) {
        cancelEditing()
      }

    } catch (error) {
      console.error('Error deleting activity:', error)
      setError(error.message)
    }
  }

  return (
    <div className="page-container itinerary-page">

      {/* Page heading */}
      <div className="itinerary-header">
        <div>
          <h1>Event Itinerary</h1>
        </div>

        <span className="activity-count">
          {activities.length} activities
        </span>
      </div>

      {/* Add activity form */}
      <form className="itinerary-form" onSubmit={addActivity}>
        <h2>Add an Activity</h2>

        <div className="itinerary-form-fields">

          <label>
            Activity Title *
            <input
              type="text"
              placeholder="e.g. Guest Arrival"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </label>

          <label>
            Time *
            <input
              type="time"
              value={activityTime}
              onChange={event => setActivityTime(event.target.value)}
            />
          </label>

          <label>
            Description
            <textarea
              placeholder="Add details about this activity..."
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </label>

          <button type="submit" className="itinerary-add-button">
            + Add Activity
          </button>

        </div>

        {error && (
          <p className="itinerary-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {/* Display saved activities */}
      <div className="itinerary-list">

        <h2>Schedule</h2>

        {loading ? (
          <p>Loading itinerary...</p>
        ) : activities.length === 0 ? (
          <p className="itinerary-empty">
            No activities yet. Add your first activity above!
          </p>
        ) : (
          activities.map(activity => (
            <div className="itinerary-entry" key={activity.id}>

              {editingId === activity.id ? (

                // Edit form
                <div className="itinerary-edit-form">

                  <label>
                    Activity Title *
                    <input
                      type="text"
                      value={editTitle}
                      onChange={event =>
                        setEditTitle(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Time *
                    <input
                      type="time"
                      value={editTime}
                      onChange={event =>
                        setEditTime(event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={editDescription}
                      onChange={event =>
                        setEditDescription(event.target.value)
                      }
                    />
                  </label>

                  <div className="itinerary-actions">
                    <button
                      type="button"
                      onClick={() => saveEdit(activity.id)}
                      className="itinerary-save-button"
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="itinerary-cancel-button"
                    >
                      Cancel
                    </button>
                  </div>

                </div>

              ) : (

                // Normal activity display
                <div className="itinerary-activity">

                  <div className="activity-time">
                    {activity.activity_time.slice(0, 5)}
                  </div>

                  <div className="activity-details">
                    <h3>{activity.title}</h3>

                    <p>
                      {activity.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="itinerary-actions">
                    <button
                      type="button"
                      onClick={() => startEditing(activity)}
                      className="itinerary-edit-button"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteActivity(activity.id)}
                      className="itinerary-delete-button"
                    >
                      Delete
                    </button>
                  </div>

                </div>

              )}

            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default Itinerary
