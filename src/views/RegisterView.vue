<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAction } from '@/composable/useAction'

const store = useUserStore()
const router = useRouter()
const { busy, run } = useAction()
const form = reactive({ name: '', email: '', password: '', role: 'passenger' })

async function submit() {
  const user = await run(() => store.handleRegister(form))
  if (user) router.replace(store.home)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form class="card w-full max-w-sm space-y-4" @submit.prevent="submit">
      <h1 class="text-xl font-bold">Create an account</h1>
      <div>
        <label class="label" for="name">Full name</label>
        <input id="name" v-model="form.name" class="input" required />
      </div>
      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="form.email" class="input" type="email" required />
      </div>
      <div>
        <label class="label" for="password">Password (min 8 characters)</label>
        <input
          id="password"
          v-model="form.password"
          class="input"
          type="password"
          minlength="8"
          required
        />
      </div>
      <div>
        <label class="label" for="role">I am a</label>
        <select id="role" v-model="form.role" class="input">
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>
      </div>
      <button class="btn w-full" :disabled="busy">Register</button>
      <p class="text-sm text-slate-600">
        Have an account? <RouterLink class="text-indigo-600" to="/login">Log in</RouterLink>
      </p>
    </form>
  </div>
</template>
