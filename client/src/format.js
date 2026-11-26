// Dates come from <input type="date"> as "YYYY-MM-DD". Parsing that directly
// treats it as UTC midnight, which shows the previous day in US time zones —
// so build the date from its parts instead.
export function formatDate(value, style = 'short') {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const opts =
    style === 'long'
      ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
      : { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString(undefined, opts);
}

// "19:00" → "7:00 PM"
export function formatTime(value) {
  const m = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!m) return value;
  return new Date(2000, 0, 1, +m[1], +m[2]).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "Sat, Apr 17, 2027, 7:00 PM – 11:00 PM" (whatever parts exist)
export function formatWhen({ date, startTime, endTime }, style = 'short') {
  if (!date) return '';
  let out = formatDate(date, style);
  if (startTime) out += `, ${formatTime(startTime)}`;
  if (startTime && endTime) out += ` – ${formatTime(endTime)}`;
  return out;
}

function parseLocalDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

// Whole days from today until the event date (0 = today, negative = past).
export function daysUntil(value, today = new Date()) {
  const d = parseLocalDate(value);
  if (!d) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d - start) / 86400000);
}

// { month: "Apr", day: "17" } for the ticket stub
export function stubDate(value) {
  const d = parseLocalDate(value);
  if (!d) return null;
  return { month: d.toLocaleDateString(undefined, { month: 'short' }), day: String(d.getDate()) };
}

// "148 days", "1 day", "Today", "Done"
export function countdownNote(days) {
  if (days === null) return '';
  if (days === 0) return 'Today';
  if (days < 0) return 'Done';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
export function countWord(n) {
  return WORDS[n] ?? String(n);
}

// Label for the logged-in user's role in an event (the API sends event.role)
export function roleLabel(event) {
  const role = event.role;
  if (role === 'host') return 'You’re the host';
  if (role === 'co-host') return 'Co-host';
  return 'Collaborator';
}
