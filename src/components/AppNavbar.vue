<script setup>
import { useAuth } from '../composables/useAuth'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'

const { currentUser, currentRole, logout, openAuthModal } = useAuth()
const { savedSchoolIds } = useSchools()
const { activeSection, showSection } = useNavigation()

function handleLogout() {
  logout()
}
</script>

<template>
  <header class="navbar">
    <div
      class="nav-brand"
      role="button"
      tabindex="0"
      @click="showSection('homeSection')"
      @keydown.enter="showSection('homeSection')"
    >
      KolehiYohoo!
    </div>
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

      <!-- Authenticated User Controls -->
      <template v-if="currentUser">
        <span class="nav-role-badge">
          {{
            (currentUser?.role === 'institution' || currentUser?.role_id === 2)
              ? '🏛️ Institution'
              : '🎓 ' + (currentUser?.name || 'Student')
          }}
        </span>
        <button type="button" class="nav-logout-btn" @click="handleLogout">Logout</button>
      </template>

      <!-- Visitor / Guest Controls -->
      <template v-else>
        <button type="button" class="nav-login-btn" @click="openAuthModal('login')">Log In</button>
        <button type="button" class="nav-signup-btn" @click="openAuthModal('signup')">
          Sign Up
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.nav-brand {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.9;
}

.nav-login-btn {
  background: none;
  border: none;
  color: var(--blue);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-login-btn:hover {
  background: #eef6ff;
  color: var(--blue-dark);
}

.nav-signup-btn {
  background: var(--blue);
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 9px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(37, 99, 166, 0.25);
  transition: all 0.2s ease;
}

.nav-signup-btn:hover {
  background: var(--blue-dark);
  box-shadow: 0 4px 12px rgba(18, 52, 91, 0.3);
  transform: translateY(-1px);
}

.nav-logout-btn {
  background: none;
  border: 1px solid #dce6f2;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-logout-btn:hover {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #dc2626;
}
</style>
