<script setup>
import { onMounted, reactive, ref } from 'vue'
import { fetchAdminRoutes, createRoute, updateRoute, deleteRoute } from '@/services/adminService'
import { useAction } from '@/composable/useAction'
import { money } from '@/utils/format'
import { Trash, Save } from '@primeicons/vue';

const { busy, run } = useAction()
const routes = ref([])
const blank = () => ({ origin: '', destination: '', durationMinutes: 30, soloFare: 0, pooledFare: 0, isActive: true })
const form = reactive(blank())

async function load() {
  const { data } = await run(fetchAdminRoutes)
  if (data) routes.value = data.data
}

const num = (r) => ({
  durationMinutes: Number(r.durationMinutes),
  soloFare: Number(r.soloFare),
  pooledFare: Number(r.pooledFare),
  isActive: Boolean(r.isActive),
  origin: r.origin,
  destination: r.destination
})

async function add() {
  const res = await run(() => createRoute(num(form)), 'Route created')
  if (res) {
    Object.assign(form, blank())
    await load()
  }
}

async function save(r) {
  await run(() => updateRoute(r.id, num(r)), 'Route updated')
  await load()
}

async function deleteR(id) {
  if (!confirm('Are you sure you want to delete this route?')) return
  const res = await run(() => deleteRoute(id), 'Route deleted')
  if (res) await load()
}

onMounted(load)
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Routes & fares</h1>
  <p class="mb-3 text-slate-600 text-sm">
    Fare changes apply to new departures only; published departures and existing bookings keep their
    stored fare.
  </p>

  <form class="gap-3 grid sm:grid-cols-5 mb-6 card" @submit.prevent="add">
    <input v-model="form.origin" class="input" placeholder="Pickup" required />
    <input v-model="form.destination" class="input" placeholder="Drop-off" required />
    <input v-model="form.durationMinutes" class="input" type="number" min="1" placeholder="Minutes" required />
    <input v-model="form.soloFare" class="input" type="number" min="0" step="0.01" placeholder="Solo fare" required />
    <input v-model="form.pooledFare" class="input" type="number" min="0" step="0.01" placeholder="Pool fare" required />
    <div class="sm:col-span-5"><button class="btn" :disabled="busy">Add route</button></div>
  </form>

  <div class="space-y-3">
    <div v-for="r in routes" :key="r.id" class="items-end gap-3 grid sm:grid-cols-7 card">
      <div class="sm:col-span-2">
        <p class="font-semibold">{{ r.origin }} → {{ r.destination }}</p>
        <p class="text-slate-500 text-xs">
          Solo {{ money(r.soloFare) }} · Pool {{ money(r.pooledFare) }}
        </p>
      </div>
      <div>
        <label class="label">Minutes</label>
        <input v-model="r.durationMinutes" class="input" type="number" min="1" />
      </div>
      <div>
        <label class="label">Solo fare</label>
        <input v-model="r.soloFare" class="input" type="number" min="0" step="0.01" />
      </div>
      <div>
        <label class="label">Pool fare</label>
        <input v-model="r.pooledFare" class="input" type="number" min="0" step="0.01" />
      </div>
      <div>
        <label class="label">Status</label>
        <select v-model="r.isActive" class="input">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </select>
      </div>
      <div class="hidden md:flex flex-row gap-2">
        <button class="btn" :disabled="busy" @click="save(r)">
          <Save />
        </button>
        <button class="bg-red-500 btn" :disabled="busy" @click="deleteR(r.id)">
          <Trash />
        </button>
      </div>
      <div class="md:hidden flex flex-row gap-2">
        <button class="w-full btn" :disabled="busy" @click="save(r)">Save</button>
        <button class="bg-red-500 w-full m btn" :disabled="busy" @click="deleteR(r.id)">Delete</button>
      </div>
    </div>
  </div>
</template>
