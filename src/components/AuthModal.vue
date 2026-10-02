<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import LoginCard from './LoginCard.vue'

const { closeAuthModal } = useAuth()

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeAuthModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="auth-modal-overlay" @click.self="closeAuthModal">
    <div class="auth-modal-container" role="dialog" aria-modal="true" aria-labelledby="authModalBrand">
      <button
        type="button"
        class="auth-modal-close-btn"
        @click="closeAuthModal"
        aria-label="Close modal"
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

      <!-- Brand Top Header -->
      <div class="auth-modal-header" id="authModalBrand">
        <div class="auth-modal-brand">
          <span class="auth-modal-brand-icon">🎓</span>
          <span class="auth-modal-brand-text">KolehiYohoo!</span>
        </div>
        <p class="auth-modal-brand-desc">Your guide to finding the right college</p>
      </div>

      <!-- Auth Form Card Content -->
      <div class="auth-modal-body">
        <LoginCard />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(18, 52, 91, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: authOverlayFadeIn 0.25s ease-out;
}

.auth-modal-container {
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  border-radius: 24px;
  box-shadow:
    0 25px 60px -15px rgba(18, 52, 91, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: authModalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: #f8fbff;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-modal-close-btn:hover {
  background: #eef6ff;
  color: var(--blue-dark);
  border-color: var(--blue-light);
  transform: rotate(90deg);
}

.auth-modal-header {
  padding: 28px 32px 14px;
  border-bottom: 1px solid #edf3f8;
  background: linear-gradient(180deg, #f9fbff 0%, #ffffff 100%);
  text-align: center;
}

.auth-modal-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.auth-modal-brand-icon {
  font-size: 22px;
}

.auth-modal-brand-text {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--blue-dark);
  letter-spacing: -0.3px;
}

.auth-modal-brand-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--muted);
}

.auth-modal-body {
  overflow-y: auto;
  padding: 20px 28px 28px;
}

/* Override standalone login-card styles when inside modal */
:deep(.login-card) {
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}

:deep(.login-card h2) {
  font-size: 22px;
}

@keyframes authOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes authModalSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 520px) {
  .auth-modal-overlay {
    padding: 12px;
  }

  .auth-modal-container {
    max-height: 94vh;
    border-radius: 18px;
  }

  .auth-modal-header {
    padding: 20px 20px 10px;
  }

  .auth-modal-body {
    padding: 16px 20px 20px;
  }
}
</style>
