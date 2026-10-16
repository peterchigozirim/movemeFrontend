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
const filter = reactive({ routeId: '', mode: 'solo', when: 'immediate', date: '' })
// One idempotency key per departure so a retry/double-click can't double book.
const keys = {}

onMounted(async () => {
  const res = await run(fetchRoutes)
  if (res) routes.value = res.data
})

async function search() {
  const params = { routeId: filter.routeId, mode: filter.mode, when: filter.when }
  if (filter.when === 'scheduled' && filter.date) params.date = filter.date
  const res = await run(() => searchDepartures(params))
  if (res) results.value = res.data
}

async function book(d) {
  keys[d.id] ??= crypto.randomUUID()
  const res = await run(() => createBooking({ departureId: d.id }, keys[d.id]))
  if (res) {
    delete keys[d.id]
    router.push('/trips')
  } else {
    await search() // availability may have changed (e.g. last seat taken)
  }
}
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">Find a ride</h1>
  <form class="card grid gap-3 sm:grid-cols-4" @submit.prevent="search">
    <div class="sm:col-span-2">
      <label class="label" for="route">Route</label>
      <select id="route" v-model="filter.routeId" class="input" required>
        <option value="" disabled>Select a route</option>
        <option v-for="r in routes" :key="r.id" :value="r.id">
          {{ r.pickup }} → {{ r.dropoff }} ({{ r.durationMinutes }} min)
        </option>
      </select>
    </div>
    <div>
      <label class="label" for="mode">Travel mode</label>
      <select id="mode" v-model="filter.mode" class="input">
        <option value="solo">Solo (private)</option>
        <option value="pooled">Pooled (shared seat)</option>
      </select>
    </div>
    <div>
      <label class="label" for="when">When</label>
      <select id="when" v-model="filter.when" class="input">
        <option value="immediate">Now (next 15 min)</option>
        <option value="scheduled">Scheduled</option>
      </select>
    </div>
    <div v-if="filter.when === 'scheduled'">
      <label class="label" for="date">Date</label>
      <input id="date" v-model="filter.date" class="input" type="date" />
    </div>
    <div class="flex items-end sm:col-span-4">
      <button class="btn" :disabled="busy">Search departures</button>
    </div>
  </form>

  <section v-if="results" class="mt-6 space-y-3">
    <p v-if="!results.length" class="card text-center text-slate-600">
      No departures available for these options. Try another mode, time or route.
    </p>
    <article
      v-for="d in results"
      :key="d.id"
      class="card flex flex-wrap items-center justify-between gap-3"
    >
      <div>
        <p class="font-semibold">{{ d.route.pickup }} → {{ d.route.dropoff }}</p>
        <p class="text-sm text-slate-600">
          Departs {{ dateTime(d.departureTime) }} · {{ d.route.durationMinutes }} min · Driver
          {{ d.driver.name }}
        </p>
        <p class="text-sm text-slate-600">
          {{ label(d.mode) }} ·
          <template v-if="d.mode === 'solo'">Exclusive use</template>
          <template v-else>{{ d.availableSeats }} of {{ d.capacity }} seats free</template>
        </p>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold">{{ money(d.fare) }}</p>
        <button class="btn mt-1" :disabled="busy" @click="book(d)">
          {{ d.mode === 'solo' ? 'Book solo' : 'Reserve seat' }}
        </button>
      </div>
    </article>
  </section>
</template>
