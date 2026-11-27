// Story 3: invites waiting for the logged-in user, with Accept and Decline
import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function InviteList({ onAccepted }) {
  const [invites, setInvites] = useState([])
  const [error, setError] = useState('')

  function load() {
    api
      .myInvites()
      .then((data) => setInvites(data.invites))
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function accept(inviteId) {
    try {
      await api.acceptInvite(inviteId)
      load()
      onAccepted()
    } catch (err) {
      setError(err.message)
    }
  }

  async function decline(inviteId) {
    try {
      await api.declineInvite(inviteId)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (invites.length === 0 && !error) return null

  return (
    <section className="card">
      <h2 className="display">Invites</h2>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <ul>
        {invites.map((inv) => (
          <li key={inv.id}>
            {inv.fromEmail} invited you to plan <strong>{inv.eventName}</strong>{' '}
            <button className="btn btn-primary" onClick={() => accept(inv.id)}>Accept</button>{' '}
            <button className="btn btn-secondary" onClick={() => decline(inv.id)}>Decline</button>
          </li>
        ))}
      </ul>
    </section>
  )
}