// Courses in the Philippines (Bachelor of Science and Bachelor of Arts)
const philippineCourses = [
  { code: "BSIT", name: "Bachelor of Science in Information Technology (BSIT)" },
  { code: "BSCS", name: "Bachelor of Science in Computer Science (BSCS)" },
  { code: "BSIS", name: "Bachelor of Science in Information Systems (BSIS)" },
  { code: "BSCpE", name: "Bachelor of Science in Computer Engineering (BSCpE)" },
  { code: "BSBA", name: "Bachelor of Science in Business Administration (BSBA)" },
  { code: "BSA", name: "Bachelor of Science in Accountancy (BSA)" },
  { code: "BSMA", name: "Bachelor of Science in Management Accounting (BSMA)" },
  { code: "BSHM", name: "Bachelor of Science in Hospitality Management (BSHM)" },
  { code: "BSTM", name: "Bachelor of Science in Tourism Management (BSTM)" },
  { code: "BSCA", name: "Bachelor of Science in Customs Administration (BSCA)" },
  { code: "BSRE", name: "Bachelor of Science in Real Estate Management (BSRE)" },
  { code: "BSCE", name: "Bachelor of Science in Civil Engineering (BSCE)" },
  { code: "BSEE", name: "Bachelor of Science in Electrical Engineering (BSEE)" },
  { code: "BSME", name: "Bachelor of Science in Mechanical Engineering (BSME)" },
  { code: "BSECE", name: "Bachelor of Science in Electronics Engineering (BSECE)" },
  { code: "BSIE", name: "Bachelor of Science in Industrial Engineering (BSIE)" },
  { code: "BSChE", name: "Bachelor of Science in Chemical Engineering (BSChE)" },
  { code: "BSArch", name: "Bachelor of Science in Architecture (BSArch)" },
  { code: "BSN", name: "Bachelor of Science in Nursing (BSN)" },
  { code: "BSPharm", name: "Bachelor of Science in Pharmacy (BSPharm)" },
  { code: "BSMedTech", name: "Bachelor of Science in Medical Technology (BSMedTech)" },
  { code: "BSPT", name: "Bachelor of Science in Physical Therapy (BSPT)" },
  { code: "BSRT", name: "Bachelor of Science in Radiologic Technology (BSRT)" },
  { code: "BSND", name: "Bachelor of Science in Nutrition and Dietetics (BSND)" },
  { code: "BSBio", name: "Bachelor of Science in Biology (BSBio)" },
  { code: "BSPsych", name: "Bachelor of Science in Psychology (BSPsych)" },
  { code: "BSChem", name: "Bachelor of Science in Chemistry (BSChem)" },
  { code: "BSMath", name: "Bachelor of Science in Mathematics (BSMath)" },
  { code: "BSStat", name: "Bachelor of Science in Statistics (BSStat)" },
  { code: "BSES", name: "Bachelor of Science in Environmental Science (BSES)" },
  { code: "BSCrim", name: "Bachelor of Science in Criminology (BSCrim)" },
  { code: "BSAgr", name: "Bachelor of Science in Agriculture (BSAgr)" },
  { code: "BSForestry", name: "Bachelor of Science in Forestry (BSForestry)" },
  { code: "BSFisheries", name: "Bachelor of Science in Fisheries (BSFisheries)" },
  { code: "BSMT", name: "Bachelor of Science in Marine Transportation (BSMT)" },
  { code: "BSMarE", name: "Bachelor of Science in Marine Engineering (BSMarE)" },
  { code: "BSED", name: "Bachelor of Secondary Education (BSED)" },
  { code: "BEED", name: "Bachelor of Elementary Education (BEED)" },
  { code: "BECEd", name: "Bachelor of Early Childhood Education (BECEd)" },
  { code: "BSNEd", name: "Bachelor of Special Needs Education (BSNEd)" },
  { code: "BPED", name: "Bachelor of Physical Education (BPED)" },
  { code: "BTVTEd", name: "Bachelor of Technical-Vocational Teacher Education (BTVTEd)" },
  { code: "BAComm", name: "Bachelor of Arts in Communication (BAComm)" },
  { code: "BAJourn", name: "Bachelor of Arts in Journalism (BAJourn)" },
  { code: "BAPolSci", name: "Bachelor of Arts in Political Science (BAPolSci)" },
  { code: "BAPsych", name: "Bachelor of Arts in Psychology (BAPsych)" },
  { code: "BAEcon", name: "Bachelor of Arts in Economics (BAEcon)" },
  { code: "BASoc", name: "Bachelor of Arts in Sociology (BASoc)" },
  { code: "BAHist", name: "Bachelor of Arts in History (BAHist)" },
  { code: "BAPhilo", name: "Bachelor of Arts in Philosophy (BAPhilo)" },
  { code: "BAEL", name: "Bachelor of Arts in English Language (BAEL)" },
  { code: "BALit", name: "Bachelor of Arts in Literature (BALit)" },
  { code: "BAIS", name: "Bachelor of Arts in International Studies (BAIS)" },
  { code: "BPA", name: "Bachelor of Public Administration (BPA)" },
  { code: "BFA", name: "Bachelor of Fine Arts (BFA)" },
  { code: "BMMA", name: "Bachelor of Multimedia Arts (BMMA)" },
  { code: "BMUS", name: "Bachelor of Music (BMUS)" }
];

// Schools Database
const schoolsData = [
  {
    id: 1,
    name: "University of Example",
    abbreviation: "UE",
    location: "Quezon City",
    address: "123 University Avenue, Quezon City",
    courses: ["BSIT", "BSCS", "BSIS", "BSBA", "BSA", "BSCE", "BAComm", "BAPsych", "BSBio"],
    description: "A higher education institution offering undergraduate programs focused on technology, business, sciences, and arts.",
    contact: "0912-345-6789",
    email: "info@universityexample.edu.ph",
    website: "https://www.up.edu.ph/"
  },
  {
    id: 2,
    name: "Metro City College",
    abbreviation: "MCC",
    location: "Quezon City",
    address: "45 Central Road, Quezon City",
    courses: ["BSIT", "BSECE", "BSBA", "BSHM", "BSTM", "BEED", "BSED", "BSCrim", "BAComm"],
    description: "A college providing accessible and career-oriented degree programs for aspiring professionals.",
    contact: "0922-456-7890",
    email: "admissions@metrocitycollege.edu.ph",
    website: "https://www.pup.edu.ph/"
  },
  {
    id: 3,
    name: "St. Augustine University",
    abbreviation: "SAU",
    location: "Manila",
    address: "88 Rizal Street, Manila",
    courses: ["BSED", "BEED", "BSN", "BSBA", "BSA", "BSPsych", "BAPolSci", "BAComm", "BSPharm", "BSMedTech"],
    description: "An institution committed to academic excellence through health sciences, education, and liberal arts.",
    contact: "0933-567-8901",
    email: "registrar@staugustine.edu.ph",
    website: "https://www.ust.edu.ph/"
  },
  {
    id: 4,
    name: "Technological Institute of the City",
    abbreviation: "TIC",
    location: "Caloocan",
    address: "76 Technology Drive, Caloocan",
    courses: ["BSIT", "BSCS", "BSECE", "BSCE", "BSME", "BSEE", "BSCpE", "BSArch"],
    description: "A technology-oriented institution offering premier computing and engineering degree programs.",
    contact: "0944-678-9012",
    email: "hello@tic.edu.ph",
    website: "https://www.tup.edu.ph/"
  },
  {
    id: 5,
    name: "National Business College",
    abbreviation: "NBC",
    location: "Pasig",
    address: "15 Business District, Pasig",
    courses: ["BSBA", "BSIT", "BSA", "BSMA", "BSCA", "BAEcon", "BSTM", "BSHM"],
    description: "A business-focused college specializing in commerce, practical entrepreneurship, and applied management.",
    contact: "0955-789-0123",
    email: "admissions@nbc.edu.ph",
    website: "https://www.dlsu.edu.ph/"
  }
];

// Vue 3 Application
const { createApp, ref, reactive, computed, onMounted } = Vue;

const app = createApp({
  setup() {
    // In-memory student accounts
    const registeredStudents = ref([
      { firstName: "Juan", lastName: "dela Cruz", email: "student@example.com", password: "password123" },
      { firstName: "Maria", lastName: "Santos", email: "maria@example.com", password: "password123" }
    ]);

    // Navigation & Views
    const activePage = ref("login"); // 'login' or 'student'
    const activeSection = ref("homeSection");
    const currentRole = ref("student"); // 'student' or 'institution'
    const currentAuthMode = ref("login"); // 'login' or 'signup'
    const isRoleChosen = ref(false);
    const currentUser = ref(null);

    // Form Models
    const loginForm = reactive({
      email: "",
      password: ""
    });

    const signupForm = reactive({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

    const institutionForm = reactive({
      schoolName: "",
      repName: "",
      email: "",
      phone: "",
      notes: ""
    });

    // Courses & Dropdown
    const coursesList = ref(philippineCourses);
    const searchCourse = ref("");
    const searchLocation = ref("");
    const hasSearched = ref(false);
    const isCourseDropdownOpen = ref(false);
    const searchMessage = ref("");

    // Schools & Bookmarks
    const schools = ref(schoolsData);
    const savedSchools = ref(JSON.parse(localStorage.getItem("kolehiyohooSavedSchools") || "[]"));
    const selectedSchool = ref(null);

    // Routes
    const routeStartLocation = ref("");
    const hasRouteGenerated = ref(false);

    // Toast Popup
    const toast = reactive({
      show: false,
      title: "",
      message: "",
      icon: "🔔"
    });
    let toastTimer = null;

    function showToast(message, title = "", icon = "🔔", duration = 4000) {
      toast.message = message;
      toast.title = title;
      toast.icon = icon;
      toast.show = true;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.show = false;
      }, duration);
    }

    // Role and Auth Modes
    function selectRole(role) {
      currentRole.value = role;
      isRoleChosen.value = true;
      currentAuthMode.value = "login";
      resetForms();
    }

    function showAccountSelect() {
      isRoleChosen.value = false;
      currentRole.value = "student";
      currentAuthMode.value = "login";
      resetForms();
    }

    function setAuthMode(mode) {
      currentAuthMode.value = mode;
      resetForms();
    }

    function toggleAuthMode() {
      setAuthMode(currentAuthMode.value === "login" ? "signup" : "login");
    }

    function resetForms() {
      loginForm.email = "";
      loginForm.password = "";
      signupForm.firstName = "";
      signupForm.lastName = "";
      signupForm.email = "";
      signupForm.password = "";
      signupForm.confirmPassword = "";
      institutionForm.schoolName = "";
      institutionForm.repName = "";
      institutionForm.email = "";
      institutionForm.phone = "";
      institutionForm.notes = "";
    }

    // Student Authentication (In-Memory)
    function handleStudentLogin() {
      const email = loginForm.email.trim().toLowerCase();
      const password = loginForm.password;

      if (!email || !password) {
        showToast("Please enter your email and password.", "Missing Fields", "⚠️");
        return;
      }

      const account = registeredStudents.value.find(
        s => s.email.toLowerCase() === email && s.password === password
      );

      if (!account) {
        showToast("Invalid email or password. You can create an account or use: student@example.com / password123", "Login Failed", "⚠️", 5000);
        return;
      }

      currentUser.value = {
        role: "student",
        name: `${account.firstName} ${account.lastName}`,
        email: account.email
      };
      activePage.value = "student";
      activeSection.value = "homeSection";
      showToast(`Welcome back, ${account.firstName}!`, "Logged In", "🎓");
      resetForms();
    }

    function handleStudentSignup() {
      const firstName = signupForm.firstName.trim();
      const lastName = signupForm.lastName.trim();
      const email = signupForm.email.trim().toLowerCase();
      const password = signupForm.password;
      const confirmPassword = signupForm.confirmPassword;

      if (!firstName || !lastName || !email || !password) {
        showToast("Please complete all required fields.", "Incomplete Form", "⚠️");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match. Please verify your password.", "Password Mismatch", "⚠️");
        return;
      }

      const existingAccount = registeredStudents.value.some(
        s => s.email.toLowerCase() === email
      );

      if (existingAccount) {
        showToast("An account with this email already exists in memory. Please log in.", "Account Exists", "⚠️", 5000);
        return;
      }

      // Add to in-memory store
      registeredStudents.value.push({
        firstName,
        lastName,
        email,
        password
      });

      currentUser.value = {
        role: "student",
        name: `${firstName} ${lastName}`,
        email
      };
      activePage.value = "student";
      activeSection.value = "homeSection";
      showToast(`Account created in memory! Welcome, ${firstName}!`, "Account Created", "🎉", 4500);
      resetForms();
    }

    // Google Sign In
    function handleGoogleAuth() {
      const rickrollUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1";
      window.open(rickrollUrl, "_blank") || (window.location.href = rickrollUrl);
    }

    // Institution Login
    function handleInstitutionLogin() {
      const email = loginForm.email.trim();
      if (!email || !loginForm.password) {
        showToast("Please enter your institutional email and password.", "Missing Fields", "⚠️");
        return;
      }

      currentUser.value = {
        role: "institution",
        name: email.split("@")[0] || "Institution Partner",
        email
      };
      activePage.value = "student";
      activeSection.value = "homeSection";
      showToast("Signed in to School / Institution preview.", "Welcome Partner", "🏛️");
      resetForms();
    }

    // Institution Verification Request Form
    function handleInstitutionVerificationSubmit() {
      const school = institutionForm.schoolName.trim();
      const rep = institutionForm.repName.trim();
      const email = institutionForm.email.trim();
      const phone = institutionForm.phone.trim();

      if (!school || !rep || !email || !phone) {
        showToast("Please fill in all required institutional details.", "Incomplete Request", "⚠️");
        return;
      }

      showToast(
        `Thank you, ${rep}. We received ${school}'s verification request and will contact you via ${email} soon.`,
        "Verification Request Sent!",
        "📨",
        6500
      );

      resetForms();
      setTimeout(() => {
        currentAuthMode.value = "login";
      }, 1200);
    }

    // Forgot password demo helper
    function handleForgotPassword() {
      const email = loginForm.email.trim();
      if (email) {
        showToast(`Demo password reset link dispatched to ${email}`, "Password Reset", "🔑");
      } else {
        showToast("Please enter your email above to reset password.", "Email Required", "ℹ️");
      }
    }

    // Logout
    function logout() {
      currentUser.value = null;
      activePage.value = "login";
      activeSection.value = "homeSection";
      isRoleChosen.value = false;
      currentRole.value = "student";
      currentAuthMode.value = "login";
      showToast("You have been signed out.", "Logged Out", "👋");
    }

    // Navigation
    function showSection(sectionId) {
      activeSection.value = sectionId;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // 3-Row Scrollable Course Dropdown Search
    const filteredCourses = computed(() => {
      const q = searchCourse.value.trim().toLowerCase();
      if (!q) return coursesList.value;
      return coursesList.value.filter(
        c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      );
    });

    function selectCourse(course) {
      searchCourse.value = course.name;
      isCourseDropdownOpen.value = false;
    }

    function clearCourseSearch() {
      searchCourse.value = "";
      isCourseDropdownOpen.value = false;
    }

    function toggleCourseDropdown() {
      isCourseDropdownOpen.value = !isCourseDropdownOpen.value;
    }

    function onCourseInput() {
      isCourseDropdownOpen.value = true;
    }

    // School Matching & Filtering
    const matchedSchools = computed(() => {
      const course = searchCourse.value.trim().toLowerCase();
      const loc = searchLocation.value.trim().toLowerCase();

      return schools.value.filter(s => {
        // Match course acronym or full name
        const courseMatch = !course || s.courses.some(c => {
          const cLower = c.toLowerCase();
          return course.includes(cLower) || cLower.includes(course);
        });

        // Match location or address
        const locMatch = !loc || 
          s.location.toLowerCase().includes(loc) || 
          s.address.toLowerCase().includes(loc);

        return courseMatch && locMatch;
      });
    });

    function searchSchools() {
      const course = searchCourse.value.trim();
      const loc = searchLocation.value.trim();

      if (!course && !loc) {
        showToast("Please select/type a course, enter a location, or both.", "Search Filter", "ℹ️");
        return;
      }

      hasSearched.value = true;
      isCourseDropdownOpen.value = false;

      const labels = [];
      if (course) labels.push(`course: ${course}`);
      if (loc) labels.push(`location: ${loc}`);
      searchMessage.value = `${matchedSchools.value.length} school(s) found for ${labels.join(" and ")}.`;
    }

    // Saved Schools (Bookmarks)
    function isSchoolSaved(id) {
      return savedSchools.value.includes(id);
    }

    function toggleSave(id) {
      if (isSchoolSaved(id)) {
        savedSchools.value = savedSchools.value.filter(x => x !== id);
        showToast("School removed from your saved list.", "Removed", "🔖");
      } else {
        savedSchools.value.push(id);
        showToast("School saved to your profile.", "Saved", "⭐");
      }
      localStorage.setItem("kolehiyohooSavedSchools", JSON.stringify(savedSchools.value));
    }

    const savedSchoolsList = computed(() => {
      return schools.value.filter(s => savedSchools.value.includes(s.id));
    });

    // School Overview & Routes
    function viewSchool(school) {
      selectedSchool.value = school;
      activeSection.value = "schoolDetailsSection";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function openRoutes() {
      if (!selectedSchool.value) return;
      hasRouteGenerated.value = false;
      routeStartLocation.value = "";
      activeSection.value = "routesSection";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function generateRoute() {
      const loc = routeStartLocation.value.trim();
      if (!loc) {
        showToast("Please enter your starting location.", "Starting Location Required", "📍");
        return;
      }
      hasRouteGenerated.value = true;
    }

    // Close dropdown on outside click
    onMounted(() => {
      document.addEventListener("click", (e) => {
        const wrapper = document.querySelector(".course-dropdown-wrapper");
        if (wrapper && !wrapper.contains(e.target)) {
          isCourseDropdownOpen.value = false;
        }
      });
    });

    return {
      registeredStudents,
      activePage,
      activeSection,
      currentRole,
      currentAuthMode,
      isRoleChosen,
      currentUser,
      loginForm,
      signupForm,
      institutionForm,
      coursesList,
      searchCourse,
      searchLocation,
      hasSearched,
      isCourseDropdownOpen,
      searchMessage,
      filteredCourses,
      selectCourse,
      clearCourseSearch,
      toggleCourseDropdown,
      onCourseInput,
      schools,
      matchedSchools,
      searchSchools,
      savedSchools,
      savedSchoolsList,
      isSchoolSaved,
      toggleSave,
      selectedSchool,
      viewSchool,
      openRoutes,
      routeStartLocation,
      hasRouteGenerated,
      generateRoute,
      selectRole,
      showAccountSelect,
      setAuthMode,
      toggleAuthMode,
      handleStudentLogin,
      handleStudentSignup,
      handleInstitutionLogin,
      handleInstitutionVerificationSubmit,
      handleGoogleAuth,
      handleForgotPassword,
      logout,
      showSection,
      toast
    };
  }
});

app.mount("#app");
