<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useSchools } from '../composables/useSchools'
import { useNavigation } from '../composables/useNavigation'
import emptyAvatar from '../assets/empty.png'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const { currentUser } = useAuth()
const { savedSchoolIds } = useSchools()
const { showSection } = useNavigation()

function closeModal() {
  emit('close')
}

function handleGoToSaved() {
  closeModal()
  showSection('savedSection')
}

function handleExploreSchools() {
  closeModal()
  showSection('schoolsSection')
}

function handleEditProfile() {
  closeModal()
  showSection('settingsSection')
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeModal()
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
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="profile-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profileModalTitle"
      @click.self="closeModal"
    >
      <div class="profile-modal-card">
        <!-- Close Button -->
        <button
          type="button"
          class="profile-modal-close"
          @click="closeModal"
          aria-label="Close profile"
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

        <!-- Profile Top Banner (Roblox-style Hero Header) -->
        <div class="profile-hero-banner">
          <div class="profile-avatar-badge">
            <img :src="emptyAvatar" alt="Profile Avatar" class="profile-avatar-img" />
          </div>
        </div>

        <!-- User Identity Info & Edit Profile Action Row -->
        <div class="profile-user-info-row">
          <div class="profile-user-details">
            <h2 id="profileModalTitle" class="profile-name">
              {{ currentUser?.name || 'User Profile' }}
            </h2>
            <p v-if="currentUser?.email" class="profile-email">{{ currentUser.email }}</p>
          </div>
          <button
            type="button"
            class="profile-edit-btn"
            @click="handleEditProfile"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </div>

        <!-- Quick Stats Grid (Roblox-inspired stats bar) -->
        <div class="profile-stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{ savedSchoolIds.length }}</span>
            <span class="stat-label">Saved Colleges</span>
            <button
              type="button"
              class="stat-action-btn"
              @click="handleGoToSaved"
            >
              View Saved →
            </button>
          </div>
          <div class="stat-card">
            <span class="stat-number">Active</span>
            <span class="stat-label">Student Status</span>
            <span class="stat-sub">KolehiYohoo</span>
          </div>
        </div>

        <!-- Details Section -->
        <div class="profile-details-section">
          <h4 class="section-title">Academic & Personal Details</h4>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">Current School:</span>
              <span class="detail-val">
                {{ currentUser?.student?.school_name || 'Not provided' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Address:</span>
              <span class="detail-val">
                {{ currentUser?.student?.address || 'Not provided' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone Number:</span>
              <span class="detail-val">
                {{ currentUser?.phone || currentUser?.student?.contact_no || 'Not provided' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="profile-modal-actions">
          <button type="button" class="profile-btn-explore" @click="handleExploreSchools">
            Explore Schools
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.profile-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(18, 52, 91, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: profileOverlayFade 0.2s ease-out;
}

.profile-modal-card {
  position: relative;
  background: #ffffff;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 25px 60px -15px rgba(18, 52, 91, 0.35),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: profileSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.profile-modal-close:hover {
  background: #ffffff;
  color: #1e293b;
  transform: rotate(90deg);
}

.profile-hero-banner {
  height: 95px;
  background: linear-gradient(135deg, #12345b 0%, #2563a6 65%, #5c9bd5 100%);
  position: relative;
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.profile-avatar-badge {
  position: absolute;
  bottom: -32px;
  left: 24px;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: #ffffff;
  border: 4px solid #ffffff;
  box-shadow: 0 6px 18px rgba(18, 52, 91, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.profile-user-info-row {
  padding: 42px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.profile-user-details {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-email {
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid #dce6f2;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  user-select: none;
}

.profile-edit-btn:hover {
  background: #f8fbff;
  border-color: var(--blue-light);
  color: var(--blue);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(37, 99, 166, 0.12);
}

.profile-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 18px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.stat-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--blue-dark);
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
}

.stat-action-btn {
  background: none;
  border: none;
  padding: 0;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  color: var(--blue);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s ease;
}

.stat-action-btn:hover {
  color: var(--blue-dark);
  text-decoration: underline;
}

.stat-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.profile-details-section {
  padding: 0 24px 20px;
  text-align: left;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.details-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-val {
  color: var(--text);
  font-weight: 600;
}

.profile-modal-actions {
  padding: 0 24px 24px;
}

.profile-btn-explore {
  width: 100%;
  background: var(--blue);
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(37, 99, 166, 0.25);
  transition: all 0.2s ease;
}

.profile-btn-explore:hover {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

@keyframes profileOverlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes profileSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
