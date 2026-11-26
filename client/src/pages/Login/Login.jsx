// User Story 1 — login form
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../useAuth.js';
import Field from '../../components/Field.jsx';
import AuthShell from '../../components/AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Messages passed from Register ("Account created!") or Logout
  const flash = location.state?.message;

  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!form.email.trim()) found.email = 'Email is required.';
    if (!form.password) found.password = 'Password is required.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
      setForm((f) => ({ ...f, password: '' }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Plan it together." lede="Budgets, tasks, supplies and RSVPs for every event, all in one place.">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        {flash && !formError && <div className="alert alert-success" role="status">{flash}</div>}
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field label="Email" name="email" type="email" value={form.email} onChange={update} error={errors.email} autoComplete="email" placeholder="you@school.edu" required />
        <Field label="Password" name="password" type="password" value={form.password} onChange={update} error={errors.password} autoComplete="current-password" required />
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
