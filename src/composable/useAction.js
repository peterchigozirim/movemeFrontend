import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useApiError } from '@/composable/useApiError'

// Wraps API calls: tracks busy state, reports errors, optionally toasts success.
export function useAction() {
  const busy = ref(false)
  const toast = useToast()
  const { handleApiError } = useApiError()

  async function run(fn, successMessage) {
    if (busy.value) return undefined
    busy.value = true
    try {
      const res = await fn()
      if (successMessage) {
        toast.add({
          severity: 'success',
          summary: successMessage,
          detail: res?.data?.message ?? '',
          life: 3000,
        })
      }
      return res
    } catch (e) {
      handleApiError(e)
      return undefined
    } finally {
      busy.value = false
    }
  }

  return { busy, run }
}
