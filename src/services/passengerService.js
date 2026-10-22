import server, { idempotencyHeader } from '@/services/api'

const api = '/passenger/rides'
export const fetchRoutes = () => server.get(api + '/all-routes')
export const searchDepartures = (payload) => server.post(api + '/search', payload)

// Pass the same key on retries of the same attempt.
export const createBooking = (payload, key) =>
  server.post(api + '/create-reservation', payload, idempotencyHeader(key))
export const fetchBookings = () => server.get(api)
export const fetchOneBooking = (id) => server.get(`${api}/${id}`)
export const payBooking = (id, payload, key) =>
  server.post(`/payments/${id}/initialize`, payload, idempotencyHeader(key))
export const cancelBooking = (id) => server.post(api + '/cancel-reservation')

export const fetchNotifications = () => server.get('/notifications')
export const markNotificationRead = (id) => server.patch(`/notifications/${id}/read`)

// Paystack redirects here with ?reference=...; the backend confirms the charge with Paystack.
export const verifyPayment = (reference) =>
  server.get(`/payments/verify/${encodeURIComponent(reference)}`)
