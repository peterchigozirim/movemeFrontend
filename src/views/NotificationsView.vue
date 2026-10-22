<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { fetchNotifications, markNotificationRead } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import { dateTime } from '@/utils/format'
import { socket } from '@/config/socketio'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const items = ref([])
const { run } = useAction()

async function load() {
  const res = await run(fetchNotifications)
  if (res) items.value = res.data
}

async function read(n) {
  if (n.read) return
  const res = await run(() => markNotificationRead(n.id))
  if (res) n.read = true
}

onMounted(() => {
  load()
  socket.on('notification', (n) => {
    toast.add({ severity: 'info', summary: 'New Notification', detail: n.message, life: 3000 })
    load()
  })
})

onBeforeUnmount(() => {
  socket.off('notification')
})
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Notifications</h1>
  <p v-if="!items.length" class="text-slate-500">No notifications.</p>
  <ul class="space-y-2">
    <li v-for="n in items" :key="n.id" class="cursor-pointer card" :class="{ 'border-indigo-400': !n.readAt }"
      @click="read(n)">
      <p class="text-sm">{{ n.message }}</p>
      <p class="text-slate-500 text-xs">{{ dateTime(n.createdAt) }}</p>
    </li>
  </ul>
</template>
