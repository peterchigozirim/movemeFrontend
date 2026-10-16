<script setup>
import { onMounted, ref } from 'vue'
import { fetchUsers } from '@/services/adminService'
import { useAction } from '@/composable/useAction'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { User } from '@primeicons/vue';
import { dateTime } from '@/utils/format'

const { busy, run } = useAction()
const users = ref([])

async function load() {
  const { data } = await run(fetchUsers)
  if (data) users.value = data.data
}


const selectedUser = ref(null)

const showUserDialog = ref(false)
function viewUser(user) {
  selectedUser.value = user
  showUserDialog.value = true
}

onMounted(load)
</script>

<template>
  <h1 class="mb-4 font-bold text-xl">Passenger access</h1>
  <p v-if="busy" class="text-slate-500">Loading passengers...</p>
  <p v-if="!users.length && !busy" class="text-slate-500">No passengers registered.</p>
  <div class="space-y-3">
    <div v-for="d in users" :key="d.id" class="flex flex-wrap justify-between items-center gap-2 card">
      <div>
        <p class="font-semibold">{{ d.name }}</p>
        <p class="mb-2 text-slate-600 text-sm capitalize">
          {{ d.firstName }} {{ d.lastName }} ·
        </p>
        <div class="flex gap-2 font-semibold">

        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button severity="help" variant="text" @click="viewUser(d)" class="">
          <User />
        </Button>
      </div>
    </div>
    <Dialog v-model:visible="showUserDialog" modal header="User Details" class="w-full max-w-lg">
      <div v-if="selectedUser">
        <p class="mb-2"><strong>Name:</strong> {{ selectedUser.firstName }} {{ selectedUser.lastName }}</p>
        <p class="mb-2"><strong>Email:</strong> {{ selectedUser.email }}</p>
        <p class="mb-2"><strong>Registered:</strong> {{ dateTime(selectedUser.createdAt) }}</p>
      </div>
      <template #footer>
        <Button label="Close" severity="danger" @click="showUserDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
