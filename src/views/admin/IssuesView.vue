<script setup>
import { onMounted, reactive, ref } from 'vue'
import { fetchIssues, createIssue, updateIssue } from '@/services/adminService'
import { useAction } from '@/composable/useAction'
import StatusBadge from '@/components/StatusBadge.vue'
import { dateTime } from '@/utils/format'

const { busy, run } = useAction()
const issues = ref([])
const form = reactive({ title: '', description: '' })

async function load() {
  const res = await run(fetchIssues)
  if (res) issues.value = res.data
}

async function add() {
  const res = await run(() => createIssue({ ...form }), 'Issue recorded')
  if (res) {
    form.title = ''
    form.description = ''
    await load()
  }
}

async function resolve(i) {
  await run(() => updateIssue(i.id, { status: 'resolved' }), 'Issue resolved')
  await load()
}

onMounted(load)
</script>

<template>
  <h1 class="mb-4 text-xl font-bold">Operational issues</h1>
  <form class="card mb-6 space-y-3" @submit.prevent="add">
    <input v-model="form.title" class="input" placeholder="Title" required />
    <textarea v-model="form.description" class="input" rows="3" placeholder="Details" required />
    <button class="btn" :disabled="busy">Record issue</button>
  </form>
  <p v-if="!issues.length" class="text-slate-500">No issues recorded.</p>
  <div class="space-y-3">
    <article v-for="i in issues" :key="i.id" class="card">
      <div class="flex justify-between gap-2">
        <p class="font-semibold">{{ i.title }}</p>
        <StatusBadge :status="i.status" />
      </div>
      <p class="text-sm">{{ i.description }}</p>
      <p class="text-xs text-slate-500">
        Recorded by {{ i.createdBy?.name }} · {{ dateTime(i.createdAt) }}
        <template v-if="i.resolvedBy">
          · Resolved by {{ i.resolvedBy.name }} {{ dateTime(i.resolvedAt) }}</template
        >
      </p>
      <button
        v-if="i.status !== 'resolved'"
        class="btn btn-secondary mt-2"
        :disabled="busy"
        @click="resolve(i)"
      >
        Mark resolved
      </button>
    </article>
  </div>
</template>
