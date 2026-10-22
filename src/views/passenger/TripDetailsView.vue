<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchOneBooking, payBooking, cancelBooking } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime, money, label } from '@/utils/format'
import { socket } from '@/config/socketio'

const id = useRoute().params.id
const { busy, run } = useAction()
const booking = ref(null)
const loaded = ref(false)
const now = ref(Date.now())
let timer
let payKey

const dep = computed(() => booking.value?.departure)
const payment = computed(() => booking.value?.payment)
const driverName = computed(() =>
  [dep.value?.driver?.firstName, dep.value?.driver?.lastName].filter(Boolean).join(' '),
)
const isPending = computed(() => booking.value?.status === 'PENDING_PAYMENT')
const canCancel = computed(
  () =>
    booking.value?.status === 'CONFIRMED' &&
    payment.value?.status === 'SUCCESS' &&
    ['SCHEDULED', 'scheduled'].includes(dep.value?.status),
)

const secondsLeft = computed(() =>
  payment.value?.expiresAt
    ? Math.max(0, Math.floor((new Date(payment.value.expiresAt).getTime() - now.value) / 1000))
    : 0,
)
const countdown = computed(
  () => `${Math.floor(secondsLeft.value / 60)}:${String(secondsLeft.value % 60).padStart(2, '0')}`,
)

const STEPS = [
  ['SCHEDULED', 'Scheduled'],
  ['ARRIVED', 'Driver arrived'],
  ['IN_PROGRESS', 'In progress'],
  ['COMPLETED', 'Completed'],
]
const stepIndex = computed(() =>
  STEPS.findIndex(([s]) => s === String(dep.value?.trip?.status ?? '').toUpperCase()),
)

async function load() {
  const { data } = await run(() => fetchOneBooking(id))
  if (data) {
    booking.value = data?.data ?? data ?? null
  }
  loaded.value = true
}

async function pay() {
  payKey ??= crypto.randomUUID()
  const res = await run(() => payBooking(payment.value.id, {}, payKey))
  const url = res?.data?.data?.authorizationUrl
  if (url) window.location.href = url
}

async function cancel() {
  if (!confirm('Cancel this reservation? A simulated refund will be recorded.')) return
  const res = await run(() => cancelBooking(booking.value.id), 'Reservation cancelled')
  if (res) await load()
}

onMounted(() => {
  load()
  timer = setInterval(() => (now.value = Date.now()), 1000)
  socket.on('departure_updated', load)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  socket.off('departure_updated', load)
})
</script>

<template>
  <RouterLink to="/trips" class="text-indigo-600 text-sm">← My trips</RouterLink>

  <p v-if="loaded && !booking" class="mt-4 text-slate-600 card">Trip not found.</p>

  <template v-if="booking && dep">
    <div class="flex flex-wrap justify-between items-center gap-2 mt-2 mb-4">
      <h1 class="font-bold text-xl">{{ dep.route?.origin }} → {{ dep.route?.destination }}</h1>
      <StatusBadge :status="booking.status" />
    </div>

    <section class="mb-4 card">
      <h2 class="mb-3 font-semibold">Trip progress</h2>
      <p v-if="['CANCELLED',].includes(dep.status)" class="bg-red-50 p-3 rounded text-red-700 text-sm">
        The driver cancelled this departure.
      </p>
      <ol v-else class="flex flex-wrap gap-2 text-sm">
        <li v-if="!dep.trip" class="bg-amber-100 px-3 py-1 rounded-full text-amber-800">
          Trip not started
        </li>
        <li else v-for="([s, text], i) in STEPS" :key="s" class="px-3 py-1 rounded-full" :class="stepIndex > i
          ? 'bg-green-100 text-green-800'
          : stepIndex === i
            ? 'bg-amber-100 text-amber-800'
            : 'bg-slate-100 text-slate-500'
          ">
          {{ i + 1 }}. {{ text }}
        </li>
      </ol>
    </section>

    <section class="gap-3 grid sm:grid-cols-3 mb-4 card">
      <div>
        <p class="text-slate-500 text-xs">Pickup time</p>
        <p class="font-medium">{{ dateTime(dep.departureTime) }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Duration</p>
        <p class="font-medium">{{ dep.route?.durationMinutes }} min</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Mode</p>
        <p class="font-medium">{{ label(String(dep.mode ?? '').toLowerCase()) }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Pickup</p>
        <p class="font-medium">{{ dep.route?.origin }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Drop-off</p>
        <p class="font-medium">{{ dep.route?.destination }}</p>
      </div>
      <div>
        <p class="text-slate-500 text-xs">Driver</p>
        <p class="font-medium capitalize">{{ driverName || '—' }}</p>
      </div>
      <div v-if="dep.vehicle">
        <p class="text-slate-500 text-xs">Vehicle</p>
        <p class="font-medium">
          {{ dep.vehicle.description ?? '—' }}
          <span v-if="dep.vehicle.registration" class="text-slate-500">
            ({{ dep.vehicle.registration }})
          </span>
        </p>
      </div>
    </section>

    <section class="mb-4 card">
      <h2 class="mb-3 font-semibold">Payment</h2>
      <div class="flex justify-between text-sm">
        <div>
          <p class="text-slate-500 text-xs">Fare</p>
          <p class="font-medium">{{ money(booking.fare) }}</p>
        </div>
        <div v-if="payment?.status">
          <p class="text-slate-500 text-xs">Payment status</p>
          <StatusBadge :status="payment.status" />
        </div>
      </div>
      <p v-if="booking.refund" class="mt-3 text-slate-600 text-sm">
        Simulated refund: {{ money(booking.refund.amount) }} ({{ label(booking.refund.status) }})
      </p>

      <div v-if="isPending" class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
        <span class="text-amber-700 text-sm">
          {{ secondsLeft ? `Seat held for ${countdown} — pay to confirm.` : 'This reservation has expired.' }}
        </span>
        <button class="btn" :disabled="busy || secondsLeft === 0" @click="pay">Pay now</button>
      </div>
      <div v-else-if="canCancel" class="mt-3 pt-3 border-t">
        <button class="btn btn-danger" :disabled="busy" @click="cancel">Cancel booking</button>
      </div>
    </section>
  </template>
</template>
