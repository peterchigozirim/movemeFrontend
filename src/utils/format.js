export const money = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN' }).format(Number(n) || 0)

export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'

// Convert a <input type="datetime-local"> value to an ISO string for the API.
export const localToIso = (v) => (v ? new Date(v).toISOString() : null)

export const label = (s) => (s ? s.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase()) : '')
