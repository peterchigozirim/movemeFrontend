<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchBookings, payBooking, cancelBooking } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime, money, label } from '@/utils/format'

const bookings = ref([])
const now = ref(Date.now())
const { busy, run } = useAction()
const payKeys = {}
let timer
let poll

const isUpcoming = (b) =>
  ['pending_payment', 'confirmed'].includes(b.status) &&
  !['completed', 'cancelled'].includes(b.departure.status)

const upcoming = computed(() =>
  bookings.value
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.departure.departureTime) - new Date(b.departure.departureTime)),
)
const history = computed(() =>
  bookings.value
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => new Date(b.departure.departureTime) - new Date(a.departure.departureTime)),
)

const secondsLeft = (b) =>
  Math.max(0, Math.floor((new Date(b.expiresAt).getTime() - now.value) / 1000))
const countdown = (b) => {
  const s = secondsLeft(b)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

async function load() {
  const res = await run(fetchBookings)
  if (res) bookings.value = res.data
}

async function pay(b, outcome) {
  const k = `${b.id}:${outcome}`
  payKeys[k] ??= crypto.randomUUID()
  const res = await run(() => payBooking(b.id, { outcome }, payKeys[k]))
  delete payKeys[k]
  await load()
  return res
}

async function cancel(b) {
  if (!confirm('Cancel this reservation? A simulated refund will be recorded.')) return
  const res = await run(() => cancelBooking(b.id), 'Reservation cancelled')
  if (res) await load()
}

onMounted(() => {
  load()
  timer = setInterval(() => (now.value = Date.now()), 1000)
  poll = setInterval(load, 15000) // pick up trip progress and expiries
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(poll)
})
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">My trips</h1>

  <h2 class="mb-2 font-semibold">Upcoming</h2>
  <p v-if="!upcoming.length" class="mb-6 text-slate-500">No upcoming trips.</p>
  <div class="mb-6 space-y-3">
    <article v-for="b in upcoming" :key="b.id" class="card">
      <div class="flex flex-wrap justify-between gap-2">
        <div>
          <p class="font-semibold">
            {{ b.departure.route.pickup }} → {{ b.departure.route.dropoff }}
          </p>
          <p class="text-sm text-slate-600">
            Pickup {{ dateTime(b.departure.departureTime) }} · {{ label(b.departure.mode) }} ·
            Driver {{ b.departure.driver.name }}
          </p>
          <p class="text-sm font-medium">{{ money(b.fare) }}</p>
        </div>
        <div class="space-y-1 text-right">
          <StatusBadge :status="b.status" />
          <div><StatusBadge :status="b.departure.status" /></div>
        </div>
      </div>

      <div
        v-if="b.status === 'pending_payment'"
        class="mt-3 flex flex-wrap items-center gap-2 border-t pt-3"
      >
        <span class="text-sm text-amber-700">
          Seat held for {{ countdown(b) }} — pay to confirm.
        </span>
        <button class="btn" :disabled="busy || secondsLeft(b) === 0" @click="pay(b, 'success')">
          Pay (simulate success)
        </button>
        <button
          class="btn btn-secondary"
          :disabled="busy || secondsLeft(b) === 0"
          @click="pay(b, 'failure')"
        >
          Simulate failure
        </button>
      </div>
      <div
        v-else-if="b.status === 'confirmed' && b.departure.status === 'scheduled'"
        class="mt-3 border-t pt-3"
      >
        <button class="btn btn-danger" :disabled="busy" @click="cancel(b)">Cancel booking</button>
      </div>
    </article>
  </div>

  <h2 class="mb-2 font-semibold">History</h2>
  <p v-if="!history.length" class="text-slate-500">No past trips.</p>
  <div class="space-y-3">
    <article v-for="b in history" :key="b.id" class="card flex flex-wrap justify-between gap-2">
      <div>
        <p class="font-semibold">
          {{ b.departure.route.pickup }} → {{ b.departure.route.dropoff }}
        </p>
        <p class="text-sm text-slate-600">
          {{ dateTime(b.departure.departureTime) }} · {{ label(b.departure.mode) }} ·
          {{ money(b.fare) }}
        </p>
        <p v-if="b.refund" class="text-sm text-slate-600">
          Simulated refund: {{ money(b.refund.amount) }} ({{ label(b.refund.status) }})
        </p>
      </div>
      <div class="space-y-1 text-right">
        <StatusBadge :status="b.status" />
        <div><StatusBadge :status="b.departure.status" /></div>
      </div>
    </article>
  </div>
</template>
