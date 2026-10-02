import { ref } from 'vue'
import { useAuth } from './useAuth'

const sectionHashMap = {
  homeSection: '#home',
  schoolsSection: '#schools',
  savedSection: '#saved',
  schoolDetailsSection: '#details',
  routesSection: '#routes',
}

const hashSectionMap = {
  home: 'homeSection',
  schools: 'schoolsSection',
  saved: 'savedSection',
  details: 'schoolDetailsSection',
  routes: 'routesSection',
}

function getInitialSection() {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace('#', '')
    if (rawHash === 'login' || rawHash === 'signup' || rawHash === 'register') {
      return 'homeSection'
    }
    if (hashSectionMap[rawHash]) {
      return hashSectionMap[rawHash]
    }
  }
  return 'homeSection'
}

const activePage = ref('student')
const activeSection = ref(getInitialSection())

// Initialize URL and popstate listeners
if (typeof window !== 'undefined') {
  const rawHash = window.location.hash.replace('#', '')
  if (rawHash === 'login') {
    const { openAuthModal } = useAuth()
    openAuthModal('login')
  } else if (rawHash === 'signup' || rawHash === 'register') {
    const { openAuthModal } = useAuth()
    openAuthModal('signup')
  }

  const initialHash = sectionHashMap[activeSection.value] || '#home'
  window.history.replaceState({ section: activeSection.value }, '', initialHash)

  // Listen for browser back / forward
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.section) {
      activeSection.value = event.state.section
    } else {
      const hash = window.location.hash.replace('#', '')
      activeSection.value = hashSectionMap[hash] || 'homeSection'
    }
  })
}

export function useNavigation() {
  const { openAuthModal } = useAuth()

  function showSection(sectionId, { pushHistory = true } = {}) {
    if (activeSection.value === sectionId) return
    activeSection.value = sectionId
    if (typeof window !== 'undefined') {
      const hash = sectionHashMap[sectionId] || '#home'
      if (pushHistory) {
        window.history.pushState({ section: sectionId }, '', hash)
      } else {
        window.history.replaceState({ section: sectionId }, '', hash)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function setPage(page, { replace = false } = {}) {
    if (page === 'login') {
      openAuthModal('login')
      return
    }
    activePage.value = page
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({ section: activeSection.value }, '', '#' + page)
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
