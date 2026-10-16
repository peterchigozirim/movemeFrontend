<script setup>
import { computed } from 'vue'
import { label } from '@/utils/format'

const props = defineProps({ status: { type: String, required: true } })

const color = computed(() => {
  const s = props.status
  if (
    ['confirmed', 'completed', 'resolved', 'success', 'open_for_booking', 'scheduled'].includes(s)
  )
    return 'bg-green-100 text-green-800'
  if (['pending_payment', 'arrived', 'in_progress', 'open', 'refunded'].includes(s))
    return 'bg-amber-100 text-amber-800'
  if (['cancelled', 'expired', 'failed'].includes(s)) return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
})
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="color">
    {{ label(status) }}
  </span>
</template>
