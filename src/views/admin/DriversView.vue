<script setup>
import { onMounted, ref } from 'vue'
import { fetchDrivers, setDriverEnabled } from '@/services/adminService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'

const { busy, run } = useAction()
const drivers = ref([])

async function load() {
  const res = await run(fetchDrivers)
  if (res) drivers.value = res.data
}

async function toggle(d) {
  await run(
    () => setDriverEnabled(d.id, !d.enabled),
    d.enabled ? 'Driver disabled' : 'Driver enabled',
  )
  await load()
}

onMounted(load)
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">Driver access</h1>
  <p v-if="!drivers.length" class="text-slate-500">No drivers registered.</p>
  <div class="space-y-3">
    <div
      v-for="d in drivers"
      :key="d.id"
      class="card flex flex-wrap items-center justify-between gap-2"
    >
      <div>
        <p class="font-semibold">{{ d.name }}</p>
        <p class="text-sm text-slate-600">
          {{ d.email }} ·
          {{
            d.vehicle
              ? `${d.vehicle.description} (${d.vehicle.registration}, ${d.vehicle.capacity} seats)`
              : 'No vehicle'
          }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="d.enabled ? 'enabled' : 'disabled'" />
        <button
          class="btn"
          :class="d.enabled ? 'btn-danger' : ''"
          :disabled="busy"
          @click="toggle(d)"
        >
          {{ d.enabled ? 'Disable' : 'Enable' }}
        </button>
      </div>
    </div>
  </div>
</template>
