import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  fetchCurrentUser,
} from '@/services/authService'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref(null)
    const token = ref(null)
    const isLoading = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const role = computed(() => user.value?.role ?? null)
    const isAdmin = computed(() => role.value === 'ADMIN')
    const isDriver = computed(() => role.value === 'DRIVER')
    const isPassenger = computed(() => role.value === 'PASSENGER')

    const home = computed(
      () => ({ ADMIN: '/admin/routes', DRIVER: '/driver/departures' })[role.value] ?? '/search',
    )

    const clearUser = () => {
      user.value = null
      token.value = null
    }

    const authenticate = async (request, payload) => {
      isLoading.value = true
      try {
        const { data } = await request(payload)
        user.value = data.data.user
        token.value = data.data.token
        return data.data.user
      } finally {
        isLoading.value = false
      }
    }

    const handleLogin = (details) => authenticate(loginRequest, details)
    const handleRegister = (details) => authenticate(registerRequest, details)

    const handleFetchUser = async () => {
      const { data } = await fetchCurrentUser()
      user.value = data.data
      return data.data
    }

    const logout = async () => {
      clearUser()
    }

    return {
      user,
      token,
      isLoading,
      isAuthenticated,
      role,
      isAdmin,
      isDriver,
      isPassenger,
      home,
      handleLogin,
      handleRegister,
      logout,
      clearUser,
      handleFetchUser,
    }
  },
  { persist: true },
)
