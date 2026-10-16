<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  fetchDeparture,
  updateProgress,
  cancelDeparture,
} from '@/services/driverService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime, money, label } from '@/utils/format'

const id = useRoute().params.id
const { busy, run } = useAction()
const departure = ref(null)
const passengers = ref([])
const loaded = ref(false)
let poll

const tripStatus = [
  { status: 'NOT_STARTED', action: 'ARRIVED', text: 'Mark arrived', done: 'Trip Not Started' },
  { status: 'ARRIVED', action: 'IN_PROGRESS', text: 'Start trip', done: 'Arrived at pickup' },
  { status: 'IN_PROGRESS', action: 'COMPLETED', text: 'Complete trip', done: 'Trip Started' },
]
const ORDER = ['NOT_STARTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const norm = (s) => String(s ?? '').toLowerCase()

const trip = computed(() => departure.value?.trip ?? null)
const status = computed(() => departure.value?.status ?? '')
const isCancelled = computed(() => status.value === 'CANCELLED')
const stepIndex = computed(() => ORDER.indexOf(trip.value?.status))
const next = computed(() => tripStatus.find((s) => s.status === trip.value?.status))
const canCancel = computed(() => ['ARRIVED', 'NOT_STARTED'].includes(trip.value?.status))
const capacity = computed(() => departure.value?.vehicle?.seats ?? departure.value?.totalSeats ?? 0)
const booked = computed(() => departure.value?.totalSeats ?? departure.value?.totalSeats ?? 0)
const activeCount = computed(
  () => passengers.value.filter((p) => ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(norm(p.status))).length,
)
const passengerName = (p) => p.name ?? p.firstName + ' ' + (p.lastName ?? '') ?? 'Passenger'

async function load() {
  const [d,] = await Promise.all([
    run(() => fetchDeparture(id)),
    // fetchPassengers(id).catch(() => null),
  ])
  if (d) departure.value = d.data?.data ?? d.data
  if (d) passengers.value = d.data.data.rides ?? d.rides ?? []
  loaded.value = true
}

async function advance() {
  const nextForm = {
    status: next.value.action,
    departureId: id,
  }
  const res = await run(() => updateProgress(nextForm), 'Trip updated')
  if (res) await load()
}

async function cancel() {
  const msg = activeCount.value
    ? `Cancel this departure? ${activeCount.value} passenger(s) will be notified and refunded (simulated).`
    : 'Cancel this departure?'
  if (!confirm(msg)) return
  const res = await run(() => cancelDeparture(id), 'Departure cancelled')
  if (res) await load()
}

onMounted(() => {
  load()
  poll = setInterval(load, 15000) // pending payments confirm or expire meanwhile
})
onBeforeUnmount(() => clearInterval(poll))
</script>

<template>
  <RouterLink to="/driver/departures" class="text-indigo-600 text-sm">← All departures</RouterLink>

  <p v-if="loaded && !departure" class="mt-4 text-slate-600 card">Departure not found.</p>

  <template v-if="departure">
    <div class="flex flex-wrap justify-between items-center gap-2 mt-2 mb-4">
      <h1 class="font-bold text-xl">
        {{ departure.route?.origin }} → {{ departure.route?.destination }}
      </h1>
      <StatusBadge :status="status" />
    </div>

    <section class="gap-3 grid sm:grid-cols-3 mb-4 card">
      <div>
        <p class="text-slate-500 text-xs">Departure time</p>
        <p class="font-medium">{{ dateTime(departure.departureTime) }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Duration</p>
        <p class="font-medium">{{ departure.route?.durationMinutes }} min</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Mode</p>
        <p class="font-medium">{{ label(norm(departure.mode)) }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Fare</p>
        <p class="font-medium">{{ money(departure.fare) }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Seats</p>
        <p class="font-medium">{{ booked }} / {{ capacity }} booked ({{ capacity - booked }} free)</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Vehicle</p>
        <p class="font-medium">
          {{ departure.vehicle?.make ?? '—' }}
          <span v-if="departure.vehicle?.registration" class="text-slate-500">
            ({{ departure.vehicle.registration }})
          </span>
          {{ departure.vehicle?.model }}
        </p>
      </div>
    </section>

    <section class="mb-4 card">
      <h2 class="mb-3 font-semibold">Trip progress</h2>
      <p v-if="isCancelled" class="bg-red-50 p-3 rounded text-red-700 text-sm">
        This departure was cancelled. Booked passengers were notified and refunds recorded
        (simulated).
      </p>
      <template v-else>
        <ol class="flex flex-wrap gap-2 mb-4 text-sm">
          <li v-for="(s, i) in tripStatus" :key="s.action" class="px-3 py-1 rounded-full capitalize" :class="s.status === 'NOT_STARTED' && s.action !== 'CANCELLED'
            ? 'bg-amber-100 text-amber-800'
            : stepIndex > i
              ? 'bg-green-100 text-green-800'
              : s.action === 'CANCELLED'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-500'
            ">
            {{ i + 1 }}. {{ stepIndex > i ? s.done : s.text }}
          </li>
        </ol>
        <p v-if="trip.status === 'COMPLETED'" class="text-green-700 text-sm">Trip completed.</p>
        <div class="flex flex-wrap gap-2">
          <button v-if="next" class="btn" :disabled="busy" @click="advance">{{ next.text }}</button>
          <button v-if="canCancel" class="btn btn-danger" :disabled="busy" @click="cancel">
            Cancel departure
          </button>
        </div>
        <p v-if="trip.status === 'IN_PROGRESS'" class="mt-2 text-slate-500 text-xs">
          A trip in progress cannot be cancelled. Complete it to finish.
        </p>
      </template>
    </section>

    <section class="card">
      <h2 class="mb-3 font-semibold">Passengers ({{ passengers.length }})</h2>
      <p v-if="!passengers.length" class="text-slate-500 text-sm">No passengers booked yet.</p>
      <ul class="divide-y divide-gray-400">
        <li v-for="(p, i) in passengers" :key="i"
          class="flex flex-wrap justify-between items-center gap-2 py-4 text-sm">
          <div>
            <p class="font-medium capitalize">{{ passengerName(p.passenger) }}</p>

          </div>
          <StatusBadge :status="norm(p.status)" />
        </li>
      </ul>
    </section>
  </template>
</template>
