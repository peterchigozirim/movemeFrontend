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
  <div class="min-h-screen bg-slate-50">
    <header class="border-b bg-white">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <span class="text-lg font-bold text-indigo-600">MoveMe</span>
        <nav class="flex flex-1 flex-wrap gap-3 text-sm">
          <RouterLink
            v-for="[to, text] in links"
            :key="to"
            :to="to"
            class="text-slate-600 hover:text-indigo-600"
            active-class="font-semibold !text-indigo-600"
          >
            {{ text }}
          </RouterLink>
        </nav>
        <span class="text-sm text-slate-500">{{ store.user?.name }} ({{ store.role }})</span>
        <button class="btn btn-secondary" @click="logout">Log out</button>
      </div>
    </header>
    <main class="mx-auto max-w-5xl p-4"><RouterView /></main>
  </div>
</template>
