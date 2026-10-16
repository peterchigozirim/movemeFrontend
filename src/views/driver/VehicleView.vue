<script setup>
import { onMounted, reactive } from 'vue'
import { fetchVehicle, saveVehicle } from '@/services/driverService'
import { useAction } from '@/composable/useAction'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const { busy, run } = useAction()
const form = reactive({ make: '', model: '', registration: '', seats: 1 })
const state = reactive({ enabled: null, exists: false })

onMounted(async () => {
  const { data } = await run(fetchVehicle)
  if (data?.data) {
    console.log(data.data);

    Object.assign(form, {
      make: data.data.make,
      model: data.data.model,
      registration: data.data.registration,
      seats: data.data.seats,
    })
    state.exists = true
    state.enabled = userStore.user?.driverEnabled
  }
})

async function submit() {
  const res = await run(
    () => saveVehicle({ ...form, seats: Number(form.seats) }),
    'Vehicle saved',
  )
  if (res) state.exists = true
}
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">My vehicle</h1>
  <p v-if="state.enabled === false" class="bg-amber-100 mb-4 p-3 rounded text-amber-800 text-sm">
    Your driver account is not enabled yet. An administrator must enable it before you can publish
    departures.
  </p>
  <form v-if="state.enabled === false" class="space-y-3 max-w-md card" @submit.prevent="submit">
    <div>
      <label class="label" for="desc">Vehicle Make</label>
      <input id="desc" v-model="form.make" class="input" placeholder="Grey Toyota Sienna" required />
    </div>
    <div>
      <label class="label" for="reg">Registration identifier</label>
      <input id="reg" v-model="form.registration" class="input" required />
    </div>
    <div>
      <label class="label" for="seats">Passenger seats</label>
      <input id="seats" v-model="form.seats" class="input" type="number" min="1" step="1" required />
    </div>
    <div>
      <label class="label" for="model">Vehicle Model</label>
      <input id="model" v-model="form.model" class="input" placeholder="Sienna" required />
    </div>
    <button class="btn" :disabled="busy">Save vehicle</button>
  </form>
  <section v-else class="gap-3 grid sm:grid-cols-4 mb-4 card">
    <div>
      <p class="text-slate-500 text-xs">Vehicle Make</p>
      <p class="font-medium">{{ form.make ?? '-' }}</p>
    </div>
    <div>
      <p class="text-slate-500 text-xs">Vehicle Registration Number</p>
      <p class="font-medium">{{ form.registration ?? '-' }}</p>
    </div>
    <div>
      <p class="text-slate-500 text-xs">Seats</p>
      <p class="font-medium">{{ form.seats ?? '-' }}</p>
    </div>
    <div>
      <p class="text-slate-500 text-xs">Vehicle Model</p>
      <p class="font-medium">
        {{ form.model ?? '—' }}
      </p>
    </div>
  </section>
</template>
