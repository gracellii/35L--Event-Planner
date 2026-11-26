// Story 1: log in
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../useAuth.js'
import Field from '../../components/Field.jsx'
import AuthShell from '../../components/AuthShell.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const notice = location.state?.message // e.g. "Account created!" or "You're logged out."

  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
      setForm({ ...form, password: '' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Plan it together."
      subtitle="Budgets, tasks, supplies and RSVPs for every event, all in one place."
    >
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="alert alert-error" role="alert">{formError}</div>
        ) : (
          notice && <div className="alert alert-success" role="status">{notice}</div>
        )}
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
          autoComplete="current-password"
        />
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}
