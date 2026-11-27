// Story 2: one event's page, with links to each planning feature
// Story 11: "Add to calendar" downloads the event as an .ics file
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../../api.js'
import { daysUntil, formatWhen, roleLabel } from '../../format.js'
import { BackIcon, BoxIcon, CheckIcon, ClockIcon, MailIcon, TeamIcon, WalletIcon } from '../../components/Icons.jsx'

// One card per feature. Cards with a `link` open that feature's page, and
// the rest show "Coming soon".
const sections = [
  { title: 'Planning team', Icon: TeamIcon, text: 'Invite people to help plan. Only the host can send invites.', link: 'team' },
  { title: 'Itinerary', Icon: ClockIcon, text: 'Activities with times and descriptions, in time order.', link: 'itinerary' },
  { title: 'Planning checklist', Icon: CheckIcon, text: 'Tasks to finish before the event.', link: 'planning-checklist' },
  { title: 'Budget', Icon: WalletIcon, text: 'Set a total and split it evenly among the hosts.', link: 'budget' },
  { title: 'Supply list', Icon: BoxIcon, text: "What's needed, how many, and what's been bought.", link: 'supplies' },
  { title: 'RSVPs', Icon: MailIcon, text: 'Share a link so guests can say if they are coming.' },
]

function Countdown({ date }) {
  const days = daysUntil(date)
  if (days === null) return <><span className="countdown-word">TBD</span><span className="countdown-label">No date yet</span></>
  if (days === 0) return <><span className="countdown-word">Today</span><span className="countdown-label">It's happening</span></>
  const n = Math.abs(days)
  return (
    <>
      <span className="countdown">{n}</span>
      <span className="countdown-label">
        {n === 1 ? 'day' : 'days'} {days > 0 ? 'to go' : 'ago'}
      </span>
    </>
  )
}

export default function EventPage() {
  const { id } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getEvent(id)
      .then((data) => setEvent(data.event))
      .catch((err) =>
        setError(err.status === 404 ? "This event doesn't exist, or you don't have access to it." : err.message)
      )
  }, [id])

  if (error) {
    return (
      <main className="container">
        <div className="card empty">
          <h2 className="display">Event not found</h2>
          <p className="muted">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to my events</Link>
        </div>
      </main>
    )
  }

  if (!event) return <main className="container"><p className="muted">Loading event...</p></main>

  return (
    <main className="container tight">
      <Link to="/dashboard" className="back"><BackIcon /> All events</Link>

      {location.state?.justCreated && (
        <div className="alert alert-success page-alert" role="status">Event created.</div>
      )}

      <section className="hero-ticket">
        <div className="ticket-body">
          <span className="chip">{roleLabel(event.role)}</span>
          <h1 className="display">{event.name}</h1>
          <p className="ticket-meta">{formatWhen(event, true)}</p>
          {event.location && <p className="ticket-meta">{event.location}</p>}
          {event.description && <p className="hero-desc">{event.description}</p>}
          {event.date && (
            <a href={`/api/events/${id}/calendar.ics`} className="btn btn-secondary" download>
              Add to calendar
            </a>
          )}
        </div>
        <div className="ticket-stub stub-blue">
          <Countdown date={event.date} />
        </div>
      </section>

      <h2 className="display section-title">Plan it</h2>
      <ul className="section-grid">
        {sections.map(({ title, Icon, text, link }) => (
          <li key={title} className="section-card">
            <span className="icon-tile"><Icon /></span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            {link ? (
              <Link to={link} className="btn btn-secondary card-action">Open {title.toLowerCase()}</Link>
            ) : (
              <span className="chip">Coming soon</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}