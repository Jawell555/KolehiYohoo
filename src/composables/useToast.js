import { reactive } from 'vue'

const toast = reactive({
  show: false,
  title: '',
  message: '',
})

let toastTimer = null

export function showToast(message, title = '', duration = 4000) {
  toast.message = message
  toast.title = title
  toast.show = true
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = setTimeout(() => {
    toast.show = false
  }, duration)
}

export function hideToast() {
  toast.show = false
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
}

export function useToast() {
  return {
    toast,
    showToast,
    hideToast,
  }
}
