// Story 1: create an account
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api.js'
import Field from '../../components/Field.jsx'
import AuthShell from '../../components/AuthShell.jsx'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = await api.register(form)
      navigate('/login', { state: { message: data.message, email: form.email.trim() } })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Get on the list." subtitle="Make an account to start planning your first event.">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field
          label="Name (optional)"
          name="name"
          value={form.name}
          onChange={update}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          error={errors.email}
          autoComplete="email"
          placeholder="you@school.edu"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={update}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
