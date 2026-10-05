<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'
import { useAdmin } from '../composables/useAdmin'
import { useToast } from '../composables/useToast'
import AppSelect from './AppSelect.vue'

const { currentUser, loginAdmin, isSubmitting, authError } = useAuth()
const { showSection, activeSection } = useNavigation()
const {
  adminTab,
  stats,
  pendingRequests,
  schools,
  isLoadingStats,
  isLoadingRequests,
  isLoadingSchools,
  setAdminTab,
  fetchStats,
  fetchPendingRequests,
  fetchSchools,
  approveRequest,
  rejectRequest,
  updateSchool,
} = useAdmin()
const { showToast } = useToast()

// Admin login
const loginEmail = ref('')
const loginPassword = ref('')
const loginErrorMsg = ref('')
const showAdminPassword = ref(false)

async function handleAdminLogin() {
  loginErrorMsg.value = ''
  if (!loginEmail.value || !loginPassword.value) {
    loginErrorMsg.value = 'Please provide both your administrator email and password.'
    return
  }

  const ok = await loginAdmin(loginEmail.value, loginPassword.value)
  if (ok) {
    loginPassword.value = ''
    showToast('Signed in to Admin Portal', 'Welcome Administrator')
    loadAdminData()
  } else {
    loginErrorMsg.value = authError.value || 'Invalid credentials or non-admin account.'
  }
}

// Schools management
const schoolSearch = ref('')
const schoolTypeFilter = ref('')

// Filter options
const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Public & Private' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

// Institution types
const INSTITUTION_TYPE_OPTIONS = [
  { value: 'Public (State University)', label: 'Public (State University)' },
  { value: 'Public (Local University/College)', label: 'Public (Local University/College)' },
  { value: 'Private', label: 'Private' },
]
const isEditModalOpen = ref(false)
const editingSchool = ref(null)
const isSavingSchool = ref(false)

const editForm = reactive({
  name: '',
  abbreviation: '',
  institution_type: 'Private',
  address: '',
  website: '',
  graduate_programs: '',
})

const filteredSchools = computed(() => {
  const query = schoolSearch.value.trim().toLowerCase()
  const filterType = schoolTypeFilter.value.toLowerCase()

  return schools.value.filter((school) => {
    const matchesSearch =
      !query ||
      (school.name && school.name.toLowerCase().includes(query)) ||
      (school.abbreviation && school.abbreviation.toLowerCase().includes(query)) ||
      (school.address && school.address.toLowerCase().includes(query))

    const matchesType =
      !filterType ||
      (school.institution_type && school.institution_type.toLowerCase().includes(filterType))

    return matchesSearch && matchesType
  })
})

function openEditSchoolModal(school) {
  editingSchool.value = school
  editForm.name = school.name || ''
  editForm.abbreviation = school.abbreviation || ''
  editForm.institution_type = school.institution_type || 'Private'
  editForm.address = school.address || ''
  editForm.website = school.website || ''
  editForm.graduate_programs = school.graduate_programs || ''
  isEditModalOpen.value = true
}

function closeEditSchoolModal() {
  isEditModalOpen.value = false
  editingSchool.value = null
}

async function handleSaveSchool() {
  if (!editingSchool.value) return
  isSavingSchool.value = true

  const result = await updateSchool(editingSchool.value.id, {
    name: editForm.name,
    abbreviation: editForm.abbreviation,
    institution_type: editForm.institution_type,
    address: editForm.address,
    website: editForm.website,
    graduate_programs: editForm.graduate_programs,
  })

  isSavingSchool.value = false

  if (result.success) {
    showToast(`Updated ${editForm.name}`, 'School Information Saved')
    closeEditSchoolModal()
  } else {
    showToast(result.message || 'Failed to update university details', 'Error')
  }
}

// Requests management
const isReviewModalOpen = ref(false)
const activeRequest = ref(null)

function openReviewModal(req) {
  activeRequest.value = req
  isReviewModalOpen.value = true
}

function closeReviewModal() {
  isReviewModalOpen.value = false
  activeRequest.value = null
}

// Generate random 8-character password
function generate8CharPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let pass = ''
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

// Approval email template
function getApprovalEmailTemplate(req, customPassword = null) {
  const repName = `${req?.first_name || ''} ${req?.last_name || ''}`.trim() || 'Institutional Representative'
  const schoolName = req?.institution_name || 'Your Institution'
  const email = req?.user?.email || 'Registered Institutional Email'
  const password = customPassword || generate8CharPassword()

  return `Subject: KolehiYohoo! - Institutional Verification Application Status

Dear ${repName},

We are pleased to inform you that your institutional verification request for ${schoolName} has been officially approved by our team.

Your institutional administrator account has been created. You can now log in to the KolehiYohoo Institution Portal to manage and update your academic programs and campus profile:

Portal URL: kolehiyohoo.app
Email: ${email}
Temporary Password: ${password}

For security purposes, please log in at your earliest convenience and update your password.

If you have any questions or require assistance managing your account, please feel free to contact us.

Best regards,
KolehiYohoo Admin Team`
}

// Rejection email template
function getRejectionEmailTemplate(req) {
  const repName = `${req?.first_name || ''} ${req?.last_name || ''}`.trim() || 'Institutional Representative'
  const schoolName = req?.institution_name || 'Your Institution'

  return `Subject: KolehiYohoo! - Institutional Verification Application Status

Dear ${repName},

Thank you for your interest in registering ${schoolName} on KolehiYohoo!.

Following a review by our team, we regret to inform you that we are unable to approve your institutional verification request at this time. This may be due to incomplete verification details, unconfirmed institutional affiliation, or duplicate records.

If you believe this decision was reached in error or would like to submit updated information regarding your institution, you are welcome to submit a new verification request or contact our team.

We appreciate your time and interest in partnering with us!.

Best regards,
KolehiYohoo Team`
}

function handleApprove(req) {
  void req
  void getApprovalEmailTemplate
  void approveRequest
  closeReviewModal()
}

function handleReject(req) {
  void req
  void getRejectionEmailTemplate
  void rejectRequest
  closeReviewModal()
}

// Data loading
function loadAdminData() {
  if (currentUser.value?.role === 'admin') {
    fetchStats()
    fetchPendingRequests()
    fetchSchools()
  }
}

onMounted(() => {
  loadAdminData()
})

watch(
  () => [currentUser.value, activeSection.value],
  ([user, section]) => {
    if (user?.role === 'admin' && section === 'adminSection') {
      loadAdminData()
    }
  }
)
</script>

<template>
  <div class="admin-container">
    <!-- Admin Login -->
    <div v-if="currentUser?.role !== 'admin'" class="admin-login-wrapper">
      <div class="admin-login-card">
        <h1 class="admin-login-title">Admin Portal</h1>

        <div v-if="loginErrorMsg" class="admin-error-banner" role="alert">
          <span>{{ loginErrorMsg }}</span>
        </div>

        <form class="admin-login-form" @submit.prevent="handleAdminLogin">
          <div class="admin-form-group">
            <label for="adminEmail">Administrator Email</label>
            <input
              id="adminEmail"
              v-model="loginEmail"
              type="email"
              placeholder="admin@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="admin-form-group">
            <label for="adminPassword">Password</label>
            <div class="password-input-wrapper">
              <input
                id="adminPassword"
                v-model="loginPassword"
                :type="showAdminPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                tabindex="-1"
                :aria-label="showAdminPassword ? 'Hide password' : 'Show password'"
                @click="showAdminPassword = !showAdminPassword"
              >
                <svg v-if="!showAdminPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <button type="submit" class="admin-submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="btn-spinner"></span>
            <span>{{ isSubmitting ? 'Verifying access...' : 'Sign In as Administrator' }}</span>
          </button>
        </form>

        <div class="admin-login-footer">
          <a href="#" class="return-link" @click.prevent="showSection('homeSection')">
            ← Return to Student Website
          </a>
        </div>
      </div>
    </div>

    <div v-else class="admin-portal">
      <!-- Dashboard -->
      <section v-if="adminTab === 'dashboard'" class="tab-content dashboard-content">
        <div class="admin-tab-topbar">
          <div class="admin-tab-heading">
            <h2>Dashboard</h2>
            <p>A quick overview of the universities, programs, and pending requests in the system.</p>
          </div>
        </div>

        <!-- Stat Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div class="stat-info">
              <div v-if="isLoadingStats" class="skeleton skeleton-stat-num" aria-hidden="true"></div>
              <span v-else class="stat-value">{{ stats.total_schools }}</span>
              <span class="stat-label">Total Universities</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div class="stat-info">
              <div v-if="isLoadingStats" class="skeleton skeleton-stat-num" aria-hidden="true"></div>
              <span v-else class="stat-value">{{ stats.total_courses }}</span>
              <span class="stat-label">Academic Programs</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'has-pending': pendingRequests.length > 0 }">
            <div class="stat-icon-wrapper icon-amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="stat-info">
              <div v-if="isLoadingRequests || isLoadingStats" class="skeleton skeleton-stat-num" aria-hidden="true"></div>
              <span v-else class="stat-value">{{ pendingRequests.length }}</span>
              <span class="stat-label">Pending Requests</span>
            </div>
          </div>
        </div>

        <!-- Quick requests -->
        <div class="dashboard-panels">
          <div class="dashboard-panel full-width">
            <div class="panel-header">
              <h3>Pending Institution Applications</h3>
              <button
                v-if="pendingRequests.length > 0"
                type="button"
                class="panel-action-btn"
                @click="setAdminTab('requests')"
              >
                View all ({{ pendingRequests.length }})
              </button>
            </div>

            <!-- Loading skeleton -->
            <div v-if="isLoadingRequests" class="requests-quick-list" aria-hidden="true">
              <div v-for="i in 3" :key="i" class="request-quick-item skeleton-item-wrapper">
                <div class="req-quick-info">
                  <div class="skeleton skeleton-title" style="width: 160px; height: 16px; margin-bottom: 6px;"></div>
                  <div class="skeleton skeleton-text" style="width: 250px; height: 12px; margin-bottom: 0;"></div>
                </div>
                <div class="skeleton skeleton-btn" style="width: 110px; height: 32px; border-radius: 8px;"></div>
              </div>
            </div>

            <div v-else-if="pendingRequests.length === 0" class="empty-state-small">
              <p>No pending verification requests. All applications have been reviewed.</p>
            </div>

            <div v-else class="requests-quick-list">
              <div
                v-for="req in pendingRequests.slice(0, 5)"
                :key="req.institution_id"
                class="request-quick-item"
              >
                <div class="req-quick-info">
                  <strong>{{ req.institution_name }}</strong>
                  <span class="req-quick-rep">
                    Representative: {{ req.first_name }} {{ req.last_name }} ({{ req.user?.email }})
                  </span>
                </div>
                <button
                  type="button"
                  class="review-quick-btn"
                  @click="openReviewModal(req)"
                >
                  Review Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Schools -->
      <section v-if="adminTab === 'schools'" class="tab-content schools-content">
        <div class="admin-tab-topbar">
          <div class="admin-tab-heading">
            <h2>Universities</h2>
            <p>View and edit the information of every university listed in the system.</p>
          </div>

          <div class="filters-row">
            <div class="admin-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="schoolSearch"
                type="text"
                placeholder="Search schools..."
              />
            </div>

            <div class="admin-type-filter">
              <AppSelect v-model="schoolTypeFilter" :options="TYPE_FILTER_OPTIONS" />
            </div>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoadingSchools" class="schools-grid" aria-hidden="true">
          <div v-for="i in 6" :key="i" class="school-card skeleton-card-wrapper admin-skeleton-card">
            <div class="skeleton skeleton-cover"></div>
            <div class="school-body">
              <div class="skeleton skeleton-badge" style="width: 70px;"></div>
              <div class="skeleton skeleton-title" style="width: 80%;"></div>
              <div class="skeleton skeleton-text" style="width: 95%;"></div>
              <div class="skeleton skeleton-text" style="width: 45%; margin-bottom: 16px;"></div>
              <div class="card-actions" style="margin-top: auto;">
                <div class="skeleton skeleton-btn" style="width: 100%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schools grid -->
        <div v-else-if="filteredSchools.length > 0" class="schools-grid">
          <div
            v-for="school in filteredSchools"
            :key="school.id"
            class="school-card admin-school-card"
          >
            <div class="school-cover">{{ school.abbreviation }}</div>
            <div class="school-body">
              <span class="school-tag">{{ school.institution_type || 'University' }}</span>
              <h3>{{ school.name }}</h3>
              <p class="school-address">{{ school.address || 'Address not yet specified' }}</p>
              <p class="school-meta">
                {{ school.courses_count ?? school.courses?.length ?? 0 }} programs offered
              </p>
              <div v-if="school.website" class="school-website">
                <a :href="school.website" target="_blank" rel="noopener noreferrer">
                  {{ school.website }}
                </a>
              </div>
              <div class="card-actions">
                <button
                  type="button"
                  class="edit-school-btn"
                  @click="openEditSchoolModal(school)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Edit School Information</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty search results -->
        <div v-else class="empty-state-large">
          <h4>No universities found</h4>
          <p>No universities match your search criteria.</p>
        </div>
      </section>

      <!-- Requests -->
      <section v-if="adminTab === 'requests'" class="tab-content requests-content">
        <div class="admin-tab-topbar">
          <div class="admin-tab-heading">
            <h2>Requests</h2>
            <p>Review institution sign-up applications and approve or decline them.</p>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoadingRequests" class="schools-grid" aria-hidden="true">
          <div v-for="i in 3" :key="i" class="school-card request-card skeleton-card-wrapper admin-skeleton-card">
            <div class="skeleton skeleton-cover request-cover"></div>
            <div class="school-body">
              <div class="skeleton skeleton-badge" style="width: 120px;"></div>
              <div class="skeleton skeleton-title" style="width: 75%;"></div>
              <div class="skeleton skeleton-text" style="width: 85%;"></div>
              <div class="skeleton skeleton-text" style="width: 60%;"></div>
              <div class="skeleton skeleton-text" style="width: 45%; margin-bottom: 16px;"></div>
              <div class="card-actions" style="margin-top: auto;">
                <div class="skeleton skeleton-btn" style="width: 100%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="pendingRequests.length === 0" class="empty-state-large">
          <div class="empty-icon-shield">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h4>All Applications Handled</h4>
          <p>There are no pending institutional verification requests at this moment.</p>
        </div>

        <!-- Requests grid -->
        <div v-else class="schools-grid">
          <div
            v-for="req in pendingRequests"
            :key="req.institution_id"
            class="school-card request-card"
          >
            <div class="school-cover request-cover">
              {{ (req.institution_name || 'INST').substring(0, 4).toUpperCase() }}
            </div>
            <div class="school-body">
              <span class="school-tag alert-tag">Pending Verification</span>
              <h3 class="req-title">{{ req.institution_name }}</h3>
              <p class="req-rep">
                Representative: <strong>{{ req.first_name }} {{ req.last_name }}</strong>
              </p>
              <p class="req-email">
                {{ req.user?.email || 'No email provided' }}
              </p>
              <p v-if="req.contact_no" class="req-phone">
                Phone: {{ req.contact_no }}
              </p>
              <div class="card-actions">
                <button
                  type="button"
                  class="review-action-btn"
                  @click="openReviewModal(req)"
                >
                  Review Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Edit School Modal -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="admin-modal-overlay"
        @click.self="closeEditSchoolModal"
      >
        <div class="admin-modal-card">
          <div class="modal-header">
            <h3>Edit University Information</h3>
            <button
              type="button"
              class="modal-close-btn"
              @click="closeEditSchoolModal"
            >
              ✕
            </button>
          </div>

          <form class="modal-form" @submit.prevent="handleSaveSchool">
            <div class="form-group">
              <label for="editSchoolName">University / Institution Name</label>
              <input
                id="editSchoolName"
                v-model="editForm.name"
                type="text"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="editSchoolAbbr">Abbreviation</label>
                <input
                  id="editSchoolAbbr"
                  v-model="editForm.abbreviation"
                  type="text"
                  placeholder="e.g. UPHSL"
                />
              </div>

              <div class="form-group">
                <label id="editSchoolTypeLabel">Institution Type</label>
                <AppSelect
                  v-model="editForm.institution_type"
                  :options="INSTITUTION_TYPE_OPTIONS"
                  aria-labelledby="editSchoolTypeLabel"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="editSchoolAddress">Campus Address</label>
              <textarea
                id="editSchoolAddress"
                v-model="editForm.address"
                rows="2"
                placeholder="Barangay, Biñan City, Laguna"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="editSchoolWebsite">Official Website URL</label>
              <input
                id="editSchoolWebsite"
                v-model="editForm.website"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div class="form-group">
              <label for="editSchoolGrad">Graduate & Professional Programs</label>
              <textarea
                id="editSchoolGrad"
                v-model="editForm.graduate_programs"
                rows="3"
                placeholder="Master's, Doctorate, Juris Doctor, or professional degrees offered..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button
                type="button"
                class="btn-cancel"
                @click="closeEditSchoolModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-save"
                :disabled="isSavingSchool"
              >
                <span v-if="isSavingSchool" class="btn-spinner"></span>
                <span>{{ isSavingSchool ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Review Request Modal -->
    <Teleport to="body">
      <div
        v-if="isReviewModalOpen && activeRequest"
        class="admin-modal-overlay"
        @click.self="closeReviewModal"
      >
        <div class="admin-modal-card review-modal-card">
          <div class="modal-header">
            <div>
              <span class="modal-badge-pending">PENDING VERIFICATION</span>
              <h3>Review Institutional Request</h3>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              @click="closeReviewModal"
            >
              ✕
            </button>
          </div>

          <div class="review-details">
            <div class="review-row">
              <span class="detail-label">Institution / School</span>
              <strong class="detail-value text-lg">{{ activeRequest.institution_name }}</strong>
            </div>

            <div class="review-row">
              <span class="detail-label">Representative Name</span>
              <span class="detail-value">
                {{ activeRequest.first_name }} {{ activeRequest.last_name }}
              </span>
            </div>

            <div class="review-row">
              <span class="detail-label">Official Email</span>
              <span class="detail-value font-mono">{{ activeRequest.user?.email }}</span>
            </div>

            <div class="review-row">
              <span class="detail-label">Contact Number</span>
              <span class="detail-value">{{ activeRequest.contact_no || 'Not specified' }}</span>
            </div>

            <div v-if="activeRequest.address" class="review-row">
              <span class="detail-label">Campus / Notes</span>
              <span class="detail-value">{{ activeRequest.address }}</span>
            </div>
          </div>

          <div class="modal-actions review-actions">
            <button
              type="button"
              class="btn-decline"
              @click="handleReject(activeRequest)"
            >
              Decline Application
            </button>

            <button
              type="button"
              class="btn-approve"
              @click="handleApprove(activeRequest)"
            >
              Approve Institution
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-container {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

/* Admin Login */
.admin-login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.admin-login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 16px 36px -8px rgba(18, 52, 91, 0.12);
  text-align: center;
}

.admin-shield-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: #eef6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-login-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}

.admin-login-subtitle {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.admin-error-banner {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.admin-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.admin-form-group input {
  padding: 11px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.admin-form-group input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 166, 0.15);
}

.admin-submit-btn {
  background: var(--blue);
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.admin-submit-btn:hover {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

.admin-login-footer {
  margin-top: 24px;
}

.return-link {
  color: var(--muted);
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.return-link:hover {
  color: var(--blue);
}

/* Navigation */
.admin-tab-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.admin-tab-topbar h2 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.3px;
}

.admin-tab-heading p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

/* Dashboard */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(18, 52, 91, 0.04);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.has-pending {
  border-color: #fde68a;
  background: #fffbeb;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue {
  background: #eff6ff;
  color: var(--blue);
}

.icon-purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.icon-amber {
  background: #fef3c7;
  color: #d97706;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
}

.skeleton-stat-num {
  width: 54px;
  height: 30px;
  border-radius: 6px;
}

.stat-label {
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
  margin-top: 4px;
}

.dashboard-panels {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.dashboard-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(18, 52, 91, 0.04);
}

.dashboard-panel.full-width {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.panel-action-btn {
  background: none;
  border: none;
  color: var(--blue);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.empty-state-small {
  padding: 28px 12px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

.requests-quick-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-quick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.req-quick-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.req-quick-info strong {
  font-size: 14px;
  color: var(--text);
}

.req-quick-rep {
  font-size: 12px;
  color: var(--muted);
}

.review-quick-btn {
  background: var(--blue);
  color: #ffffff;
  border: none;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

/* Schools & Requests */
.filters-row {
  display: flex;
  gap: 12px;
  align-items: center;
  /* Match control height */
  --select-height: 42px;
}

.admin-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--select-height);
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid var(--border);
  padding: 0 14px;
  border-radius: 8px;
  width: 320px;
  max-width: 100%;
  color: var(--muted);
  transition: border-color 0.2s;
}

.admin-search-box:focus-within {
  border-color: var(--blue-light);
}

.admin-search-box input {
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  height: 100%;
  width: 100%;
  font-size: 14px;
  font-family: inherit;
  color: var(--text);
}

.admin-type-filter {
  width: 200px;
}

.schools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 22px;
}

.admin-school-card .school-body {
  display: flex;
  flex-direction: column;
}

.school-address {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}

.school-meta {
  font-size: 12px;
  font-weight: 600;
  color: var(--blue);
  margin-bottom: 12px;
}

.school-website {
  margin-bottom: 14px;
}

.school-website a {
  font-size: 12px;
  color: var(--blue);
  text-decoration: underline;
  word-break: break-all;
}

.edit-school-btn {
  margin-top: auto;
  width: 100%;
  background: #f8fafc;
  color: var(--blue);
  border: 1px solid #cbd5e1;
  padding: 9px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.edit-school-btn:hover {
  background: #eff6ff;
  border-color: var(--blue);
}

.skeleton-card-wrapper {
  pointer-events: none;
  user-select: none;
  border-color: #e2e8f0;
}

.skeleton-item-wrapper {
  pointer-events: none;
  user-select: none;
  border-color: #e2e8f0;
}

.admin-skeleton-card .school-body {
  gap: 4px;
}

/* Requests */
.empty-state-large {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
}

.empty-icon-shield {
  width: 68px;
  height: 68px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-state-large h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.empty-state-large p {
  font-size: 13px;
  color: var(--muted);
}

.request-card {
  border-left: 4px solid #f59e0b;
}

.request-cover {
  background: #fffbeb !important;
  color: #b45309 !important;
}

.alert-tag {
  background: #fef3c7 !important;
  color: #92400e !important;
}

.req-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.req-rep {
  font-size: 13px;
  color: #334155;
  margin-bottom: 4px;
}

.req-email,
.req-phone {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.review-action-btn {
  margin-top: auto;
  width: 100%;
  background: var(--blue);
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-action-btn:hover {
  background: var(--blue-dark);
}

/* Modals */
.admin-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(18, 52, 91, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin-modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 540px;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(18, 52, 91, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.review-modal-card {
  max-width: 580px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.modal-badge-pending {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 5px;
  margin-bottom: 4px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* Match modal input height */
  --select-height: 38px;
  --select-font-size: 13px;
}

.modal-form input {
  height: 38px;
  box-sizing: border-box;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--blue);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: var(--blue);
  border: none;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Review Details */
.review-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 8px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.detail-value {
  font-size: 14px;
  color: var(--text);
}

.text-lg {
  font-size: 16px;
}

.review-actions {
  display: flex;
  justify-content: space-between;
}

.btn-decline {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-decline:hover {
  background: #fecaca;
}

.btn-approve {
  background: #10b981;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 22px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.btn-approve:hover {
  background: #059669;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .filters-row {
    width: 100%;
    flex-wrap: wrap;
  }
  .admin-search-box,
  .admin-type-filter {
    width: 100%;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .review-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .btn-decline,
  .btn-approve {
    width: 100%;
    justify-content: center;
  }
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input-wrapper input {
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
</style>
