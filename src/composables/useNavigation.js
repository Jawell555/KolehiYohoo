import { ref } from 'vue'

const activePage = ref('login') // 'login' or 'student'
const activeSection = ref('homeSection')

export function useNavigation() {
  function showSection(sectionId) {
    activeSection.value = sectionId
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function setPage(page) {
    activePage.value = page
    window.location.hash = page
    if (typeof window !== 'undefined') {
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
