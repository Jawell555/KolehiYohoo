<script setup>
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import SchoolCard from './SchoolCard.vue'

const { savedSchoolsList, isSchoolSaved, toggleSave, viewSchool } = useSchools()
const { showSection } = useNavigation()

function handleViewSchool(school) {
  viewSchool(school, showSection)
}
</script>

<template>
  <section id="savedSection" class="section">
    <div class="section-heading">
      <p class="eyebrow">MY PROFILE</p>
      <h1>Saved Schools</h1>
      <p>Keep track of the schools you may want to consider.</p>
    </div>

    <div v-if="savedSchoolsList.length > 0" class="school-grid">
      <SchoolCard
        v-for="school in savedSchoolsList"
        :key="school.id"
        :school="school"
        :is-saved="isSchoolSaved(school.id)"
        tag="Saved"
        :is-saved-view="true"
        @view="handleViewSchool"
        @toggle-save="toggleSave"
      />
    </div>

    <div v-else class="empty-state">
      <h3>No saved schools yet</h3>
      <p>Search for a school and click “Save School” to add it to your profile.</p>
    </div>
  </section>
</template>

<style scoped></style>
