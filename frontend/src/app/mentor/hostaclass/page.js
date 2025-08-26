"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import MentorSideBase from "@/components/MentorSideBase";
import { navItems } from "@/app/utils";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Re-creating the Tailwind config for use in the component
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: "#00A2E8",
        "primary-dark": "#00468C",
        "primary-light": "#E6F7FF",
        background: "#F9FBFF",
      },
    },
  },
};

const classTypes = [
  {
    id: "group",
    icon: "fas fa-users",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Group Classes",
    description:
      "Multi-session courses with small groups of students learning together.",
    feature: "Great for building community • Recurring revenue",
  },
  {
    id: "workshop",
    icon: "fas fa-graduation-cap",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Special Workshops",
    description:
      "One-off intensive sessions (1-8 hours) for specific skills or topics.",
    feature: "High visibility • Premium pricing • Flexible duration",
  },
];

const HostClassPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubjectData, setSelectedSubjectData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consolidated form data state matching API requirements
  const [formData, setFormData] = useState({
    type: "group",
    title: "",
    subject: "",
    subjectId: "",  // Store subject ID for enhanced integration
    category: "",
    customCategory: "",
    description: "",
    mentorId: "", // Will be set from Firebase user
    level: "",
    ageGroup: "",
    format: "online",
    pricing: {
      perSessionRate: 0,
      totalSessions: 0,
      currency: "GBP",
      isFree: false,
      packageDiscount: "none",
    },
    schedule: {
      startDate: "",
      endDate: "",
      startTime: "",
      sessionDuration: 60,
      selectedDays: [],
      weeklySchedule: [],
    },
    capacity: {
      maxStudents: 6,
      minStudents: 2,
    },
    materials: {
      requirements: "",
      prerequisites: "",
      platformOrAddress: "",
      postcode: "",
    },
  });

  const [user, setUser] = useState(null);
  const [mentorDetails, setMentorDetails] = useState({});

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  // Firebase auth and setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Set mentorId in form data
        setFormData(prev => ({ ...prev, mentorId: currentUser.uid }));
        // Get mentor details from localStorage (set by dashboard)
        const mentor = JSON.parse(localStorage.getItem("mentor") || "{}");
        setMentorDetails(mentor);
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/getstarted';
      }
    });

    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileDropdownBtnRef.current &&
        !profileDropdownBtnRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories and subjects from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(
          "https://rootsnwings-api-944856745086.europe-west2.run.app/metadata/categories"
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error("Failed to fetch categories");
          // Fallback to hardcoded categories
          setCategories([
            { categoryName: "Music" },
            { categoryName: "Dance" },
            { categoryName: "Art & Craft" },
            { categoryName: "Languages" },
            { categoryName: "Coding" },
            { categoryName: "Philosophy" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to hardcoded categories
        setCategories([
          { categoryName: "Music" },
          { categoryName: "Dance" },
          { categoryName: "Art & Craft" },
          { categoryName: "Languages" },
          { categoryName: "Coding" },
          { categoryName: "Philosophy" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const response = await fetch(
          "https://rootsnwings-api-944856745086.europe-west2.run.app/metadata/subjects"
        );
        if (response.ok) {
          const data = await response.json();
          setSubjects(data.subjects || []);
          setFilteredSubjects(data.subjects || []);
        } else {
          console.error("Failed to fetch subjects");
          setSubjects([]);
          setFilteredSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
        setFilteredSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchCategories();
    fetchSubjects();
  }, []);

  // Calculate weekly schedule and total sessions whenever dependencies change
  useEffect(() => {
    generateWeeklySchedule();
  }, [
    formData.schedule.startDate,
    formData.schedule.endDate,
    formData.schedule.selectedDays,
    formData.schedule.startTime,
    formData.schedule.sessionDuration,
    formData.type,
  ]);

  // Generate weekly schedule array for API
  const generateWeeklySchedule = () => {
    if (formData.type === "workshop") {
      // For workshops, create a single session entry
      if (formData.schedule.startDate && formData.schedule.startTime) {
        const endTime = calculateEndTime(
          formData.schedule.startTime,
          formData.schedule.sessionDuration
        );
        const weeklySchedule = [
          {
            day: new Date(formData.schedule.startDate).toLocaleDateString(
              "en-US",
              { weekday: "long" }
            ),
            startTime: formData.schedule.startTime,
            endTime: endTime,
          },
        ];

        setFormData((prev) => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            weeklySchedule: weeklySchedule,
          },
          pricing: {
            ...prev.pricing,
            totalSessions: 1,
          },
        }));
      }
      return;
    }

    // For group classes, calculate all sessions in the date range
    if (
      !formData.schedule.startDate ||
      !formData.schedule.endDate ||
      formData.schedule.selectedDays.length === 0 ||
      !formData.schedule.startTime
    ) {
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          weeklySchedule: [],
        },
        pricing: {
          ...prev.pricing,
          totalSessions: 0,
        },
      }));
      return;
    }

    const start = new Date(formData.schedule.startDate);
    const end = new Date(formData.schedule.endDate);

    if (start >= end) {
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          weeklySchedule: [],
        },
        pricing: {
          ...prev.pricing,
          totalSessions: 0,
        },
      }));
      return;
    }

    const weeklySchedule = [];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const selectedDayNumbers = formData.schedule.selectedDays.map((day) =>
      dayNames.indexOf(day)
    );
    const endTime = calculateEndTime(
      formData.schedule.startTime,
      formData.schedule.sessionDuration
    );

    let sessionCount = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      if (selectedDayNumbers.includes(currentDate.getDay())) {
        const dayName = dayNames[currentDate.getDay()];
        weeklySchedule.push({
          day: dayName,
          startTime: formData.schedule.startTime,
          endTime: endTime,
          date: currentDate.toISOString().split('T')[0],
        });
        sessionCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(weeklySchedule,'weeklySchedule weeklySchedule');
    
    // Update the form data with calculated values
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        weeklySchedule: weeklySchedule,
      },
      pricing: {
        ...prev.pricing,
        totalSessions: sessionCount,
      },
    }));
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return "";

    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  // Generic form field update handler
  const updateFormField = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;

      // Navigate to the parent of the target field
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      // Set the final value
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Handle day selection for group classes
  const handleDayToggle = (day) => {
    const currentDays = formData.schedule.selectedDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateFormField("schedule.selectedDays", newDays);
  };

  // Filter subjects based on search and category
  const filterSubjects = (searchTerm, categoryFilter = "") => {
    let filtered = subjects;

    // Filter by category if selected
    if (categoryFilter && categoryFilter !== "Other") {
      const categoryKey = categoryFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
      filtered = filtered.filter(subject => 
        subject.category?.toLowerCase().replace(/[^a-z0-9]/g, '_') === categoryKey
      );
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.subject?.toLowerCase().includes(search) ||
        subject.synonyms?.some(synonym => synonym.toLowerCase().includes(search)) ||
        subject.cultural_keywords?.some(keyword => keyword.toLowerCase().includes(search))
      );
    }

    // Sort by relevance: cultural subjects first, then by searchBoost
    filtered.sort((a, b) => {
      if (a.is_culturally_rooted && !b.is_culturally_rooted) return -1;
      if (!a.is_culturally_rooted && b.is_culturally_rooted) return 1;
      return (b.searchBoost || 0) - (a.searchBoost || 0);
    });

    return filtered;
  };

  // Handle subject search
  const handleSubjectSearch = (searchTerm) => {
    setSubjectSearch(searchTerm);
    const filtered = filterSubjects(searchTerm, formData.category);
    setFilteredSubjects(filtered);
    setShowSubjectDropdown(true);
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setFormData(prev => ({
      ...prev,
      subject: subject.subject,
      subjectId: subject.subjectId
    }));
    setSelectedSubjectData(subject);
    setSubjectSearch(subject.subject);
    setShowSubjectDropdown(false);
  };

  // Handle manual subject input (fallback for new subjects)
  const handleCustomSubjectInput = (value) => {
    setFormData(prev => ({
      ...prev,
      subject: value,
      subjectId: ""  // Clear subjectId for custom subjects
    }));
    setSelectedSubjectData(null);
    setSubjectSearch(value);
    
    if (value.length > 0) {
      handleSubjectSearch(value);
    } else {
      setShowSubjectDropdown(false);
    }
  };

  // Handle category change and filter subjects accordingly
  const handleCategoryChange = (categoryValue) => {
    updateFormField("category", categoryValue);
    
    // Filter subjects based on new category
    const filtered = filterSubjects(subjectSearch, categoryValue);
    setFilteredSubjects(filtered);
    
    // If current subject doesn't match new category, clear it
    if (selectedSubjectData && categoryValue !== "Other") {
      const categoryKey = categoryValue.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const subjectCategoryKey = selectedSubjectData.category?.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      if (subjectCategoryKey !== categoryKey) {
        setFormData(prev => ({
          ...prev,
          subject: "",
          subjectId: ""
        }));
        setSelectedSubjectData(null);
        setSubjectSearch("");
      }
    }
  };

  // Handle class type selection
  const handleClassTypeSelect = (type) => {
    updateFormField("type", type);

    // Reset schedule-related fields when switching types
    if (type === "workshop") {
      updateFormField("schedule.endDate", "");
      updateFormField("schedule.selectedDays", []);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showErrorMessage("Please log in to create a class.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Prepare the API request body
      const requestBody = {
        type: formData.type,
        title: formData.title,
        subject: formData.subject,
        subjectId: formData.subjectId,  // Include subject ID for enhanced integration
        category:
          formData.category === "Other"
            ? formData.customCategory
            : formData.category,
        description: formData.description,
        mentorId: user.uid,
        level: formData.level,
        ageGroup: formData.ageGroup,
        format: formData.format,
        pricing: {
          perSessionRate: formData.pricing.isFree
            ? 0
            : parseFloat(formData.pricing.perSessionRate) || 0,
          totalSessions: formData.pricing.totalSessions,
          currency: formData.pricing.currency,
        },
        schedule: {
          startDate: formData.schedule.startDate,
          endDate:
            formData.type === "workshop"
              ? formData.schedule.startDate
              : formData.schedule.endDate,
          weeklySchedule: formData.schedule.weeklySchedule,
          sessionDuration: formData.schedule.sessionDuration,
        },
        capacity: {
          maxStudents: parseInt(formData.capacity.maxStudents),
          minStudents: parseInt(formData.capacity.minStudents),
        },
      };

      console.log("Submitting class data:", requestBody);

      // Make API call with Firebase auth
      const response = await fetch(
        "https://rootsnwings-api-944856745086.europe-west2.run.app/classes/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Class created successfully:", result);

        // Show success message
        showSuccessMessage(
          "Class created successfully! It will be reviewed and published within 24 hours."
        );

        // Reset form or redirect as needed
        // window.location.href = '/mentor-dashboard';
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      showErrorMessage(
        "There was an error creating your class. Please try again or contact support if the problem persists."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom success message handler
  const showSuccessMessage = (message) => {
    const messageBox = document.createElement("div");
    messageBox.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4";
    messageBox.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
        <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="close-message-box" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);
    window.location.href = "/mentor/dashboard";
    document.getElementById("close-message-box").onclick = () => {
      document.body.removeChild(messageBox);
    };
  };

  // Custom error message handler
  const showErrorMessage = (message) => {
    const messageBox = document.createElement("div");
    messageBox.className =
      "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4";
    messageBox.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
        <div class="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Error</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="close-error-box" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById("close-error-box").onclick = () => {
      document.body.removeChild(messageBox);
    };
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };


  return (
    <>
      <Head>
        <title>Host a Class - Roots & Wings</title>
        <style>{`
          html, body { background-color: ${tailwindConfig.theme.extend.colors["background"]}; }
          .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
          /* Custom transitions for sidebar */
          .sidebar-transition {
            transition-property: transform;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </Head>
      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                id="mobile-menu-btn"
                className="md:hidden text-gray-600 hover:text-primary"
                onClick={toggleSidebar}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">
                Roots & Wings
              </h1>
              <span className="hidden md:block text-sm text-gray-500">
                Mentor Portal
              </span>
            </div>

            {/* Right: Profile Dropdown */}
            <MentorHeaderAccount isProfileDropdownOpen={isProfileDropdownOpen} handleProfileDropdownClick={toggleProfileDropdown} user={user} mentorDetails={mentorDetails} />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <MentorSideBase
            isSidebarOpen={isSidebarOpen}
            navItems={navItems}
            activeTab={3}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Host a Class
              </h1>
              <p className="text-gray-600">
                Create a new class to share your expertise with students across
                the UK.
              </p>
            </div>

            {/* Class Type Selection */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {classTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleClassTypeSelect(type.id)}
                  className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    formData.type === type.id
                      ? "ring-2 ring-primary border-primary"
                      : ""
                  }`}
                >
                  <div
                    className={`w-16 h-16 ${type.iconBg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <i
                      className={`${type.icon} ${type.iconColor} text-2xl`}
                    ></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span>{type.feature}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Class Creation Form */}
            <div
              className="bg-white rounded-xl border border-gray-200"
              id="class-form"
            >
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Class Details
                </h2>
                <p className="text-gray-600">
                  Fill in the information below to create your class
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="classTitle"
                        className="block text-sm font-semibold text-gray-900 mb-2"
                      >
                        Class Title
                      </label>
                      <input
                        type="text"
                        id="classTitle"
                        placeholder="e.g., Beginner Kathak Dance for Teens"
                        value={formData.title}
                        onChange={(e) =>
                          updateFormField("title", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Make it descriptive and engaging
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="subjectCategory"
                        className="block text-sm font-semibold text-gray-900 mb-2"
                      >
                        Subject Category
                      </label>
                      <select
                        id="subjectCategory"
                        value={formData.category}
                        onChange={(e) =>
                          handleCategoryChange(e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loadingCategories}
                        required
                      >
                        <option value="">
                          {loadingCategories
                            ? "Loading categories..."
                            : "Select a category"}
                        </option>
                        {categories.map((category, index) => (
                          <option key={index} value={category.categoryName}>
                            {category.categoryName}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      {formData.category === "Other" && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Please specify your subject category"
                            value={formData.customCategory}
                            onChange={(e) =>
                              updateFormField("customCategory", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter a category not listed above
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Cultural Subject Selector - NEW FEATURE */}
                  <div className="relative">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Specific Subject
                      {selectedSubjectData?.is_culturally_rooted && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <span className="mr-1">🏛️</span>
                          Cultural Heritage
                        </span>
                      )}
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        id="subject"
                        placeholder="Search subjects or type custom subject..."
                        value={subjectSearch}
                        onChange={(e) => handleCustomSubjectInput(e.target.value)}
                        onFocus={() => {
                          if (filteredSubjects.length > 0) {
                            setShowSubjectDropdown(true);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      
                      {/* Subject Dropdown - NEW */}
                      {showSubjectDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {loadingSubjects ? (
                            <div className="px-4 py-3 text-gray-500">Loading subjects...</div>
                          ) : filteredSubjects.length > 0 ? (
                            <>
                              {filteredSubjects.map((subject, index) => (
                                <div
                                  key={subject.subjectId || index}
                                  onClick={() => handleSubjectSelect(subject)}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {subject.subject}
                                      </div>
                                      {subject.heritage_context && subject.heritage_context !== "folk" && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {subject.heritage_context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} tradition
                                        </div>
                                      )}
                                      {subject.synonyms && subject.synonyms.length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                          Also known as: {subject.synonyms.slice(0, 3).join(", ")}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end ml-3">
                                      {subject.is_culturally_rooted && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mb-1">
                                          🏛️ Cultural
                                        </span>
                                      )}
                                      {subject.cultural_authenticity_score && subject.cultural_authenticity_score > 0.7 && (
                                        <div className="flex items-center text-xs text-gray-500">
                                          <span className="text-yellow-500">★</span>
                                          <span className="ml-1">{Math.round(subject.cultural_authenticity_score * 100)}% authentic</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Option for custom subject */}
                              {subjectSearch && !filteredSubjects.find(s => s.subject.toLowerCase() === subjectSearch.toLowerCase()) && (
                                <div
                                  onClick={() => {
                                    handleSubjectSelect({
                                      subject: subjectSearch,
                                      subjectId: "",
                                      is_culturally_rooted: false
                                    });
                                  }}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-t-2 border-blue-100 bg-blue-25"
                                >
                                  <div className="flex items-center">
                                    <span className="text-blue-600 mr-2">+</span>
                                    <div>
                                      <div className="font-medium text-blue-900">
                                        Add "{subjectSearch}" as custom subject
                                      </div>
                                      <div className="text-xs text-blue-600">
                                        Subject will be reviewed by admin
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="px-4 py-3 text-gray-500">
                              No subjects found. Type to add custom subject.
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Click outside handler */}
                      {showSubjectDropdown && (
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSubjectDropdown(false)}
                        />
                      )}
                    </div>
                    
                    {/* Cultural Context Display - NEW */}
                    {selectedSubjectData?.is_culturally_rooted && (
                      <div className="mt-2 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                        <div className="flex items-start">
                          <span className="text-amber-600 mr-2 mt-0.5">ℹ️</span>
                          <div>
                            <p className="text-sm font-medium text-amber-800">Cultural Subject</p>
                            <p className="text-xs text-amber-700 mt-1">
                              This subject has cultural significance. 
                              {selectedSubjectData.cultural_authenticity_score > 0.8 && 
                                " Consider mentioning your traditional training or cultural background."
                              }
                            </p>
                            {selectedSubjectData.tradition_or_school && (
                              <p className="text-xs text-amber-600 mt-1">
                                Traditional school: {selectedSubjectData.tradition_or_school}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Search from our cultural taxonomy or add your own custom subject
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="classDescription"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Class Description
                    </label>
                    <textarea
                      id="classDescription"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => {
                        const text = e.target.value;
                        if (text.length <= 500) {
                          updateFormField("description", text);
                        }
                      }}
                      placeholder="Describe what students will learn, your teaching approach, and what makes this class special..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Help students understand what to expect
                      </p>
                      <span
                        className={`text-xs ${
                          formData.description.length > 450
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.description.length}/500 characters
                      </span>
                    </div>
                  </div>

                  {/* Level & Age Group */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Skill Level
                      </label>
                      <div className="space-y-2">
                        {["beginner", "intermediate", "advanced"].map(
                          (level) => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="skillLevel"
                                value={level}
                                checked={formData.level === level}
                                onChange={(e) =>
                                  updateFormField("level", e.target.value)
                                }
                                className="w-4 h-4 text-primary focus:ring-primary"
                              />
                              <span className="ml-3 text-gray-700 capitalize">
                                {level}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Age Group
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="ageGroup"
                            value="child"
                            checked={formData.ageGroup === "child"}
                            onChange={(e) =>
                              updateFormField("ageGroup", e.target.value)
                            }
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="ml-3 text-gray-700">
                            Children (5-12 years)
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="ageGroup"
                            value="teen"
                            checked={formData.ageGroup === "teen"}
                            onChange={(e) =>
                              updateFormField("ageGroup", e.target.value)
                            }
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="ml-3 text-gray-700">
                            Teens (13-17 years)
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="ageGroup"
                            value="adult"
                            checked={formData.ageGroup === "adult"}
                            onChange={(e) =>
                              updateFormField("ageGroup", e.target.value)
                            }
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="ml-3 text-gray-700">
                            Adults (18+ years)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Class Format & Scheduling */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                      Schedule & Format
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          {formData.type === "workshop"
                            ? "Workshop Duration"
                            : "Session Duration"}
                        </label>
                        <select
                          id="duration"
                          value={formData.schedule.sessionDuration}
                          onChange={(e) =>
                            updateFormField(
                              "schedule.sessionDuration",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {formData.type === "workshop" ? (
                            <>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                              <option value="180">3 hours</option>
                              <option value="240">4 hours</option>
                              <option value="300">5 hours</option>
                              <option value="360">6 hours</option>
                              <option value="420">7 hours</option>
                              <option value="480">8 hours</option>
                            </>
                          ) : (
                            <>
                              <option value="45">45 minutes</option>
                              <option value="60">60 minutes</option>
                              <option value="90">90 minutes</option>
                              <option value="120">120 minutes</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="maxStudents"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Max Students
                        </label>
                        <select
                          id="maxStudents"
                          value={formData.capacity.maxStudents}
                          onChange={(e) =>
                            updateFormField(
                              "capacity.maxStudents",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="2">2-5 students</option>
                          <option value="6">6-10 students</option>
                          <option value="11">11-15 students</option>
                          <option value="16">16-20 students</option>
                          {formData.type === "workshop" && (
                            <>
                              <option value="30">21-30 students</option>
                              <option value="50">31-50 students</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="minStudents"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Min Students (Groups)
                        </label>
                        <select
                          id="minStudents"
                          value={formData.capacity.minStudents}
                          onChange={(e) =>
                            updateFormField(
                              "capacity.minStudents",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="teachingMode"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Teaching Mode
                        </label>
                        <select
                          id="teachingMode"
                          value={formData.format}
                          onChange={(e) =>
                            updateFormField("format", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="online">Online only</option>
                          <option value="in-person">In-person only</option>
                        </select>
                      </div>
                    </div>

                    {/* Days Selection for Group Classes */}
                    {formData.type === "group" && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Available Days & Times
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => (
                            <label
                              key={day}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.schedule.selectedDays.includes(day)
                                  ? "border-primary bg-primary-light text-primary-dark"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.schedule.selectedDays.includes(
                                  day
                                )}
                                onChange={() => handleDayToggle(day)}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                              />
                              <span className="ml-3 font-medium">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date and Time Selection */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label
                          htmlFor="startTime"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          value={formData.schedule.startTime}
                          onChange={(e) =>
                            updateFormField(
                              "schedule.startTime",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          {formData.type === "workshop"
                            ? "Workshop Date"
                            : "Start Date"}
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={formData.schedule.startDate}
                          onChange={(e) =>
                            updateFormField(
                              "schedule.startDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      {formData.type === "group" && (
                        <div>
                          <label
                            htmlFor="endDate"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            End Date
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            value={formData.schedule.endDate}
                            onChange={(e) =>
                              updateFormField(
                                "schedule.endDate",
                                e.target.value
                              )
                            }
                            min={formData.schedule.startDate}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Session Summary for Group Classes */}
                    {formData.type === "group" &&
                      formData.pricing.totalSessions > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4 mt-6">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            <i className="fas fa-calculator mr-2"></i>
                            Calculated Schedule Summary
                          </h4>
                          <div className="text-sm text-blue-700">
                            <p>
                              <strong>Total Sessions:</strong>{" "}
                              {formData.pricing.totalSessions}
                            </p>
                            <p>
                              <strong>Days:</strong>{" "}
                              {formData.schedule.selectedDays.join(", ")}
                            </p>
                            <p>
                              <strong>Duration:</strong>{" "}
                              {formData.schedule.sessionDuration} minutes per
                              session
                            </p>
                            <p>
                              <strong>End Time:</strong>{" "}
                              {calculateEndTime(
                                formData.schedule.startTime,
                                formData.schedule.sessionDuration
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                      Pricing
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label
                          htmlFor="price"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Price per Session
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">
                            £
                          </span>
                          <input
                            type="number"
                            id="price"
                            placeholder={
                              formData.type === "workshop" &&
                              formData.pricing.isFree
                                ? "0"
                                : "35"
                            }
                            min="0"
                            max="200"
                            step="0.01"
                            value={formData.pricing.perSessionRate}
                            onChange={(e) =>
                              updateFormField(
                                "pricing.perSessionRate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={
                              formData.type === "workshop" &&
                              formData.pricing.isFree
                            }
                            className={`w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                              formData.type === "workshop" &&
                              formData.pricing.isFree
                                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          <span className="absolute right-3 top-3 text-gray-500">
                            /session
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.type === "workshop" &&
                          formData.pricing.isFree
                            ? "Free workshop - great for building reputation!"
                            : "Average rate: £25-45 per session"}
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="totalSessions"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Total Sessions
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="totalSessions"
                            value={formData.pricing.totalSessions || ""}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-3 text-gray-400">
                            <i className="fas fa-calculator text-sm"></i>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.type === "workshop"
                            ? "Workshops are single sessions"
                            : formData.pricing.totalSessions > 0
                            ? `Auto-calculated: ${
                                formData.pricing.totalSessions
                              } sessions over ${
                                formData.schedule.selectedDays.length
                              } day${
                                formData.schedule.selectedDays.length !== 1
                                  ? "s"
                                  : ""
                              } per week`
                            : "Select days and date range to calculate sessions"}
                        </p>
                      </div>
                      {formData.type === "group" && (
                        <div>
                          <label
                            htmlFor="discount"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Package Discount (Optional)
                          </label>
                          <select
                            id="discount"
                            value={formData.pricing.packageDiscount}
                            onChange={(e) =>
                              updateFormField(
                                "pricing.packageDiscount",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="none">No package discount</option>
                            <option value="5">5% off (4+ sessions)</option>
                            <option value="10">10% off (8+ sessions)</option>
                            <option value="15">15% off (12+ sessions)</option>
                            <option value="custom">Custom discount</option>
                          </select>
                        </div>
                      )}
                      {formData.type === "workshop" && (
                        <div>
                          <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.pricing.isFree}
                              onChange={(e) => {
                                updateFormField(
                                  "pricing.isFree",
                                  e.target.checked
                                );
                                if (e.target.checked) {
                                  updateFormField("pricing.perSessionRate", 0);
                                }
                              }}
                              className="w-5 h-5 text-primary focus:ring-primary rounded"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">
                                Free Workshop
                              </div>
                              <div className="text-sm text-gray-500">
                                Offer this workshop for free to attract new
                                students
                              </div>
                            </div>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            {formData.pricing.isFree
                              ? "✨ Free workshops get higher visibility and more bookings"
                              : "Consider offering occasional free workshops to build your reputation"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Materials & Requirements */}
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                      Materials & Requirements
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="bring"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          What students need to bring/have
                        </label>
                        <textarea
                          id="bring"
                          rows="3"
                          placeholder="List any materials, equipment, or software students need for the class..."
                          value={formData.materials.requirements}
                          onChange={(e) =>
                            updateFormField(
                              "materials.requirements",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="prerequisites"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Skill Prerequisites
                        </label>
                        <textarea
                          id="prerequisites"
                          rows="3"
                          placeholder="Any prior knowledge or skills students should have..."
                          value={formData.materials.prerequisites}
                          onChange={(e) =>
                            updateFormField(
                              "materials.prerequisites",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label
                        htmlFor="locationDetails"
                        className="block text-sm font-semibold text-gray-900 mb-2"
                      >
                        {formData.format === "online"
                          ? "Platform Details"
                          : formData.format === "in-person"
                          ? "Location Details"
                          : "Location & Platform Details"}
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          id="platform"
                          placeholder={
                            formData.format === "online"
                              ? "Platform (e.g., Zoom, Google Meet)"
                              : formData.format === "in-person"
                              ? "Address"
                              : "Platform or Address"
                          }
                          value={formData.materials.platformOrAddress}
                          onChange={(e) =>
                            updateFormField(
                              "materials.platformOrAddress",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {formData.format === "in-person" && (
                          <input
                            type="text"
                            id="postcode"
                            placeholder="Postcode (for in-person classes)"
                            value={formData.materials.postcode}
                            onChange={(e) =>
                              updateFormField(
                                "materials.postcode",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => console.log("Save as draft clicked")}
                      >
                        Save as Draft
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() =>
                          console.log("Preview class clicked", formData)
                        }
                      >
                        Preview Class
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Publishing...
                          </>
                        ) : (
                          "Publish Class"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            id="sidebar-overlay"
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
      </body>
    </>
  );
};

export default HostClassPage;
