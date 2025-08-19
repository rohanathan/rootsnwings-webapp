"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";

const UserOnboardingFlow = () => {
  // State to manage the current step of the onboarding process
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Total number of steps in the flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // {
  //     "userId": "string",
  //     "phone": "string",
  //     "city": "string",
  //     "region": "string",
  //     "country": "string",
  //     "postcode": "string",
  //     "roles": [
  //       "string"
  //     ],
  //     "learningGoals": "string",
  //     "interests": [
  //       "string"
  //     ],
  //     "learningStyle": "string",

  //     "emergencyContactName": "string",
  //     "emergencyContactPhone": "string",
  //     "preferredContactMethod": "string"
  //   }

  // State to hold all form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    city: "",
    region: "",
    country: "",
    postcode: "",
    selectedRoles: [],
    studentProfile: {
      learningGoals: "",
      selectedInterests: [],
      customInterest: "",
      learningStyle: "",
    },
    parentProfile: {
      emergencyContactName: "",
      emergencyContactPhone: "",
      preferredContactMethod: "",
    },
  });

  // Predefined interests for the student profile step
  const predefinedInterests = [
    "Math",
    "Science",
    "English",
    "History",
    "Art",
    "Music",
    "Coding",
    "Robotics",
    "Public Speaking",
    "Photography",
    "Sports",
    "Cooking",
  ];

  // State for managing custom interest input
  const [customInterest, setCustomInterest] = useState("");

  // Update the document title based on the current step
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user.user.displayName;
    const email = user.user.email;

    setFormData((prev) => ({
      ...prev,
      username: username,
      email: email,
    }));

    // Clear error and success when step changes
    setError("");
    setSuccess(false);

    const stepTitles = {
      1: "Welcome",
      2: "Roles",
      3: "Student Profile",
      4: "Parent Profile",
      5: "Summary", // The final summary step
    };
    const title = stepTitles[currentStep] || "Complete Your Profile";
    document.title = `${title} - Roots & Wings`;
  }, [currentStep]);

  // A helper function to handle input changes for Step 1
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // A helper function to toggle the selection of a role card in Step 2
  const handleRoleToggle = (role) => {
    setFormData((prev) => {
      const currentRoles = prev.selectedRoles;
      if (currentRoles.includes(role)) {
        return {
          ...prev,
          selectedRoles: currentRoles.filter((r) => r !== role),
        };
      } else {
        return { ...prev, selectedRoles: [...currentRoles, role] };
      }
    });
  };

  // A helper function to handle form changes for the Student profile (Step 3)
  const handleStudentProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      studentProfile: {
        ...prev.studentProfile,
        [name]: value,
      },
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // A helper function to toggle interest selection in Step 3
  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const currentInterests = prev.studentProfile.selectedInterests;
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          studentProfile: {
            ...prev.studentProfile,
            selectedInterests: currentInterests.filter((i) => i !== interest),
          },
        };
      } else {
        return {
          ...prev,
          studentProfile: {
            ...prev.studentProfile,
            selectedInterests: [...currentInterests, interest],
          },
        };
      }
    });
  };

  // A helper function to add a custom interest in Step 3
  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim();
    if (
      trimmedInterest &&
      !formData.studentProfile.selectedInterests.includes(trimmedInterest)
    ) {
      handleInterestToggle(trimmedInterest);
      setCustomInterest("");
    }
  };

  // A helper function to handle form changes for the Parent profile (Step 4)
  const handleParentProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      parentProfile: {
        ...prev.parentProfile,
        [name]: value,
      },
    }));
  };

  // Helper to determine the next step
  const getNextStep = () => {
    if (currentStep === 1) {
      return 2;
    } else if (currentStep === 2) {
      if (formData.selectedRoles.includes("student")) {
        return 3;
      } else if (formData.selectedRoles.includes("parent")) {
        return 4;
      } else {
        // If no roles are selected, show an error or just stay on the same step
        return 2;
      }
    } else if (currentStep === 3 && formData.selectedRoles.includes("parent")) {
      return 4;
    } else {
      return 5;
    }
  };

  // Handle form submission and step progression
  const handleNextStep = async (e) => {
    e.preventDefault();

    // Simple validation for current step
    if (
      currentStep === 1 &&
      (!formData.phoneNumber ||
        !formData.city ||
        !formData.region ||
        !formData.country)
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (currentStep === 2 && formData.selectedRoles.length === 0) {
      alert("Please select at least one role to continue.");
      return;
    }
    if (
      currentStep === 3 &&
      (!formData.studentProfile.learningGoals ||
        formData.studentProfile.selectedInterests.length < 3)
    ) {
      alert(
        "Please describe your learning goals and select at least 3 interests."
      );
      return;
    }
    if (
      currentStep === 4 &&
      (!formData.parentProfile.emergencyContactName ||
        !formData.parentProfile.emergencyContactPhone ||
        !formData.parentProfile.preferredContactMethod)
    ) {
      alert("Please fill in all required parent profile fields.");
      return;
    }

    // If we're on step 3 and validation passes, post data to API
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user.user.uid;

        // Prepare the data payload according to the required format
        const userOnboardingData = {
          userId: userId,
          phone: formData.phoneNumber,
          city: formData.city,
          region: formData.region,
          country: formData.country,
          postcode: formData.postcode,
          roles: formData.selectedRoles,
          learningGoals: formData.studentProfile.learningGoals,
          interests: formData.studentProfile.selectedInterests,
          learningStyle: formData.studentProfile.learningStyle,
          emergencyContactName: formData.parentProfile.emergencyContactName,
          emergencyContactPhone: formData.parentProfile.emergencyContactPhone,
          preferredContactMethod: formData.parentProfile.preferredContactMethod,
        };

        // Make API call to /user-onboarding
        const response = await axios.post(
          "https://rootsnwings-api-944856745086.europe-west2.run.app/user-onboarding",
          userOnboardingData
        );

        console.log(response, "response response response");

        if (response.status === 200 || response.status === 201) {
          console.log(
            "User onboarding data saved successfully:",
            response.data
          );
          setSuccess(true);
          // Move to next step on success after a short delay
          const nextStep = getNextStep();
          if (nextStep) {
            setTimeout(() => {
              setCurrentStep(nextStep);
            }, 1500); // 1.5 second delay to show success message
          }
        }
      } catch (error) {
        console.error("Error saving user onboarding data:", error);
        setError("There was an error saving your data. Please try again.");
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For other steps, just move to next step
      const nextStep = getNextStep();
      if (nextStep) {
        console.log("Moving to next step:", formData);
        setCurrentStep(nextStep);
      } else {
        // Final submission logic
        console.log("Final form submission:", formData);
        // alert('Profile setup complete! (This is a demo)');
      }
    }
  };

  // Handle going back a step
  const handleBackStep = (e) => {
    e.preventDefault();
    if (
      currentStep === 2 &&
      formData.selectedRoles.includes("student") &&
      !formData.selectedRoles.includes("parent")
    ) {
      setCurrentStep(1);
    } else if (
      currentStep === 3 &&
      formData.selectedRoles.includes("student")
    ) {
      setCurrentStep(2);
    } else if (currentStep === 4 && formData.selectedRoles.includes("parent")) {
      setCurrentStep(3);
    } else if (
      currentStep === 4 &&
      !formData.selectedRoles.includes("student")
    ) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitPreferences = async (e) => {


    e.preventDefault();
    window.location.href = '/user/dashboard';
    // alert("Final form submission:", formData);
    // e.preventDefault();
    // console.log("Final form submission:", formData);

    // const user = JSON.parse(localStorage.getItem("user"));
    // const userId = user.user.uid;
    // // Prepare the data payload
    // console.log(userId, "userId userId");

    // const studentData = {
    //   userId: userId,
    //   interests: formData.studentProfile.selectedInterests,
    //   learningGoals: formData.studentProfile.learningGoals,
    //   preferredLanguages: [],

    //   ageGroup: "adult",
    //   step: 1,
    //   location: {
    //     city: "Birmingham",
    //     region: "England",
    //     country: "UK",
    //     postcode: "B1 1AA",
    //     geo: {
    //       lat: 52.4862,
    //       lng: -1.8904,
    //     },
    //   },
    //   learningPreferences: {
    //     learningStyle: formData.studentProfile.learningStyle,
    //   },
    //   learningGoals: "want to become",
    //   preferredLanguages: ["english", "french"],
    // };

    // try {
    //   const response = await axios.post(
    //     "https://rootsnwings-api-944856745086.europe-west2.run.app/onboarding/student/save-progress",
    //     studentData
    //   );
    //   if (response.status === 200) {
    //     // Redirect to dashboard or next step
    //     // window.location.href = '/dashboard';
    //   }
    // } catch (error) {
    //   console.error("Error saving student progress:", error);
    //   alert("There was an error saving your preferences. Please try again.");
    // }
  };

  // Calculate progress bar width
  const progressBarWidth = `${(currentStep / (totalSteps + 1)) * 100}%`;

  return (
    <>
      <Head>
        <title>Complete Your Profile - Roots & Wings</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          id="tailwind-config"
          dangerouslySetInnerHTML={{
            __html: `
                            tailwind.config = {
                                theme: {
                                    extend: {
                                        colors: {
                                            primary: '#00A2E8',
                                            'primary-dark': '#00468C',
                                            'primary-light': '#f8fbff',
                                            'accent-light': '#e8f4ff',
                                            'green-500': '#22C55E',
                                            'blue-100': '#DBEAFE',
                                            'blue-600': '#2563EB',
                                            'purple-100': '#EDE9FE',
                                            'purple-600': '#7C3AED'
                                        },
                                        fontFamily: {
                                            sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
                                        }
                                    }
                                }
                            }
                        `,
          }}
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="font-sans text-gray-800 bg-primary-light min-h-screen flex flex-col">
        {/* Header Component */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary-dark">
                Roots & Wings
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <i className="fas fa-shield-alt mr-2 text-green-500"></i>
                Secure Setup
              </div>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
          {/* Progress Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Step <span id="current-step">{currentStep}</span> of{" "}
                  <span id="total-steps">{totalSteps}</span>
                </span>
                <div className="text-sm text-gray-500" id="step-title">
                  {currentStep === 1 && "Welcome"}
                  {currentStep === 2 && "Roles"}
                  {currentStep === 3 && "Student Profile"}
                  {currentStep === 4 && "Parent Profile"}
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <i className="fas fa-save mr-1 text-green-500"></i>
                Auto-saved
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((step) => (
                <>
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < totalSteps && (
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                  )}
                </>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: progressBarWidth }}
              ></div>
            </div>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-96">
            {/* Step 1: Welcome & Basic Info */}
            {currentStep === 1 && (
              <form onSubmit={handleNextStep}>
                <div className="step-content p-8" data-step="1">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                      <i className="fas fa-user-circle text-white text-2xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      Welcome to Roots & Wings!
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                      Let's complete your profile so we can personalize your
                      learning experience.
                    </p>

                    {/* Basic Info Form */}
                    <div className="space-y-6 text-left">
                      {/* Display Name (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-user mr-2 text-primary"></i>Your
                          Name
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                          {formData.username}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          You can update this later in your profile settings
                        </p>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="phone-number"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-phone mr-2 text-primary"></i>
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <div className="px-3 py-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50 text-gray-600">
                            +44
                          </div>
                          <input
                            type="tel"
                            id="phone-number"
                            name="phoneNumber"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="10"
                            value={formData.phoneNumber}
                            onChange={handleBasicInfoChange}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="7700 900123"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          We'll use this for important updates and booking
                          confirmations
                        </p>
                      </div>

                      {/* City */}
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleBasicInfoChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="Birmingham"
                          required
                        />
                      </div>

                      {/* Region/County/State */}
                      <div>
                        <label
                          htmlFor="region"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-map mr-2 text-primary"></i>
                          County/State/Province{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="region"
                          name="region"
                          value={formData.region}
                          onChange={handleBasicInfoChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="West Midlands"
                          required
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-globe mr-2 text-primary"></i>
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleBasicInfoChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="United Kingdom"
                          required
                        />
                      </div>

                      {/* Postcode (Optional) */}
                      <div>
                        <label
                          htmlFor="postcode"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-mail-bulk mr-2 text-primary"></i>
                          Postcode{" "}
                          <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="postcode"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleBasicInfoChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="B15 2TT"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Helps us find mentors and workshops near you
                        </p>
                      </div>

                      {/* Email (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="fas fa-envelope mr-2 text-primary"></i>
                          Email Address
                        </label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                          {formData.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Navigation Buttons for Step 1 */}
                  <div className="flex justify-end items-center mt-8">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Next Step <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <form onSubmit={handleNextStep}>
                <div className="step-content p-8" data-step="2">
                  <div className="max-w-3xl mx-auto text-center">
                    <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                      <i className="fas fa-users text-white text-2xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      How will you use Roots & Wings?
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                      Select all that apply. You can always add more roles
                      later.
                    </p>

                    {/* Role Selection Cards */}
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      {/* Student Role */}
                      <div
                        onClick={() => handleRoleToggle("student")}
                        className={`role-card border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                          formData.selectedRoles.includes("student")
                            ? "border-primary shadow-lg"
                            : "border-gray-200 hover:border-primary hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              I want to learn
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Book sessions with mentors, join workshops, and
                              track your learning progress.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-1">
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                One-on-one mentoring sessions
                              </li>
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                Group classes and workshops
                              </li>
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                Learning progress tracking
                              </li>
                            </ul>
                          </div>
                          <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center">
                            <i
                              className={`fas fa-check text-primary ${
                                !formData.selectedRoles.includes("student")
                                  ? "hidden"
                                  : ""
                              }`}
                            ></i>
                          </div>
                        </div>
                      </div>

                      {/* Parent Role */}
                      <div
                        onClick={() => handleRoleToggle("parent")}
                        className={`role-card border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                          formData.selectedRoles.includes("parent")
                            ? "border-primary shadow-lg"
                            : "border-gray-200 hover:border-primary hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-heart text-purple-600 text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              I'm a parent/guardian
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Manage learning experiences for your children and
                              family members.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-1">
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                Create young learner profiles
                              </li>
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                Book sessions for your children
                              </li>
                              <li>
                                <i className="fas fa-check text-green-500 mr-2"></i>
                                Family learning dashboard
                              </li>
                            </ul>
                          </div>
                          <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center">
                            <i
                              className={`fas fa-check text-primary ${
                                !formData.selectedRoles.includes("parent")
                                  ? "hidden"
                                  : ""
                              }`}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mentor CTA */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Want to become a mentor?
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Share your expertise and help others learn with our
                          dedicated mentor program.
                        </p>
                        <a
                          href="/become-mentor"
                          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200"
                        >
                          <i className="fas fa-chalkboard-teacher mr-2"></i>
                          Become a Mentor
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Navigation Buttons for Step 2 */}
                <div className="flex justify-between items-center p-8">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next Step <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Student Profile (Conditional) */}
            {currentStep === 3 &&
              formData.selectedRoles.includes("student") && (
                <form onSubmit={handleNextStep}>
                  <div className="step-content p-8" data-step="3">
                    <div className="max-w-2xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary-dark rounded-full mx-auto mb-6 flex items-center justify-center">
                          <i className="fas fa-graduation-cap text-white text-2xl"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          Tell us about your learning goals
                        </h1>
                        <p className="text-lg text-gray-600">
                          This helps us match you with the right mentors and
                          recommend relevant workshops.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Learning Goals */}
                        <div>
                          <label
                            htmlFor="learning-goals"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            <i className="fas fa-bullseye mr-2 text-primary"></i>
                            What do you want to learn or achieve?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="learning-goals"
                            name="learningGoals"
                            rows="4"
                            value={formData.studentProfile.learningGoals}
                            onChange={handleStudentProfileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Learn to play guitar, improve my public speaking skills, master watercolor painting, get better at coding..."
                            required
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1">
                            Be specific about your goals - it helps mentors
                            understand how to help you best
                          </p>
                        </div>

                        {/* Interests/Subjects */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            <i className="fas fa-heart mr-2 text-primary"></i>
                            What subjects interest you?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {predefinedInterests.map((interest) => (
                              <button
                                key={interest}
                                type="button"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                                  formData.studentProfile.selectedInterests.includes(
                                    interest
                                  )
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                                onClick={() => handleInterestToggle(interest)}
                              >
                                {interest}
                              </button>
                            ))}
                            {formData.studentProfile.selectedInterests
                              .filter((i) => !predefinedInterests.includes(i))
                              .map((interest) => (
                                <button
                                  key={interest}
                                  type="button"
                                  className="px-4 py-2 rounded-full font-medium transition-all duration-200 bg-primary text-white shadow-md"
                                  onClick={() => handleInterestToggle(interest)}
                                >
                                  {interest}
                                </button>
                              ))}
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <input
                              type="text"
                              id="custom-interest"
                              placeholder="Add your own interest..."
                              value={customInterest}
                              onChange={(e) =>
                                setCustomInterest(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addCustomInterest();
                                }
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={addCustomInterest}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Select at least 3 interests that excite you
                          </p>
                        </div>

                        {/* Learning Style (Optional) */}
                        <div>
                          <label
                            htmlFor="learning-style"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            <i className="fas fa-brain mr-2 text-primary"></i>
                            How do you prefer to learn?{" "}
                            <span className="text-gray-400">(Optional)</span>
                          </label>
                          <select
                            id="learning-style"
                            name="learningStyle"
                            value={formData.studentProfile.learningStyle}
                            onChange={handleStudentProfileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          >
                            <option value="">
                              Choose your learning style...
                            </option>
                            <option value="visual">
                              Visual - I learn best with images, diagrams, and
                              demonstrations
                            </option>
                            <option value="auditory">
                              Auditory - I learn best by listening and
                              discussing
                            </option>
                            <option value="kinesthetic">
                              Kinesthetic - I learn best through hands-on
                              practice
                            </option>
                            <option value="mixed">
                              Mixed - I like a combination of different
                              approaches
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                          <span className="text-red-700">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Success Display */}
                    {success && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span className="text-green-700">
                            Data saved successfully! Moving to next step...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Navigation Buttons for Step 3 */}
                  <div className="flex justify-between items-center p-8">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          {formData.selectedRoles.includes("parent")
                            ? "Next Step"
                            : "Complete Setup"}
                          <i className="fas fa-arrow-right ml-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            {/* Step 4: Parent Profile (Conditional) */}
            {currentStep === 4 && formData.selectedRoles.includes("parent") && (
              <form onSubmit={handleNextStep}>
                <div className="step-content p-8" data-step="4">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-primary-dark rounded-full mx-auto mb-6 flex items-center justify-center">
                        <i className="fas fa-heart text-white text-2xl"></i>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Parent Profile
                      </h1>
                      <p className="text-lg text-gray-600">
                        Provide some information to help us support you as a
                        parent or guardian.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Emergency Contact Name */}
                      <div>
                        <label
                          htmlFor="emergency-contact-name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-user-shield mr-2 text-primary"></i>
                          Emergency Contact Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="emergency-contact-name"
                          name="emergencyContactName"
                          value={formData.parentProfile.emergencyContactName}
                          onChange={handleParentProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="e.g., Sarah Smith"
                          required
                        />
                      </div>

                      {/* Emergency Contact Phone */}
                      <div>
                        <label
                          htmlFor="emergency-contact-phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-phone-alt mr-2 text-primary"></i>
                          Emergency Contact Phone{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="emergency-contact-phone"
                          name="emergencyContactPhone"
                          value={formData.parentProfile.emergencyContactPhone}
                          onChange={handleParentProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          placeholder="e.g., 7700 900123"
                          required
                        />
                      </div>

                      {/* Preferred Contact Method */}
                      <div>
                        <label
                          htmlFor="preferred-contact"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          <i className="fas fa-hand-point-right mr-2 text-primary"></i>
                          Preferred Contact Method{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="preferred-contact"
                          name="preferredContactMethod"
                          value={formData.parentProfile.preferredContactMethod}
                          onChange={handleParentProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Select a method...</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Call</option>
                          <option value="sms">SMS / Text Message</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Navigation Buttons for Step 4 */}
                <div className="flex justify-between items-center p-8">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Complete Setup <i className="fas fa-check ml-2"></i>
                  </button>
                </div>
              </form>
            )}

            {/* Final Summary Step */}
            {currentStep === 5 && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <i className="fas fa-check-circle text-white text-2xl"></i>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Setup Complete!
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Your profile has been created successfully. Welcome to Roots
                    & Wings!
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 text-left border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">
                      Your Profile Summary
                    </h2>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <span className="font-medium">Name:</span> John Smith
                      </li>
                      <li>
                        <span className="font-medium">Phone:</span>{" "}
                        {formData.phoneNumber}
                      </li>
                      <li>
                        <span className="font-medium">Location:</span>{" "}
                        {formData.city}, {formData.region}, {formData.country}
                        {formData.postcode ? ` ${formData.postcode}` : ""}
                      </li>
                      {formData.selectedRoles.length > 0 && (
                        <li>
                          <span className="font-medium">Roles:</span>{" "}
                          {formData.selectedRoles
                            .map(
                              (role) =>
                                role.charAt(0).toUpperCase() + role.slice(1)
                            )
                            .join(", ")}
                        </li>
                      )}
                      {formData.selectedRoles.includes("student") && (
                        <li>
                          <span className="font-medium">Learning Goals:</span>{" "}
                          {formData.studentProfile.learningGoals}
                        </li>
                      )}
                      {formData.selectedRoles.includes("student") && (
                        <li>
                          <span className="font-medium">Interests:</span>{" "}
                          {formData.studentProfile.selectedInterests.join(", ")}
                        </li>
                      )}
                      {formData.selectedRoles.includes("student") &&
                        formData.studentProfile.learningStyle && (
                          <li>
                            <span className="font-medium">Learning Style:</span>{" "}
                            {formData.studentProfile.learningStyle
                              .charAt(0)
                              .toUpperCase() +
                              formData.studentProfile.learningStyle.slice(1)}
                          </li>
                        )}
                      {formData.selectedRoles.includes("parent") && (
                        <>
                          <li>
                            <span className="font-medium">
                              Emergency Contact:
                            </span>{" "}
                            {formData.parentProfile.emergencyContactName}
                          </li>
                          <li>
                            <span className="font-medium">Contact Method:</span>{" "}
                            {formData.parentProfile.preferredContactMethod
                              .charAt(0)
                              .toUpperCase() +
                              formData.parentProfile.preferredContactMethod.slice(
                                1
                              )}
                          </li>
                        </>
                      )}

                      <button
                        onClick={handleSubmitPreferences}
                        type="submit"
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center mx-auto"
                      >
                        My Homepage <i className="fas fa-check ml-2"></i>
                      </button>
                    </ul>
                  </div>

                  {/* Next Steps (Conditional) */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
                    {formData.selectedRoles.includes("student") && (
                      <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <i className="fas fa-book-open mr-2"></i> Find a Mentor
                      </a>
                    )}
                    {formData.selectedRoles.includes("parent") && (
                      <a
                        href="/"
                        className="inline-flex items-center ml-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <i className="fas fa-users mr-2"></i> Manage Learner
                        Profiles
                      </a>
                    )}
                    {!formData.selectedRoles.includes("student") &&
                      !formData.selectedRoles.includes("parent") && (
                        <a
                          href="/"
                          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <i className="fas fa-home mr-2"></i> Go to Dashboard
                        </a>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer Component */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-gray-600">
              <p>
                &copy; 2025 Roots & Wings. Empowering learners across the UK.
              </p>
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <a
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </a>
                <a
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms
                </a>
                <a
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UserOnboardingFlow;