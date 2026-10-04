<script setup>
import { useToast } from '../composables/useToast'

const { toast, hideToast } = useToast()
</script>

<template>
  <div v-if="toast.show" id="toast" class="toast show" role="alert" aria-live="assertive">
    <div class="toast-body">
      <div class="toast-text">
        <strong v-if="toast.title">{{ toast.title }}</strong>
        <p>{{ toast.message }}</p>
      </div>
      <button
        type="button"
        class="toast-close-btn"
        title="Dismiss"
        aria-label="Dismiss notification"
        @click="hideToast"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped></style>
