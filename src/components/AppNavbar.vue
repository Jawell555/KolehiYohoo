<script setup>
import { useAuth } from '../composables/useAuth'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'

const { currentUser, currentRole, logout } = useAuth()
const { savedSchoolIds } = useSchools()
const { activeSection, showSection, setPage } = useNavigation()

function handleLogout() {
  logout()
  setPage('login')
}
</script>

<template>
  <header class="navbar">
    <div class="nav-brand">Kolehiyohoo</div>
    <div class="nav-links">
      <a
        href="#"
        :class="{ active: activeSection === 'homeSection' }"
        @click.prevent="showSection('homeSection')"
      >
        Home
      </a>
      <a
        href="#"
        :class="{ active: activeSection === 'schoolsSection' }"
        @click.prevent="showSection('schoolsSection')"
      >
        Find Schools
      </a>
      <a
        href="#"
        :class="{ active: activeSection === 'savedSection' }"
        @click.prevent="showSection('savedSection')"
      >
        Saved Schools ({{ savedSchoolIds.length }})
      </a>
      <span class="nav-role-badge">
        {{
          currentRole === 'institution'
            ? '🏛️ Institution'
            : '🎓 ' + (currentUser?.name || 'Student')
        }}
      </span>
      <a href="#" @click.prevent="handleLogout">Logout</a>
    </div>
  </header>
</template>

<style scoped></style>
