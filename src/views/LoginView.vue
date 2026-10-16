<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAction } from '@/composable/useAction'

const store = useUserStore()
const router = useRouter()
const { busy, run } = useAction()
const form = reactive({ email: '', password: '' })

async function submit() {
  const user = await run(() => store.handleLogin(form))
  if (user) router.replace(store.home)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form class="card w-full max-w-sm space-y-4" @submit.prevent="submit">
      <h1 class="text-xl font-bold">Log in to MoveMe</h1>
      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="form.email" class="input" type="email" required />
      </div>
      <div>
        <label class="label" for="password">Password</label>
        <input id="password" v-model="form.password" class="input" type="password" required />
      </div>
      <button class="btn w-full" :disabled="busy">Log in</button>
      <p class="text-sm text-slate-600">
        No account? <RouterLink class="text-indigo-600" to="/register">Register</RouterLink>
      </p>
    </form>
  </div>
</template>
