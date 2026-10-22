<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { verifyPayment } from '@/services/passengerService'
import { money } from '@/utils/format'

const route = useRoute()
const reference = route.query.reference || route.query.trxref
// verifying | success | failed | pending | invalid
const state = ref('verifying')
const message = ref('')
const payment = ref(null)

async function verify() {
  state.value = 'verifying'
  if (!reference) {
    state.value = 'invalid'
    return
  }
  try {
    const { data } = await verifyPayment(reference)
    const body = data?.data ?? data
    payment.value = body
    const status = String(body?.status ?? '').toUpperCase()
    message.value = data?.message ?? ''
    if (['SUCCESS', 'SUCCESSFUL', 'PAID', 'CONFIRMED'].includes(status)) state.value = 'success'
    else if (['PENDING', 'PROCESSING', 'ONGOING'].includes(status)) state.value = 'pending'
    else state.value = 'failed'
  } catch (e) {
    message.value = e.response?.data?.message ?? ''
    state.value = e.response ? 'failed' : 'pending'
  }
}

onMounted(verify)
</script>

<template>
  <div class="mx-auto max-w-md text-center card">
    <template v-if="state === 'verifying'">
      <h1 class="font-bold text-xl">Confirming your payment…</h1>
      <p class="mt-2 text-slate-600 text-sm">Please don't close or refresh this page.</p>
    </template>

    <template v-else-if="state === 'success'">
      <h1 class="font-bold text-green-700 text-xl">Payment successful</h1>
      <p class="mt-2 text-slate-600 text-sm">Your seat is confirmed.</p>
      <p v-if="payment?.amount" class="mt-1 font-medium">{{ money(payment.amount) }}</p>
    </template>

    <template v-else-if="state === 'pending'">
      <h1 class="font-bold text-amber-700 text-xl">Payment not confirmed yet</h1>
      <p class="mt-2 text-slate-600 text-sm">
        We couldn't confirm the payment yet. Check again, or look at My trips shortly.
      </p>
      <button class="mt-3 btn" @click="verify">Check again</button>
    </template>

    <template v-else-if="state === 'invalid'">
      <h1 class="font-bold text-red-700 text-xl">Missing payment reference</h1>
      <p class="mt-2 text-slate-600 text-sm">This page must be opened from the payment gateway.</p>
    </template>

    <template v-else>
      <h1 class="font-bold text-red-700 text-xl">Payment failed</h1>
      <p class="mt-2 text-slate-600 text-sm">
        {{ message || 'The payment was not completed, or the reservation has expired.' }}
      </p>
    </template>

    <p v-if="reference" class="mt-3 text-slate-400 text-xs">Reference: {{ reference }}</p>
    <RouterLink v-if="state !== 'verifying'" to="/trips" class="inline-block mt-4 btn btn-secondary">
      Go to My trips
    </RouterLink>
  </div>
</template>
