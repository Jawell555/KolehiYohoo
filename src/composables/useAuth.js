import { ref } from 'vue'
import { useToast } from './useToast'

const registeredStudents = ref([
  {
    firstName: 'Juan',
    lastName: 'dela Cruz',
    email: 'student@example.com',
    password: 'password123',
  },
  {
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria@example.com',
    password: 'password123',
  },
])

const currentUser = ref(null)
const currentRole = ref('student') // 'student' or 'institution'
const currentAuthMode = ref('login') // 'login' or 'signup'
const isRoleChosen = ref(false)

export function useAuth() {
  const { showToast } = useToast()

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

      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        showToast(data.message || 'Login Failed', 'Error', '⚠️')
        return false
      }
      localStorage.setItem('token', data.token)
      showToast('Login Success', 'Success', '✅')

      currentUser.value = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: 'student',
      }
      return true
    } catch (error) {
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
    } catch (error) {
      showToast('Network error connecting to backend', 'Error', '⚠️')
      return false
    }
  }
  function loginInstitution(emailInput, passwordInput) {
    const email = (emailInput || '').trim()
    const password = passwordInput || ''

    if (!email || !password) {
      showToast('Please enter your institutional email and password.', 'Missing Fields', '⚠️')
      return false
    }

    currentUser.value = {
      role: 'institution',
      name: email.split('@')[0] || 'Institution Partner',
      email,
    }
    showToast('Signed in to School / Institution preview.', 'Welcome Partner', '🏛️')
    return true
  }

  function submitInstitutionVerification({ schoolName, repName, email, phone, _notes }) {
    const school = (schoolName || '').trim()
    const rep = (repName || '').trim()
    const officialEmail = (email || '').trim()
    const contactPhone = (phone || '').trim()

    if (!school || !rep || !officialEmail || !contactPhone) {
      showToast('Please fill in all required institutional details.', 'Incomplete Request', '⚠️')
      return false
    }

    showToast(
      `Thank you, ${rep}. We received ${school}'s verification request and will contact you via ${officialEmail} soon.`,
      'Verification Request Sent!',
      '📨',
      6500,
    )

    setTimeout(() => {
      currentAuthMode.value = 'login'
    }, 1200)

    return true
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
    currentUser.value = null
    isRoleChosen.value = false
    currentRole.value = 'student'
    currentAuthMode.value = 'login'
    showToast('You have been signed out.', 'Logged Out', '👋')
  }

  return {
    registeredStudents,
    currentUser,
    currentRole,
    currentAuthMode,
    isRoleChosen,
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
