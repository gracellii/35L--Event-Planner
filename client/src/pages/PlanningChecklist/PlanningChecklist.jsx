
import { useEffect, useState } from 'react'
import './PlanningChecklist.css'

function PlanningChecklist() {
  // Store all planning tasks
  const [tasks, setTasks] = useState([])

  // Store the new task title
  const [title, setTitle] = useState('')

  // Track the task currently being edited
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Error messages
  const [error, setError] = useState('')

  // Loading state
  const [loading, setLoading] = useState(true)

  // Load tasks when the page opens
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch('/api/planning-tasks')

        if (!response.ok) {
          throw new Error('Failed to load planning tasks.')
        }

        const data = await response.json()
        setTasks(data)

      } catch (error) {
        console.error('Error loading planning tasks:', error)
        setError(error.message)

      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Add a new planning task
  async function addTask(event) {
    event.preventDefault()
    setError('')

    // Validate title
    if (!title.trim()) {
      setError('Please enter a task title.')
      return
    }

    try {
      const response = await fetch('/api/planning-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add task.')
      }

      // Add the saved task to the list
      setTasks(prevTasks => [...prevTasks, data])

      // Clear input
      setTitle('')

    } catch (error) {
      console.error('Error adding task:', error)
      setError(error.message)
    }
  }

  // Toggle a task between completed and pending
  async function toggleTask(id) {
    setError('')

    const task = tasks.find(task => task.id === id)

    if (!task) return

    try {
      const response = await fetch(`/api/planning-tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task status.')
      }

      // Update task in React state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? data : task
        )
      )

    } catch (error) {
      console.error('Error updating task status:', error)
      setError(error.message)
    }
  }

  // Start editing a task
  function startEditing(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setError('')
  }

  // Cancel editing
  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setError('')
  }

  // Save edited task title
  async function saveEdit(id) {
    setError('')

    if (!editTitle.trim()) {
      setError('Task title is required.')
      return
    }

    try {
      const response = await fetch(`/api/planning-tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task.')
      }

      // Replace old task with updated task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? data : task
        )
      )

      cancelEditing()

    } catch (error) {
      console.error('Error editing task:', error)
      setError(error.message)
    }
  }

  // Delete a task
  async function deleteTask(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`/api/planning-tasks/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task.')
      }

      // Remove task from React state
      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== id)
      )

      if (editingId === id) {
        cancelEditing()
      }

    } catch (error) {
      console.error('Error deleting task:', error)
      setError(error.message)
    }
  }

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  const progress = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="page-container planning-checklist-page">

      {/* Page heading */}
      <div className="checklist-header">
        <div>
          <h1>Planning Checklist</h1>
        </div>
      </div>

      {/* Progress section */}
      <div className="checklist-progress">

        <div className="progress-info">
          <span>
            {completedTasks} of {totalTasks} tasks completed
          </span>

          <span>{progress}%</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Add task form */}
      <form className="checklist-form" onSubmit={addTask}>

        <h2>Add a Task</h2>

        <div className="checklist-form-row">

          <input
            type="text"
            placeholder="Enter task title..."
            value={title}
            onChange={event => setTitle(event.target.value)}
          />

          <button
            type="submit"
            className="checklist-add-button"
          >
            + Add Task
          </button>

        </div>

      </form>

      {/* Error messages */}
      {error && (
        <p className="checklist-error" role="alert">
          {error}
        </p>
      )}

      {/* Task list */}
      <div className="checklist-tasks">

        <h2>Your Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="checklist-empty">
            No tasks yet. Add your first planning task above!
          </p>
        ) : (

          tasks.map(task => (

            <div className="checklist-task" key={task.id}>

              {editingId === task.id ? (

                // Edit task form
                <div className="checklist-edit-form">

                  <input
                    type="text"
                    value={editTitle}
                    onChange={event =>
                      setEditTitle(event.target.value)
                    }
                  />

                  <div className="checklist-actions">

                    <button
                      type="button"
                      className="checklist-save-button"
                      onClick={() => saveEdit(task.id)}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="checklist-cancel-button"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              ) : (

                // Normal task display
                <div className="checklist-task-content">

                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${
                      task.completed ? 'pending' : 'complete'
                    }`}
                  />

                  <div className="checklist-task-details">

                    <span
                      className={
                        task.completed
                          ? 'checklist-task-title completed'
                          : 'checklist-task-title'
                      }
                    >
                      {task.title}
                    </span>

                    <span
                      className={
                        task.completed
                          ? 'checklist-status completed-status'
                          : 'checklist-status pending-status'
                      }
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>

                  </div>

                  <div className="checklist-actions">

                    <button
                      type="button"
                      className="checklist-edit-button"
                      onClick={() => startEditing(task)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="checklist-delete-button"
                      onClick={() => deleteTask(task.id)}
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

export default PlanningChecklist
