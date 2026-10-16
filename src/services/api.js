import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const server = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { Accept: 'application/json' },
})

server.interceptors.request.use((config) => {
  const { token } = useUserStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

server.interceptors.response.use(
  (response) => response,
  (error) => {
    const store = useUserStore()
    // Only a rejected token forces logout; wrong credentials on login arrive with no token set
    if (error.response?.status === 401 && store.token) store.clearUser()
    return Promise.reject(error)
  },
)

// Stable key per user action so retries/double-clicks never create duplicates.
export const idempotencyHeader = (key = crypto.randomUUID()) => ({
  headers: { 'Idempotency-Key': key },
})

export default server
