import server from '@/services/api'

const api = 'auth/'

export const loginRequest = (payload) => server.post(api + 'login', payload)
export const registerRequest = (payload) => server.post(api + 'register', payload)
export const logoutRequest = () => server.post(api + 'logout')
export const fetchCurrentUser = () => server.get(api + 'me')
export const changePassword = (payload) => server.post(api + 'change-password', payload)
