<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import SchoolCard from './SchoolCard.vue'
import SkeletonSchoolCard from './SkeletonSchoolCard.vue'

const dropdownRef = ref(null)
const typeDropdownRef = ref(null)
const resultsRef = ref(null)
const isTypeDropdownOpen = ref(false)

const TYPE_OPTIONS = [
  { value: '', label: 'Public & Private' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

const {
  searchCourse,
  selectedCourse,
  searchLocation,
  searchType,
  hasSearched,
  searchMessage,
  isCourseDropdownOpen,
  filteredCourses,
  isLoadingCourses,
  courseTag,
  matchedSchools,
  pagedSchools,
  currentPage,
  totalPages,
  goToPage,
  isSearchingSchools,
  selectCourse,
  clearCourseSearch,
  toggleCourseDropdown,
  onCourseInput,
  closeCourseDropdown,
  searchSchools,
  isSchoolSaved,
  toggleSave,
  viewSchool,
  resetSearch,
} = useSchools()

const { showSection, activeSection } = useNavigation()

// Pages that are "inside" a search flow; coming back from them keeps the results.
const SEARCH_FLOW_SECTIONS = ['schoolDetailsSection', 'routesSection']

watch(activeSection, (now, prev) => {
  if (now === 'schoolsSection' && !SEARCH_FLOW_SECTIONS.includes(prev)) {
    isTypeDropdownOpen.value = false
    resetSearch()
  }
})

// Page numbers to render, e.g. [1, 2, 3] or [1, '…', 4, 5, 6, '…', 10]
const pageItems = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const items = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) items.push('…')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < total - 1) items.push('…')
  items.push(total)
  return items
})

function changePage(page) {
  if (page === currentPage.value || page < 1 || page > totalPages.value) return
  goToPage(page)
  // Bring the top of the results back into view
  const el = resultsRef.value
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 95
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const selectedTypeLabel = computed(
  () => TYPE_OPTIONS.find((o) => o.value === searchType.value)?.label || TYPE_OPTIONS[0].label,
)

function toggleTypeDropdown() {
  isTypeDropdownOpen.value = !isTypeDropdownOpen.value
  if (isTypeDropdownOpen.value) closeCourseDropdown()
}

function selectType(value) {
  searchType.value = value
  isTypeDropdownOpen.value = false
}

function handleViewSchool(school) {
  viewSchool(school, showSection)
}

function handleOutsideClick(event) {
  if (isCourseDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeCourseDropdown()
  }
  if (isTypeDropdownOpen.value && typeDropdownRef.value && !typeDropdownRef.value.contains(event.target)) {
    isTypeDropdownOpen.value = false
  }
}

onMounted(() => {
  // Fresh page load / refresh always starts with an empty search (all schools).
  resetSearch()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <section id="schoolsSection" class="section">
    <div class="section-heading">
      <!-- <p class="eyebrow">SCHOOL FINDER</p> -->
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
              :key="course.id"
              class="course-dropdown-item"
              :class="{ selected: selectedCourse && selectedCourse.id === course.id }"
              @click="selectCourse(course)"
            >
              <span class="course-name">{{ course.name }}</span>
              <span v-if="course.code" class="course-badge">{{ course.code }}</span>
            </div>
            <div v-if="isLoadingCourses && filteredCourses.length === 0" class="course-dropdown-empty">
              Loading courses...
            </div>
            <div v-else-if="filteredCourses.length === 0" class="course-dropdown-empty">
              No courses matching your search
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label id="schoolTypeLabel">School Type <span>(Optional)</span></label>
        <div ref="typeDropdownRef" class="course-dropdown-wrapper">
          <button
            type="button"
            class="type-trigger"
            :class="{ open: isTypeDropdownOpen }"
            aria-haspopup="listbox"
            aria-labelledby="schoolTypeLabel"
            :aria-expanded="isTypeDropdownOpen"
            @click="toggleTypeDropdown"
            @keydown.esc="isTypeDropdownOpen = false"
          >
            <span class="type-trigger-text">{{ selectedTypeLabel }}</span>
            <span class="course-arrow-btn" :class="{ open: isTypeDropdownOpen }" aria-hidden="true">▼</span>
          </button>

          <div v-if="isTypeDropdownOpen" class="course-dropdown-menu" role="listbox">
            <div
              v-for="option in TYPE_OPTIONS"
              :key="option.value || 'all'"
              class="course-dropdown-item"
              :class="{ selected: searchType === option.value }"
              role="option"
              :aria-selected="searchType === option.value"
              @click="selectType(option.value)"
            >
              <span class="course-name">{{ option.label }}</span>
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
          autocomplete="off"
          @keyup.enter="searchSchools"
        />
      </div>

      <button
        type="button"
        class="primary-btn search-btn"
        :disabled="isSearchingSchools"
        title="Search schools"
        aria-label="Search schools"
        @click="searchSchools"
      >
        <span v-if="isSearchingSchools" class="search-btn-spinner" aria-hidden="true"></span>
        <svg
          v-else
          class="search-btn-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </div>

    <div ref="resultsRef" class="search-message" v-if="!isSearchingSchools && searchMessage">
      {{ searchMessage }}
    </div>

    <!-- Skeleton Loading Grid when searching -->
    <div v-if="isSearchingSchools" class="school-grid">
      <SkeletonSchoolCard v-for="i in 6" :key="i" />
    </div>

    <!-- School Results Grid (all schools by default, filtered after a search) -->
    <template v-else-if="matchedSchools.length > 0">
      <div class="school-grid">
        <SchoolCard
          v-for="school in pagedSchools"
          :key="school.id"
          :school="school"
          :is-saved="isSchoolSaved(school.id)"
          :tag="courseTag"
          @view="handleViewSchool"
          @toggle-save="toggleSave"
        />
      </div>

      <nav v-if="totalPages > 1" class="pagination" aria-label="School results pages">
        <button
          type="button"
          class="page-btn page-nav"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          ‹ Prev
        </button>
        <template v-for="(item, idx) in pageItems" :key="`${item}-${idx}`">
          <span v-if="item === '…'" class="page-ellipsis">…</span>
          <button
            v-else
            type="button"
            class="page-btn"
            :class="{ active: item === currentPage }"
            :aria-current="item === currentPage ? 'page' : undefined"
            @click="changePage(item)"
          >
            {{ item }}
          </button>
        </template>
        <button
          type="button"
          class="page-btn page-nav"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next ›
        </button>
      </nav>
    </template>

    <div v-else-if="hasSearched" class="empty-state">
      <h3>No schools found</h3>
      <p>Try selecting another course, school type, or changing your starting location.</p>
    </div>
  </section>
</template>

<style scoped>
.type-trigger {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 10px 0 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
}

.type-trigger:focus-visible,
.type-trigger.open {
  border-color: var(--blue-light);
}

.type-trigger-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-btn {
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.search-btn:disabled {
  opacity: 0.75;
  cursor: progress;
  transform: none;
}

.search-btn-icon {
  width: 20px;
  height: 20px;
}

.search-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: search-spin 0.7s linear infinite;
}

@keyframes search-spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 30px;
}

.page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--blue-dark);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--pale);
  border-color: var(--blue-light);
}

.page-btn.active {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 4px;
  color: var(--muted);
}
</style>
