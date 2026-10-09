<script setup>
import { useNavigation } from './composables/useNavigation'
import { useAuth } from './composables/useAuth'
import AppNavbar from './components/AppNavbar.vue'
import HomeSection from './components/HomeSection.vue'
import SchoolFinderSection from './components/SchoolFinderSection.vue'
import SavedSchoolsSection from './components/SavedSchoolsSection.vue'
import SchoolDetailsSection from './components/SchoolDetailsSection.vue'
import SettingsSection from './components/SettingsSection.vue'
import AdminSection from './components/AdminSection.vue'
import ApplicationStatusSection from './components/ApplicationStatusSection.vue'
import AuthModal from './components/AuthModal.vue'
import ToastNotification from './components/ToastNotification.vue'

const { activeSection } = useNavigation()
const { isAuthModalOpen } = useAuth()
</script>

<template>
  <div id="app-root">
    <div id="studentPage" class="page active">
      <AppNavbar />
      <main :class="{ 'main-full': activeSection === 'schoolDetailsSection' || activeSection === 'adminSection' }">
        <HomeSection v-show="activeSection === 'homeSection'" />
        <SchoolFinderSection v-show="activeSection === 'schoolsSection'" />
        <SavedSchoolsSection v-show="activeSection === 'savedSection'" />
        <SchoolDetailsSection v-show="activeSection === 'schoolDetailsSection'" />
        <SettingsSection v-show="activeSection === 'settingsSection'" />
        <AdminSection v-show="activeSection === 'adminSection'" />
        <ApplicationStatusSection v-show="activeSection === 'applicationStatusSection'" />
      </main>
    </div>

    <AuthModal v-if="isAuthModalOpen" />
    <ToastNotification />
  </div>
</template>

<style scoped>
/* School overview spans the full screen width */
main.main-full {
  max-width: none;
}
</style>
