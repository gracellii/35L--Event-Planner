// Requests to the server for Stories 1 and 2.
// On failure, throws an Error with .status and .fields ({ field: message })
// so forms can show each message under its field.

async function request(method, path, body) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error("Can't reach the server. Is it running?")
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong.')
    error.status = res.status
    error.fields = data.fields || {}
    throw error
  }
  return data
}

export const api = {
  register: (form) => request('POST', '/auth/register', form),
  login: (form) => request('POST', '/auth/login', form),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),

  listEvents: () => request('GET', '/events'),
  createEvent: (form) => request('POST', '/events', form),
  getEvent: (id) => request('GET', `/events/${id}`),
}
