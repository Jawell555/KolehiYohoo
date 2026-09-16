<script setup>
import { useNavigation } from './composables/useNavigation'
import LoginContent from './components/LoginContent.vue'
import AppNavbar from './components/AppNavbar.vue'
import HomeSection from './components/HomeSection.vue'
import SchoolFinderSection from './components/SchoolFinderSection.vue'
import SavedSchoolsSection from './components/SavedSchoolsSection.vue'
import SchoolDetailsSection from './components/SchoolDetailsSection.vue'
import RoutesSection from './components/RoutesSection.vue'
import ToastNotification from './components/ToastNotification.vue'

const { activePage, activeSection } = useNavigation()
</script>

<template>
  <div id="app-root">
    <!-- Login View -->
    <LoginContent v-if="activePage === 'login'" />

    <!-- Student / Institution Dashboard View -->
    <div v-else-if="activePage === 'student'" id="studentPage" class="page active">
      <AppNavbar />
      <main>
        <HomeSection v-show="activeSection === 'homeSection'" />
        <SchoolFinderSection v-show="activeSection === 'schoolsSection'" />
        <SavedSchoolsSection v-show="activeSection === 'savedSection'" />
        <SchoolDetailsSection v-show="activeSection === 'schoolDetailsSection'" />
        <RoutesSection v-show="activeSection === 'routesSection'" />
      </main>
    </div>

    <!-- Global Toast Notification -->
    <ToastNotification />
  </div>
</template>

<style scoped></style>
