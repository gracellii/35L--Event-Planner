// Form checks for Stories 1 and 2.
// Each function returns { value, errors }, where errors is { field: message }.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/ // what <input type="date"> sends
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/ // what <input type="time"> sends

const text = (value) => String(value ?? '').trim()
const hasErrors = (errors) => Object.keys(errors).length > 0

function validateRegistration(body = {}) {
  const email = text(body.email).toLowerCase()
  const name = text(body.name)
  const password = String(body.password ?? '')
  const errors = {}

  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL.test(email) || email.length > 255) errors.email = 'Enter a valid email address.'

  if (name.length > 60) errors.name = 'Name must be 60 characters or fewer.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must include a letter and a number.'
  }

  // Only checked when the form sends a confirmation
  if (body.confirm !== undefined && body.confirm !== password) {
    errors.confirm = "Passwords don't match."
  }

  return { value: { email, name, password }, errors }
}

function validateLogin(body = {}) {
  const email = text(body.email).toLowerCase()
  const password = String(body.password ?? '')
  const errors = {}

  if (!email) errors.email = 'Email is required.'
  if (!password) errors.password = 'Password is required.'

  return { value: { email, password }, errors }
}

// Catches dates like 2027-02-30 that match the format but don't exist
function isRealDate(value) {
  const date = new Date(value + 'T00:00:00Z')
  return DATE.test(value) && !isNaN(date) && date.toISOString().startsWith(value)
}

function validateEvent(body = {}) {
  const name = text(body.name)
  const date = text(body.date)
  const startTime = text(body.startTime)
  const endTime = text(body.endTime)
  const location = text(body.location)
  const description = text(body.description)
  const errors = {}

  if (!name) errors.name = 'Event name is required.'
  else if (name.length > 255) errors.name = 'Event name must be 255 characters or fewer.'

  if (date && !isRealDate(date)) errors.date = 'Enter a valid date.'
  else if ((startTime || endTime) && !date) errors.date = 'Add a date to go with the time.'

  if (startTime && !TIME.test(startTime)) errors.startTime = 'Enter a valid start time.'
  else if (endTime && !startTime) errors.startTime = 'Add a start time too.'

  if (endTime && !TIME.test(endTime)) errors.endTime = 'Enter a valid end time.'
  else if (startTime && endTime && endTime <= startTime) {
    errors.endTime = 'End time must be after the start time.'
  }

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

module.exports = { validateRegistration, validateLogin, validateEvent, hasErrors }
