<script setup>
import { computed } from 'vue'
import { label } from '@/utils/format'

const props = defineProps({ status: { type: String, required: true } })

const color = computed(() => {
  const s = props.status
  if (
    ['CONFIRMED', 'confirmed', 'COMPLETED', 'RESOLVED', 'SUCCESS', 'OPEN_FOR_BOOKING', 'SCHEDULED'].includes(s)
  )
    return 'bg-green-100 text-green-800'
  if (['PENDING_PAYMENT', 'ARRIVED', 'IN_PROGRESS', 'OPEN', 'REFUNDED'].includes(s))
    return 'bg-amber-100 text-amber-800'
  if (['CANCELLED', 'EXPIRED', 'FAILED', 'CLOSED'].includes(s)) return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
})
</script>

<template>
  <span
    class="flex justify-center items-center px-2 py-0.5 rounded-full font-medium text-xs capitalize first-letter:uppercase"
    :class="color">
    {{ label(status) }}
  </span>
</template>
