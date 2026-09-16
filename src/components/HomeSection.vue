<script setup>
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const { currentRole } = useAuth()
const { showSection } = useNavigation()
</script>

<template>
  <section id="homeSection" class="section">
    <div v-if="currentRole === 'institution'" class="institution-banner">
      <div class="banner-icon">🏛️</div>
      <div class="banner-text">
        <strong>School / Institution Preview Mode</strong>
        <p>
          You are signed in as an institutional partner. Course listings and institution management
          are in preview.
        </p>
      </div>
    </div>

    <div class="hero">
      <div class="hero-text">
        <p class="eyebrow">STUDENT DASHBOARD</p>
        <h1>Find the right school<br />for your future.</h1>
        <p>Discover colleges and universities based on the degree program you want to pursue.</p>
        <button class="primary-btn" @click="showSection('schoolsSection')">Find a School</button>
      </div>
      <div class="hero-illustration">
        <div class="illustration-card">
          <div class="illustration-icon">+</div>
          <h3>Explore Your Options</h3>
          <p>Courses, schools, and possible routes in one place.</p>
        </div>
      </div>
    </div>

    <div class="quick-info">
      <div class="info-box">
        <h3>Search by Degree</h3>
        <p>Find schools offering your preferred program.</p>
      </div>
      <div class="info-box">
        <h3>Compare Schools</h3>
        <p>View basic information about your choices.</p>
      </div>
      <div class="info-box">
        <h3>Check Routes</h3>
        <p>Explore possible travel routes to campus.</p>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
