<script setup>
import { useSchools } from '../composables/useSchools'

const { selectedSchool, routeStartLocation, hasRouteGenerated, isGeneratingRoutes, generateRoute } =
  useSchools()
</script>

<template>
  <div class="school-routes-panel">
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

        <!-- Skeleton Routes Loading State -->
        <div v-if="isGeneratingRoutes">
          <div v-for="n in 3" :key="n" class="route-card skeleton-route-card" aria-hidden="true">
            <div class="skeleton skeleton-title" style="width: 50%; height: 20px;"></div>
            <div class="skeleton skeleton-text" style="width: 100%;"></div>
            <div class="skeleton skeleton-text" style="width: 80%; margin-bottom: 14px;"></div>
            <div class="skeleton skeleton-badge" style="width: 140px; height: 18px;"></div>
          </div>
        </div>

        <div v-else-if="!hasRouteGenerated" class="empty-route">
          Your route options will appear here after entering your starting location.
        </div>
        <div v-else>
          <div class="route-card">
            <h3>Route 1: Public Transportation</h3>
            <p>
              Travel from {{ routeStartLocation }} toward
              {{ selectedSchool?.address || selectedSchool?.name }} and continue to the campus.
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
            <p>
              Navigate from {{ routeStartLocation }} to
              {{ selectedSchool?.address || selectedSchool?.name }}.
            </p>
            <span class="route-time">Depends on traffic</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-route-card {
  pointer-events: none;
  user-select: none;
}
</style>
