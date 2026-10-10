<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { showToast } from '../composables/useToast'

const { currentUser, updateUserProfile, changeUserPassword } = useAuth()

// Active Settings Tab: 'account' or 'preferences'
const activeTab = ref('account')

// Theme preference
const currentTheme = ref('light')

function selectGhostTheme(theme) {
  currentTheme.value = theme
}

// User Computed Data
const displayFirstName = computed(() => {
  if (currentUser.value?.student?.first_name) {
    return currentUser.value.student.first_name.trim()
  }
  const name = currentUser.value?.admin?.name || currentUser.value?.name
  if (!name || name.includes('@')) return ''
  return name.split(' ')[0].trim()
})

const displayLastName = computed(() => {
  if (currentUser.value?.student?.last_name) {
    return currentUser.value.student.last_name.trim()
  }
  const name = currentUser.value?.admin?.name || currentUser.value?.name
  if (!name || name.includes('@')) return ''
  return name.split(' ').slice(1).join(' ').trim()
})

const displayAddress = computed(() => {
  return (currentUser.value?.student?.address || '').trim()
})

const displaySchool = computed(() => {
  return (currentUser.value?.student?.school_name || '').trim()
})

const userEmail = computed(() => {
  return (currentUser.value?.email || '').trim()
})

const displayPhone = computed(() => {
  return (
    currentUser.value?.phone ||
    currentUser.value?.student?.contact_no ||
    ''
  ).trim()
})

const isEmailVerified = computed(() => {
  return !!(currentUser.value?.email_verified || currentUser.value?.email_verified_at)
})

// Edit modal state
const isEditModalOpen = ref(false)
const isConfirmingSave = ref(false)
const isSaving = ref(false)
const currentEditKey = ref('')
const editModalValue = ref('')
const modalError = ref('')

const isAddingField = computed(() => {
  if (currentEditKey.value === 'firstName') return !displayFirstName.value
  if (currentEditKey.value === 'lastName') return !displayLastName.value
  if (currentEditKey.value === 'email') return !userEmail.value
  if (currentEditKey.value === 'address') return !displayAddress.value
  if (currentEditKey.value === 'schoolName') return !displaySchool.value
  if (currentEditKey.value === 'phone') return !displayPhone.value
  return false
})

// Password Form inside Modal
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordError = ref('')
const showPasswords = reactive({
  current: false,
  new: false,
  confirm: false,
})

const fieldConfigs = {
  firstName: {
    title: 'Change First Name',
    label: 'First Name',
    note: 'Enter your new first name.',
    maxLength: 30,
  },
  lastName: {
    title: 'Change Last Name',
    label: 'Last Name',
    note: 'Enter your new last name.',
    maxLength: 30,
  },
  address: {
    title: 'Address',
    label: 'Address',
    note: 'Enter your Address',
    maxLength: 80,
  },
  schoolName: {
    title: 'Current School',
    label: 'Current School',
    note: 'Enter your current school.',
    maxLength: 80,
  },
  email: {
    title: 'Change Email',
    label: 'Email',
    note: 'Important: If you change your email, you will need to verify the new address.',
    maxLength: 60,
  },
  phone: {
    title: 'Phone Number',
    label: 'Phone Number',
    placeholder: '09123456789',
    note: 'Enter an 11-digit mobile number.',
    maxLength: 11,
  },
  password: {
    title: 'Change Password',
    label: 'Password',
    note: 'Important: Your new password must be at least 6 characters.',
    maxLength: 30,
  },
}

const currentConfig = computed(() => {
  const base = fieldConfigs[currentEditKey.value] || fieldConfigs.firstName
  if (currentEditKey.value === 'firstName') {
    return {
      ...base,
      title: displayFirstName.value ? 'Change First Name' : 'Add First Name',
    }
  }
  if (currentEditKey.value === 'lastName') {
    return {
      ...base,
      title: displayLastName.value ? 'Change Last Name' : 'Add Last Name',
    }
  }
  if (currentEditKey.value === 'email') {
    return {
      ...base,
      title: userEmail.value ? 'Change Email' : 'Add Email',
    }
  }
  if (currentEditKey.value === 'address') {
    return {
      ...base,
      title: displayAddress.value ? 'Change Address' : 'Add Address',
    }
  }
  if (currentEditKey.value === 'schoolName') {
    return {
      ...base,
      title: displaySchool.value ? 'Change Current School' : 'Add Current School',
    }
  }
  if (currentEditKey.value === 'phone') {
    return {
      ...base,
      title: displayPhone.value ? 'Change Phone Number' : 'Add Phone Number',
    }
  }
  return base
})

function openEditModal(key) {
  currentEditKey.value = key
  passwordError.value = ''
  modalError.value = ''
  isConfirmingSave.value = false

  if (key === 'firstName') {
    editModalValue.value = displayFirstName.value
  } else if (key === 'lastName') {
    editModalValue.value = displayLastName.value
  } else if (key === 'address') {
    editModalValue.value = displayAddress.value
  } else if (key === 'schoolName') {
    editModalValue.value = displaySchool.value
  } else if (key === 'email') {
    editModalValue.value = userEmail.value
  } else if (key === 'phone') {
    editModalValue.value = displayPhone.value
  } else if (key === 'password') {
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    showPasswords.current = false
    showPasswords.new = false
    showPasswords.confirm = false
  }

  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  isConfirmingSave.value = false
  passwordError.value = ''
  modalError.value = ''
  showPasswords.current = false
  showPasswords.new = false
  showPasswords.confirm = false
}

function clearModalValue() {
  editModalValue.value = ''
  modalError.value = ''
}

// Validate before confirmation
function requestSaveConfirmation() {
  modalError.value = ''
  const key = currentEditKey.value

  if (key === 'password') {
    if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
      passwordError.value = 'Password must be at least 6 characters.'
      return
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = 'New passwords do not match.'
      return
    }
    passwordError.value = ''
    isConfirmingSave.value = true
    return
  }

  const trimmed = editModalValue.value.trim()
  if (!trimmed) {
    modalError.value = `Please enter your ${currentConfig.value.label.toLowerCase()}.`
    return
  }

  // Validate phone format
  if (key === 'phone') {
    if (!/^09\d{9}$/.test(trimmed)) {
      modalError.value = 'Enter a valid phone number!'
      return
    }
  }

  // Validate email format
  if (key === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      modalError.value = 'Please enter a valid email address.'
      return
    }
  }

  isConfirmingSave.value = true
}

function cancelSaveConfirmation() {
  isConfirmingSave.value = false
}

// Save changes
async function executeSave() {
  if (isSaving.value) return
  isSaving.value = true
  const key = currentEditKey.value

  try {
    if (key === 'password') {
      const res = await changeUserPassword(
        passwordForm.value.currentPassword,
        passwordForm.value.newPassword
      )
      if (!res.success) {
        isConfirmingSave.value = false
        passwordError.value = res.message || 'Failed to change password.'
        return
      }
      closeEditModal()
      showToast('Password changed successfully!', 'Security Updated')
      return
    }

    const trimmed = editModalValue.value.trim()
    if (!trimmed) return

    let res = { success: true }
    if (key === 'firstName') {
      res = await updateUserProfile({
        first_name: trimmed,
        student: { first_name: trimmed },
      })
      if (res.success) showToast('First name updated successfully!', 'Account Updated')
    } else if (key === 'lastName') {
      res = await updateUserProfile({
        last_name: trimmed,
        student: { last_name: trimmed },
      })
      if (res.success) showToast('Last name updated successfully!', 'Account Updated')
    } else if (key === 'address') {
      res = await updateUserProfile({
        student: { address: trimmed },
      })
      if (res.success) showToast('Address updated successfully!', 'Account Updated')
    } else if (key === 'schoolName') {
      res = await updateUserProfile({
        student: { school_name: trimmed },
      })
      if (res.success) showToast('Current school updated successfully!', 'Account Updated')
    } else if (key === 'email') {
      const isNew = trimmed.toLowerCase() !== userEmail.value.toLowerCase()
      res = await updateUserProfile({
        email: trimmed,
        email_verified: isNew ? false : isEmailVerified.value,
      })
      if (res.success) showToast('Email address updated successfully!', 'Account Updated')
    } else if (key === 'phone') {
      res = await updateUserProfile({
        phone: trimmed,
        student: { contact_no: trimmed },
      })
      if (res.success) showToast('Phone number updated successfully!', 'Account Updated')
    }

    if (!res.success) {
      showToast(res.message || 'Failed to update database', 'Error')
      return
    }

    closeEditModal()
  } finally {
    isSaving.value = false
  }
}

// Global Keyboard Handler (Escape key closes modals)
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    if (isEditModalOpen.value) closeEditModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <section id="settingsSection" class="section settings-page-section">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="settings-title">Settings</h1>
    </div>

    <!-- Two-Column Layout -->
    <div class="settings-layout-container">
      <!-- Left Sidebar Tabs -->
      <aside class="settings-sidebar">
        <button
          type="button"
          class="settings-nav-item"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          <svg
            width="18"
            height="18"
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
          <span>Account info</span>
        </button>

        <button
          type="button"
          class="settings-nav-item"
          :class="{ active: activeTab === 'preferences' }"
          @click="activeTab = 'preferences'"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>Preferences</span>
        </button>
      </aside>

      <!-- Right Main Content Panel -->
      <div class="settings-content-card">
        <!-- Account -->
        <div v-if="activeTab === 'account'" class="tab-panel">
          <!-- Personal Subgroup -->
          <div class="settings-group">
            <h2 class="group-heading">Personal</h2>

            <!-- First Name Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">First Name:</span>
                <span v-if="displayFirstName" class="row-value">{{ displayFirstName }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('firstName')"
                >
                  Add First Name
                </button>
              </div>
              <button
                v-if="displayFirstName"
                type="button"
                class="row-edit-btn"
                title="Edit First Name"
                aria-label="Edit First Name"
                @click="openEditModal('firstName')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <!-- Last Name Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Last Name:</span>
                <span v-if="displayLastName" class="row-value">{{ displayLastName }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('lastName')"
                >
                  Add Last Name
                </button>
              </div>
              <button
                v-if="displayLastName"
                type="button"
                class="row-edit-btn"
                title="Edit Last Name"
                aria-label="Edit Last Name"
                @click="openEditModal('lastName')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <!-- Address Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Address:</span>
                <span v-if="displayAddress" class="row-value">{{ displayAddress }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('address')"
                >
                  Add Address
                </button>
              </div>
              <button
                v-if="displayAddress"
                type="button"
                class="row-edit-btn"
                title="Edit Address"
                aria-label="Edit Address"
                @click="openEditModal('address')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <!-- Current School Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Current School:</span>
                <span v-if="displaySchool" class="row-value">{{ displaySchool }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('schoolName')"
                >
                  Add Current School
                </button>
              </div>
              <button
                v-if="displaySchool"
                type="button"
                class="row-edit-btn"
                title="Edit Current School"
                aria-label="Edit Current School"
                @click="openEditModal('schoolName')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="settings-card-divider"></div>

          <!-- Security -->
          <div class="settings-group">
            <h2 class="group-heading">Security</h2>

            <!-- Email row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Email:</span>
                <span v-if="userEmail" class="row-value">{{ userEmail }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('email')"
                >
                  Add Email
                </button>

                <!-- Verify button -->
                <button
                  v-if="userEmail && !isEmailVerified"
                  type="button"
                  class="verify-btn-red"
                  title="Email verification is not available yet"
                  disabled
                >
                  Verify
                </button>

                <!-- Verified badge -->
                <span v-else-if="userEmail && isEmailVerified" class="verified-pill">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </span>
              </div>
              <button
                v-if="userEmail"
                type="button"
                class="row-edit-btn"
                title="Edit Email"
                aria-label="Edit Email"
                @click="openEditModal('email')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <!-- Phone Number Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Phone Number:</span>
                <span v-if="displayPhone" class="row-value">{{ displayPhone }}</span>
                <button
                  v-else
                  type="button"
                  class="row-add-link"
                  @click="openEditModal('phone')"
                >
                  Add Phone Number
                </button>
              </div>
              <button
                v-if="displayPhone"
                type="button"
                class="row-edit-btn"
                title="Edit Phone Number"
                aria-label="Edit Phone Number"
                @click="openEditModal('phone')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <!-- Password Row -->
            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Password:</span>
                <span class="row-value password-dots">••••••••</span>
              </div>
              <button
                type="button"
                class="row-edit-btn"
                title="Change Password"
                aria-label="Change Password"
                @click="openEditModal('password')"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div v-else-if="activeTab === 'preferences'" class="tab-panel">
          <div class="settings-group">
            <h2 class="group-heading">Appearance</h2>

            <div class="roblox-setting-row">
              <div class="row-info">
                <span class="row-label">Theme:</span>
                <!-- Theme Selector -->
                <div class="ghost-theme-control">
                  <button
                    type="button"
                    class="theme-pill"
                    :class="{ active: currentTheme === 'light' }"
                    @click="selectGhostTheme('light')"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    class="theme-pill"
                    :class="{ active: currentTheme === 'dark' }"
                    @click="selectGhostTheme('dark')"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>

            <p class="ghost-theme-note">
              This does not work btw.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="edit-modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'editModalTitle'"
        @click.self="closeEditModal"
      >
        <div class="edit-modal-card">
          <!-- Edit Form -->
          <template v-if="!isConfirmingSave">
            <!-- Modal header -->
            <div class="edit-modal-header">
              <h3 id="editModalTitle" class="edit-modal-title">
                {{ currentConfig.title }}
              </h3>
              <button
                type="button"
                class="edit-modal-close"
                title="Close"
                aria-label="Close dialog"
                @click="closeEditModal"
              >
                <svg
                  width="14"
                  height="14"
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
            </div>

            <!-- Notice -->
            <p class="edit-modal-note">{{ currentConfig.note }}</p>

            <!-- Field input -->
            <div v-if="currentEditKey !== 'password'" class="modal-input-section">
              <div v-if="modalError" class="modal-error-banner">
                {{ modalError }}
              </div>
              <div class="modal-input-wrapper">
                <input
                  v-model="editModalValue"
                  type="text"
                  class="edit-input"
                  :maxlength="currentConfig.maxLength"
                  :placeholder="currentConfig.placeholder || currentConfig.label"
                  autofocus
                  @input="modalError = ''"
                  @keydown.enter.prevent="requestSaveConfirmation"
                />
                <button
                  v-if="editModalValue"
                  type="button"
                  class="edit-input-clear"
                  title="Clear input"
                  @click="clearModalValue"
                >
                  ×
                </button>
              </div>
              <div class="modal-char-counter">
                {{ editModalValue.length }}/{{ currentConfig.maxLength }}
              </div>
            </div>

            <!-- Password inputs -->
            <div v-else class="modal-password-section">
              <div v-if="passwordError" class="modal-error-banner">
                {{ passwordError }}
              </div>
              <div class="modal-pw-field">
                <label>Current Password</label>
                <div class="password-input-wrapper">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="showPasswords.current ? 'text' : 'password'"
                    class="edit-input"
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    class="password-toggle-btn"
                    tabindex="-1"
                    :aria-label="showPasswords.current ? 'Hide password' : 'Show password'"
                    @click="showPasswords.current = !showPasswords.current"
                  >
                    <svg v-if="!showPasswords.current" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="modal-pw-field">
                <label>New Password</label>
                <div class="password-input-wrapper">
                  <input
                    v-model="passwordForm.newPassword"
                    :type="showPasswords.new ? 'text' : 'password'"
                    class="edit-input"
                    placeholder="New password (min. 6 chars)"
                  />
                  <button
                    type="button"
                    class="password-toggle-btn"
                    tabindex="-1"
                    :aria-label="showPasswords.new ? 'Hide password' : 'Show password'"
                    @click="showPasswords.new = !showPasswords.new"
                  >
                    <svg v-if="!showPasswords.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="modal-pw-field">
                <label>Confirm New Password</label>
                <div class="password-input-wrapper">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showPasswords.confirm ? 'text' : 'password'"
                    class="edit-input"
                    placeholder="Confirm new password"
                    @keydown.enter.prevent="requestSaveConfirmation"
                  />
                  <button
                    type="button"
                    class="password-toggle-btn"
                    tabindex="-1"
                    :aria-label="showPasswords.confirm ? 'Hide password' : 'Show password'"
                    @click="showPasswords.confirm = !showPasswords.confirm"
                  >
                    <svg v-if="!showPasswords.confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="button"
              class="edit-modal-save-btn"
              @click="requestSaveConfirmation"
            >
              Save
            </button>
          </template>

          <!-- Confirmation Dialog -->
          <template v-else>
            <div class="edit-modal-header">
              <h3 id="editModalTitle" class="edit-modal-title">
                Confirmation
              </h3>
              <button
                type="button"
                class="edit-modal-close"
                :disabled="isSaving"
                title="Close"
                aria-label="Close dialog"
                @click="closeEditModal"
              >
                <svg
                  width="14"
                  height="14"
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
            </div>

            <div class="confirm-content-box">
              <div class="confirm-icon-circle">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--blue)"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <p v-if="currentEditKey !== 'password'" class="confirm-prompt-text">
                Are you sure you want to {{ isAddingField ? 'set' : 'update' }} your
                <strong>{{ currentConfig.label }}</strong> to
                <strong class="confirm-new-value">“{{ editModalValue.trim() }}”</strong>?
              </p>
              <p v-else class="confirm-prompt-text">
                Are you sure you want to change your account password?
              </p>
            </div>

            <div class="confirm-actions-row">
              <button
                type="button"
                class="confirm-btn-cancel"
                :disabled="isSaving"
                @click="cancelSaveConfirmation"
              >
                Cancel
              </button>
              <button
                type="button"
                class="confirm-btn-proceed"
                :disabled="isSaving"
                @click="executeSave"
              >
                <span v-if="isSaving" class="btn-spinner"></span>
                <span>{{ isSaving ? 'Saving...' : 'Yes, Save Changes' }}</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.settings-page-section {
  max-width: 1040px;
  margin: 0 auto;
  padding: 36px 24px 80px;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--blue-dark);
  letter-spacing: -0.5px;
}

/* Two-Column Layout */
.settings-layout-container {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 28px;
  align-items: start;
}

/* Left Sidebar Navigation */
.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.settings-nav-item:hover {
  background: #e6eef8;
  color: var(--blue-dark);
}

.settings-nav-item.active {
  background: #ffffff;
  color: var(--blue-dark);
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(18, 52, 91, 0.08);
}

/* Right Content Panel */
.settings-content-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(18, 52, 91, 0.04);
}

.settings-group {
  margin-bottom: 20px;
}

/* Subgroup heading */
.group-heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--blue-dark);
  margin-bottom: 18px;
  letter-spacing: -0.3px;
}

.settings-card-divider {
  height: 1px;
  background: #eef2f6;
  margin: 28px 0 24px;
}

/* Setting row */
.roblox-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid #f8fafc;
}

.row-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  flex-wrap: wrap;
}

.row-label {
  font-weight: 700;
  color: var(--text);
  min-width: 120px;
}

.row-value {
  color: var(--text);
  font-weight: 500;
}

.row-add-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--blue);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s ease, text-decoration 0.15s ease;
}

.row-add-link:hover {
  text-decoration: underline;
  color: var(--blue-dark);
}

.password-dots {
  letter-spacing: 2px;
  font-size: 15px;
}

/* Verify button */
.verify-btn-red {
  background: #dc2626;
  color: #ffffff;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(220, 38, 38, 0.3);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
}

.verify-btn-red:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.verify-btn-red:disabled {
  opacity: 0.85;
  cursor: default;
  transform: none;
  box-shadow: none;
}

/* Verified badge */
.verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.verified-pill svg {
  color: #16a34a;
}

/* Edit button */
.row-edit-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.row-edit-btn:hover {
  background: #f1f5f9;
  color: var(--blue);
  transform: scale(1.05);
}

/* Theme toggle */
.ghost-theme-control {
  display: inline-flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 4px;
}

.theme-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-pill.active {
  background: #ffffff;
  color: var(--blue-dark);
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ghost-theme-note {
  font-size: 13px;
  color: var(--muted);
  margin-top: 14px;
  font-style: italic;
}

/* Edit Modal */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 52, 91, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2400;
  padding: 20px;
  animation: fadeIn 0.15s ease-out;
}

.edit-modal-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 26px;
  color: var(--text);
  box-shadow: 0 20px 60px rgba(18, 52, 91, 0.18);
  animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.edit-modal-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--blue-dark);
  margin: 0;
  letter-spacing: -0.3px;
}

.edit-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.edit-modal-close:hover {
  background: #e2e8f0;
  color: var(--blue-dark);
}

.edit-modal-note {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 18px;
}

.modal-input-section {
  margin-bottom: 22px;
}

.modal-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.edit-input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px 38px 12px 14px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: all 0.15s ease;
}

.edit-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 166, 0.15);
  background: #ffffff;
}

.edit-input-clear {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e2e8f0;
  border: none;
  color: #64748b;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-input-clear:hover {
  background: #cbd5e1;
  color: var(--text);
}

.modal-char-counter {
  font-size: 11px;
  color: var(--muted);
  text-align: right;
  margin-top: 6px;
}

.edit-modal-save-btn {
  width: 100%;
  background: var(--blue);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 13px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 166, 0.25);
}

.edit-modal-save-btn:hover {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

/* Password Inputs */
.modal-password-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.modal-pw-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-pw-field label {
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input-wrapper .edit-input {
  width: 100%;
  padding-right: 42px !important;
}

.password-toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.password-toggle-btn:hover {
  color: var(--blue);
  background: #f1f5f9;
}

.modal-error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 4px;
}

/* Confirmation Dialog */
.confirm-content-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 8px 24px;
}

.confirm-icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #eef6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.confirm-prompt-text {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 380px;
}

.confirm-prompt-text strong {
  color: var(--blue-dark);
}

.confirm-new-value {
  font-weight: 700;
  color: var(--blue-dark);
  word-break: break-word;
}

.confirm-actions-row {
  display: flex;
  gap: 12px;
}

.confirm-btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: var(--text);
  border: 1px solid #dce6f2;
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.confirm-btn-cancel:hover {
  background: #e2e8f0;
}

.confirm-btn-proceed {
  flex: 1.2;
  background: var(--blue);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 166, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.confirm-btn-proceed:hover:not(:disabled) {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

.confirm-btn-proceed:disabled,
.edit-modal-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.confirm-btn-cancel:disabled,
.edit-modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: btnSpin 0.6s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes btnSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .settings-layout-container {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    flex-direction: row;
    overflow-x: auto;
  }

  .row-label {
    min-width: 90px;
  }
}
</style>
