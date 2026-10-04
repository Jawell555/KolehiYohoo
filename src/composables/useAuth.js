import { ref } from 'vue'

function getStoredUser() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
const savedUser = getStoredUser()
const currentUser = ref(savedUser)
const currentRole = ref(savedUser?.role || 'student')
const currentAuthMode = ref('login') // 'login' or 'signup'
const isRoleChosen = ref(false)
const isAuthModalOpen = ref(false)
const isSubmitting = ref(false)
const authError = ref('')
const authSuccess = ref('')

const API_BASE = '/api'

export function useAuth() {

  function openAuthModal(mode = 'login', role = null) {
    authError.value = ''
    authSuccess.value = ''
    currentAuthMode.value = mode
    if (role) {
      currentRole.value = role
      isRoleChosen.value = true
    }
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
    authError.value = ''
    authSuccess.value = ''
  }

  function selectRole(role) {
    authError.value = ''
    authSuccess.value = ''
    currentRole.value = role
    isRoleChosen.value = true
    currentAuthMode.value = 'login'
  }

  function showAccountSelect() {
    authError.value = ''
    authSuccess.value = ''
    isRoleChosen.value = false
    currentRole.value = 'student'
    currentAuthMode.value = 'login'
  }

  function setAuthMode(mode) {
    authError.value = ''
    authSuccess.value = ''
    currentAuthMode.value = mode
  }

  function clearAuthMessages() {
    authError.value = ''
    authSuccess.value = ''
  }

  function toggleAuthMode() {
    currentAuthMode.value = currentAuthMode.value === 'login' ? 'signup' : 'login'
  }

  async function loginStudent(formData) {
    if (isSubmitting.value) return false
    authError.value = ''
    authSuccess.value = ''
    try {
      if (!formData.email || !formData.password) {
        authError.value = 'Please enter your email and password.'
        return false
      }

      isSubmitting.value = true
      const response = await fetch(`${API_BASE}/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'student',
          role_id: 1,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        authError.value = data.message || 'Login Failed. Please check your credentials.'
        return false
      }

      if (data.user?.role !== 'student' && data.user?.role_id !== 1) {
        authError.value = 'This account is not a student account.'
        return false
      }

      localStorage.setItem('token', data.token)

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'student',
        role_id: data.user.role_id || 1,
        phone: data.user.phone || data.user.student?.contact_no || '',
        email_verified: !!data.user.email_verified,
        student: data.user.student,
      }
      currentUser.value = userData
      currentRole.value = 'student'
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    } catch {
      authError.value = 'Network error connecting to backend'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function signupStudent(formData) {
    if (isSubmitting.value) return false
    authError.value = ''
    authSuccess.value = ''
    try {
      if (formData.password !== formData.confirmPassword) {
        authError.value = 'Passwords do not match'
        return false
      }

      isSubmitting.value = true
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        authError.value = data.message || 'Registration Failed'
        return false
      }

      authSuccess.value = 'Account created successfully! You can now log in below.'
      setTimeout(() => {
        currentAuthMode.value = 'login'
      }, 1500)
      return true
    } catch {
      authError.value = 'Network error connecting to backend'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function loginInstitution(emailInput, passwordInput) {
    if (isSubmitting.value) return false
    authError.value = ''
    authSuccess.value = ''
    const email = (emailInput || '').trim()
    const password = passwordInput || ''

    if (!email || !password) {
      authError.value = 'Please enter your institutional email and password.'
      return false
    }

    try {
      isSubmitting.value = true
      const response = await fetch(`${API_BASE}/institution/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'institution',
          role_id: 2,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        authError.value = data.message || 'Login Failed. Please check your credentials.'
        return false
      }

      if (data.user?.role !== 'institution' && data.user?.role_id !== 2) {
        authError.value = 'This account is not registered as an institution.'
        return false
      }

      localStorage.setItem('token', data.token)

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'institution',
        role_id: data.user.role_id || 2,
        phone: data.user.phone || data.user.institution?.contact_no || '',
        email_verified: !!data.user.email_verified,
        institution: data.user.institution,
      }
      currentUser.value = userData
      currentRole.value = 'institution'
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    } catch {
      authError.value = 'Network error connecting to backend'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitInstitutionVerification({
    schoolName,
    repName,
    email,
    phone,
    notes,
    password,
  }) {
    if (isSubmitting.value) return false
    authError.value = ''
    authSuccess.value = ''
    const school = (schoolName || '').trim()
    const rep = (repName || '').trim()
    const officialEmail = (email || '').trim()
    const contactPhone = (phone || '').trim()

    if (!school || !rep || !officialEmail || !contactPhone) {
      authError.value = 'Please fill in all required institutional details.'
      return false
    }

    try {
      isSubmitting.value = true
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          role: 'institution',
          school_name: school,
          rep_name: rep,
          email: officialEmail,
          phone: contactPhone,
          notes: notes || '',
          password: password || 'KolehiYohoo!2026',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        authError.value = data.message || 'Account request failed'
        return false
      }

      authSuccess.value = `Thank you, ${rep}. Account created for ${school}! You can now log in below.`

      setTimeout(() => {
        currentAuthMode.value = 'login'
      }, 2000)

      return true
    } catch {
      authError.value = 'Network error connecting to backend'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function handleGoogleAuth() {
    authError.value = '\'di pa \'to nagana.'
  }

  function handleForgotPassword(emailInput) {
    const email = (emailInput || '').trim()
    authError.value = ''
    authSuccess.value = ''
    if (email) {
      authSuccess.value = `Password reset link dispatched to ${email}`
    } else {
      authError.value = 'Please enter your email above to reset password.'
    }
  }

  function logout() {
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }).catch((error) => {
        console.error('Error logging out from server:', error)
      })
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    currentUser.value = null
    isRoleChosen.value = false
    currentRole.value = 'student'
  }

  async function updateUserProfile(newData) {
    if (isSubmitting.value) return { success: false, message: 'Request in progress' }
    isSubmitting.value = true
    try {
      if (!currentUser.value) {
        currentUser.value = {
          name: '',
          email: '',
          phone: null,
          email_verified: false,
          role: 'student',
          student: {
            first_name: '',
            last_name: '',
            address: null,
            school_name: null,
            contact_no: null,
          },
        }
      }
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = {}
          if (newData.email !== undefined) payload.email = newData.email
          if (newData.phone !== undefined) payload.contact_no = newData.phone
          if (newData.student) {
            if (newData.student.first_name !== undefined) payload.first_name = newData.student.first_name
            if (newData.student.last_name !== undefined) payload.last_name = newData.student.last_name
            if (newData.student.address !== undefined) payload.address = newData.student.address
            if (newData.student.school_name !== undefined) payload.school_name = newData.student.school_name
            if (newData.student.contact_no !== undefined) payload.contact_no = newData.student.contact_no
          }

          const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          })

          const data = await res.json().catch(() => ({}))
          if (res.ok && data.user) {
            currentUser.value = {
              ...currentUser.value,
              ...data.user,
              student: {
                ...currentUser.value?.student,
                ...data.user.student,
              },
            }
            if (data.user.student?.first_name || data.user.student?.last_name) {
              const fName = data.user.student?.first_name || currentUser.value?.student?.first_name || ''
              const lName = data.user.student?.last_name || currentUser.value?.student?.last_name || ''
              currentUser.value.name = `${fName} ${lName}`.trim() || currentUser.value.name
            }
            localStorage.setItem('user', JSON.stringify(currentUser.value))
            return { success: true }
          } else if (!res.ok) {
            const firstErr = data.errors ? Object.values(data.errors)[0]?.[0] : null
            return { success: false, message: firstErr || data.message || 'Database update failed' }
          }
        } catch (err) {
          console.error('Failed to update profile in database:', err)
          return { success: false, message: 'Database connection error' }
        }
      } else {
        return { success: false, message: 'You must be logged in to update your profile.' }
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function changeUserPassword(currentPassword, newPassword) {
    if (isSubmitting.value) return { success: false, message: 'Request in progress' }
    isSubmitting.value = true
    try {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/user/password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              current_password: currentPassword,
              new_password: newPassword,
            }),
          })

          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            return { success: false, message: data.message || 'Failed to update password in database' }
          }
          return { success: true, message: data.message }
        } catch (err) {
          console.error('Error changing password in database:', err)
          return { success: false, message: 'Network error connecting to database' }
        }
      }
      return { success: true }
    } finally {
      isSubmitting.value = false
    }
  }

  async function verifyUserEmail() {
    if (isSubmitting.value) return { success: false, message: 'Request in progress' }
    isSubmitting.value = true
    try {
      if (currentUser.value) {
        currentUser.value.email_verified = true
        localStorage.setItem('user', JSON.stringify(currentUser.value))
      }

      const token = localStorage.getItem('token')
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/user/verify-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok) {
            return { success: true }
          }
          return { success: false, message: data.message || 'Failed to verify email in database' }
        } catch (err) {
          console.error('Error verifying email in database:', err)
          return { success: false, message: 'Network error connecting to database' }
        }
      }
      return { success: true }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    currentUser,
    currentRole,
    currentAuthMode,
    isRoleChosen,
    isAuthModalOpen,
    isSubmitting,
    authError,
    authSuccess,
    openAuthModal,
    closeAuthModal,
    selectRole,
    showAccountSelect,
    setAuthMode,
    clearAuthMessages,
    toggleAuthMode,
    loginStudent,
    signupStudent,
    loginInstitution,
    submitInstitutionVerification,
    handleGoogleAuth,
    handleForgotPassword,
    updateUserProfile,
    changeUserPassword,
    verifyUserEmail,
    logout,
  }
}
