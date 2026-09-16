import { reactive } from 'vue'

const toast = reactive({
  show: false,
  title: '',
  message: '',
  icon: '🔔',
})

let toastTimer = null

export function useToast() {
  function showToast(message, title = '', icon = '🔔', duration = 4000) {
    toast.message = message
    toast.title = title
    toast.icon = icon
    toast.show = true
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
    toastTimer = setTimeout(() => {
      toast.show = false
    }, duration)
  }

  function hideToast() {
    toast.show = false
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
  }

  return {
    toast,
    showToast,
    hideToast,
  }
}
