import { ref, computed } from 'vue'
import { philippineCourses } from '../data/courses'
import { schoolsData } from '../data/schools'
import { useToast } from './useToast'

const schools = ref(schoolsData)
const coursesList = ref(philippineCourses)

function getStoredSavedSchools() {
  try {
    return JSON.parse(localStorage.getItem('kolehiyohooSavedSchools') || '[]')
  } catch {
    return []
  }
}

const savedSchoolIds = ref(getStoredSavedSchools())
const searchCourse = ref('')
const searchLocation = ref('')
const hasSearched = ref(false)
const searchMessage = ref('')
const isCourseDropdownOpen = ref(false)
const selectedSchool = ref(null)
const routeStartLocation = ref('')
const hasRouteGenerated = ref(false)

export function useSchools() {
  const { showToast } = useToast()

  const savedSchoolsList = computed(() => {
    return schools.value.filter((s) => savedSchoolIds.value.includes(s.id))
  })

  const filteredCourses = computed(() => {
    const q = searchCourse.value.trim().toLowerCase()
    if (!q) return coursesList.value
    return coursesList.value.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    )
  })

  const matchedSchools = computed(() => {
    const course = searchCourse.value.trim().toLowerCase()
    const loc = searchLocation.value.trim().toLowerCase()

    return schools.value.filter((s) => {
      const courseMatch =
        !course ||
        s.courses.some((c) => {
          const cLower = c.toLowerCase()
          return course.includes(cLower) || cLower.includes(course)
        })

      const locMatch =
        !loc || s.location.toLowerCase().includes(loc) || s.address.toLowerCase().includes(loc)

      return courseMatch && locMatch
    })
  })

  function selectCourse(course) {
    searchCourse.value = course.name
    isCourseDropdownOpen.value = false
  }

  function clearCourseSearch() {
    searchCourse.value = ''
    isCourseDropdownOpen.value = false
  }

  function toggleCourseDropdown() {
    isCourseDropdownOpen.value = !isCourseDropdownOpen.value
  }

  function onCourseInput() {
    isCourseDropdownOpen.value = true
  }

  function closeCourseDropdown() {
    isCourseDropdownOpen.value = false
  }

  function searchSchools() {
    const course = searchCourse.value.trim()
    const loc = searchLocation.value.trim()

    if (!course && !loc) {
      showToast('Please select/type a course, enter a location, or both.', 'Search Filter', 'ℹ️')
      return
    }

    hasSearched.value = true
    isCourseDropdownOpen.value = false

    const labels = []
    if (course) labels.push(`course: ${course}`)
    if (loc) labels.push(`location: ${loc}`)
    searchMessage.value = `${matchedSchools.value.length} school(s) found for ${labels.join(' and ')}.`
  }

  function isSchoolSaved(id) {
    return savedSchoolIds.value.includes(id)
  }

  function toggleSave(id) {
    if (isSchoolSaved(id)) {
      savedSchoolIds.value = savedSchoolIds.value.filter((x) => x !== id)
      showToast('School removed from your saved list.', 'Removed', '🔖')
    } else {
      savedSchoolIds.value.push(id)
      showToast('School saved to your profile.', 'Saved', '⭐')
    }
    localStorage.setItem('kolehiyohooSavedSchools', JSON.stringify(savedSchoolIds.value))
  }

  function viewSchool(school, onNavigate) {
    selectedSchool.value = school
    if (onNavigate) {
      onNavigate('schoolDetailsSection')
    }
  }

  function openRoutes(onNavigate) {
    if (!selectedSchool.value) return
    hasRouteGenerated.value = false
    routeStartLocation.value = ''
    if (onNavigate) {
      onNavigate('routesSection')
    }
  }

  function generateRoute() {
    const loc = routeStartLocation.value.trim()
    if (!loc) {
      showToast('Please enter your starting location.', 'Starting Location Required', '📍')
      return
    }
    hasRouteGenerated.value = true
  }

  return {
    schools,
    coursesList,
    savedSchoolIds,
    savedSchoolsList,
    searchCourse,
    searchLocation,
    hasSearched,
    searchMessage,
    isCourseDropdownOpen,
    filteredCourses,
    matchedSchools,
    selectedSchool,
    routeStartLocation,
    hasRouteGenerated,
    selectCourse,
    clearCourseSearch,
    toggleCourseDropdown,
    onCourseInput,
    closeCourseDropdown,
    searchSchools,
    isSchoolSaved,
    toggleSave,
    viewSchool,
    openRoutes,
    generateRoute,
  }
}
