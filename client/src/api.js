// Calls to the Express API for Stories 1 & 2 (Ananya).
// Throws an ApiError with { status, message, fields } when the server says no,
// so forms can show a message under each field.

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function request(method, path, body) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include', // send the login cookie
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Can't reach the server. Is it running?")
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.message || 'Something went wrong.', data.fields)
  return data
}

export const api = {
  // Story 1
  register: (form) => request('POST', '/auth/register', form),
  login: (form) => request('POST', '/auth/login', form),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),

  // Story 2
  listEvents: () => request('GET', '/events'),
  createEvent: (form) => request('POST', '/events', form),
  getEvent: (id) => request('GET', `/events/${encodeURIComponent(id)}`),
}
