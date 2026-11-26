// Helpers for showing event dates and times

// "2027-04-17" -> a Date at local midnight. (new Date("2027-04-17") would use
// UTC midnight, which shows as the day before in California.)
export function toDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// "19:00" -> "7:00 PM"
export function formatTime(value) {
  const [hour, minute] = value.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// "Sat, Apr 17, 2027, 7:00 PM – 11:00 PM", or with full day/month names
export function formatWhen(event, long = false) {
  if (!event.date) return 'No date yet'
  const style = long ? 'long' : 'short'
  let text = toDate(event.date).toLocaleDateString([], {
    weekday: style,
    month: style,
    day: 'numeric',
    year: 'numeric',
  })
  if (event.startTime) text += `, ${formatTime(event.startTime)}`
  if (event.endTime) text += ` – ${formatTime(event.endTime)}`
  return text
}

// Days from today until the event (0 = today, negative = already happened)
export function daysUntil(value) {
  const date = toDate(value)
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((date - today) / (24 * 60 * 60 * 1000))
}

export function roleLabel(role) {
  if (role === 'host') return "You're the host"
  if (role === 'co-host') return 'Co-host'
  return 'Collaborator'
}
