import { ref } from 'vue'
import { useToast } from './useToast'

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

export function useAuth() {
  const { showToast } = useToast()

  function openAuthModal(mode = 'login', role = null) {
    currentAuthMode.value = mode
    if (role) {
      currentRole.value = role
      isRoleChosen.value = true
    }
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
  }

  function selectRole(role) {
    currentRole.value = role
    isRoleChosen.value = true
    currentAuthMode.value = 'login'
  }

  function showAccountSelect() {
    isRoleChosen.value = false
    currentRole.value = 'student'
    currentAuthMode.value = 'login'
  }

  function setAuthMode(mode) {
    currentAuthMode.value = mode
  }

  function toggleAuthMode() {
    currentAuthMode.value = currentAuthMode.value === 'login' ? 'signup' : 'login'
  }

  async function loginStudent(formData) {
    try {
      if (!formData.email || !formData.password) {
        showToast('Please enter your email and password.', 'Missing Fields', '⚠️')
        return false
      }

      const response = await fetch('http://localhost:8000/api/student/login', {
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
        showToast(data.message || 'Login Failed', 'Access Denied', '⚠️')
        return false
      }

      if (data.user?.role !== 'student' && data.user?.role_id !== 1) {
        showToast('This account is not a student account.', 'Access Denied', '⚠️')
        return false
      }

      localStorage.setItem('token', data.token)
      showToast('Login Success', 'Success', '✅')

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'student',
        role_id: data.user.role_id || 1,
        student: data.user.student,
      }
      currentUser.value = userData
      currentRole.value = 'student'
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    } catch {
      showToast('Network error connecting to backend', 'Error', '⚠️')
      return false
    }
  }

  async function signupStudent(formData) {
    try {
      if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match', 'Error', '⚠️')
        return false
      }

      const response = await fetch('http://localhost:8000/api/register', {
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
        showToast(data.message || 'Registration Failed', 'Error', '⚠️')
        return false
      }

      showToast(
        'Account created successfully! Log in to your account to get started',
        'Success',
        '✅',
      )
      return true
    } catch {
      showToast('Network error connecting to backend', 'Error', '⚠️')
      return false
    }
  }
  async function loginInstitution(emailInput, passwordInput) {
    const email = (emailInput || '').trim()
    const password = passwordInput || ''

    if (!email || !password) {
      showToast('Please enter your institutional email and password.', 'Missing Fields', '⚠️')
      return false
    }

    try {
      const response = await fetch('http://localhost:8000/api/institution/login', {
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
        showToast(data.message || 'Login Failed', 'Access Denied', '⚠️')
        return false
      }

      if (data.user?.role !== 'institution' && data.user?.role_id !== 2) {
        showToast('This account is not registered as an institution.', 'Access Denied', '⚠️')
        return false
      }

      localStorage.setItem('token', data.token)
      showToast('Welcome, ' + (data.user.name || 'Partner') + '!', 'Login Success', '🏛️')

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'institution',
        role_id: data.user.role_id || 2,
        institution: data.user.institution,
      }
      currentUser.value = userData
      currentRole.value = 'institution'
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    } catch {
      showToast('Network error connecting to backend', 'Error', '⚠️')
      return false
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
    const school = (schoolName || '').trim()
    const rep = (repName || '').trim()
    const officialEmail = (email || '').trim()
    const contactPhone = (phone || '').trim()

    if (!school || !rep || !officialEmail || !contactPhone) {
      showToast('Please fill in all required institutional details.', 'Incomplete Request', '⚠️')
      return false
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
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
        showToast(data.message || 'Account request failed', 'Error', '⚠️')
        return false
      }

      showToast(
        `Thank you, ${rep}. Account created for ${school}! You can now log in.`,
        'Account Registered!',
        '🏛️',
        6500,
      )

      setTimeout(() => {
        currentAuthMode.value = 'login'
      }, 1200)

      return true
    } catch {
      showToast('Network error connecting to backend', 'Error', '⚠️')
      return false
    }
  }

  function handleGoogleAuth() {
    const rickrollUrl =
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1'
    window.open(rickrollUrl, '_blank')
  }

  function handleForgotPassword(emailInput) {
    const email = (emailInput || '').trim()
    if (email) {
      showToast(`Demo password reset link dispatched to ${email}`, 'Password Reset', '🔑')
    } else {
      showToast('Please enter your email above to reset password.', 'Email Required', 'ℹ️')
    }
  }

  async function logout() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
      } catch (error) {
        console.error('Error logging out from server:', error)
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    currentUser.value = null
    isRoleChosen.value = false
    currentRole.value = 'student'

    showToast('You have been signed out.', 'Logged Out', '👋')
  }

  return {
    currentUser,
    currentRole,
    currentAuthMode,
    isRoleChosen,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    selectRole,
    showAccountSelect,
    setAuthMode,
    toggleAuthMode,
    loginStudent,
    signupStudent,
    loginInstitution,
    submitInstitutionVerification,
    handleGoogleAuth,
    handleForgotPassword,
    logout,
  }
}
