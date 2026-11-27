// Story 3: an event's planning team. Only the host can invite people.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api.js'

export default function PlanningTeam() {
  const { id } = useParams()
  const [isHost, setIsHost] = useState(false)
  const [members, setMembers] = useState([])
  const [pending, setPending] = useState([])
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function loadTeam() {
    api
      .getTeam(id)
      .then((data) => {
        setMembers(data.members)
        setPending(data.pending)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    api
      .getEvent(id)
      .then((data) => setIsHost(data.event.role === 'host'))
      .catch((err) => setError(err.message))
    loadTeam()
  }, [id])

  async function handleInvite(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.sendInvite(id, email)
      setMessage(`Invite sent to ${email}.`)
      setEmail('')
      loadTeam()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1 className="display">Planning team</h1>

      {isHost ? (
        <form onSubmit={handleInvite} className="card">
          <label htmlFor="invite-email">Invite by email</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@test.com"
            required
          />
          <button type="submit" className="btn btn-primary">Send invite</button>
        </form>
      ) : (
        <p className="muted">Only the host can send invites.</p>
      )}

      {message && <div className="alert alert-success" role="status">{message}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <h2 className="display section-title">Members</h2>
      <ul>
        {members.map((m) => (
          <li key={m.email}>{m.email} ({m.role})</li>
        ))}
      </ul>

      <h2 className="display section-title">Pending invites</h2>
      {pending.length === 0 ? (
        <p className="muted">No pending invites.</p>
      ) : (
        <ul>
          {pending.map((p) => (
            <li key={p.id}>{p.email}</li>
          ))}
        </ul>
      )}
    </>
  )
}