// Story 2: your events, and the form to create a new one
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api.js'
import { useAuth } from '../../useAuth.js'
import Field from '../../components/Field.jsx'
import { PlusIcon } from '../../components/Icons.jsx'
import { daysUntil, formatWhen, roleLabel, toDate } from '../../format.js'

const emptyForm = { name: '', date: '', startTime: '', endTime: '', location: '', description: '' }

function EventTicket({ event }) {
  const date = toDate(event.date)
  const days = daysUntil(event.date)

  return (
    <Link to={`/events/${event.id}`} className="ticket">
      <div className="ticket-body">
        <div>
          <h2>{event.name}</h2>
          <p className="ticket-meta">{formatWhen(event)}</p>
          {event.location && <p className="ticket-meta">{event.location}</p>}
        </div>
        <span className="chip">{roleLabel(event.role)}</span>
      </div>
      <div className="ticket-stub stub-gold">
        {date ? (
          <>
            <span className="stub-month">{date.toLocaleDateString([], { month: 'short' })}</span>
            <span className="stub-day">{date.getDate()}</span>
            <span className="stub-note">
              {days === 0 ? 'Today' : days < 0 ? 'Done' : `${days} ${days === 1 ? 'day' : 'days'}`}
            </span>
          </>
        ) : (
          <>
            <span className="stub-tbd">TBD</span>
            <span className="stub-note">Pick a date</span>
          </>
        )}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // The server sends them soonest first
  useEffect(() => {
    api
      .listEvents()
      .then((data) => setEvents(data.events))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = await api.createEvent(form)
      navigate(`/events/${data.event.id}`, { state: { justCreated: true } })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  function openForm() {
    setShowForm(true)
    window.scrollTo({ top: 0 })
  }

  function closeForm() {
    setShowForm(false)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
  }

  const firstName = user.name?.split(' ')[0]
  const count = events.length

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="display">{firstName ? `Hey ${firstName}.` : 'Your events.'}</h1>
          {!loading && !loadError && (
            <p>
              {count === 0
                ? 'Nothing planned yet. All you need to start is a name.'
                : `${count} ${count === 1 ? 'event' : 'events'} in the works.`}
            </p>
          )}
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openForm}>
            <PlusIcon /> New event
          </button>
        )}
      </div>

      {showForm && (
        <section className="card new-event">
          <h2 className="display">New event</h2>
          <form className="form-stack" onSubmit={handleCreate} noValidate>
            {formError && <div className="alert alert-error" role="alert">{formError}</div>}
            <Field
              label="Event name"
              name="name"
              value={form.name}
              onChange={update}
              error={errors.name}
              placeholder="What are you planning?"
              maxLength={255}
              autoFocus
            />
            <div className="field-row">
              <Field label="Date" name="date" type="date" value={form.date} onChange={update} error={errors.date} />
              <Field
                label="Start time"
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={update}
                error={errors.startTime}
              />
              <Field
                label="End time"
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={update}
                error={errors.endTime}
              />
            </div>
            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={update}
              error={errors.location}
              placeholder="Where is it?"
              maxLength={200}
            />
            <Field
              label="Description"
              name="description"
              as="textarea"
              rows={3}
              value={form.description}
              onChange={update}
              error={errors.description}
              maxLength={1000}
            />
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create event'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && <p className="muted">Loading your events...</p>}
      {loadError && <div className="alert alert-error">{loadError}</div>}
      {!loading && !loadError && (
        <ul className="ticket-grid">
          {events.map((event) => (
            <li key={event.id}>
              <EventTicket event={event} />
            </li>
          ))}
          {!showForm && (
            <li>
              <button type="button" className="new-ticket" onClick={openForm}>
                <span className="plus-dot"><PlusIcon size={18} /></span>
                <strong>Plan a new event</strong>
                <span className="muted small">Only the name is required.</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </main>
  )
}
