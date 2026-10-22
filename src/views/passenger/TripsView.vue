<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchBookings, payBooking, cancelBooking } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime, money, label } from '@/utils/format'

const bookings = ref([])
const now = ref(Date.now())
const { busy, run } = useAction()
const payKeys = {}
let timer

const isUpcoming = (b) =>
  ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status) &&
  !['CLOSED'].includes(b.departure.status)

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
  Math.max(0, Math.floor((new Date(b.payment.expiresAt).getTime() - now.value) / 1000))
const countdown = (b) => {
  const s = secondsLeft(b)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

async function load() {
  const { data } = await run(fetchBookings)
  if (data) bookings.value = data.data
}

async function pay(b, outcome) {
  const k = `${b.id}:${outcome}`
  payKeys[k] ??= crypto.randomUUID()
  const res = await run(() => payBooking(b.id, { outcome }, payKeys[k]))
  delete payKeys[k]
  if (res?.data?.data.authorizationUrl) {
    window.location.href = res.data.data.authorizationUrl
    await load()
    return res
  }
  console.log(res);


}

async function cancel(b) {
  if (!confirm('Cancel this reservation? A simulated refund will be recorded.')) return
  const res = await run(() => cancelBooking(b.id), 'Reservation cancelled')
  if (res) await load()
}

onMounted(() => {
  load()
  timer = setInterval(() => (now.value = Date.now()), 1000)// pick up trip progress and expiries
})
onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">My trips</h1>

  <h2 class="mb-2 font-semibold">Upcoming</h2>
  <p v-if="!upcoming.length" class="mb-6 text-slate-500">No upcoming trips.</p>
  <div class="space-y-3 mb-6">
    <article v-for="b in upcoming" :key="b.id" class="card">
      <div class="flex flex-wrap justify-between gap-2">
        <div>
          <RouterLink :to="`/trips/${b.id}`" class="font-semibold hover:text-indigo-600">
            {{ b.departure.route.origin }} → {{ b.departure.route.destination }}
          </RouterLink>
          <p class="text-slate-600 text-sm capitalize">
            Pickup {{ dateTime(b.departure.departureTime) }} · {{ label(b.departure.mode) }} ·
            (Driver) {{ b.departure.driver.firstName + ' ' + b.departure.driver.lastName }}
          </p>
          <p class="font-medium text-sm">{{ money(b.fare) }}</p>
        </div>
        <div class="space-y-1 text-right">
          <StatusBadge :status="b.status" />
          <div>
            <StatusBadge :status="b.departure.status" />
          </div>
        </div>
      </div>

      <div v-if="b.status === 'PENDING_PAYMENT'" class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
        <span class="text-amber-700 text-sm">
          Seat held for {{ countdown(b) }} — pay to confirm.
        </span>
        <button class="btn" :disabled="busy || secondsLeft(b) === 0" @click="pay(b.payment, 'success')">
          Pay (simulate success)
        </button>
        <button class="btn btn-secondary" :disabled="busy || secondsLeft(b) === 0" @click="pay(b, 'failure')">
          Simulate failure
        </button>
      </div>
      <div v-else-if="b.status === 'CONFIRMED' && b?.payment?.status === 'SUCCESS'" class="mt-3 pt-3 border-t">
        <button class="btn btn-danger" :disabled="busy" @click="cancel(b)">Cancel booking</button>
      </div>
    </article>
  </div>

  <h2 class="mb-2 font-semibold">History</h2>
  <p v-if="!history.length" class="text-slate-500">No past trips.</p>
  <div class="space-y-3">
    <article v-for="b in history" :key="b.id" class="flex flex-wrap justify-between gap-2 card">
      <div>
        <RouterLink :to="`/trips/${b.id}`" class="font-semibold hover:text-indigo-600">
          {{ b.departure.route.origin }} → {{ b.departure.route.destination }}
        </RouterLink>
        <p class="text-slate-600 text-sm">
          {{ dateTime(b.departure.departureTime) }} · {{ label(b.departure.mode) }} ·
          {{ money(b.fare) }}
        </p>
        <p v-if="b.refund" class="text-slate-600 text-sm">
          Simulated refund: {{ money(b.refund.amount) }} ({{ label(b.refund.status) }})
        </p>
      </div>
      <div class="space-y-1 text-right">
        <div class="flex items-center gap-2 text-xs">
          Payment:
          <StatusBadge :status="b.status" />
        </div>
        <div class="flex items-center gap-2 text-xs">
          Departure:
          <StatusBadge :status="b.departure.status" />
        </div>
      </div>
    </article>
  </div>
</template>
