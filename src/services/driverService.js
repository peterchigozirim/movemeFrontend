import server from '@/services/api'

const base = '/driver'

export const fetchVehicle = () => server.get(`/vehicle`)
export const saveVehicle = (payload) => server.put(`/vehicle`, payload)

export const fetchDepartures = () => server.get(`${base}/get-all-departures`)
export const fetchDeparture = (id) => server.get(`${base}/get-one-departures/${id}`)
export const publishDeparture = (payload) => server.post(`${base}/publish-departure`, payload)
export const cancelDeparture = (id) => server.post(`${base}/cancel-departure`)
export const fetchPassengers = (id) => server.get(`${base}/departures`)
// action: 'arrive' | 'start' | 'complete'
export const updateProgress = (action) => server.post(`${base}/update-trip`, action)

export const fetchRoutes = () => server.get(`${base}/get-all-routes`)
