import { ref } from 'vue'
import { useAuth } from './useAuth'

const sectionHashMap = {
  homeSection: '#home',
  schoolsSection: '#schools',
  savedSection: '#saved',
  schoolDetailsSection: '#details',
  routesSection: '#routes',
  settingsSection: '#settings',
}

const hashSectionMap = {
  home: 'homeSection',
  schools: 'schoolsSection',
  saved: 'savedSection',
  details: 'schoolDetailsSection',
  routes: 'routesSection',
  settings: 'settingsSection',
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
      window.scrollTo(0, 0)
    }
  }

  return {
    activeSection,
    showSection,
  }
}
