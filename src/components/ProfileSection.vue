<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const { currentUser, currentRole } = useAuth()
const { showSection } = useNavigation()
</script>
<template>
  <section id="profileSection" class="section">
    <h1>Profile</h1>
    <div>
      <p>{{ currentUser }}</p>
      <p>{{ currentRole }}</p>
    </div>
  </section>
</template>
<style scoped></style>
