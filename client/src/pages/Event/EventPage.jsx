// User Story 2 (Ananya): a single event's page. Only this event's data is loaded.
//
// Teammates: each card in SECTIONS is one user story from the project plan.
// Give your story a `to` link (like Supply list below) once your page exists,
// or render your component in place of the card.
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { formatWhen, daysUntil, roleLabel } from '../../format.js';
import { BackIcon, TeamIcon, ClockIcon, CheckIcon, WalletIcon, BoxIcon, MailIcon } from '../../components/Icons.jsx';

const SECTIONS = [
  { key: 'collaborators', story: 3, Icon: TeamIcon, title: 'Planning team', blurb: 'Invite people to help plan. Only the host can send invites.' },
  { key: 'itinerary', story: 4, Icon: ClockIcon, title: 'Itinerary', blurb: 'Activities with times and descriptions, in time order.', to: 'itinerary', cta: 'Open itinerary' },
  { key: 'checklist', story: 5, Icon: CheckIcon, title: 'Planning checklist', blurb: 'Tasks to finish before the event, checked off as you go.', to: 'planning-checklist', cta: 'Open checklist' },
  { key: 'budget', story: 6, Icon: WalletIcon, title: 'Budget', blurb: 'Set a total and split it evenly among the hosts.', to: 'budget', cta: 'Open budget' },
  { key: 'supplies', story: 7, Icon: BoxIcon, title: 'Supply list', blurb: 'What’s needed, how many, and what’s been bought.', to: 'supplies', cta: 'Open supply list' },
  { key: 'rsvps', story: 8, Icon: MailIcon, title: 'RSVPs', blurb: 'Share a link so guests can say attending, maybe or no.' },
];

function Countdown({ date }) {
  const days = daysUntil(date);
  if (days === null)
    return (
      <>
        <span className="countdown-word">TBD</span>
        <span className="countdown-label">No date yet</span>
      </>
    );
  if (days === 0)
    return (
      <>
        <span className="countdown-word">Today</span>
        <span className="countdown-label">It’s happening</span>
      </>
    );
  if (days < 0)
    return (
      <>
        <span className="countdown">{-days}</span>
        <span className="countdown-label">{-days === 1 ? 'day ago' : 'days ago'}</span>
      </>
    );
  return (
    <>
      <span className="countdown">{days}</span>
      <span className="countdown-label">{days === 1 ? 'day to go' : 'days to go'}</span>
    </>
  );
}

export default function EventPage() {
  const { id } = useParams();
  const location = useLocation();

  // Results are tagged with the id they belong to. If the URL switches to a
  // different workspace, the old result no longer matches, so another event's
  // details can never be shown on this page.
  const [result, setResult] = useState({ id: null, workspace: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    api
      .getEvent(id)
      .then((d) => !cancelled && setResult({ id, workspace: d.event, error: '' }))
      .catch((err) =>
        !cancelled &&
        setResult({
          id,
          workspace: null,
          error: err.status === 404 ? "This event doesn't exist, or you don't have access to it." : err.message,
        }),
      );
    return () => {
      cancelled = true;
    };
  }, [id]);

  const current = result.id === id ? result : { workspace: null, error: '' };
  const { workspace, error } = current;

  if (error) {
    return (
      <main className="container">
        <div className="card empty">
          <h2 className="display">Event not found</h2>
          <p className="muted">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to my events</Link>
        </div>
      </main>
    );
  }
  if (!workspace) return <main className="container"><p className="muted">Loading event…</p></main>;

  return (
    <main className="container" style={{ paddingTop: 28 }}>
      <Link to="/dashboard" className="back"><BackIcon /> All events</Link>

      {location.state?.justCreated && (
        <div className="alert alert-success" role="status" style={{ marginBottom: 18 }}>Event created.</div>
      )}

      <section className="hero-ticket" aria-label="Event details">
        <div className="ticket-body">
          <span className="chip">{roleLabel(workspace)}</span>
          <h1 className="display">{workspace.name}</h1>
          <p className="ticket-meta">{workspace.date ? formatWhen(workspace, 'long') : 'No date set yet'}</p>
          {workspace.location && <p className="ticket-meta">{workspace.location}</p>}
          {workspace.description && <p className="hero-desc">{workspace.description}</p>}
        </div>
        <div className="ticket-stub stub-blue">
          <Countdown date={workspace.date} />
        </div>
      </section>

      <h2 className="display section-title">Plan it</h2>
      <ul className="section-grid">
        {SECTIONS.map(({ key, Icon, title, blurb, to, cta }) => (
          <li key={key}>
            <section className="section-card" aria-labelledby={`sec-${key}`}>
              <span className="icon-tile"><Icon /></span>
              <div>
                <h3 id={`sec-${key}`}>{title}</h3>
                <p>{blurb}</p>
              </div>
              {to ? (
                <Link to={to} className="btn btn-secondary card-action">{cta}</Link>
              ) : (
                <span className="chip">Coming soon</span>
              )}
            </section>
          </li>
        ))}
      </ul>
    </main>
  );
}
