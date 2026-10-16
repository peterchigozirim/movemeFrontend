import server from '@/services/api'

const base = '/admin'

export const fetchAdminRoutes = () => server.get(`${base}/routes`)
export const createRoute = (payload) => server.post(`${base}/routes`, payload)
export const updateRoute = (id, payload) => server.put(`${base}/routes/${id}`, payload)
export const deleteRoute = (id) => server.delete(`${base}/routes/${id}`)

export const fetchDrivers = () => server.get(`${base}/drivers`)
export const setDriverEnabled = (id, enabled) => server.patch(`${base}/drivers/${id}`, { enabled })

export const fetchIssues = () => server.get(`${base}/issues`)
export const createIssue = (payload) => server.post(`${base}/issues`, payload)
export const updateIssue = (id, payload) => server.patch(`${base}/issues/${id}`, payload)
