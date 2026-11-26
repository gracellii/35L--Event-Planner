// User Story 1 — registration form
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import Field from '../../components/Field.jsx';
import AuthShell from '../../components/AuthShell.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Quick checks in the browser so users get instant feedback. The server
// re-checks everything, so these are a convenience, not the security.
function clientValidate({ email, password, confirm }) {
  const e = {};
  if (!email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address.';
  if (!password) e.password = 'Password is required.';
  else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    e.password = 'Password must include at least one letter and one number.';
  if (password && confirm !== password) e.confirm = "Passwords don't match.";
  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const found = clientValidate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const { message } = await api.register({ name: form.name, email: form.email, password: form.password });
      navigate('/login', { state: { message, email: form.email.trim() } });
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Get on the list." lede="Make an account to start your first event workspace.">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field label="Name (optional)" name="name" value={form.name} onChange={update} error={errors.name} autoComplete="name" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={update} error={errors.email} autoComplete="email" placeholder="you@school.edu" required />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
          autoComplete="new-password"
          required
        />
        <Field label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={update} error={errors.confirm} autoComplete="new-password" required />
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
