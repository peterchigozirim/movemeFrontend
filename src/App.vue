<script setup>
import { onBeforeUnmount, watch } from 'vue'
import Toast from 'primevue/toast'
import { connectSocket, disconnectSocket } from '@/config/socketio'
import { useUserStore } from '@/stores/userStore'

const store = useUserStore()

// Only hold a socket while logged in; reconnect with the new token on re-login.
watch(
  () => store.token,
  (token) => (token ? connectSocket(token) : disconnectSocket()),
  { immediate: true },
)

onBeforeUnmount(disconnectSocket)
</script>

<template>
  <Toast position="top-right" />
  <RouterView />
</template>
