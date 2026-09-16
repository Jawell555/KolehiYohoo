<script setup>
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'

const { selectedSchool, isSchoolSaved, toggleSave, openRoutes } = useSchools()
const { showSection } = useNavigation()

function handleOpenRoutes() {
  openRoutes(showSection)
}
</script>

<template>
  <section id="schoolDetailsSection" class="section">
    <button type="button" class="back-btn" @click="showSection('schoolsSection')">
      ← Back to Search Results
    </button>
    <div v-if="selectedSchool" class="school-profile">
      <div class="profile-header">
        <p class="eyebrow">SCHOOL OVERVIEW</p>
        <h1>{{ selectedSchool.name }}</h1>
        <p>{{ selectedSchool.location }}</p>
      </div>
      <div class="profile-body">
        <div class="profile-columns">
          <div>
            <h2>About the School</h2>
            <p>{{ selectedSchool.description }}</p>
            <br />
            <h2>Available Programs</h2>
            <p>{{ selectedSchool.courses.join(', ') }}</p>
          </div>
          <div>
            <h2>School Information</h2>
            <div class="detail-item">
              <strong>Address</strong>
              <p>{{ selectedSchool.address }}</p>
            </div>
            <div class="detail-item">
              <strong>Contact Number</strong>
              <p>{{ selectedSchool.contact }}</p>
            </div>
            <div class="detail-item">
              <strong>Email</strong>
              <p>{{ selectedSchool.email }}</p>
            </div>
            <div class="detail-item">
              <strong>Official Website</strong>
              <p>
                <a
                  class="official-link"
                  :href="selectedSchool.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit official website
                </a>
              </p>
            </div>
          </div>
        </div>
        <br />
        <div class="detail-actions">
          <button type="button" class="primary-btn" @click="toggleSave(selectedSchool.id)">
            {{ isSchoolSaved(selectedSchool.id) ? 'Remove from Saved' : 'Save School' }}
          </button>
          <button type="button" class="primary-btn secondary-btn" @click="handleOpenRoutes">
            View Possible Routes
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
