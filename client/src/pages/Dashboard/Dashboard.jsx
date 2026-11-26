// User Story 2 (Ananya): the user's events as tickets, plus the "new event" form.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../useAuth.js';
import Field from '../../components/Field.jsx';
import { PlusIcon } from '../../components/Icons.jsx';
import { formatDate, formatTime, daysUntil, stubDate, countdownNote, countWord, roleLabel } from '../../format.js';

const EMPTY_FORM = { name: '', date: '', startTime: '', endTime: '', location: '', description: '' };

function whenLine(ws) {
  if (!ws.date) return 'No date yet';
  let out = formatDate(ws.date).replace(/, \d{4}$/, ''); // "Sat, Apr 17"
  if (ws.startTime) out += `, ${formatTime(ws.startTime)}`;
  if (ws.startTime && ws.endTime) out += ` – ${formatTime(ws.endTime)}`;
  return out;
}

function EventTicket({ ws }) {
  const stub = stubDate(ws.date);
  const days = daysUntil(ws.date);
  return (
    <Link to={`/events/${ws.id}`} className="ticket">
      <div className="ticket-body">
        <div>
          <h2>{ws.name}</h2>
          <p className="ticket-meta">{whenLine(ws)}</p>
          {ws.location && <p className="ticket-meta">{ws.location}</p>}
        </div>
        <span className="chip">{roleLabel(ws)}</span>
      </div>
      <div className="ticket-stub stub-gold">
        {stub ? (
          <>
            <span className="stub-month">{stub.month}</span>
            <span className="stub-day">{stub.day}</span>
            <span className="stub-note">{countdownNote(days)}</span>
          </>
        ) : (
          <>
            <span className="stub-tbd">TBD</span>
            <span className="stub-note">Pick a date</span>
          </>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listEvents()
      .then((d) => setWorkspaces(d.events))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!form.name.trim()) found.name = 'Event name is required.';
    if ((form.startTime || form.endTime) && !form.date) found.date = 'Add a date to go with the time.';
    if (form.endTime && !form.startTime) found.startTime = 'Add a start time to go with the end time.';
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
      found.endTime = 'End time must be after the start time.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const { event } = await api.createEvent(form);
      navigate(`/events/${event.id}`, { state: { justCreated: true } });
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openForm() {
    setShowForm(true);
    window.scrollTo({ top: 0 });
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
  }

  // Soonest dated events first, undated ones last
  const sorted = [...workspaces].sort((a, b) => {
    if (!a.date && !b.date) return b.createdAt.localeCompare(a.createdAt);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || '');
  });

  const firstName = (user.name || '').trim().split(/\s+/)[0];
  const n = workspaces.length;
  const subline =
    n === 0
      ? 'Nothing planned yet. Start with a name; the rest can come later.'
      : `${countWord(n)} ${n === 1 ? 'event' : 'events'} in the works. Pick one to keep planning.`;

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="display">{firstName ? `Hey ${firstName}.` : 'Your events.'}</h1>
          {!loading && !loadError && <p>{subline}</p>}
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openForm}>
            <PlusIcon /> New event
          </button>
        )}
      </div>

      {showForm && (
        <section className="card new-event" aria-labelledby="new-event-title">
          <h2 id="new-event-title" className="display">New event</h2>
          {formError && <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>{formError}</div>}
          <form className="form-stack" onSubmit={handleCreate} noValidate>
            <Field label="Event name" name="name" value={form.name} onChange={update} error={errors.name} placeholder="What are you planning?" maxLength={255} autoFocus required />
            <div className="field-row">
              <Field label="Date" name="date" type="date" value={form.date} onChange={update} error={errors.date} />
              <Field label="Start time" name="startTime" type="time" value={form.startTime} onChange={update} error={errors.startTime} />
              <Field label="End time" name="endTime" type="time" value={form.endTime} onChange={update} error={errors.endTime} />
            </div>
            <Field label="Location" name="location" value={form.location} onChange={update} error={errors.location} placeholder="Where is it?" maxLength={200} />
            <Field label="Description" name="description" as="textarea" rows={3} value={form.description} onChange={update} error={errors.description} placeholder="A line or two about the event" maxLength={1000} />
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create event'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <p className="muted">Loading your events…</p>
      ) : loadError ? (
        <div className="alert alert-error">{loadError}</div>
      ) : (
        <ul className="ticket-grid">
          {sorted.map((ws) => (
            <li key={ws.id}>
              <EventTicket ws={ws} />
            </li>
          ))}
          {!showForm && (
            <li>
              <button type="button" className="new-ticket" onClick={openForm}>
                <span className="plus-dot"><PlusIcon size={18} /></span>
                <strong>Plan a new event</strong>
                <span className="muted small">Only the name is required. Add the rest later.</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </main>
  );
}
