// Input validation for Stories 1 & 2 (Ananya).
// Each function returns { value, errors }. `errors` maps a field name to a
// message, and is empty when the input is valid. The React forms show each
// message under the matching field.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD, what <input type="date"> sends
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/ // HH:MM 24-hour, what <input type="time"> sends

function validateRegistration(body = {}) {
  const email = String(body.email ?? '').trim().toLowerCase()
  const name = String(body.name ?? '').trim()
  const password = String(body.password ?? '')
  const errors = {}

  if (!email) errors.email = 'Email is required.'
  else if (email.length > 255 || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  if (name.length > 60) errors.name = 'Name must be 60 characters or fewer.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (password.length > 72) errors.password = 'Password must be 72 characters or fewer.'
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.password = 'Password must include at least one letter and one number.'

  return { value: { email, name, password }, errors }
}

function validateLogin(body = {}) {
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const errors = {}
  if (!email) errors.email = 'Email is required.'
  if (!password) errors.password = 'Password is required.'
  return { value: { email, password }, errors }
}

function isRealDate(value) {
  if (!DATE_RE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function validateEvent(body = {}) {
  const name = String(body.name ?? '').trim()
  const date = String(body.date ?? '').trim()
  const startTime = String(body.startTime ?? '').trim()
  const endTime = String(body.endTime ?? '').trim()
  const location = String(body.location ?? '').trim()
  const description = String(body.description ?? '').trim()
  const errors = {}

  if (!name) errors.name = 'Event name is required.'
  else if (name.length > 255) errors.name = 'Event name must be 255 characters or fewer.'

  if (date && !isRealDate(date)) errors.date = 'Enter a valid date.'

  if (startTime && !TIME_RE.test(startTime)) errors.startTime = 'Enter a valid start time.'
  if (endTime && !TIME_RE.test(endTime)) errors.endTime = 'Enter a valid end time.'
  if ((startTime || endTime) && !date && !errors.date) errors.date = 'Add a date to go with the time.'
  if (endTime && !startTime && !errors.endTime) errors.startTime = 'Add a start time to go with the end time.'
  if (startTime && endTime && !errors.startTime && !errors.endTime && endTime <= startTime)
    errors.endTime = 'End time must be after the start time.'

  if (location.length > 200) errors.location = 'Location must be 200 characters or fewer.'
  if (description.length > 1000) errors.description = 'Description must be 1000 characters or fewer.'

  return {
    value: {
      name,
      date: date || null,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      description: description || null,
    },
    errors,
  }
}

const hasErrors = (errors) => Object.keys(errors).length > 0

module.exports = { validateRegistration, validateLogin, validateEvent, hasErrors }
