import { ref } from 'vue'

function checkIsLoggedIn() {
  if (typeof localStorage === 'undefined') return false
  return Boolean(localStorage.getItem('token') || localStorage.getItem('user'))
}

function getInitialPage() {
  const isLoggedIn = checkIsLoggedIn()
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '')
    if (isLoggedIn) {
      // If already logged in, redirect away from login to student dashboard
      return hash === 'login' || !hash ? 'student' : hash
    }
    return 'login'
  }
  return isLoggedIn ? 'student' : 'login'
}

const activePage = ref(getInitialPage())
const activeSection = ref('homeSection')

// Sync URL hash with initial activePage and listen for browser back/forward buttons
if (typeof window !== 'undefined') {
  if (checkIsLoggedIn()) {
    // Replace current state with dashboard root and push a guard state so Back stays inside the app
    window.history.replaceState({ page: 'student', section: activeSection.value }, '', '#student')
    window.history.pushState({ page: 'student', section: activeSection.value }, '', '#student')
  } else {
    window.history.replaceState({ page: 'login' }, '', '#login')
  }

  // Intercept the browser's Back and Forward buttons
  window.addEventListener('popstate', (event) => {
    const isLoggedIn = checkIsLoggedIn()

    if (isLoggedIn) {
      // If the popped state contains a dashboard section, navigate to it
      if (event.state && event.state.section) {
        activePage.value = 'student'
        activeSection.value = event.state.section
      } else {
        // Attempting to back out of dashboard to browser index or login:
        // Keep the user in the dashboard and re-push the guard state
        activePage.value = 'student'
        window.history.pushState({ page: 'student', section: activeSection.value }, '', '#student')
      }
    } else {
      // If not logged in, keep activePage as login
      activePage.value = 'login'
      window.history.replaceState({ page: 'login' }, '', '#login')
    }
  })
}

export function useNavigation() {
  function showSection(sectionId, { pushHistory = true } = {}) {
    if (activeSection.value === sectionId) return
    activeSection.value = sectionId
    if (typeof window !== 'undefined') {
      if (pushHistory) {
        window.history.pushState({ page: 'student', section: sectionId }, '', '#student')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function setPage(page, { replace = false } = {}) {
    activePage.value = page
    if (typeof window !== 'undefined') {
      if (page === 'student') {
        // Replace login in history, then push guard state so Back button stays inside dashboard
        window.history.replaceState(
          { page: 'student', section: activeSection.value },
          '',
          '#student',
        )
        window.history.pushState({ page: 'student', section: activeSection.value }, '', '#student')
      } else if (replace) {
        window.history.replaceState({ page }, '', '#' + page)
      } else {
        window.location.hash = page
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return {
    activePage,
    activeSection,
    showSection,
    setPage,
  }
}
