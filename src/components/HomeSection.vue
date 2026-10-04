<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const { currentUser, openAuthModal } = useAuth()
const { showSection } = useNavigation()

const isInstitution = computed(() => {
  return currentUser.value && (currentUser.value.role === 'institution' || currentUser.value.role_id === 2)
})

// const eyebrowText = computed(() => {
//   if (currentUser.value) {
//     return isInstitution.value ? 'INSTITUTION PORTAL' : 'STUDENT DASHBOARD'
//   }
//   return 'DISCOVER YOUR PATH'
// })
</script>

<template>
  <section id="homeSection" class="section">
    <!-- Institution Partner Banner (only shown if signed in as institution) -->
    <div v-if="isInstitution" class="institution-banner">
      <div class="banner-icon">🏛️</div>
      <div class="banner-text">
        <strong>School / Institution Preview Mode</strong>
        <p>
          You are signed in as an institutional partner. Course listings and institution management
          are in preview.
        </p>
      </div>
    </div>

    <!-- Hero Section / Landing Page Header -->
    <div class="hero">
      <div class="hero-text">
        <p class="eyebrow">{{ eyebrowText }}</p>
        <h1>Find the right school<br />for your future.</h1>
        <p>
          Discover colleges and universities based on the degree program you want to pursue.
          Compare programs, check admission details, and plan your commute all in one place.
        </p>
        <div class="hero-actions">
          <button class="primary-btn hero-primary-btn" @click="showSection('schoolsSection')">
            Find a School
          </button>
          <button
            v-if="!currentUser"
            type="button"
            class="hero-secondary-btn"
            @click="openAuthModal('signup')"
          >
            Create Free Account
          </button>
        </div>
      </div>
      <div class="hero-illustration">
        <div class="illustration-card" @click="showSection('schoolsSection')">
          <div class="illustration-icon">🎓</div>
          <h3>Explore Your Options</h3>
          <p>Courses, schools, and commute routes in one unified platform.</p>
        </div>
      </div>
    </div>

    <!-- Quick Info Cards -->
    <div class="quick-info">
      <div class="info-box clickable" @click="showSection('schoolsSection')">
        <div class="info-box-header">
          <h3>Search by Degree</h3>
          <span class="info-arrow">→</span>
        </div>
        <p>Find accredited schools offering your preferred program or major.</p>
      </div>
      <div class="info-box clickable" @click="showSection('schoolsSection')">
        <div class="info-box-header">
          <h3>Compare Schools</h3>
          <span class="info-arrow">→</span>
        </div>
        <p>View locations, available courses, and admission contact details.</p>
      </div>
      <div class="info-box clickable" @click="showSection('schoolsSection')">
        <div class="info-box-header">
          <h3>Check Routes</h3>
          <span class="info-arrow">→</span>
        </div>
        <p>Explore step-by-step transit and driving routes directly to campus.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.hero-primary-btn {
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.hero-secondary-btn {
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 700;
  background: #ffffff;
  color: var(--blue-dark);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(18, 52, 91, 0.06);
}

.hero-secondary-btn:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: #f7fbff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 166, 0.12);
}

.hero-secondary-btn:active {
  transform: translateY(0);
}

.illustration-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.illustration-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(18, 52, 91, 0.1);
}

.info-box.clickable {
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.info-box.clickable:hover {
  transform: translateY(-3px);
  border-color: var(--blue-light);
  box-shadow: 0 8px 24px rgba(37, 99, 166, 0.1);
}

.info-box.clickable:hover .info-arrow {
  transform: translateX(4px);
  color: var(--blue);
}

.info-box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-box-header h3 {
  margin-bottom: 0;
}

.info-arrow {
  font-size: 18px;
  color: var(--muted);
  transition: transform 0.2s ease, color 0.2s ease;
}
</style>
