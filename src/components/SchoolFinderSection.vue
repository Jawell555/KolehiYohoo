<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import SchoolCard from './SchoolCard.vue'

const dropdownRef = ref(null)

const {
  searchCourse,
  searchLocation,
  hasSearched,
  searchMessage,
  isCourseDropdownOpen,
  filteredCourses,
  matchedSchools,
  selectCourse,
  clearCourseSearch,
  toggleCourseDropdown,
  onCourseInput,
  closeCourseDropdown,
  searchSchools,
  isSchoolSaved,
  toggleSave,
  viewSchool,
} = useSchools()

const { showSection } = useNavigation()

function handleViewSchool(school) {
  viewSchool(school, showSection)
}

function handleOutsideClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeCourseDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <section id="schoolsSection" class="section">
    <div class="section-heading">
      <p class="eyebrow">SCHOOL FINDER</p>
      <h1>Find schools by program</h1>
      <p>Choose a degree program to see schools that offer it.</p>
    </div>

    <div class="search-panel">
      <!-- Course Dropdown -->
      <div class="form-group">
        <label for="courseSearchInput">Preferred Course / Program</label>
        <div ref="dropdownRef" class="course-dropdown-wrapper">
          <div class="course-input-container">
            <input
              id="courseSearchInput"
              v-model="searchCourse"
              type="text"
              placeholder="Search or select course (e.g., BSIT, BAComm)..."
              autocomplete="off"
              @focus="isCourseDropdownOpen = true"
              @input="onCourseInput"
            />
            <div class="course-input-actions">
              <button
                v-if="searchCourse"
                type="button"
                class="course-clear-btn"
                title="Clear course"
                @click="clearCourseSearch"
              >
                ×
              </button>
              <button
                type="button"
                class="course-arrow-btn"
                :class="{ open: isCourseDropdownOpen }"
                title="Toggle dropdown"
                @click.stop="toggleCourseDropdown"
              >
                ▼
              </button>
            </div>
          </div>

          <!-- 3-row visible scrollable dropdown menu -->
          <div v-if="isCourseDropdownOpen" class="course-dropdown-menu">
            <div
              v-for="course in filteredCourses"
              :key="course.code"
              class="course-dropdown-item"
              :class="{ selected: searchCourse === course.name }"
              @click="selectCourse(course)"
            >
              <span class="course-name">{{ course.name }}</span>
              <span class="course-badge">{{ course.code }}</span>
            </div>
            <div v-if="filteredCourses.length === 0" class="course-dropdown-empty">
              No courses matching your search
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="locationInput">Starting Location <span>(Optional)</span></label>
        <input
          id="locationInput"
          v-model="searchLocation"
          placeholder="Enter barangay or location"
          @keyup.enter="searchSchools"
        />
      </div>

      <button type="button" class="primary-btn search-btn" @click="searchSchools">
        Search Schools
      </button>
    </div>

    <div v-if="hasSearched" class="search-message">{{ searchMessage }}</div>

    <!-- School Results Grid -->
    <div v-if="hasSearched && matchedSchools.length > 0" class="school-grid">
      <SchoolCard
        v-for="school in matchedSchools"
        :key="school.id"
        :school="school"
        :is-saved="isSchoolSaved(school.id)"
        :tag="searchCourse ? searchCourse.split(' ')[0] : 'University'"
        @view="handleViewSchool"
        @toggle-save="toggleSave"
      />
    </div>

    <div v-else-if="hasSearched && matchedSchools.length === 0" class="empty-state">
      <h3>No schools found</h3>
      <p>Try selecting another course from the dropdown or changing your starting location.</p>
    </div>
  </section>
</template>

<style scoped></style>
