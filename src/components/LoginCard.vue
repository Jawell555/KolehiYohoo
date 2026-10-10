<script setup>
import { reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useNavigation } from '../composables/useNavigation'

const {
  isRoleChosen,
  currentRole,
  currentAuthMode,
  isSubmitting,
  authError,
  authSuccess,
  clearAuthMessages,
  selectRole,
  showAccountSelect,
  setAuthMode,
  loginStudent,
  signupStudent,
  loginInstitution,
  submitInstitutionVerification,
  handleGoogleAuth,
  handleForgotPassword,
  closeAuthModal,
  isPendingInstitution,
} = useAuth()

const { showSection } = useNavigation()

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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  password: '',
  confirmPassword: '',
})

const showPassword = reactive({
  studentLogin: false,
  studentSignup: false,
  studentSignupConfirm: false,
  instLogin: false,
  instSignup: false,
  instSignupConfirm: false,
})

function resetForms() {
  clearAuthMessages()
  loginForm.email = ''
  loginForm.password = ''
  signupForm.firstName = ''
  signupForm.lastName = ''
  signupForm.email = ''
  signupForm.password = ''
  signupForm.confirmPassword = ''
  institutionForm.schoolName = ''
  institutionForm.firstName = ''
  institutionForm.lastName = ''
  institutionForm.email = ''
  institutionForm.phone = ''
  institutionForm.notes = ''
  institutionForm.password = ''
  institutionForm.confirmPassword = ''
  showPassword.studentLogin = false
  showPassword.studentSignup = false
  showPassword.studentSignupConfirm = false
  showPassword.instLogin = false
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
    closeAuthModal()
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

async function onInstitutionLogin() {
  const success = await loginInstitution(loginForm.email, loginForm.password)
  if (success) {
    resetForms()
    closeAuthModal()
    if (isPendingInstitution.value) {
      showSection('applicationStatusSection')
    }
  }
}

async function onInstitutionVerification() {
  if (institutionForm.password !== institutionForm.confirmPassword) {
    authError.value = 'Password do not match!'
    return
  }

  const success = await submitInstitutionVerification({
    schoolName: institutionForm.schoolName,
    firstName: institutionForm.firstName,
    lastName: institutionForm.lastName,
    repName: `${institutionForm.firstName} ${institutionForm.lastName}`.trim(),
    email: institutionForm.email,
    phone: institutionForm.phone,
    notes: institutionForm.notes,
    password: institutionForm.password,
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
            Submit your details for institutional verification.
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

      <!-- Inline Error Feedback -->
      <div v-if="authError" class="auth-inline-error" role="alert">
        <span class="auth-error-text">{{ authError }}</span>
      </div>

      <!-- Inline Success Feedback -->
      <div v-if="authSuccess" class="auth-inline-success" role="status">
        <span class="auth-success-text">{{ authSuccess }}</span>
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
            <a href="#" class="forgot-link" tabindex="-1" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>
          <div class="password-input-wrapper">
            <input
              id="studentLoginPassword"
              v-model="loginForm.password"
              :type="showPassword.studentLogin ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              tabindex="-1"
              :aria-label="showPassword.studentLogin ? 'Hide password' : 'Show password'"
              @click="showPassword.studentLogin = !showPassword.studentLogin"
            >
              <svg v-if="!showPassword.studentLogin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <button type="submit" class="primary-btn auth-submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-spinner"></span>
          <span>{{ isSubmitting ? 'Signing in...' : 'Log In' }}</span>
        </button>

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
              placeholder="Rene"
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
              placeholder="Baterbonia"
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
          <div class="password-input-wrapper">
            <input
              id="studentSignupPassword"
              v-model="signupForm.password"
              :type="showPassword.studentSignup ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              tabindex="-1"
              :aria-label="showPassword.studentSignup ? 'Hide password' : 'Show password'"
              @click="showPassword.studentSignup = !showPassword.studentSignup"
            >
              <svg v-if="!showPassword.studentSignup" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <div class="form-group">
          <label for="studentConfirmPassword">Confirm Password</label>
          <div class="password-input-wrapper">
            <input
              id="studentConfirmPassword"
              v-model="signupForm.confirmPassword"
              :type="showPassword.studentSignupConfirm ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              tabindex="-1"
              :aria-label="showPassword.studentSignupConfirm ? 'Hide password' : 'Show password'"
              @click="showPassword.studentSignupConfirm = !showPassword.studentSignupConfirm"
            >
              <svg v-if="!showPassword.studentSignupConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <button type="submit" class="primary-btn auth-submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-spinner"></span>
          <span>{{ isSubmitting ? 'Creating account...' : 'Create Account' }}</span>
        </button>

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
            <a href="#" class="forgot-link" tabindex="-1" @click.prevent="onForgotPassword">Forgot Password?</a>
          </div>
          <div class="password-input-wrapper">
            <input
              id="instLoginPassword"
              v-model="loginForm.password"
              :type="showPassword.instLogin ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              tabindex="-1"
              :aria-label="showPassword.instLogin ? 'Hide password' : 'Show password'"
              @click="showPassword.instLogin = !showPassword.instLogin"
            >
              <svg v-if="!showPassword.instLogin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <button type="submit" class="primary-btn auth-submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-spinner"></span>
          <span>{{ isSubmitting ? 'Signing in...' : 'Log In' }}</span>
        </button>

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
          <div class="verify-notice-text">
            <strong>Admin Verification Required</strong>
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
            placeholder="University of the Philippines"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="instFirstName">Representative's First Name</label>
            <input
              id="instFirstName"
              v-model="institutionForm.firstName"
              type="text"
              placeholder="Maria"
              required
              autocomplete="given-name"
            />
          </div>
          <div class="form-group">
            <label for="instLastName">Representative's Last Name</label>
            <input
              id="instLastName"
              v-model="institutionForm.lastName"
              type="text"
              placeholder="Santos"
              required
              autocomplete="family-name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="instEmail">Official Institutional Email</label>
          <input
            id="instEmail"
            v-model="institutionForm.email"
            type="email"
            placeholder="admissions@up.edu.ph"
            required
          />
        </div>

        <div class="form-group">
          <label for="instPhone">Contact Number</label>
          <input
            id="instPhone"
            v-model="institutionForm.phone"
            type="tel"
            placeholder="0912 345 6789"
            required
          />
        </div>

        <!-- Address na muna 'to  -->
        <div class="form-group">
          <label for="instNotes">Address <span></span></label>
          <input
            id="instNotes"
            v-model="institutionForm.notes"
            type="text"
            required
            placeholder="123 Matandang Balara, Diliman, Quezon City"
          />
        </div>

        <div class="form-group">
          <label for="instPassword">Password</label>
          <div class="password-input-wrapper">
            <input
              id="instPassword"
              v-model="institutionForm.password"
              :type="showPassword.instSignup ? 'text' : 'password'"
              placeholder="At least 8 characters"
              required
              minlength="8"
              maxlength="64"
              autocomplete="new-password"/>
          <button
            type="button"
            class="password-toggle-btn"
            tabindex="-1"
            @click="showPassword.instSignup = !showPassword.instSignup"
            >
              <svg v-if="!showPassword.instSignup" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <div class="form-group">
          <label for="instConfirmPassword">Confirm Password</label>
          <div class="password-input-wrapper">
            <input
              id="instConfirmPassword"
              v-model="institutionForm.confirmPassword"
              :type="showPassword.instSignupConfirm ? 'text' : 'password'"
              placeholder="Re-enter your password"
              required
              minlength="8"
              maxlength="64"
              autocomplete="new-password"
            />

          <button
            type="button"
            class="password-toggle-btn"
            tabindex="-1"
            @click="showPassword.instSignupConfirm = !showPassword.instSignupConfirm"
          >
            <svg v-if="!showPassword.instSignupConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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


        <button type="submit" class="primary-btn auth-submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-spinner"></span>
          <span>{{ isSubmitting ? 'Sending request...' : 'Send Verification Request' }}</span>
        </button>

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

<style scoped>
.auth-inline-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  animation: errorFadeIn 0.2s ease-out;
}

.auth-error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.auth-error-text {
  line-height: 1.4;
}

.auth-inline-success {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  animation: errorFadeIn 0.2s ease-out;
}

.auth-success-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.auth-success-text {
  line-height: 1.4;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
  animation: btnSpin 0.7s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

.auth-submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none !important;
}

@keyframes btnSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes errorFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
