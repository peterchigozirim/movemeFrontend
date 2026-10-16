<script setup>
import { onMounted, ref } from 'vue'
import { fetchDrivers, setDriverEnabled } from '@/services/adminService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { Car, User } from '@primeicons/vue';
import { dateTime } from '@/utils/format'

const { busy, run } = useAction()
const drivers = ref([])

async function load() {
  const { data } = await run(fetchDrivers)
  if (data) drivers.value = data.data
}

async function toggle(d, type) {
  await run(
    () => setDriverEnabled(d.id, type)
  )
  await load()
}

const showVehicleDialog = ref(false)
const selectedVehicle = ref(null)
const selectedDriver = ref(null)

function viewVehicle(vehicles) {
  selectedVehicle.value = vehicles
  showVehicleDialog.value = true
}
const showDriverDialog = ref(false)
function viewDriver(user) {
  selectedDriver.value = user
  showDriverDialog.value = true
}

onMounted(load)
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Driver access</h1>
  <p v-if="busy" class="text-slate-500">Loading drivers...</p>
  <p v-if="!drivers.length && !busy" class="text-slate-500">No drivers registered.</p>
  <div class="space-y-3">
    <div v-for="d in drivers" :key="d.id" class="flex flex-wrap justify-between items-center gap-2 card">
      <div>
        <p class="font-semibold">{{ d.name }}</p>
        <p class="mb-2 text-slate-600 text-sm capitalize">
          {{ d.firstName }} {{ d.lastName }} ·
        </p>
        <div class="flex gap-2 font-semibold">
          <Button severity="help" variant="text" @click="viewDriver(d)" class="">
            <User />
          </Button>
          <Button severity="help" variant="text" @click="viewVehicle(d.vehicles)" class="">
            <Car />
          </Button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="d.driverEnabled ? 'enabled' : 'disabled'" />
        <button class="btn" :class="d.driverEnabled ? 'btn-danger' : ''" :disabled="busy"
          @click="toggle(d, d.driverEnabled ? 'disable' : 'enable')">
          {{ d.driverEnabled ? 'Disable' : 'Enable' }}
        </button>
      </div>
    </div>
    <Dialog v-model:visible="showVehicleDialog" modal header="Vehicle Details" class="w-full max-w-lg">
      <div v-if="selectedVehicle && selectedVehicle.length > 0">
        <div v-for="veh in selectedVehicle" :key="veh.id">
          <p class="mb-2"><strong>Color:</strong> {{ veh.color }}</p>
          <p class="mb-2"><strong>Make:</strong> {{ veh.make }}</p>
          <p class="mb-2"><strong>Model:</strong> {{ veh.model }}</p>
          <p class="mb-2"><strong>registration No:</strong> {{ veh.registration }}</p>
          <p class="mb-2"><strong>Capacity:</strong> {{ veh.seats }} seats</p>
          <p class="mb-2"><strong>Uploaded:</strong> {{ dateTime(veh.createdAt) }}</p>
        </div>
      </div>
      <template #footer>
        <Button label="Close" severity="danger" @click="showVehicleDialog = false" />
      </template>
    </Dialog>
    <Dialog v-model:visible="showDriverDialog" modal header="Driver Details" class="w-full max-w-lg">
      <div v-if="selectedDriver">
        <p class="mb-2"><strong>Name:</strong> {{ selectedDriver.firstName }} {{ selectedDriver.lastName }}</p>
        <p class="mb-2"><strong>Email:</strong> {{ selectedDriver.email }}</p>
        <p class="mb-2"><strong>Registered:</strong> {{ dateTime(selectedDriver.createdAt) }}</p>
      </div>
      <template #footer>
        <Button label="Close" severity="danger" @click="showDriverDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
