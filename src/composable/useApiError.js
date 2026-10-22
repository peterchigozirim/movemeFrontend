import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

const STATUS_MESSAGES = {
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'A server error occurred. Please try again later.',
  503: 'Service is temporarily unavailable. Please try again later.',
}

export function useApiError() {
  const toast = useToast()
  const router = useRouter()
  const _recentMessages = new Set()

  function _toast(detail, summary = 'Error', life = 4000) {
    // Deduplicate: ignore if the same message was shown in the last 2 seconds
    if (_recentMessages.has(detail)) return
    _recentMessages.add(detail)
    setTimeout(() => _recentMessages.delete(detail), 2000)

    toast.add({ severity: 'error', summary, detail, life })
  }

  function handleApiError(error, options = {}) {
    const { summary, life } = options

    // No response — network error or request was never sent
    if (!error.response) {
      const msg = navigator.onLine
        ? 'Request timed out. Please check your connection and try again.'
        : 'You appear to be offline. Please check your internet connection.'
      _toast(msg, summary ?? 'Network Error', life)
      return
    }

    const status = error.response.status

    // 422 Unprocessable — field-level validation errors
    if (status === 422) {
      const errors = error.response.data?.errors ?? {}
      if (errors && Object.keys(errors).length > 0) {
        for (const key of Object.keys(errors)) {
          _toast(errors[key][0], summary ?? 'Something went wrong', life)
        }
      } else {
        const message = error.response.data?.message
        _toast(
          typeof message === 'string' && message.trim().length > 0
            ? message
            : 'Something went wrong',
          summary ?? 'Something went wrong',
          life,
        )
      }
      return
    }

    if (status === 401) {
      router.replace('/login')
      return
    }

    // Any other server error with a message
    if (error.response.data?.message) {
      _toast(error.response.data.message, summary ?? 'Error', life)
      return
    }

    // Known status codes
    if (STATUS_MESSAGES[status]) {
      _toast(STATUS_MESSAGES[status], summary ?? 'Error', life)
      return
    }

    // Fallback
    _toast('An unexpected error occurred. Please try again.', summary ?? 'Error', life)
    console.error('[useApiError]', error)
  }

  return { handleApiError }
}
