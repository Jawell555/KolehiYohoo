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

  function loginStudent(emailInput, passwordInput) {
    const email = (emailInput || '').trim().toLowerCase()
    const password = passwordInput || ''

    if (!email || !password) {
      showToast('Please enter your email and password.', 'Missing Fields', '⚠️')
      return false
    }

    const account = registeredStudents.value.find(
      (s) => s.email.toLowerCase() === email && s.password === password,
    )

    if (!account) {
      showToast(
        'Invalid email or password. You can create an account or use: student@example.com / password123',
        'Login Failed',
        '⚠️',
        5000,
      )
      return false
    }

    currentUser.value = {
      role: 'student',
      name: `${account.firstName} ${account.lastName}`,
      email: account.email,
    }
    showToast(`Welcome back, ${account.firstName}!`, 'Logged In', '🎓')
    return true
  }

  function signupStudent({
    firstNameInput,
    lastNameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput,
  }) {
    const firstName = (firstNameInput || '').trim()
    const lastName = (lastNameInput || '').trim()
    const email = (emailInput || '').trim().toLowerCase()
    const password = passwordInput || ''
    const confirmPassword = confirmPasswordInput || ''

    if (!firstName || !lastName || !email || !password) {
      showToast('Please complete all required fields.', 'Incomplete Form', '⚠️')
      return false
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify your password.', 'Password Mismatch', '⚠️')
      return false
    }

    const existingAccount = registeredStudents.value.some((s) => s.email.toLowerCase() === email)

    if (existingAccount) {
      showToast(
        'An account with this email already exists in memory. Please log in.',
        'Account Exists',
        '⚠️',
        5000,
      )
      return false
    }

    registeredStudents.value.push({
      firstName,
      lastName,
      email,
      password,
    })

    currentUser.value = {
      role: 'student',
      name: `${firstName} ${lastName}`,
      email,
    }
    showToast(`Account created in memory! Welcome, ${firstName}!`, 'Account Created', '🎉', 4500)
    return true
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

  function logout() {
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
