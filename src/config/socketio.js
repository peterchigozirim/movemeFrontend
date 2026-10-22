// src/socket.js
import { reactive } from 'vue'
import { io } from 'socket.io-client'

// 1. Declare a reactive object to hold connection states or global events
export const socketState = reactive({
  connected: false,
  messages: [],
})

// 2. Define your backend URL (Adjust the port to match your backend)
const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

// 3. Initialize the Socket.io client
export const socket = io(URL, {
  autoConnect: false, // Connected after login (see App.vue)
  // Starts on polling and upgrades; if websocket is blocked it stays on polling
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 10,
  reconnectionDelayMax: 5000,
})

export function connectSocket(token) {
  socket.auth = { token }
  if (socket.connected) socket.disconnect()
  socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}

// 4. Listen to global connection events
socket.on('connect', () => {
  console.log('Socket connected')
  socketState.connected = true
})

socket.on('disconnect', () => {
  console.log('Socket disconnected')
  socketState.connected = false
})

socket.on('connect_error', (err) => {
  console.warn('Socket connection error:', err.message)
  socketState.connected = false
})
