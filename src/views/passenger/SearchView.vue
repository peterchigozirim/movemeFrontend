<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRoutes, searchDepartures, createBooking } from '@/services/passengerService'
import { useAction } from '@/composable/useAction'
import { dateTime, money, label } from '@/utils/format'

const router = useRouter()
const { busy, run } = useAction()
const routes = ref([])
const results = ref(null)
const filter = reactive({ origin: '', destination: '', routeId: '', mode: 'solo', when: 'immediate', date: '' })
// One idempotency key per departure so a retry/double-click can't double book.
const keys = {}

onMounted(async () => {
  const { data } = await run(fetchRoutes)
  if (data) routes.value = data.data
})

async function search() {
  const params = { origin: filter.origin, destination: filter.destination }
  if (filter.when === 'scheduled' && filter.date) params.date = filter.date
  const { data } = await run(() => searchDepartures(params))
  if (data) results.value = data.data
}

async function book(d) {
  keys[d.id] ??= crypto.randomUUID()
  const { data: booking } = await run(() => createBooking({ departureId: d.id }, keys[d.id]))
  if (booking) {
    delete keys[d.id]
    router.push('/trips')
  } else {
    await search() // availability may have changed (e.g. last seat taken)
  }
}
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Find a ride</h1>
  <form class="gap-3 grid sm:grid-cols-4 card" @submit.prevent="search">
    <div class="sm:col-span-2">
      <label class="label" for="route">Route</label>
      <select id="route" @change="filter.destination = routes.find(r => r.origin === filter.origin)?.destination || ''"
        v-model="filter.origin" class="input" required>
        <option value="" disabled>Select a route</option>
        <option v-for="r in routes" :key="r.id" :value="r.origin">
          {{ r.origin }} → {{ r.destination }} ({{ r.durationMinutes }} min)
        </option>
      </select>
    </div>
    <div class="flex items-end sm:col-span-4">
      <button class="btn" :disabled="busy">Search departures</button>
    </div>
  </form>

  <section v-if="results" class="space-y-3 mt-6">
    <p v-if="!results.length" class="text-slate-600 text-center card">
      No departures available for these options. Try another mode, time or route.
    </p>
    <article v-for="d in results" :key="d.id" class="card">
      <p class="font-semibold">{{ d.origin }} → {{ d.destination }}</p>
      <div v-for="m in d.departures" :key="m.id"
        class="flex justify-between items-center gap-3 py-4 border-slate-300 border-b">
        <div>
          <p class="text-slate-600 text-sm">
            Departs {{ dateTime(m.departureTime) }} · {{ d.durationMinutes }} min · Driver:
            {{ m.driver?.firstName }} {{ m.driver?.lastName }}
          </p>
          <p class="text-slate-600 text-sm">
            {{ label(d.mode) }} ·
            <template v-if="m.mode === 'SOLO'">Exclusive use</template>
            <template v-else>{{ d.totalSeats ?? 0 }} of {{ m.vehicle.seats }} seats free</template>
          </p>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg">{{ money(m.mode === 'SOLO' ? d.soloFare : d.pooledFare) }}</p>
          <button class="bg-slate-400 mt-1 btn" v-if="m.status == 'CLOSED'" :disabled="busy || m.status === 'CLOSED'">
            Closed
          </button>
          <button class="mt-1 btn" v-else :disabled="busy || m.status === 'CLOSED'" @click="book(m)">
            {{ m.mode === 'SOLO' ? 'Book solo' : 'Reserve seat' }}
          </button>
        </div>
      </div>
    </article>
  </section>
</template>
