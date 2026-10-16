import server from '@/services/api'

const base = '/api/driver'

export const fetchVehicle = () => server.get(`${base}/vehicle`)
export const saveVehicle = (payload) => server.put(`${base}/vehicle`, payload)

export const fetchDepartures = () => server.get(`${base}/departures`)
export const publishDeparture = (payload) => server.post(`${base}/departures`, payload)
export const cancelDeparture = (id) => server.post(`${base}/departures/${id}/cancel`)
export const fetchPassengers = (id) => server.get(`${base}/departures/${id}/passengers`)
// action: 'arrive' | 'start' | 'complete'
export const updateProgress = (id, action) => server.post(`${base}/departures/${id}/${action}`)
