<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  fetchDepartures,
  publishDeparture,
  cancelDeparture,
  fetchPassengers,
  updateProgress,
  fetchRoutes
} from '@/services/driverService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime, money, label, localToIso } from '@/utils/format'

const { busy, run } = useAction()
const routes = ref([])
const departures = ref([])
const passengers = reactive({})
const form = reactive({ routeId: '', departureTime: '', mode: 'solo' })

const sorted = computed(() =>
  [...departures.value].sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime)),
)
const active = (d) => ['scheduled', 'arrived', 'in_progress'].includes(d.status)
const nextAction = (d) =>
  ({
    scheduled: ['arrive', 'Mark arrived'],
    arrived: ['start', 'Start trip'],
    in_progress: ['complete', 'Complete trip'],
  })[d.status]

async function load() {
  const { data } = await run(fetchDepartures)
  if (data) departures.value = data.data
}

async function publish() {
  const res = await run(
    () => publishDeparture({ ...form, departureTime: localToIso(form.departureTime) }),
    'Departure published',
  )
  if (res) {
    form.departureTime = ''
    await load()
  }
}

async function progress(d, action) {
  const res = await run(() => updateProgress(d.id, action), 'Trip updated')
  await load()
  return res
}

async function cancel(d) {
  if (
    !confirm('Cancel this departure? Booked passengers will be notified and refunded (simulated).')
  )
    return
  const res = await run(() => cancelDeparture(d.id), 'Departure cancelled')
  if (res) await load()
}

async function togglePassengers(d) {
  if (passengers[d.id]) {
    delete passengers[d.id]
    return
  }
  const res = await run(() => fetchPassengers(d.id))
  if (res) passengers[d.id] = res.data
}

onMounted(async () => {
  const { data } = await run(fetchRoutes)
  if (data) routes.value = data.data
  await load()
})
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Departures</h1>

  <form class="gap-3 grid sm:grid-cols-4 mb-6 card" @submit.prevent="publish">
    <div class="sm:col-span-2">
      <label class="label" for="route">Route</label>
      <select id="route" v-model="form.routeId" class="input" required>
        <option value="" disabled>Select a route</option>
        <option v-for="r in routes" :key="r.id" :value="r.id">
          {{ r.origin }} → {{ r.destination }} ({{ r.durationMinutes }} min)
        </option>
      </select>
    </div>
    <div>
      <label class="label" for="time">Departure time</label>
      <input id="time" v-model="form.departureTime" class="input" type="datetime-local" required />
    </div>
    <div>
      <label class="label" for="mode">Mode</label>
      <select id="mode" v-model="form.mode" class="input">
        <option value="SOLO">Solo</option>
        <option value="POOL">Pool</option>
      </select>
    </div>
    <div class="sm:col-span-4">
      <button class="btn" :disabled="busy">Publish departure</button>
    </div>
  </form>

  <p v-if="!sorted.length" class="text-slate-500">You have not published any departures.</p>
  <div class="space-y-3">
    <article v-for="d in sorted" :key="d.id" class="card">
      <div class="flex flex-wrap justify-between gap-2">
        <div>
          <p class="font-semibold">{{ d.route.origin }} → {{ d.route.destination }}</p>
          <p class="text-slate-600 text-sm">
            {{ dateTime(d.departureTime) }} · {{ d.route.durationMinutes }} min ·
            {{ label(d.mode) }} · {{ money(d.fare) }} · {{ d.totalSeats }}/{{ d.vehicle.seats }} seats
            booked
          </p>
        </div>
        <StatusBadge :status="d.status" />
      </div>
      <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t">
        <RouterLink class="btn btn-secondary" :to="`/driver/departures/${d.id}/details`">
          Details
        </RouterLink>
        <button v-if="nextAction(d)" class="btn" :disabled="busy" @click="progress(d, nextAction(d)[0])">
          {{ nextAction(d)[1] }}
        </button>
        <button v-if="['scheduled', 'arrived'].includes(d.status)" class="btn btn-danger" :disabled="busy"
          @click="cancel(d)">
          Cancel departure
        </button>
        <button v-if="active(d) || d.status === 'completed'" class="btn btn-secondary" @click="togglePassengers(d)">
          {{ passengers[d.id] ? 'Hide' : 'Show' }} passengers
        </button>
      </div>
      <ul v-if="passengers[d.id]" class="space-y-1 mt-3 text-sm">
        <li v-if="!passengers[d.id].length" class="text-slate-500">No passengers.</li>
        <li v-for="p in passengers[d.id]" :key="p.bookingId" class="flex gap-2">
          {{ p.name }}
          <StatusBadge :status="p.status" />
        </li>
      </ul>
    </article>
  </div>
</template>
