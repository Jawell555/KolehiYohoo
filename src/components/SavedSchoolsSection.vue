<script setup>
import { computed } from 'vue'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import { useAuth } from '../composables/useAuth'
import SchoolCard from './SchoolCard.vue'
import SkeletonSchoolCard from './SkeletonSchoolCard.vue'

const { savedSchoolsList, isSchoolSaved, toggleSave, viewSchool, isLoadingSaved } = useSchools()
const { showSection } = useNavigation()
const { currentUser, openAuthModal } = useAuth()

const isStudent = computed(
  () => !!currentUser.value && (currentUser.value.role === 'student' || currentUser.value.role_id === 1),
)

function handleViewSchool(school) {
  viewSchool(school, showSection)
}
</script>

<template>
  <section id="savedSection" class="section">
    <div class="section-heading">
      <!-- <p class="eyebrow">MY PROFILE</p> -->
      <h1>Saved Schools</h1>
      <p>Keep track of the schools you may want to consider.</p>
    </div>

    <div v-if="!currentUser" class="empty-state">
      <h3>Log in to see your saved schools</h3>
      <p>Saved schools are stored in your student account.</p>
      <br />
      <button type="button" class="primary-btn" @click="openAuthModal('login', 'student')">
        Log In
      </button>
    </div>

    <div v-else-if="!isStudent" class="empty-state">
      <h3>Saved schools are for student accounts</h3>
      <p>Log in with a student account to save and track schools.</p>
    </div>

    <!-- Skeleton Loading Grid -->
    <div v-else-if="isLoadingSaved" class="school-grid">
      <SkeletonSchoolCard v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="savedSchoolsList.length > 0" class="school-grid">
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
