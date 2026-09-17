<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const {
  isRoleChosen,
  currentRole,
  currentAuthMode,
  selectRole,
  showAccountSelect,
  setAuthMode,
  loginStudent,
  signupStudent,
  loginInstitution,
  submitInstitutionVerification,
  handleGoogleAuth,
  handleForgotPassword,
} = useAuth()

const { setPage } = useNavigation()

const loginForm = reactive({
  email: '',
  password: '',
})

const signupForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const institutionForm = reactive({
  schoolName: '',
  repName: '',
  email: '',
  phone: '',
  notes: '',
})

function resetForms() {
  loginForm.email = ''
  loginForm.password = ''
  signupForm.firstName = ''
  signupForm.lastName = ''
  signupForm.email = ''
  signupForm.password = ''
  signupForm.confirmPassword = ''
  institutionForm.schoolName = ''
  institutionForm.repName = ''
  institutionForm.email = ''
  institutionForm.phone = ''
  institutionForm.notes = ''
}

function handleRoleSelect(role) {
  selectRole(role)
  resetForms()
}

function handleBackToRoles() {
  showAccountSelect()
  resetForms()
}

function handleModeChange(mode) {
  setAuthMode(mode)
  resetForms()
}

async function onStudentLogin() {
  const success = await loginStudent({
    email: loginForm.email,
    password: loginForm.password,
  })
  if (success) {
    resetForms()
    setPage('student')
  }
}

async function onStudentSignup() {
  const success = await signupStudent({
    firstName: signupForm.firstName,
    lastName: signupForm.lastName,
    email: signupForm.email,
    password: signupForm.password,
    confirmPassword: signupForm.confirmPassword,
  })
  if (success) {
    resetForms()
    handleModeChange('login')
  }
}

function onInstitutionLogin() {
  const success = loginInstitution(loginForm.email, loginForm.password)
  if (success) {
    resetForms()
    setPage('student')
  }
}

function onInstitutionVerification() {
  const success = submitInstitutionVerification({
    schoolName: institutionForm.schoolName,
    repName: institutionForm.repName,
    email: institutionForm.email,
    phone: institutionForm.phone,
    notes: institutionForm.notes,
  })
  if (success) {
    resetForms()
  }
}

function onForgotPassword() {
  handleForgotPassword(loginForm.email)
}
</script>

<template>
  <div class="login-card">
    <!-- Choose Account Type -->
    <div v-if="!isRoleChosen" id="roleSelectView">
      <h2>Welcome</h2>
      <p class="subtitle">Choose your account type to continue</p>
      <div class="account-options">
        <button type="button" class="account-btn" @click="handleRoleSelect('student')">
          <div class="account-btn-icon">🎓</div>
          <div class="account-btn-text">
            <span>Student</span>
            <small>Find schools and explore courses</small>
          </div>
        </button>
        <button type="button" class="account-btn" @click="handleRoleSelect('institution')">
          <div class="account-btn-icon">🏛️</div>
          <div class="account-btn-text">
            <span>School / Institution</span>
            <small>Manage offerings and institution profile</small>
          </div>
        </button>
      </div>
    </div>

    <!-- Auth Form View -->
    <div v-else id="authFormView">
      <button type="button" class="auth-back-btn" @click="handleBackToRoles">
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
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Change account type
      </button>

      <div class="auth-header">
        <span class="auth-role-badge">
          {{ currentRole === 'institution' ? 'School / Institution' : 'Student' }}
        </span>
        <h2>
          <template v-if="currentRole === 'institution' && currentAuthMode === 'signup'">
            Contact Us for Account Creation
          </template>
          <template v-else-if="currentAuthMode === 'signup'">Create an account</template>
          <template v-else>Welcome back</template>
        </h2>
        <p class="subtitle">
          <template v-if="currentRole === 'institution' && currentAuthMode === 'signup'">
            Submit your details for personal institutional verification.
          </template>
          <template v-else-if="currentRole === 'institution' && currentAuthMode === 'login'">
            Sign in to manage your school portal
          </template>
          <template v-else-if="currentAuthMode === 'signup'">
            Sign up to explore and save universities
          </template>
          <template v-else>Sign in to continue to your student dashboard</template>
        </p>
      </div>

      <!-- Auth Tabs -->
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab"
          :class="{ active: currentAuthMode === 'login' }"
          @click="handleModeChange('login')"
        >
          Log In
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="{ active: currentAuthMode === 'signup' }"
          @click="handleModeChange('signup')"
        >
          {{ currentRole === 'institution' ? 'Request Account' : 'Sign Up' }}
        </button>
      </div>

      <!-- Google Sign In -->
      <div
        v-if="!(currentRole === 'institution' && currentAuthMode === 'signup')"
        id="googleAuthSection"
      >
        <button type="button" class="google-btn" @click="handleGoogleAuth">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
            />
          </svg>
          <span>{{
            currentAuthMode === 'signup' ? 'Sign up with Google' : 'Continue with Google'
          }}</span>
        </button>

        <div class="auth-divider">
          <span>or continue with email</span>
        </div>
      </div>

      <!-- Student Login -->
      <form
        v-if="currentRole === 'student' && currentAuthMode === 'login'"
        id="studentLoginForm"
        @submit.prevent="onStudentLogin"
      >
        <div class="form-group">
          <label for="studentLoginEmail">Email Address</label>
          <input
            id="studentLoginEmail"
            v-model="loginForm.email"
            type="email"
            placeholder="name@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <label for="studentLoginPassword">Password</label>
            <a href="#" class="forgot-link" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>
          <input
            id="studentLoginPassword"
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="primary-btn auth-submit-btn">Log In</button>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <button type="button" class="auth-switch-link" @click="handleModeChange('signup')">
            Sign up
          </button>
        </div>
      </form>

      <!-- Student Sign Up -->
      <form
        v-if="currentRole === 'student' && currentAuthMode === 'signup'"
        id="studentSignupForm"
        @submit.prevent="onStudentSignup"
      >
        <div class="form-row">
          <div class="form-group">
            <label for="studentFirstName">First Name</label>
            <input
              id="studentFirstName"
              v-model="signupForm.firstName"
              type="text"
              placeholder="Juan"
              required
              autocomplete="given-name"
            />
          </div>
          <div class="form-group">
            <label for="studentLastName">Last Name</label>
            <input
              id="studentLastName"
              v-model="signupForm.lastName"
              type="text"
              placeholder="dela Cruz"
              required
              autocomplete="family-name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="studentSignupEmail">Email Address</label>
          <input
            id="studentSignupEmail"
            v-model="signupForm.email"
            type="email"
            placeholder="name@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="studentSignupPassword">Password</label>
          <input
            id="studentSignupPassword"
            v-model="signupForm.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="studentConfirmPassword">Confirm Password</label>
          <input
            id="studentConfirmPassword"
            v-model="signupForm.confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="primary-btn auth-submit-btn">Create Account</button>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <button type="button" class="auth-switch-link" @click="handleModeChange('login')">
            Log In
          </button>
        </div>
      </form>

      <!-- Institution Login -->
      <form
        v-if="currentRole === 'institution' && currentAuthMode === 'login'"
        id="institutionLoginForm"
        @submit.prevent="onInstitutionLogin"
      >
        <div class="form-group">
          <label for="instLoginEmail">Institutional Email Address</label>
          <input
            id="instLoginEmail"
            v-model="loginForm.email"
            type="email"
            placeholder="admissions@school.edu.ph"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <label for="instLoginPassword">Password</label>
            <a href="#" class="forgot-link" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>
          <input
            id="instLoginPassword"
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="primary-btn auth-submit-btn">Log In</button>

        <div class="auth-footer">
          <span>Need an institution account?</span>
          <button type="button" class="auth-switch-link" @click="handleModeChange('signup')">
            Request access
          </button>
        </div>
      </form>

      <!-- Institution Request Verification -->
      <form
        v-if="currentRole === 'institution' && currentAuthMode === 'signup'"
        id="institutionVerifyForm"
        @submit.prevent="onInstitutionVerification"
      >
        <div class="verify-notice-banner">
          <div class="verify-notice-icon">🛡️</div>
          <div class="verify-notice-text">
            <strong>Personal Verification Required</strong>
            <p>
              We personally verify every institution before creating your account. Send us your
              details and our team will get in touch.
            </p>
          </div>
        </div>

        <div class="form-group">
          <label for="instSchoolName">Institution / School Name</label>
          <input
            id="instSchoolName"
            v-model="institutionForm.schoolName"
            type="text"
            placeholder="e.g., Manila Central University"
            required
          />
        </div>

        <div class="form-group">
          <label for="instRepName">Representative Name & Title</label>
          <input
            id="instRepName"
            v-model="institutionForm.repName"
            type="text"
            placeholder="e.g., Dr. Maria Santos (Admissions Director)"
            required
          />
        </div>

        <div class="form-group">
          <label for="instEmail">Official Institutional Email</label>
          <input
            id="instEmail"
            v-model="institutionForm.email"
            type="email"
            placeholder="e.g., admissions@mcu.edu.ph"
            required
          />
        </div>

        <div class="form-group">
          <label for="instPhone">Contact Number</label>
          <input
            id="instPhone"
            v-model="institutionForm.phone"
            type="tel"
            placeholder="e.g., 0917-123-4567 or (02) 8123-4567"
            required
          />
        </div>

        <div class="form-group">
          <label for="instNotes">Campus / Inquiry Notes <span>(Optional)</span></label>
          <input
            id="instNotes"
            v-model="institutionForm.notes"
            type="text"
            placeholder="e.g., Main Campus, Caloocan City"
          />
        </div>

        <button type="submit" class="primary-btn auth-submit-btn">Send Verification Request</button>

        <div class="auth-footer">
          <span>Already verified?</span>
          <button type="button" class="auth-switch-link" @click="handleModeChange('login')">
            Log In
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
