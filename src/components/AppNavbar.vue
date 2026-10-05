<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'
import { useAdmin } from '../composables/useAdmin'
import ProfileModal from './ProfileModal.vue'
import emptyAvatar from '../assets/empty.png'

const { currentUser, logout, openAuthModal } = useAuth()
const { activeSection, showSection } = useNavigation()
const { adminTab, stats, setAdminTab } = useAdmin()

const isLogoutConfirmOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isProfileModalOpen = ref(false)
const userMenuRef = ref(null)

function handleBrandClick() {
  if (currentUser.value?.role === 'admin') {
    setAdminTab('dashboard')
    showSection('adminSection')
  } else {
    showSection('homeSection')
  }
}

function navigateAdmin(tab) {
  setAdminTab(tab)
  showSection('adminSection')
}

function toggleUserDropdown() {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

function closeUserDropdown() {
  isUserDropdownOpen.value = false
}

function handleProfileClick() {
  closeUserDropdown()
  isProfileModalOpen.value = true
}

function handleSettingsClick() {
  closeUserDropdown()
  showSection('settingsSection')
}

function handleSignOutFromMenu() {
  closeUserDropdown()
  handleLogout()
}

function handleLogout() {
  isLogoutConfirmOpen.value = true
}

function closeLogoutModal() {
  isLogoutConfirmOpen.value = false
}

function confirmLogout() {
  isLogoutConfirmOpen.value = false
  logout()
  if (
    activeSection.value === 'savedSection' ||
    activeSection.value === 'settingsSection' ||
    activeSection.value === 'adminSection'
  ) {
    showSection('homeSection')
  }
}

function handleOutsideClick(event) {
  if (
    isUserDropdownOpen.value &&
    userMenuRef.value &&
    !userMenuRef.value.contains(event.target)
  ) {
    closeUserDropdown()
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    if (isUserDropdownOpen.value) {
      closeUserDropdown()
    }
    if (isProfileModalOpen.value) {
      isProfileModalOpen.value = false
    }
    if (isLogoutConfirmOpen.value) {
      closeLogoutModal()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <header class="navbar">
    <!-- Left Navigation: Brand + Links aligned with content margin -->
    <div class="nav-left">
      <div
        class="nav-brand"
        role="button"
        tabindex="0"
        @click="handleBrandClick"
        @keydown.enter="handleBrandClick"
      >
        KolehiYohoo!
      </div>

      <!-- Admin Navigation -->
      <nav v-if="currentUser?.role === 'admin'" class="nav-links">
        <a
          href="#"
          :class="{ active: activeSection === 'adminSection' && adminTab === 'dashboard' }"
          @click.prevent="navigateAdmin('dashboard')"
        >
          Dashboard
        </a>
        <a
          href="#"
          :class="{ active: activeSection === 'adminSection' && adminTab === 'schools' }"
          @click.prevent="navigateAdmin('schools')"
        >
          Schools
        </a>
        <a
          href="#"
          :class="{ active: activeSection === 'adminSection' && adminTab === 'requests' }"
          @click.prevent="navigateAdmin('requests')"
        >
          Requests
          <span v-if="stats.pending_requests > 0" class="nav-badge-alert">
            {{ stats.pending_requests }}
          </span>
        </a>
      </nav>

      <!-- Student / Public Navigation -->
      <nav v-else-if="activeSection !== 'adminSection'" class="nav-links">
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
          Saved Schools
        </a>
      </nav>
    </div>

    <!-- Right Controls: Profile Dropdown or Log In / Sign Up -->
    <div class="nav-right">
      <!-- Authenticated User Dropdown Menu -->
      <template v-if="currentUser">
        <div ref="userMenuRef" class="nav-user-menu">
          <button
            type="button"
            class="nav-user-dropdown-btn"
            :class="{ active: isUserDropdownOpen }"
            @click="toggleUserDropdown"
            aria-haspopup="true"
            :aria-expanded="isUserDropdownOpen"
          >
            <span class="user-btn-avatar">
              <img :src="emptyAvatar" alt="Avatar" class="nav-avatar-img" />
            </span>
            <span class="user-btn-name">
              {{ currentUser?.name ? currentUser.name.split(' ')[0] : 'Account' }}
              <small v-if="currentUser?.role === 'admin'" class="role-badge-pill">Admin</small>
            </span>
            <svg
              class="user-btn-chevron"
              :class="{ rotated: isUserDropdownOpen }"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <!-- Floating Dropdown Choices: Profile, Settings, Sign Out -->
          <div v-if="isUserDropdownOpen" class="nav-user-dropdown">
            <button
              v-if="currentUser?.role !== 'admin'"
              type="button"
              class="dropdown-item"
              @click="handleProfileClick"
            >
              <svg
                class="dropdown-item-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>

            <button
              type="button"
              class="dropdown-item"
              @click="handleSettingsClick"
            >
              <svg
                class="dropdown-item-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </button>

            <div class="dropdown-divider"></div>

            <button
              type="button"
              class="dropdown-item dropdown-item-danger"
              @click="handleSignOutFromMenu"
            >
              <svg
                class="dropdown-item-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Visitor / Guest Controls -->
      <template v-else-if="activeSection !== 'adminSection'">
        <button type="button" class="nav-login-btn" @click="openAuthModal('login')">Log In</button>
        <button type="button" class="nav-signup-btn" @click="openAuthModal('signup')">
          Sign Up
        </button>
      </template>
    </div>
  </header>

  <!-- Profile Modal -->
  <ProfileModal
    :is-open="isProfileModalOpen"
    @close="isProfileModalOpen = false"
  />

  <!-- Logout Modal -->
  <Teleport to="body">
    <div
      v-if="isLogoutConfirmOpen"
      class="logout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logoutModalTitle"
      @click.self="closeLogoutModal"
    >
      <div class="logout-modal-card">
        <button
          type="button"
          class="logout-modal-close"
          @click="closeLogoutModal"
          aria-label="Close dialog"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="logout-icon-wrapper">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 id="logoutModalTitle" class="logout-modal-title">Sign Out</h3>
        <p class="logout-modal-text">
          Are you sure you want to sign out,
          <strong>{{ currentUser?.name || 'Student' }}</strong>?
        </p>

        <div class="logout-modal-actions">
          <button
            type="button"
            class="logout-btn-cancel"
            @click="closeLogoutModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="logout-btn-confirm"
            @click="confirmLogout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </Teleport>
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

.nav-badge-alert {
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.role-badge-pill {
  font-size: 10px;
  font-weight: 800;
  background: #eff6ff;
  color: var(--blue);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
  vertical-align: middle;
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

/* Authenticated User Menu Dropdown */
.nav-user-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.nav-user-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: 1px solid #dce6f2;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
}

.nav-user-dropdown-btn:hover,
.nav-user-dropdown-btn.active {
  border-color: var(--blue-light);
  background: #f8fbff;
  color: var(--blue-dark);
}

.user-btn-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-btn-name {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-btn-chevron {
  transition: transform 0.2s ease;
  color: var(--muted);
}

.user-btn-chevron.rotated {
  transform: rotate(180deg);
}

.nav-user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 180px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow:
    0 12px 28px -4px rgba(18, 52, 91, 0.16),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  padding: 6px;
  z-index: 1000;
  animation: dropdownFadeIn 0.15s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  text-align: left;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: var(--blue-dark);
}

.dropdown-item-icon {
  color: var(--muted);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.dropdown-item:hover .dropdown-item-icon {
  color: var(--blue);
}

.dropdown-divider {
  height: 1px;
  background: #edf2f7;
  margin: 4px 6px;
}

.dropdown-item-danger {
  color: #dc2626;
}

.dropdown-item-danger:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.dropdown-item-danger .dropdown-item-icon {
  color: #ef4444;
}

.dropdown-item-danger:hover .dropdown-item-icon {
  color: #b91c1c;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logout Modal */
.logout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(18, 52, 91, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: logoutFadeIn 0.2s ease-out;
}

.logout-modal-card {
  position: relative;
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  padding: 32px 28px 24px;
  box-shadow:
    0 25px 50px -12px rgba(18, 52, 91, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  text-align: center;
  animation: logoutScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.logout-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
  transform: rotate(90deg);
}

.logout-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logout-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.logout-modal-text {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.logout-modal-text strong {
  color: var(--text);
}

.logout-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.logout-btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.logout-btn-confirm {
  flex: 1;
  background: #dc2626;
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.3);
  transition: all 0.2s ease;
}

.logout-btn-confirm:hover {
  background: #b91c1c;
  box-shadow: 0 4px 14px rgba(185, 28, 28, 0.4);
  transform: translateY(-1px);
}

@keyframes logoutFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes logoutScaleIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
