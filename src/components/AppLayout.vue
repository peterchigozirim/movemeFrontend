<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const store = useUserStore()
const router = useRouter()

const links = computed(() => {
  if (store.isAdmin) {
    return [
      ['/admin/routes', 'Routes & fares'],
      ['/admin/drivers', 'Drivers'],
      ['/admin/users', 'Users'],
      ['/admin/issues', 'Issues'],
    ]
  }
  if (store.isDriver) {
    return [
      ['/driver/departures', 'Departures'],
      ['/driver/vehicle', 'Vehicle'],
      ['/notifications', 'Notifications'],
    ]
  }
  return [
    ['/search', 'Find a ride'],
    ['/trips', 'My trips'],
    ['/notifications', 'Notifications'],
  ]
})

async function logout() {
  await store.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <header class="bg-white border-b">
      <div class="flex flex-wrap items-center gap-4 mx-auto px-4 py-3 max-w-5xl">
        <span class="font-bold text-indigo-600 text-lg">MoveMe</span>
        <nav class="flex flex-wrap flex-1 gap-3 text-sm">
          <RouterLink v-for="[to, text] in links" :key="to" :to="to" class="text-slate-600 hover:text-indigo-600"
            active-class="font-semibold !text-indigo-600">
            {{ text }}
          </RouterLink>
        </nav>
        <span class="text-slate-500 text-sm">{{ store.user?.name }} ({{ store.role }})</span>
        <button class="btn btn-secondary" @click="logout">Log out</button>
      </div>
    </header>
    <main class="mx-auto p-4 max-w-5xl">
      <RouterView />
    </main>
  </div>
</template>
