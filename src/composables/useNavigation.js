import { ref } from 'vue'
import { useAuth } from './useAuth'

const sectionHashMap = {
  homeSection: '#home',
  schoolsSection: '#schools',
  savedSection: '#saved',
  schoolDetailsSection: '#details',
  settingsSection: '#settings',
  adminSection: '#admin',
  applicationStatusSection: '#application-status',
}

const hashSectionMap = {
  home: 'homeSection',
  schools: 'schoolsSection',
  saved: 'savedSection',
  details: 'schoolDetailsSection',
  routes: 'schoolDetailsSection',
  settings: 'settingsSection',
  admin: 'adminSection',
  'application-status': 'applicationStatusSection',
  status: 'applicationStatusSection',
}

function getInitialSection() {
  const { isPendingInstitution } =useAuth()
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace('#', '')
    if (isPendingInstitution.value) {
      if (rawHash === 'settings') return 'settingsSection'
      return 'applicationStatusSection'
    }
    if (rawHash === 'login' || rawHash === 'signup' || rawHash === 'register') {
      return 'homeSection'
    }
    if (hashSectionMap[rawHash]) {
      return hashSectionMap[rawHash]
    }
  }
  const { isPendingInstitution: isPending } =useAuth()
  if (isPending.value) return 'applicationStatusSection'
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
    const { isPendingInstitution } =useAuth()
    let target = 'homeSection'
    if (event.state && event.state.section) {
      target = event.state.section
    } else {
      const hash = window.location.hash.replace('#', '')
      target = hashSectionMap[hash] || 'homeSection'
    }
    if (isPendingInstitution.value && target !== 'settingsSection') {
      target = 'applicationStatusSection'
    }
    activeSection.value = target
  })
}

export function useNavigation() {
  function showSection(sectionId, { pushHistory = true } = {}) {
    const { isPendingInstitution } = useAuth()
    if (isPendingInstitution.value && sectionId !== 'settingsSection') {
      sectionId = 'applicationStatusSection'
    }
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
