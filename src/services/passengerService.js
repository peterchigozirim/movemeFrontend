import server, { idempotencyHeader } from '@/services/api'

const api = '/passenger/rides'
export const fetchRoutes = () => server.get(api)
export const searchDepartures = (payload) => server.post(api + '/search', payload)

// Pass the same key on retries of the same attempt.
export const createBooking = (payload, key) =>
  server.post(api + '/create-reservation', payload, idempotencyHeader(key))
export const fetchBookings = () => server.get(api)
export const payBooking = (id, payload, key) =>
  server.post(`/api/bookings/${id}/pay`, payload, idempotencyHeader(key))
export const cancelBooking = (id) => server.post(api + '/cancel-reservation')

export const fetchNotifications = () => server.get('/api/notifications')
export const markNotificationRead = (id) => server.post(`/api/notifications/${id}/read`)
