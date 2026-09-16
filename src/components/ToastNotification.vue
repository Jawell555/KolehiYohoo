<script setup>
import { useToast } from '../composables/useToast'

const { toast } = useToast()
</script>

<template>
  <div v-if="toast.show" id="toast" class="toast show">
    <div class="toast-body">
      <div class="toast-icon">{{ toast.icon }}</div>
      <div class="toast-text">
        <strong v-if="toast.title">{{ toast.title }}</strong>
        <p>{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
