<script setup>
import { computed, ref, watch } from 'vue'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import SchoolRoutesPanel from './SchoolRoutesPanel.vue'

const { selectedSchool, isSchoolSaved, toggleSave, openRoutes, isLoadingDetails } = useSchools()
const { showSection } = useNavigation()

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'programs', label: 'Available Programs' },
  { key: 'routes', label: 'Possible Routes' },
]
const activeTab = ref('overview')
const activeCategory = ref('all')

const UNCATEGORIZED = 'none'

// Reset tabs on school change
watch(
  () => selectedSchool.value?.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      activeTab.value = 'overview'
      activeCategory.value = 'all'
      openRoutes()
    }
  },
)

const courses = computed(() => selectedSchool.value?.courses || [])

function categoryKey(course) {
  return course.category ? String(course.category.id) : UNCATEGORIZED
}

// Available course categories
const categories = computed(() => {
  const map = new Map()
  for (const course of courses.value) {
    const key = categoryKey(course)
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: course.category?.name || 'Other Programs',
        description: course.category?.description || '',
        count: 0,
      })
    }
    map.get(key).count++
  }
  return [...map.values()].sort((a, b) => {
    if (a.key === UNCATEGORIZED) return 1
    if (b.key === UNCATEGORIZED) return -1
    return a.name.localeCompare(b.name)
  })
})

const activeCategoryInfo = computed(() =>
  categories.value.find((c) => c.key === activeCategory.value),
)

const visibleCourses = computed(() => {
  const list =
    activeCategory.value === 'all'
      ? [...courses.value]
      : courses.value.filter((c) => categoryKey(c) === activeCategory.value)

  return list.sort((a, b) => {
    const catA = a.category?.name || '\uffff'
    const catB = b.category?.name || '\uffff'
    return catA.localeCompare(catB) || a.name.localeCompare(b.name)
  })
})

function categoryLabel(course) {
  return course.category?.description || course.category?.name || 'Other Programs'
}

function yearsLabel(years) {
  if (!years) return null
  return `${years} Year${years === 1 ? '' : 's'}`
}

function selectTab(key) {
  activeTab.value = key
}
</script>

<template>
  <section id="schoolDetailsSection" class="section">
    <button type="button" class="header-back-btn" @click="showSection('schoolsSection')">
      ← Back
    </button>

    <!-- Loading skeleton -->
    <div v-if="isLoadingDetails" class="school-profile skeleton-profile-wrapper" aria-hidden="true">
      <div class="profile-header">
        <div class="skeleton skeleton-badge" style="width: 140px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-title" style="width: 55%; height: 36px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 25%; height: 18px;"></div>
      </div>
      <div class="school-tabs">
        <div v-for="n in 3" :key="n" class="skeleton skeleton-text" style="width: 120px; height: 16px;"></div>
      </div>
      <div class="profile-body">
        <div class="profile-columns">
          <div>
            <div class="skeleton skeleton-title" style="width: 160px; margin-bottom: 16px;"></div>
            <div class="skeleton skeleton-text" style="width: 100%;"></div>
            <div class="skeleton skeleton-text" style="width: 95%;"></div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 24px;"></div>
          </div>
          <div>
            <div class="skeleton skeleton-title" style="width: 170px; margin-bottom: 16px;"></div>
            <div v-for="n in 3" :key="n" class="detail-item" style="margin-bottom: 16px;">
              <div class="skeleton skeleton-text" style="width: 100px; height: 14px; margin-bottom: 6px;"></div>
              <div class="skeleton skeleton-text" style="width: 80%; height: 16px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- School profile -->
    <div v-else-if="selectedSchool" class="school-profile">
      <div class="profile-header">
        <p class="eyebrow">SCHOOL OVERVIEW</p>
        <h1>{{ selectedSchool.name }}</h1>
        <p>{{ selectedSchool.address || selectedSchool.institution_type }}</p>
      </div>

      <!-- Tabs -->
      <nav class="school-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="school-tab"
          :class="{ active: activeTab === tab.key }"
          :aria-selected="activeTab === tab.key"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- Overview tab -->
      <div v-if="activeTab === 'overview'" class="profile-body">
        <div class="profile-columns">
          <div>
            <h2>School Information</h2>
            <div v-if="selectedSchool.institution_type" class="detail-item">
              <strong>Institution Type</strong>
              <p>{{ selectedSchool.institution_type }}</p>
            </div>
            <div class="detail-item">
              <strong>Address</strong>
              <p>{{ selectedSchool.address || 'Not yet available' }}</p>
            </div>
            <div v-if="selectedSchool.website" class="detail-item">
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
          <div>
            <h2>Programs Offered</h2>
            <div class="detail-item">
              <strong>Undergraduate &amp; Other Programs</strong>
              <p>
                {{ courses.length }} program{{ courses.length === 1 ? '' : 's' }} across
                {{ categories.length }} categor{{ categories.length === 1 ? 'y' : 'ies' }}.
                <a href="#" class="official-link" @click.prevent="selectTab('programs')">
                  Browse programs →
                </a>
              </p>
            </div>
            <div v-if="selectedSchool.graduate_programs" class="detail-item">
              <strong>Graduate / Professional Programs</strong>
              <p>{{ selectedSchool.graduate_programs }}</p>
            </div>
          </div>
        </div>
        <br />
        <div class="detail-actions">
          <button type="button" class="primary-btn" @click="toggleSave(selectedSchool.id)">
            {{ isSchoolSaved(selectedSchool.id) ? 'Remove from Saved' : 'Save School' }}
          </button>
          <button type="button" class="primary-btn secondary-btn" @click="selectTab('routes')">
            View Possible Routes
          </button>
        </div>
      </div>

      <!-- Programs tab -->
      <div v-else-if="activeTab === 'programs'" class="programs-layout">
        <aside class="category-sidebar">
          <p class="category-sidebar-title">CHOOSE A CATEGORY</p>
          <button
            type="button"
            class="category-item"
            :class="{ active: activeCategory === 'all' }"
            @click="activeCategory = 'all'"
          >
            <span class="category-item-text">
              <strong>All Programs</strong>
              <small>View all programs offered</small>
            </span>
            <span class="category-count">{{ courses.length }}</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            class="category-item"
            :class="{ active: activeCategory === cat.key }"
            @click="activeCategory = cat.key"
          >
            <span class="category-item-text">
              <strong>{{ cat.name }}</strong>
              <small v-if="cat.description">{{ cat.description }}</small>
            </span>
            <span class="category-count">{{ cat.count }}</span>
          </button>
        </aside>

        <div class="programs-main">
          <h2 class="programs-heading">
            {{ activeCategory === 'all' ? 'ALL PROGRAMS' : activeCategoryInfo?.name?.toUpperCase() }}
          </h2>

          <div v-if="visibleCourses.length" class="program-grid">
            <article v-for="course in visibleCourses" :key="course.id" class="program-card">
              <p class="program-card-category">{{ categoryLabel(course) }}</p>
              <h3 class="program-card-name">{{ course.name }}</h3>
              <p v-if="yearsLabel(course.completion_year)" class="program-card-meta">
                <svg
                  class="program-card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {{ yearsLabel(course.completion_year) }}
              </p>
            </article>
          </div>
          <p v-else class="programs-empty">No programs listed yet.</p>
        </div>
      </div>

      <!-- Routes tab -->
      <div v-else-if="activeTab === 'routes'" class="profile-body">
        <SchoolRoutesPanel />
      </div>
    </div>

    <div v-else class="empty-state">
      <h3>No school selected</h3>
      <p>Search for a school and click “View School” to see its profile.</p>
    </div>
  </section>
</template>

<style scoped>
.skeleton-profile-wrapper {
  pointer-events: none;
  user-select: none;
}

/* Full-width layout */
#schoolDetailsSection.section {
  position: relative;
  padding: 0;
}

.school-profile {
  overflow: clip;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  min-height: calc(100vh - 75px);
}

.profile-header {
  padding: 45px 60px;
  padding-right: 160px; /* keep the title clear of the Back button */
}

#schoolDetailsSection > .empty-state {
  margin: 100px 60px 60px;
}

/* Back button */
.header-back-btn {
  position: absolute;
  top: 28px;
  right: 40px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  color: #fca5a5;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.header-back-btn:hover {
  color: #ffffff;
}

.header-back-btn:active {
  color: #f87171;
}

/* Tab bar */
.school-tabs {
  display: flex;
  justify-content: center;
  gap: 56px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  background: #fff;
  min-height: 58px;
  align-items: center;
}

.school-tab {
  position: relative;
  background: none;
  border: none;
  padding: 19px 2px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.school-tab:hover {
  color: var(--blue);
}

.school-tab.active {
  color: var(--blue-dark);
}

.school-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--blue);
}

/* Available programs */
.programs-layout {
  display: grid;
  grid-template-columns: 270px 1fr;
  min-height: 480px;
}

.category-sidebar {
  border-right: 1px solid var(--border);
  padding: 28px 16px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: start;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.category-sidebar-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--blue-dark);
  margin: 0 0 12px 8px;
}

.category-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 11px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.category-item:hover {
  background: var(--pale);
}

.category-item.active {
  background: #e5f1ff;
  border-color: #cfe3fa;
}

.category-item-text strong {
  display: block;
  font-size: 14px;
  color: var(--blue-dark);
  margin-bottom: 2px;
}

.category-item-text small {
  display: block;
  font-size: 12px;
  line-height: 1.4;
  color: var(--muted);
}

.category-count {
  flex-shrink: 0;
  min-width: 26px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--blue);
  background: #fff;
  border: 1px solid #cfe3fa;
  border-radius: 20px;
  padding: 2px 7px;
}

.programs-main {
  padding: 28px 32px 36px;
  min-width: 0;
}

.programs-heading {
  font-family: inherit;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--blue-dark);
  margin-bottom: 22px;
}

.program-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.program-card {
  display: flex;
  flex-direction: column;
  min-height: 150px;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.program-card-category {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}

.program-card-name {
  font-size: 16px;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 16px;
}

.program-card-meta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
}

.program-card-icon {
  width: 15px;
  height: 15px;
}

.programs-empty {
  color: var(--muted);
  font-size: 14px;
}

@media (max-width: 900px) {
  .school-tabs {
    gap: 24px;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .school-tab {
    white-space: nowrap;
  }

  .programs-layout {
    grid-template-columns: 1fr;
  }

  .category-sidebar {
    position: static;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
    overflow-x: auto;
    padding: 16px;
  }

  .category-sidebar-title {
    display: none;
  }

  .category-item {
    flex: 0 0 auto;
    width: auto;
    align-items: center;
  }

  .category-item-text small {
    display: none;
  }

  .programs-main {
    padding: 22px 18px 28px;
  }
}

@media (max-width: 1100px) {
  .program-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .program-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    padding: 70px 22px 32px;
  }

  .header-back-btn {
    top: 18px;
    right: 18px;
  }

  #schoolDetailsSection > .empty-state {
    margin: 80px 20px 40px;
  }
}
</style>
