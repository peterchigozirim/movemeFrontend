<script setup>
import { onMounted, ref } from 'vue'
import { fetchNotifications, markNotificationRead } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import { dateTime } from '@/utils/format'

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

onMounted(load)
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">Notifications</h1>
  <p v-if="!items.length" class="text-slate-500">No notifications.</p>
  <ul class="space-y-2">
    <li
      v-for="n in items"
      :key="n.id"
      class="card cursor-pointer"
      :class="{ 'border-indigo-400': !n.read }"
      @click="read(n)"
    >
      <p class="text-sm">{{ n.message }}</p>
      <p class="text-xs text-slate-500">{{ dateTime(n.createdAt) }}</p>
    </li>
  </ul>
</template>
