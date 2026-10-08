import { ref } from 'vue'

const adminTab = ref('dashboard') // 'dashboard' | 'schools' | 'requests'
const stats = ref({
  total_schools: 0,
  total_courses: 0,
  pending_requests: 0,
})
const pendingRequests = ref([])
const schools = ref([])
const isLoading = ref(false)
const isLoadingStats = ref(false)
const isLoadingRequests = ref(false)
const isLoadingSchools = ref(false)
const adminError = ref('')
const adminSuccess = ref('')

const API_BASE = '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function useAdmin() {
  function setAdminTab(tab) {
    adminTab.value = tab
    adminError.value = ''
    adminSuccess.value = ''
  }

  async function fetchStats() {
    try {
      isLoadingStats.value = true
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        stats.value = data
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
    } finally {
      isLoadingStats.value = false
    }
  }

  async function fetchPendingRequests() {
    try {
      isLoadingRequests.value = true
      isLoading.value = true
      const response = await fetch(`${API_BASE}/admin/pending-institutions`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const result = await response.json()
        pendingRequests.value = result.data || []
        stats.value.pending_requests = pendingRequests.value.length
      } else {
        const err = await response.json().catch(() => ({}))
        adminError.value = err.message || 'Failed to fetch verification requests'
      }
    } catch (err) {
      console.error('Failed to fetch pending requests:', err)
      adminError.value = 'Network error fetching requests'
    } finally {
      isLoadingRequests.value = false
      isLoading.value = false
    }
  }

  async function fetchSchools() {
    try {
      isLoadingSchools.value = true
      isLoading.value = true
      const response = await fetch(`${API_BASE}/universities`)
      if (response.ok) {
        const result = await response.json()
        schools.value = result.data || []
        stats.value.total_schools = schools.value.length
      }
    } catch (err) {
      console.error('Failed to fetch universities for admin:', err)
    } finally {
      isLoadingSchools.value = false
      isLoading.value = false
    }
  }

  async function approveRequest(institutionId, tempPassword = null) {
    try {
      isLoading.value = true
      adminError.value = ''
      adminSuccess.value = ''

      const bodyData = {}
      if (tempPassword) {
        bodyData.temp_password = tempPassword
      }

      const response = await fetch(`${API_BASE}/admin/institutions/${institutionId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyData),
      })

      const data = await response.json()
      if (!response.ok) {
        adminError.value = data.message || 'Failed to approve institution'
        return { success: false, message: adminError.value }
      }

      adminSuccess.value = data.message || 'Institution approved successfully'
      pendingRequests.value = pendingRequests.value.filter(
        (r) => r.institution_id !== institutionId
      )
      stats.value.pending_requests = pendingRequests.value.length

      // Refresh schools in background
      fetchSchools()
      return { success: true, message: adminSuccess.value }
    } catch (err) {
      console.error('Error approving institution:', err)
      adminError.value = 'Network error during approval'
      return { success: false, message: adminError.value }
    } finally {
      isLoading.value = false
    }
  }

  async function rejectRequest(institutionId) {
    try {
      isLoading.value = true
      adminError.value = ''
      adminSuccess.value = ''

      const response = await fetch(`${API_BASE}/admin/institutions/${institutionId}/reject`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      const data = await response.json()
      if (!response.ok) {
        adminError.value = data.message || 'Failed to reject institution'
        return { success: false, message: adminError.value }
      }

      adminSuccess.value = data.message || 'Institution request rejected and removed'
      pendingRequests.value = pendingRequests.value.filter(
        (r) => r.institution_id !== institutionId
      )
      stats.value.pending_requests = pendingRequests.value.length

      return { success: true, message: adminSuccess.value }
    } catch (err) {
      console.error('Error rejecting institution:', err)
      adminError.value = 'Network error during rejection'
      return { success: false, message: adminError.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateSchool(universityId, payload) {
    try {
      isLoading.value = true
      adminError.value = ''
      adminSuccess.value = ''

      const response = await fetch(`${API_BASE}/admin/universities/${universityId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        adminError.value = data.message || 'Failed to update university details'
        return { success: false, message: adminError.value }
      }

      adminSuccess.value = data.message || 'University updated successfully'

      // Update local item
      const idx = schools.value.findIndex((s) => s.id === universityId)
      if (idx !== -1 && data.data) {
        schools.value[idx] = { ...schools.value[idx], ...data.data }
      }

      return { success: true, data: data.data, message: adminSuccess.value }
    } catch (err) {
      console.error('Error updating university:', err)
      adminError.value = 'Network error updating university'
      return { success: false, message: adminError.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    adminTab,
    stats,
    pendingRequests,
    schools,
    isLoading,
    isLoadingStats,
    isLoadingRequests,
    isLoadingSchools,
    adminError,
    adminSuccess,
    setAdminTab,
    fetchStats,
    fetchPendingRequests,
    fetchSchools,
    approveRequest,
    rejectRequest,
    updateSchool,
  }
}
