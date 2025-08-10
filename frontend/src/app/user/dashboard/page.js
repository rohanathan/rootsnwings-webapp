"use client";
import UserSidebar from "@/components/UserSidebar";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const Dashboard = () => {
  // State to manage the mobile sidebar's visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to manage the profile dropdown's visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // State to manage the active profile view (e.g., 'student' or 'family')
  const [activeProfile, setActiveProfile] = useState("student");
  
  const [user, setUser] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [youngLearners, setYoungLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  // Fetch user data and profile
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.user?.uid) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        setUser(userData.user);
        
        // Check if user has completed onboarding by checking localStorage first
        const onboardingCompleted = localStorage.getItem("onboardingCompleted");
        const userRolesFromStorage = localStorage.getItem("userRoles");
        
        if (onboardingCompleted === "true" && userRolesFromStorage) {
          // User has completed onboarding, use stored roles
          const roles = JSON.parse(userRolesFromStorage);
          setUserProfile(userData.user); // Use user data from auth
          setUserRoles(roles);
          
          // Set default active profile based on roles
          if (roles.includes("parent") && roles.includes("student")) {
            setActiveProfile("family");
          } else if (roles.includes("parent")) {
            setActiveProfile("parent"); // Parents get parent view
          } else {
            setActiveProfile("student"); // Students get student view
          }
        } else {
          // Fallback: Try to fetch from API
          try {
            const profileResponse = await axios.get(
              `https://rootsnwings-api-944856745086.europe-west2.run.app/users/me?user_id=${userData.user.uid}`
            );
            
            if (profileResponse.data?.user) {
              // Check if profile is complete
              if (!profileResponse.data.user.profileComplete) {
                console.log("Profile not complete, redirecting to onboarding");
                window.location.href = '/user/onboarding';
                return;
              }
              
              setUserProfile(profileResponse.data.user);
              const roles = profileResponse.data.user.roles || [];
              setUserRoles(roles);
              
              // Store in localStorage for future use
              localStorage.setItem("onboardingCompleted", "true");
              localStorage.setItem("userRoles", JSON.stringify(roles));
              
              // Set default active profile based on roles
              if (roles.includes("parent") && roles.includes("student")) {
                setActiveProfile("family");
              } else if (roles.includes("parent")) {
                setActiveProfile("parent"); // Parents get parent view
              } else {
                setActiveProfile("student"); // Students get student view
              }
            }
          } catch (profileError) {
            console.log("Profile not found, user likely needs to complete onboarding");
            console.log("Profile error:", profileError);
            // User hasn't completed onboarding - show empty state
          }
        }
        
        // Fetch user's bookings
        try {
          const bookingsResponse = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings/student/${userData.user.uid}`
          );
          setBookings(bookingsResponse.data || []);
        } catch (bookingError) {
          console.log("No bookings found");
          setBookings([]);
        }
        
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Load young learners data for parent users
  useEffect(() => {
    const loadYoungLearners = async () => {
      if (!userRoles.includes('parent') || !user.uid) return;
      
      try {
        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/users/me/profiles/parent?user_id=${user.uid}`
        );
        
        if (response.data?.profile?.youngLearners) {
          setYoungLearners(response.data.profile.youngLearners);
        }
      } catch (error) {
        console.error('Failed to load young learners:', error);
        // Don't show error for young learners - it's optional data
      }
    };

    if (userRoles.length > 0) {
      loadYoungLearners();
    }
  }, [userRoles, user.uid]);

  // Effect to handle window resize and close the mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to handle clicks outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        !event.target.closest("#profile-dropdown-btn") &&
        !event.target.closest("#profile-dropdown")
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Function to toggle the mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // JSX for the component
  return (
    <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-a0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              id="mobile-menu-btn"
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-primary"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">
              Roots & Wings
            </h1>
            <span className="hidden md:block text-sm text-gray-500">
              Family Learning Hub
            </span>
          </div>

          {/* Center: Profile Switcher - Only show if user has both student and parent roles */}
          {userRoles.includes('student') && userRoles.includes('parent') && (
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                id="student-profile-btn"
                onClick={() => setActiveProfile("student")}
                className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                  activeProfile === "student"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <i className="fas fa-user mr-2"></i>My Profile
              </button>
              <button
                id="family-profile-btn"
                onClick={() => setActiveProfile("family")}
                className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                  activeProfile === "family"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <i className="fas fa-users mr-2"></i>Family View
              </button>
            </div>
          )}

          <div className="relative">
            <MentorHeaderAccount
              isProfileDropdownOpen={isProfileDropdownOpen}
              profileDropdownBtnRef={profileDropdownBtnRef}
              toggleProfileDropdown={toggleProfileDropdown}
              profileDropdownRef={profileDropdownRef}
              user={user}
              mentorDetails={null}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <UserSidebar isSidebarOpen={isSidebarOpen} activeTab={1} />

        {/* Overlay for mobile sidebar */}
        <div
          id="sidebar-overlay"
          onClick={toggleSidebar}
          className={`${
            isSidebarOpen ? "" : "hidden"
          } md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}
        ></div>

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
                <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (!userProfile || userRoles.length === 0 || localStorage.getItem("onboardingCompleted") !== "true") ? (
            // Empty state for users who haven't completed onboarding
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-light rounded-full mx-auto mb-6 flex items-center justify-center">
                  <i className="fas fa-rocket text-primary text-3xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Roots & Wings!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Let's complete your profile to get started with your learning journey.
                </p>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Complete Your Setup
                  </h2>
                  <p className="text-gray-600 mb-6">
                    To get the most out of Roots & Wings, please complete your profile setup.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/user/onboarding'}
                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                  >
                    <i className="fas fa-user-plus mr-2"></i>Complete Profile
                  </button>
                </div>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            // Empty state for users with no bookings
            <div>
              {/* Welcome Section is still shown above */}
          {/* Welcome Section */}
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.displayName || 'there'}! 👋
                  </h1>
                  <p className="text-gray-600">
                    {activeProfile === 'family' && userRoles.includes('parent') && userRoles.includes('student')
                      ? 'Your family learning journey continues today'
                      : userRoles.includes('parent') && !userRoles.includes('student')
                      ? 'Manage your family\'s learning journey'
                      : userRoles.includes('student')
                      ? 'Your learning journey continues today'
                      : 'Ready to start your learning journey?'}
                  </p>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 mt-2">
                      Debug: Roles: [{userRoles.join(', ')}] | Active: {activeProfile} | Profile: {userProfile ? 'exists' : 'missing'} | Onboarding: {localStorage.getItem("onboardingCompleted")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                  {bookings.length > 0 ? (
                    <button 
                      onClick={() => window.location.href = '/user/sessions'}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <i className="fas fa-video mr-2"></i>View Sessions
                    </button>
                  ) : null}
                  <button 
                    onClick={() => window.location.href = '/explore'}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-search mr-2"></i>Find New Mentors
                  </button>
                </div>
              </div>
            </div>
          </div>

              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <i className="fas fa-calendar-plus text-gray-400 text-2xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to start learning?
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't booked any sessions yet. Explore our amazing mentors and start your learning journey today!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => window.location.href = '/mentor/directory'}
                      className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                    >
                      <i className="fas fa-search mr-2"></i>Browse Mentors
                    </button>
                    <button 
                      onClick={() => window.location.href = '/explore/workshops'}
                      className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      <i className="fas fa-users mr-2"></i>Find Workshops
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Dashboard with actual data
            <div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Learning Overview Stats */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {activeProfile === 'family' ? 'Family Learning Overview' : 'Learning Overview'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{bookings.length}</h3>
                  <p className="text-gray-600 text-sm">Active Bookings</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-check text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {bookings.reduce((total, booking) => total + (booking.totalSessions || 0), 0)}
                  </h3>
                  <p className="text-gray-600 text-sm">Total Sessions</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-graduate text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {new Set(bookings.map(booking => booking.mentorId)).size}
                  </h3>
                  <p className="text-gray-600 text-sm">Mentors</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-percentage text-orange-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {bookings.length > 0 ? Math.round(
                      bookings.reduce((total, booking) => 
                        total + (booking.progressPercentage || 0), 0) / bookings.length
                    ) : 0}%
                  </h3>
                  <p className="text-gray-600 text-sm">Avg Progress</p>
                </div>
              </div>
            </section>

            {/* Upcoming Sessions & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today's Sessions
                    </h3>
                    <a
                      href="#"
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      View All
                    </a>
                  </div>

                  <div className="space-y-4">
                    {bookings.length > 0 ? (
                      bookings.slice(0, 3).map((booking, index) => (
                        <div key={booking.bookingId} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold">
                                {booking.className?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {booking.className || 'Class Session'}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  booking.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.status || 'Active'}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Progress: {booking.completedSessions || 0}/{booking.totalSessions || 0} sessions
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>
                                  <i className="fas fa-calendar mr-1"></i>
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                                <span>
                                  <i className="fas fa-percentage mr-1"></i>
                                  {booking.progressPercentage || 0}% Complete
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => window.location.href = `/user/bookings/${booking.bookingId}`}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <i className="fas fa-calendar-plus text-gray-400 text-xl"></i>
                        </div>
                        <p className="text-gray-600 mb-4">No upcoming sessions</p>
                        <button 
                          onClick={() => window.location.href = '/explore'}
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Book Your First Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Quick Actions
                  </h3>
                  <div className="space-y-4">
                    {/* {userRoles.includes('parent') && (
                      <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                        <i className="fas fa-plus text-primary"></i>
                        <span className="font-medium">Add Young Learner</span>
                      </button>
                    )} */}

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-search text-primary"></i>
                      <span className="font-medium">Find New Mentors</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-calendar-plus text-primary"></i>
                      <span className="font-medium">Schedule Session</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-chart-line text-primary"></i>
                      <span className="font-medium">View Progress</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Young Learners Section (Only show for users with parent role) */}
            {/* {userRoles.includes('parent') && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Young Learners
                  </h2>
                  <button 
                    onClick={() => window.location.href = '/user/young-learners/add'}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>Add Young Learner
                  </button>
                </div>

                {youngLearners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {youngLearners.map((learner, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {learner.firstName?.[0]?.toUpperCase() || learner.name?.[0]?.toUpperCase() || 'Y'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {learner.firstName || learner.name} ({learner.age})
                            </h4>
                            <p className="text-sm text-gray-600">
                              {learner.interests?.join(', ') || 'No interests set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            <i className="fas fa-calendar mr-1"></i>
                            Next session: {learner.nextSession || 'None scheduled'}
                          </span>
                          <button className="text-primary hover:text-primary-dark font-medium">
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-primary-light rounded-full mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-child text-primary text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Young Learners Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add young learner profiles to manage their learning journey and book sessions for them.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/user/young-learners/add'}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Your First Young Learner
                    </button>
                  </div>
                )}
              </section>
            )} */}

            {/* Quick Actions for Getting Started */}
            {bookings.length === 0 && (
              <section className="mb-8">
                <div className="bg-gradient-to-r from-primary-light to-blue-50 rounded-xl p-8 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Discover amazing mentors and start your learning journey today!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => window.location.href = '/explore'}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                    >
                      <i className="fas fa-search mr-2"></i>Browse Mentors
                    </button>
                    <button 
                      onClick={() => window.location.href = '/explore/workshops'}
                      className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
                    >
                      <i className="fas fa-users mr-2"></i>Join Workshops
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
