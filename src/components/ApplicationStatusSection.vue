<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const { currentUser } = useAuth()
const { showSection } = useNavigation()

const institutionName = computed(() => {
  return (
    currentUser.value?.institution?.institution_name ||
    currentUser.value?.name ||
    'Partner Institution'
  )
})

const repName = computed(() => {
  const inst = currentUser.value?.institution
  if (inst?.first_name || inst?.last_name) {
    return `${inst.first_name || ''} ${inst.last_name || ''}`.trim()
  }
  return currentUser.value?.name || 'Authorized Representative'
})
</script>

<template>
  <section id="applicationStatusSection" class="status-section">
    <div class="status-card">
      <div class="status-badge">
        <span>Application Under Review</span>
      </div>

      <p class="status-message">
        Your institution application has been submitted and is currently being verified by the
        KolehiYohoo administration team. We'll send you an email once your account is activated.
        Please wait for further notice.
      </p>

      <!-- Details Summary -->
      <div class="details-box">
        <h3>Application Details</h3>
        <div class="details-grid">
          <div class="detail-row">
            <span class="detail-label">Representative:</span>
            <span class="detail-value">{{ repName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Official Email:</span>
            <span class="detail-value">{{ currentUser?.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Contact Phone:</span>
            <span class="detail-value">{{ currentUser?.institution?.contact_no || currentUser?.phone || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.status-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.status-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  max-width: 680px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(18, 52, 91, 0.08);
  border: 1px solid var(--border);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
}

.status-message {
  color: var(--blue-dark);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 30px;
  font-weight: 700;
}

.step-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  position: relative;
}

.step-info strong {
  display: block;
  font-size: 14px;
  color: var(--blue-dark);
}

.step-info p {
  font-size: 13px;
  color: var(--muted);
}

.details-box {
  background: var(--pale);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 28px;
}

.details-box h3 {
  font-size: 15px;
  color: var(--blue-dark);
  margin-bottom: 14px;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
w
.detail-label {
  color: var(--muted);
}

.detail-value {
  font-weight: 600;
  color: var(--text);
}

.status-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
