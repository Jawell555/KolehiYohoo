<script setup>
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import SchoolRoutesPanel from './SchoolRoutesPanel.vue'

const { selectedSchool } = useSchools()

const { showSection } = useNavigation()
</script>

<template>
  <section id="routesSection" class="section">
    <button type="button" class="back-btn" @click="showSection('schoolDetailsSection')">
      ← Back to School Overview
    </button>
    <div class="section-heading">
      <p class="eyebrow">POSSIBLE ROUTES</p>
      <h1>Routes to {{ selectedSchool?.name }}</h1>
      <p>Enter your starting location to view possible travel routes.</p>
    </div>

    <SchoolRoutesPanel />
  </section>
</template>
