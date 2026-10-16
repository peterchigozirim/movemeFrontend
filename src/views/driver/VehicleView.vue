<script setup>
import { onMounted, reactive } from 'vue'
import { fetchVehicle, saveVehicle } from '@/services/driverService'
import { useAction } from '@/composable/useAction'

const { busy, run } = useAction()
const form = reactive({ description: '', registration: '', capacity: 1 })
const state = reactive({ enabled: null, exists: false })

onMounted(async () => {
  const res = await run(fetchVehicle)
  if (res?.data) {
    Object.assign(form, {
      description: res.data.description,
      registration: res.data.registration,
      capacity: res.data.capacity,
    })
    state.exists = true
    state.enabled = res.data.driverEnabled
  }
})

async function submit() {
  const res = await run(
    () => saveVehicle({ ...form, capacity: Number(form.capacity) }),
    'Vehicle saved',
  )
  if (res) state.exists = true
}
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">My vehicle</h1>
  <p v-if="state.enabled === false" class="mb-4 rounded bg-amber-100 p-3 text-sm text-amber-800">
    Your driver account is not enabled yet. An administrator must enable it before you can publish
    departures.
  </p>
  <form class="card max-w-md space-y-3" @submit.prevent="submit">
    <div>
      <label class="label" for="desc">Vehicle description</label>
      <input
        id="desc"
        v-model="form.description"
        class="input"
        placeholder="Grey Toyota Sienna"
        required
      />
    </div>
    <div>
      <label class="label" for="reg">Registration identifier</label>
      <input id="reg" v-model="form.registration" class="input" required />
    </div>
    <div>
      <label class="label" for="cap">Passenger seats</label>
      <input
        id="cap"
        v-model="form.capacity"
        class="input"
        type="number"
        min="1"
        step="1"
        required
      />
    </div>
    <button class="btn" :disabled="busy">Save vehicle</button>
  </form>
</template>
