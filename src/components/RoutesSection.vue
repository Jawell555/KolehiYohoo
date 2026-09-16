<script setup>
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'

const { selectedSchool, routeStartLocation, hasRouteGenerated, generateRoute } = useSchools()

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

    <div class="route-search">
      <label for="routeLocation">Your Starting Location</label>
      <div class="route-input-row">
        <input
          id="routeLocation"
          v-model="routeStartLocation"
          placeholder="Example: Barangay San Antonio"
          @keyup.enter="generateRoute"
        />
        <button type="button" class="primary-btn" @click="generateRoute">Show Routes</button>
      </div>
    </div>

    <div class="route-content">
      <div class="map-placeholder">
        <div class="map-pin start-pin">S</div>
        <div class="map-line"></div>
        <div class="map-pin destination-pin">D</div>
        <div class="map-label start-label">{{ routeStartLocation || 'Starting Location' }}</div>
        <div class="map-label destination-label">{{ selectedSchool?.abbreviation }}</div>
        <p class="map-note">Illustrative route map preview</p>
      </div>

      <div class="route-options">
        <h2>Possible Routes</h2>
        <div v-if="!hasRouteGenerated" class="empty-route">
          Your route options will appear here after entering your starting location.
        </div>
        <div v-else>
          <div class="route-card">
            <h3>Route 1: Public Transportation</h3>
            <p>
              Travel from {{ routeStartLocation }} toward {{ selectedSchool?.location }} and
              continue to the university area.
            </p>
            <span class="route-time">Estimated: 45–60 minutes</span>
          </div>
          <div class="route-card">
            <h3>Route 2: Alternative Route</h3>
            <p>
              Use the nearest major transport terminal and proceed toward
              {{ selectedSchool?.name }}.
            </p>
            <span class="route-time">Estimated: 60–75 minutes</span>
          </div>
          <div class="route-card">
            <h3>Route 3: Private Vehicle</h3>
            <p>Navigate from {{ routeStartLocation }} to {{ selectedSchool?.address }}.</p>
            <span class="route-time">Depends on traffic</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
