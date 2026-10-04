import { ref, computed, watch } from 'vue'
import { useToast } from './useToast'
import { useAuth } from './useAuth'

const API_BASE = '/api'
const SELECTED_SCHOOL_KEY = 'kolehiyohooSelectedSchoolId'

// ---- Shared state (module-level so every component sees the same data) ----
const coursesList = ref([])
const isLoadingCourses = ref(false)
let coursesLoaded = false

const matchedSchools = ref([])
const savedSchoolsList = ref([])
const savedSchoolIds = ref([])

const searchCourse = ref('')
const selectedCourse = ref(null) // course picked from the dropdown ({ id, name, code })
const searchLocation = ref('')
const searchType = ref('') // '' = both, 'public', 'private'
const hasSearched = ref(false)
const searchMessage = ref('')
const isCourseDropdownOpen = ref(false)
const selectedSchool = ref(null)
const routeStartLocation = ref('')
const hasRouteGenerated = ref(false)
const isSearchingSchools = ref(false)
const isLoadingDetails = ref(false)
const isGeneratingRoutes = ref(false)
const isLoadingSaved = ref(false)

// Find Schools pagination
const SCHOOLS_PER_PAGE = 6
const currentPage = ref(1)
const appliedCourseTag = ref('School')

let searchRequestId = 0
let initialized = false

function authHeaders() {
  const headers = { Accept: 'application/json' }
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

// Expand "BS ..." / "AB ..." shorthand the same way the backend does.
function courseSearchTerms(query) {
  const q = query.trim().replace(/\s+/g, ' ').toLowerCase()
  if (!q) return []
  const terms = [q]
  const prefixes = [
    ['bs in ', 'bachelor of science in '],
    ['b.s. in ', 'bachelor of science in '],
    ['b.s. ', 'bachelor of science in '],
    ['bs ', 'bachelor of science in '],
    ['ab in ', 'bachelor of arts in '],
    ['ba in ', 'bachelor of arts in '],
    ['ab ', 'bachelor of arts in '],
    ['ba ', 'bachelor of arts in '],
  ]
  for (const [short, long] of prefixes) {
    if (q.startsWith(short)) {
      const rest = q.slice(short.length)
      terms.push(long + rest, rest)
      break
    }
  }
  return terms.filter(Boolean)
}

async function loadCourses(force = false) {
  if ((coursesLoaded && !force) || isLoadingCourses.value) return
  isLoadingCourses.value = true
  try {
    const { data } = await apiGet('/courses')
    coursesList.value = data || []
    coursesLoaded = true
  } catch (error) {
    console.error('Failed to load courses:', error)
  } finally {
    isLoadingCourses.value = false
  }
}

async function loadSavedSchools() {
  const { currentUser } = useAuth()
  const user = currentUser.value
  const isStudent = user && (user.role === 'student' || user.role_id === 1)

  if (!isStudent || !localStorage.getItem('token')) {
    savedSchoolsList.value = []
    savedSchoolIds.value = []
    return
  }

  isLoadingSaved.value = true
  try {
    const { data } = await apiGet('/saved-universities')
    savedSchoolsList.value = data || []
    savedSchoolIds.value = savedSchoolsList.value.map((s) => s.id)
  } catch (error) {
    console.error('Failed to load saved schools:', error)
  } finally {
    isLoadingSaved.value = false
  }
}

async function fetchSchool(id) {
  const { data } = await apiGet(`/universities/${id}`)
  return data
}

function initOnce() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  // Remove the old browser-only saved list; saved schools now live in the database.
  localStorage.removeItem('kolehiyohooSavedSchools')

  loadCourses()

  // Reload saved schools whenever the logged-in user changes (login / logout / switch).
  const { currentUser } = useAuth()
  watch(
    () => currentUser.value?.id ?? null,
    () => loadSavedSchools(),
    { immediate: true },
  )

  // Restore the selected school after a page refresh on #details / #routes.
  const storedId = sessionStorage.getItem(SELECTED_SCHOOL_KEY)
  if (storedId && !selectedSchool.value) {
    isLoadingDetails.value = true
    fetchSchool(storedId)
      .then((school) => {
        if (!selectedSchool.value) selectedSchool.value = school
      })
      .catch(() => sessionStorage.removeItem(SELECTED_SCHOOL_KEY))
      .finally(() => {
        isLoadingDetails.value = false
      })
  }
}

export function useSchools() {
  const { showToast } = useToast()
  const { currentUser, openAuthModal } = useAuth()

  initOnce()

  const filteredCourses = computed(() => {
    const terms = courseSearchTerms(searchCourse.value)
    if (!terms.length) return coursesList.value
    // Keep the full list visible while the selected course name is in the input
    if (selectedCourse.value && searchCourse.value === selectedCourse.value.name) {
      return coursesList.value
    }
    return coursesList.value.filter((c) => {
      const name = c.name.toLowerCase()
      const code = (c.code || '').toLowerCase()
      return terms.some((t) => name.includes(t) || (code && code.includes(t)))
    })
  })

  // Label shown on each result card for the last applied course filter
  const courseTag = computed(() => appliedCourseTag.value)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(matchedSchools.value.length / SCHOOLS_PER_PAGE)),
  )

  const pagedSchools = computed(() => {
    const start = (currentPage.value - 1) * SCHOOLS_PER_PAGE
    return matchedSchools.value.slice(start, start + SCHOOLS_PER_PAGE)
  })

  function goToPage(page) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  function selectCourse(course) {
    selectedCourse.value = course
    searchCourse.value = course.name
    isCourseDropdownOpen.value = false
  }

  function clearCourseSearch() {
    searchCourse.value = ''
    selectedCourse.value = null
    isCourseDropdownOpen.value = false
  }

  function toggleCourseDropdown() {
    isCourseDropdownOpen.value = !isCourseDropdownOpen.value
    if (isCourseDropdownOpen.value) loadCourses()
  }

  function onCourseInput() {
    // Typing after picking a course turns it back into a free-text search
    if (selectedCourse.value && searchCourse.value !== selectedCourse.value.name) {
      selectedCourse.value = null
    }
    isCourseDropdownOpen.value = true
  }

  function closeCourseDropdown() {
    isCourseDropdownOpen.value = false
  }

  // Clears the Find Schools form and shows every school again
  function resetSearch() {
    searchCourse.value = ''
    selectedCourse.value = null
    searchLocation.value = ''
    searchType.value = ''
    isCourseDropdownOpen.value = false
    return runSearch()
  }

  function searchSchools() {
    return runSearch()
  }

  // Fetches schools for the current filters. No filters = all schools (A-Z).
  async function runSearch() {
    const course = searchCourse.value.trim()
    const loc = searchLocation.value.trim()
    const type = searchType.value
    const usesSelectedCourse = !!selectedCourse.value && searchCourse.value === selectedCourse.value.name

    const params = new URLSearchParams()
    if (usesSelectedCourse) {
      params.set('course_id', selectedCourse.value.id)
    } else if (course) {
      params.set('course', course)
    }
    if (loc) params.set('location', loc)
    if (type) params.set('type', type)

    const isFiltered = !!(course || loc || type)
    const requestId = ++searchRequestId
    isSearchingSchools.value = true
    hasSearched.value = isFiltered
    isCourseDropdownOpen.value = false

    try {
      const query = params.toString()
      const { data } = await apiGet(`/universities${query ? `?${query}` : ''}`)
      if (requestId !== searchRequestId) return // a newer search superseded this one

      matchedSchools.value = [...(data || [])].sort((a, b) => a.name.localeCompare(b.name))
      currentPage.value = 1
      appliedCourseTag.value = usesSelectedCourse
        ? selectedCourse.value.code || selectedCourse.value.name
        : course || 'School'

      const count = matchedSchools.value.length
      if (!isFiltered) {
        searchMessage.value = `Showing all schools available in our system.`
      } else {
        const labels = []
        if (course) labels.push(`Course: ${course}`)
        if (type) labels.push(`School type: ${type === 'public' ? 'Public' : 'Private'}`)
        if (loc) labels.push(`location: ${loc}`)
        searchMessage.value = `${count} school${count === 1 ? '' : 's'} found for ${labels.join(', ')}.`
      }
    } catch (error) {
      if (requestId !== searchRequestId) return
      console.error('School search failed:', error)
      matchedSchools.value = []
      currentPage.value = 1
      searchMessage.value = 'Could not load schools right now. Please try again.'
      showToast('Could not reach the server. Please try again.', 'Search Failed')
    } finally {
      if (requestId === searchRequestId) isSearchingSchools.value = false
    }
  }

  function isSchoolSaved(id) {
    return savedSchoolIds.value.includes(id)
  }

  async function toggleSave(id) {
    const user = currentUser.value
    if (!user) {
      openAuthModal('login', 'student')
      return
    }
    if (!(user.role === 'student' || user.role_id === 1)) {
      showToast('Only student accounts can save schools.', 'Not Available')
      return
    }

    const wasSaved = isSchoolSaved(id)
    const prevIds = [...savedSchoolIds.value]
    const prevList = [...savedSchoolsList.value]

    // Optimistic update
    if (wasSaved) {
      savedSchoolIds.value = savedSchoolIds.value.filter((x) => x !== id)
      savedSchoolsList.value = savedSchoolsList.value.filter((s) => s.id !== id)
    } else {
      savedSchoolIds.value = [...savedSchoolIds.value, id]
      const school =
        matchedSchools.value.find((s) => s.id === id) ||
        (selectedSchool.value?.id === id ? selectedSchool.value : null)
      if (school) {
        savedSchoolsList.value = [...savedSchoolsList.value, school].sort((a, b) =>
          a.name.localeCompare(b.name),
        )
      }
    }

    try {
      const res = await fetch(`${API_BASE}/saved-universities/${id}`, {
        method: wasSaved ? 'DELETE' : 'POST',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Request failed')
      }
      if (wasSaved) {
        showToast('School removed from your saved list.', 'Removed')
      } else {
        showToast('School saved to your profile.', 'Saved')
        // If the school data wasn't available locally, refresh from the database
        if (!savedSchoolsList.value.some((s) => s.id === id)) loadSavedSchools()
      }
    } catch (error) {
      savedSchoolIds.value = prevIds
      savedSchoolsList.value = prevList
      showToast(error.message || 'Could not update saved schools.', 'Save Failed')
    }
  }

  async function viewSchool(school, onNavigate) {
    selectedSchool.value = school
    sessionStorage.setItem(SELECTED_SCHOOL_KEY, String(school.id))
    isLoadingDetails.value = true
    if (onNavigate) {
      onNavigate('schoolDetailsSection')
    }
    try {
      const fresh = await fetchSchool(school.id)
      if (selectedSchool.value?.id === school.id) selectedSchool.value = fresh
    } catch (error) {
      console.error('Failed to load school details:', error)
    } finally {
      isLoadingDetails.value = false
    }
  }

  function openRoutes(onNavigate) {
    if (!selectedSchool.value) return
    hasRouteGenerated.value = false
    routeStartLocation.value = ''
    isGeneratingRoutes.value = false
    if (onNavigate) {
      onNavigate('routesSection')
    }
  }

  function generateRoute() {
    const loc = routeStartLocation.value.trim()
    if (!loc) {
      showToast('Please enter your starting location.', 'Starting Location Required')
      return
    }
    isGeneratingRoutes.value = true
    hasRouteGenerated.value = true
    setTimeout(() => {
      isGeneratingRoutes.value = false
    }, 500)
  }

  return {
    coursesList,
    isLoadingCourses,
    savedSchoolIds,
    savedSchoolsList,
    searchCourse,
    selectedCourse,
    searchLocation,
    searchType,
    hasSearched,
    searchMessage,
    isCourseDropdownOpen,
    filteredCourses,
    courseTag,
    matchedSchools,
    pagedSchools,
    currentPage,
    totalPages,
    goToPage,
    selectedSchool,
    routeStartLocation,
    hasRouteGenerated,
    isSearchingSchools,
    isLoadingDetails,
    isGeneratingRoutes,
    isLoadingSaved,
    selectCourse,
    clearCourseSearch,
    toggleCourseDropdown,
    onCourseInput,
    closeCourseDropdown,
    resetSearch,
    searchSchools,
    isSchoolSaved,
    toggleSave,
    viewSchool,
    openRoutes,
    generateRoute,
    loadSavedSchools,
  }
}
