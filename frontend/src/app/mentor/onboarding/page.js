"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

// Updated steps after removing step 3
const STEPS = [
  { id: 1, title: "Welcome" },
  { id: 2, title: "Subject & Level" },
  { id: 3, title: "Bio & Experience" },
  { id: 4, title: "Location & Mode" },
  { id: 5, title: "Languages & Safety" },
  { id: 6, title: "Photo" },
  { id: 7, title: "Pricing" },
];

// Categories will be fetched from API

const LANGUAGES = [
  { value: "spanish", name: "Spanish" },
  { value: "french", name: "French" },
  { value: "hindi", name: "Hindi" },
  { value: "urdu", name: "Urdu" },
  { value: "punjabi", name: "Punjabi" },
  { value: "arabic", name: "Arabic" },
  { value: "mandarin", name: "Mandarin" },
  { value: "german", name: "German" },
];

const OnBoarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firebase auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state matching the API request body structure
  const [formData, setFormData] = useState({
    userId: "", // Will be set from Firebase user
    teachingRole: "both",
    subjects: [],
    levels: [],
    ageGroups: [],
    title: "",
    aboutYou: "",
    qualifications: [], // Added qualifications array
    city: "",
    region: "",
    postalCode: "",
    country: "",
    phone: "",
    teachingModes: [],
    languages: ["english"],
    dbsCheck: false,
    photo: "",
    pricing: {
      oneOnOneRate: 0,
      groupRate: 0,
      firstSessionFree: false,
      currency: "GBP",
    },
  });

  console.log(formData, "formData formData formData");

  const [customSubject, setCustomSubject] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Qualification form state
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [editingQualificationIndex, setEditingQualificationIndex] = useState(-1);
  const [currentQualification, setCurrentQualification] = useState({
    type: "degree",
    title: "",
    institution: "",
    year: "",
    description: ""
  });

  const languageSelectRef = useRef(null);

  const totalSteps = STEPS.length;
  const currentStepTitle =
    STEPS.find((step) => step.id === currentStep)?.title || "";
  const progressBarWidth = `${(currentStep / totalSteps) * 100}%`;

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setFormData(prev => ({ ...prev, userId: currentUser.uid }));
      }
    }, (error) => {
      setAuthError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load saved progress on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("mentorOnboardingForm");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Override userId with current Firebase user
        if (user) {
          parsedData.userId = user.uid;
        }
        setFormData(parsedData);
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    }
  }, [user]);

  // Save progress whenever formData changes
  useEffect(() => {
    localStorage.setItem("mentorOnboardingForm", JSON.stringify(formData));
  }, [formData]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(
          "/api/metadata/categories"
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error("Failed to fetch categories");
          // Fallback to hardcoded categories
          setCategories([
            { categoryId: "music", categoryName: "Music", icon: "fas fa-music" },
            { categoryId: "maths", categoryName: "Maths", icon: "fas fa-calculator" },
            { categoryId: "art", categoryName: "Art & Craft", icon: "fas fa-palette" },
            { categoryId: "languages", categoryName: "Languages", icon: "fas fa-globe" },
            { categoryId: "coding", categoryName: "Coding", icon: "fas fa-code" },
            { categoryId: "philosophy", categoryName: "Philosophy", icon: "fas fa-brain" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to hardcoded categories
        setCategories([
          { categoryId: "music", categoryName: "Music", icon: "fas fa-music" },
          { categoryId: "maths", categoryName: "Maths", icon: "fas fa-calculator" },
          { categoryId: "art", categoryName: "Art & Craft", icon: "fas fa-palette" },
          { categoryId: "languages", categoryName: "Languages", icon: "fas fa-globe" },
          { categoryId: "coding", categoryName: "Coding", icon: "fas fa-code" },
          { categoryId: "philosophy", categoryName: "Philosophy", icon: "fas fa-brain" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && e.ctrlKey && currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && e.ctrlKey && currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, totalSteps]);

  // Generic input handler for text inputs, radio buttons, and checkboxes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (type === "checkbox") {
      if (name in formData && Array.isArray(formData[name])) {
        // Handle array checkboxes (levels, ageGroups, teachingModes)
        let newArray = formData[name];
        if (checked) {
          newArray = [...newArray, value];
        } else {
          newArray = newArray.filter((item) => item !== value);
        }
        setFormData((prev) => ({ ...prev, [name]: newArray }));
      } else {
        // Handle boolean checkboxes (dbsCheck, firstSessionFree)
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      // Handle text inputs
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Special handler for pricing fields
  const handlePricingChange = (field, value) => {
    console.log(field, value, "field, value");
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: field === "firstSessionFree" ? value : parseFloat(value) || 0,
      },
    }));
  };

  // Subject selection handler
  const handleSubjectSelect = (subjectValue) => {
    let newSubjects;
    if (formData.subjects.includes(subjectValue)) {
      newSubjects = formData.subjects.filter((s) => s !== subjectValue);
    } else {
      newSubjects = [...formData.subjects, subjectValue];
    }
    setFormData((prev) => ({ ...prev, subjects: newSubjects }));
  };

  // Add custom subject
  const handleAddCustomSubject = (e) => {
    e.preventDefault();
    if (
      customSubject.trim() !== "" &&
      !formData.subjects.includes(customSubject.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, customSubject.trim()],
      }));
      setCustomSubject("");
    }
  };

  // Add language
  const handleAddLanguage = () => {
    if (selectedLanguage && !formData.languages.includes(selectedLanguage)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, selectedLanguage],
      }));
      setSelectedLanguage("");
      if (languageSelectRef.current) {
        languageSelectRef.current.value = "";
      }
    }
  };

  // Remove language
  const handleRemoveLanguage = (languageToRemove) => {
    if (languageToRemove !== "english") {
      // Prevent removing English
      setFormData((prev) => ({
        ...prev,
        languages: prev.languages.filter((lang) => lang !== languageToRemove),
      }));
    }
  };

  // Qualification types mapping from backend QualificationType enum
  const qualificationTypes = [
    // === FORMAL QUALIFICATIONS ===
    { value: "degree", label: "Degree", icon: "🎓", description: "University degree or formal qualification" },
    { value: "certification", label: "Certification", icon: "📜", description: "Professional certification or license" },
    { value: "professional_experience", label: "Professional Experience", icon: "💼", description: "Work experience or industry background" },
    
    // === CULTURAL/TRADITIONAL QUALIFICATIONS ===
    { value: "traditional_lineage", label: "Traditional Lineage", icon: "🙏", description: "Student of Guru or traditional master" },
    { value: "cultural_apprenticeship", label: "Cultural Apprenticeship", icon: "👨‍🏫", description: "Apprenticed under cultural master or craftsperson" },
    { value: "cultural_immersion", label: "Cultural Immersion", icon: "🌍", description: "Studied tradition in its cultural homeland" },
    { value: "self_taught_cultural", label: "Self-Taught Cultural", icon: "📚", description: "Self-study of cultural or traditional practice" },
    { value: "community_recognition", label: "Community Recognition", icon: "🏆", description: "Recognized by cultural community or elders" }
  ];

  // Add/Edit qualification handlers
  const handleAddQualification = () => {
    setCurrentQualification({
      type: "degree",
      title: "",
      institution: "",
      year: "",
      description: ""
    });
    setEditingQualificationIndex(-1);
    setShowQualificationForm(true);
  };

  const handleEditQualification = (index) => {
    setCurrentQualification(formData.qualifications[index]);
    setEditingQualificationIndex(index);
    setShowQualificationForm(true);
  };

  const handleSaveQualification = () => {
    if (!currentQualification.title.trim() || !currentQualification.institution.trim() || !currentQualification.year.trim()) {
      alert("Please fill in all required fields (Title, Institution, Year)");
      return;
    }

    const qualificationToSave = {
      ...currentQualification,
      id: editingQualificationIndex >= 0 ? formData.qualifications[editingQualificationIndex].id : `qual_${Date.now()}`,
      icon: qualificationTypes.find(type => type.value === currentQualification.type)?.icon || "🎓"
    };

    if (editingQualificationIndex >= 0) {
      // Edit existing qualification
      const updatedQualifications = [...formData.qualifications];
      updatedQualifications[editingQualificationIndex] = qualificationToSave;
      setFormData(prev => ({ ...prev, qualifications: updatedQualifications }));
    } else {
      // Add new qualification
      setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, qualificationToSave] }));
    }

    setShowQualificationForm(false);
    setCurrentQualification({ type: "degree", title: "", institution: "", year: "", description: "" });
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, qualifications: updatedQualifications }));
  };

  const handleQualificationInputChange = (field, value) => {
    setCurrentQualification(prev => ({ ...prev, [field]: value }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Form submission to API
  const handleSubmit = async () => {
    if (!user) {
      alert("❌ Authentication required. Please log in and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      // Prepare the request body according to the API specification
      const requestBody = {
        userId: user.uid, // Firebase UID
        teachingRole: formData.teachingRole,
        subjects: formData.subjects,
        levels: formData.levels,
        ageGroups: formData.ageGroups,
        title: formData.title,
        aboutYou: formData.aboutYou,
        qualifications: formData.qualifications, 
        city: formData.city,
        region: formData.region,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        teachingModes: formData.teachingModes,
        languages: formData.languages,
        dbsCheck: formData.dbsCheck,
        photo: formData.photo || "",
        pricing: formData.pricing,
      };

      // Make API call to submit the onboarding data with Firebase auth
      const response = await axios.post(
        "/api/user-onboarding/mentor",
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response) {
        // Clear saved progress on successful submission
        localStorage.removeItem("mentorOnboardingForm");

        // Mark onboarding as complete in Firebase backend
        try {
          await axios.post(
            "/api/firebase-auth/complete-onboarding",
            {},
            {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (onboardingError) {
          console.warn("Failed to mark onboarding complete:", onboardingError);
          // Continue with success flow even if this fails
        }

        // Show success alert
        alert(
          "🎉 Profile submitted successfully! You will receive confirmation within 24-48 hours. Redirecting to mentor dashboard..."
        );

        // Redirect to mentor dashboard (replace with actual route)
        window.location.href = "/mentor/dashboard";
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        "❌ There was an error submitting your profile. Please try again or contact support if the problem persists."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for the last step
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  // Validation for moving to next step
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.teachingRole;
      case 2:
        return (
          formData.subjects.length > 0 &&
          formData.levels.length > 0 &&
          formData.ageGroups.length > 0
        );
      case 3:
        return formData.title.length >= 20 && formData.aboutYou.length >= 50;
      case 4:
        return (
          formData.city && formData.country && formData.teachingModes.length > 0
        );
      case 5:
        return formData.languages.length > 0 && formData.dbsCheck;
      case 6:
        return true; // Photo is optional
      case 7:
        return formData.pricing.oneOnOneRate > 0 || formData.pricing.groupRate > 0;
      default:
        return true;
    }
  };

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <i className="fas fa-chalkboard-teacher text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Let&apos;s build your teaching profile
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Welcome to Roots & Wings! We&apos;ll guide you through creating an
              amazing mentor profile that attracts the right students.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm your teaching role
              </h3>
              <div className="space-y-3 text-left">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="individual"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    checked={formData.teachingRole === "individual"}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">
                    Individual mentor (1-on-1)
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="group"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    checked={formData.teachingRole === "group"}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Group mentorship</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="both"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    checked={formData.teachingRole === "both"}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">
                    Both (recommended for maximum opportunities)
                  </span>
                </label>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span role="img" aria-label="clock">
                ⏱️
              </span>{" "}
              This process takes about 10 minutes and your progress is
              automatically saved
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg p-6 sticky top-4">
                <h3 className="font-semibold text-blue-800 mb-3">
                  <span role="img" aria-label="lightbulb">
                    💡
                  </span>{" "}
                  Good to Know
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Most popular: Music, Maths, Languages, Art</li>
                  <li>• You can teach multiple subjects</li>
                  <li>• Choose levels you&apos;re comfortable with</li>
                  <li>• Age groups help students find you easily</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What would you like to teach?
              </h2>

              {/* Category Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose your subject category
                </h3>
                {loadingCategories ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading categories...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <label
                        key={category.categoryId}
                        className="subject-option cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          value={category.categoryId}
                          checked={formData.subjects.includes(category.categoryId)}
                          onChange={() => handleSubjectSelect(category.categoryId)}
                        />
                        <div
                          className={`subject-card p-3 border-2 rounded-lg text-center transition-colors ${
                            formData.subjects.includes(category.categoryId)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-500"
                          }`}
                        >
                          <i className={`${category.icon} text-blue-500 mb-2`}></i>
                          <div className="text-sm font-medium">
                            {category.categoryName}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Levels and Age Groups */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <span role="img" aria-label="graduation cap">
                      🎓
                    </span>{" "}
                    Teaching levels
                  </h3>
                  <div className="space-y-3">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <label
                        key={level}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          name="levels"
                          value={level}
                          checked={formData.levels.includes(level)}
                          onChange={handleInputChange}
                        />
                        <span className="capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <span role="img" aria-label="people">
                      👥
                    </span>{" "}
                    Age groups
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        name="ageGroups"
                        value="children"
                        checked={formData.ageGroups.includes("children")}
                        onChange={handleInputChange}
                      />
                      <span>Children (5-12)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        name="ageGroups"
                        value="teens"
                        checked={formData.ageGroups.includes("teens")}
                        onChange={handleInputChange}
                      />
                      <span>Teens (13-17)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        name="ageGroups"
                        value="adults"
                        checked={formData.ageGroups.includes("adults")}
                        onChange={handleInputChange}
                      />
                      <span>Adults (18+)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tell students about yourself
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-lg font-semibold text-gray-900 mb-3"
                >
                  <span role="img" aria-label="pencil">
                    ✏️
                  </span>{" "}
                  Headline
                </label>
                <textarea
                  id="title"
                  name="title"
                  rows="2"
                  placeholder="Write a compelling headline that summarizes what you offer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={handleInputChange}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">
                  Minimum 20 characters ({formData.title.length}/20)
                </div>
              </div>

              <div>
                <label
                  htmlFor="aboutYou"
                  className="block text-lg font-semibold text-gray-900 mb-3"
                >
                  <span role="img" aria-label="person">
                    🧑
                  </span>{" "}
                  About you
                </label>
                <p className="text-gray-600 mb-3">
                  Share your background, experience, passion, and personal
                  message to students
                </p>
                <textarea
                  id="aboutYou"
                  name="aboutYou"
                  rows="5"
                  placeholder="Tell students about your background, experience, why you love teaching..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.aboutYou}
                  onChange={handleInputChange}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">
                  Minimum 50 characters ({formData.aboutYou.length}/50)
                </div>
              </div>

              {/* Qualifications Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-900">
                    <span role="img" aria-label="graduation">
                      🎓
                    </span>{" "}
                    Your Qualifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Qualification
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Add your degrees, certifications, traditional training, or cultural qualifications
                </p>

                {/* Display existing qualifications */}
                {formData.qualifications.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {formData.qualifications.map((qual, index) => {
                      const qualType = qualificationTypes.find(type => type.value === qual.type);
                      return (
                        <div key={qual.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{qualType?.icon || '🎓'}</span>
                                <span className="text-sm font-medium text-blue-600">{qualType?.label || 'Qualification'}</span>
                              </div>
                              <h4 className="font-semibold text-gray-900">{qual.title}</h4>
                              <p className="text-gray-600">{qual.institution} • {qual.year}</p>
                              {qual.description && (
                                <p className="text-sm text-gray-500 mt-1">{qual.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => handleEditQualification(index)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQualification(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add/Edit Qualification Form */}
                {showQualificationForm && (
                  <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingQualificationIndex >= 0 ? 'Edit' : 'Add'} Qualification
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Qualification Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type of Qualification</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={currentQualification.type}
                          onChange={(e) => handleQualificationInputChange('type', e.target.value)}
                        >
                          {qualificationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {qualificationTypes.find(type => type.value === currentQualification.type)?.description}
                        </p>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Bachelor of Music, Kathak Dance Certification, 10 years Guitar Teaching"
                          value={currentQualification.title}
                          onChange={(e) => handleQualificationInputChange('title', e.target.value)}
                        />
                      </div>

                      {/* Institution */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution/Teacher <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., University of Cambridge, Guru Rajesh Kumar, Self-taught"
                          value={currentQualification.institution}
                          onChange={(e) => handleQualificationInputChange('institution', e.target.value)}
                        />
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year/Period <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 2018, 2015-2019, 20+ years"
                          value={currentQualification.year}
                          onChange={(e) => handleQualificationInputChange('year', e.target.value)}
                        />
                      </div>

                      {/* Description (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="2"
                          placeholder="Any additional context about this qualification..."
                          value={currentQualification.description}
                          onChange={(e) => handleQualificationInputChange('description', e.target.value)}
                        ></textarea>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowQualificationForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQualification}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {editingQualificationIndex >= 0 ? 'Save Changes' : 'Add Qualification'}
                      </button>
                    </div>
                  </div>
                )}

                {formData.qualifications.length === 0 && !showQualificationForm && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 text-4xl mb-3">🎓</div>
                    <p className="text-gray-500 mb-4">No qualifications added yet</p>
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Your First Qualification
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Where would you like to teach?
            </h2>

            {/* Location Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span role="img" aria-label="pin">
                  📍
                </span>{" "}
                Your location
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="region"
                  placeholder="Region/State"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.region}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.country}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Teaching Modes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choose your teaching modes
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    name="teachingModes"
                    value="atHome"
                    checked={formData.teachingModes.includes("atHome")}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium">
                    <span role="img" aria-label="house">
                      🏠
                    </span>{" "}
                    At my home
                  </span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    name="teachingModes"
                    value="travel"
                    checked={formData.teachingModes.includes("travel")}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium">
                    <span role="img" aria-label="car">
                      🚗
                    </span>{" "}
                    I can travel
                  </span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    name="teachingModes"
                    value="online"
                    checked={formData.teachingModes.includes("online")}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium">
                    <span role="img" aria-label="globe">
                      🌐
                    </span>{" "}
                    Online lessons
                  </span>
                </label>
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Languages & Safety
            </h2>

            {/* Languages Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Languages you speak
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">English</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Default
                  </span>
                </div>

                {/* Added Languages */}
                <div id="added-languages">
                  {formData.languages
                    .filter((lang) => lang !== "english")
                    .map((lang) => (
                      <div
                        key={lang}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-2"
                      >
                        <span className="font-medium capitalize">{lang}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add another language
                  </label>
                  <div className="flex space-x-3">
                    <select
                      id="language-select"
                      ref={languageSelectRef}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="">Select a language...</option>
                      {LANGUAGES.filter(
                        (lang) => !formData.languages.includes(lang.value)
                      ).map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your safety and ours
              </h3>
              <p className="text-gray-600 mb-6">
                Roots & Wings is committed to creating a safe environment.
                Please confirm the following:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 mt-1"
                    name="dbsCheck"
                    checked={formData.dbsCheck}
                    onChange={handleInputChange}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="dbsCheck"
                      className="text-lg font-semibold text-gray-900 cursor-pointer"
                    >
                      I have a valid DBS check (or equivalent)
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      This is required for teaching students under 18. You will
                      be asked to upload proof later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 6:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add a profile photo
            </h2>
            <p className="text-gray-600 mb-8">
              A clear, friendly photo helps students connect with you.
            </p>
            <div className="w-48 h-48 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6 overflow-hidden">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-camera text-gray-500 text-3xl"></i>
              )}
            </div>
            <label className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setFormData((prev) => ({
                        ...prev,
                        photo: e.target.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Recommended: Clear headshot, good lighting, professional
              appearance
            </p>
          </div>
        );

      case 7:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Set your pricing
            </h2>
            <p className="text-gray-600 mb-8">
              Set fair prices for your lessons. You can adjust these later.
            </p>

            <form onSubmit={handleFinalSubmit}>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    One-on-one sessions
                  </h3>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <i className="fas fa-pound-sign"></i>
                    </span>
                    <input
                      type="number"
                      placeholder="Price per hour"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      value={formData.pricing.oneOnOneRate}
                      onChange={(e) =>
                        handlePricingChange("oneOnOneRate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Group sessions
                  </h3>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <i className="fas fa-pound-sign"></i>
                    </span>
                    <input
                      type="number"
                      placeholder="Price per student per hour"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      value={formData.pricing.groupRate}
                      onChange={(e) =>
                        handlePricingChange("groupRate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      name="firstSessionFree"
                      checked={formData.pricing.firstSessionFree}
                      onChange={(e) =>
                        handlePricingChange(
                          "firstSessionFree",
                          e.target.checked
                        )
                      }
                    />
                    <label className="text-lg font-semibold text-gray-900 cursor-pointer">
                      First Session Free
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    Offering a free first session can help attract new students
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    <span role="img" aria-label="checkmark">
                      ✅
                    </span>{" "}
                    Ready to submit your profile?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Your mentor profile will be reviewed within 24-48 hours.
                    Once approved, students can start booking sessions with you!
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || !canProceedToNextStep()}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Submit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while Firebase auth loads
  if (loading) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if Firebase auth failed
  if (authError) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Please log in and try again.</p>
          <button 
            onClick={() => window.location.href = "/getstarted"}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    window.location.href = "/getstarted";
    return null;
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Font Awesome and custom styles */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      />

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-800">
                Roots & Wings
              </h1>
              <span className="ml-4 text-gray-500">Mentor Onboarding</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => window.history.back()}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Step <span className="font-semibold">{currentStep}</span> of{" "}
                <span className="font-semibold">{totalSteps}</span>
              </span>
              <div className="text-sm text-gray-500">{currentStepTitle}</div>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="fas fa-save mr-1 text-green-500"></i>
              Progress saved
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                  ${
                    step.id <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.id}
                </div>
                {step.id < totalSteps && (
                  <div className="w-6 h-0.5 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: progressBarWidth }}
            ></div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-96">
          <div className="step-content p-8">{renderStepContent()}</div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-arrow-left mr-2"></i> Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <i className="fas fa-arrow-right ml-2"></i>
            </button>
          ) : null}
        </div>

        {/* Validation Messages */}
        {!canProceedToNextStep() && currentStep < totalSteps && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
              <span className="text-sm text-yellow-800">
                {currentStep === 1 &&
                  "Please select your teaching role to continue."}
                {currentStep === 2 &&
                  "Please select at least one subject, level, and age group."}
                {currentStep === 3 &&
                  "Please complete both the title (50+ chars) and about you (150+ chars) sections."}
                {currentStep === 4 &&
                  "Please fill in your city, country, and select at least one teaching mode."}
                {currentStep === 5 &&
                  "Please confirm your DBS check status to continue."}
                {currentStep === 7 &&
                  "Please set pricing for at least one session type."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnBoarding;
