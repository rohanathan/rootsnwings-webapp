"use client";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import UserSidebar from "@/components/UserSidebar";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  // State to manage the mobile sidebar's visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to manage the profile dropdown's visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // State to manage the active profile view (e.g., 'adult' or 'family')
  const [activeProfile, setActiveProfile] = useState("adult");

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [showAllUpcomingSessions, setShowAllUpcomingSessions] = useState(false);
  const [youngLearners, setYoungLearners] = useState([]);
  
  // Review Modal State  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  const [bookingsClasses, setBookingsClasses] = useState([]);

  // Firebase auth listener
  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Fetch full user profile with roles
          const idToken = await currentUser.getIdToken();
          const profileResponse = await axios.get(
            `/api/users/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          const userData = profileResponse.data?.user || {};
          setUserProfile(userData);
          setUserRoles(userData.roles || []);
          
          // Set activeProfile based on roles
          if (userData.roles?.includes("parent")) {
            setActiveProfile("family");
          } else {
            setActiveProfile("adult");
          }
          
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to basic profile
          setUserProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            roles: ["student"] // Default fallback
          });
          setUserRoles(["student"]);
        }
        
        setLoading(false);
      } else {
        window.location.href = "/getstarted";
      }
    });

    return () => unsubscribe();
  }, []);

  // Load bookings when user is available
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const idToken = await user.getIdToken();
        const bookingsResponse = await axios.get(
          `/api/bookings?studentId=${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setBookings(bookingsResponse.data?.bookings || []);

        bookingsResponse.data?.bookings.forEach(async (booking) => {
          try {
            const classResponse = await axios.get(
              `/api/classes/${booking.classId}`
            );
            setBookingsClasses((prev) => [...prev, classResponse.data?.class]);
          } catch (error) {
            console.error("Error fetching class data:", error);
          }
        });
      } catch (error) {}
    };

    fetchBookings();
  }, [user]);

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

  // Load young learners data for parent users
  useEffect(() => {
    const loadYoungLearners = async () => {
      if (!userRoles.includes("parent") || !user?.uid) return;

      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `/api/young-learners?parent_uid=${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (response.data?.profiles) {
          console.log('Dashboard: Young learners loaded:', response.data.profiles);
          setYoungLearners(response.data.profiles);
        } else {
          console.log('Dashboard: No profiles found in response:', response.data);
        }
      } catch (error) {
        console.error("Failed to load young learners:", error);
        // Don't show error for young learners - it's optional data
      }
    };

    if (userRoles.length > 0) {
      loadYoungLearners();
    }
  }, [userRoles, user]);

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

  // Review Modal Handlers
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewRating(0);
    setReviewText('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewRating(0);
    setReviewText('');
  };

  const submitReview = async () => {
    if (reviewRating === 0) {
      alert('Please select a rating');
      return;
    }
    if (reviewText.trim() === '') {
      alert('Please write a review');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const idToken = await user.getIdToken();
      await axios.post(
        '/api/reviews',
        {
          classId: selectedBooking.classId,
          rating: reviewRating,
          review: reviewText.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'X-Student-ID': user.uid
          }
        }
      );
      
      alert('Review submitted successfully!');
      closeReviewModal();
    } catch (error) {
      console.error('Failed to submit review:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 'Failed to submit review. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Function to toggle the mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Show loading while Firebase auth is resolving
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

          {/* Center: Profile Switcher - Role-based visibility */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {userRoles.includes("student") && (
              <button
                id="adult-profile-btn"
                onClick={() => setActiveProfile("adult")}
                className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                  activeProfile === "adult"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <i className="fas fa-user mr-2"></i>My Learning
              </button>
            )}
            {userRoles.includes("parent") && (
              <button
                id="family-profile-btn"
                onClick={() => setActiveProfile("family")}
                className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                  activeProfile === "family"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <i className="fas fa-users mr-2"></i>Family Learning
              </button>
            )}
          </div>

          <div className="relative">
            <MentorHeaderAccount
              isProfileDropdownOpen={isProfileDropdownOpen}
              handleProfileDropdownClick={toggleProfileDropdown}
              user={userProfile}
              mentorDetails={null}
            />
          </div>
        </div>
      </header>

      <div className="flex">
                 {/* Sidebar */}
         <UserSidebar isSidebarOpen={isSidebarOpen} activeTab={1} userRoles={userRoles} youngLearners={youngLearners} />

        {/* Overlay for mobile sidebar */}
        <div
          id="sidebar-overlay"
          onClick={toggleSidebar}
          className={`${
            isSidebarOpen ? "" : "hidden"
          } md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}
        ></div>

        {/* Main Content - Role-based */}
        <main className="flex-1 md:ml-0">
          {/* Empty State - Role-aware */}
          {bookings.length === 0 && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-light rounded-full mx-auto mb-6 flex items-center justify-center">
                  <i className="fas fa-rocket text-primary text-3xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Roots & Wings!
                </h1>
                
                {/* Role-specific welcome message */}
                {userRoles.includes("student") && userRoles.includes("parent") && (
                  <p className="text-lg text-gray-600 mb-8">
                    Start your family learning journey - book classes for yourself or your children.
                  </p>
                )}
                {userRoles.includes("student") && !userRoles.includes("parent") && (
                  <p className="text-lg text-gray-600 mb-8">
                    Let's get started with your personal learning journey.
                  </p>
                )}
                {!userRoles.includes("student") && userRoles.includes("parent") && (
                  <p className="text-lg text-gray-600 mb-8">
                    Set up your family learning hub - add your children and explore classes for them.
                  </p>
                )}
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
                  
                  {/* Student-only quick start */}
                  {userRoles.includes("student") && !userRoles.includes("parent") && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Find Your Perfect Mentor
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Browse our expert mentors and book your first learning session.
                      </p>
                      <button
                        onClick={() => (window.location.href = "/mentor/directory")}
                        className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                      >
                        <i className="fas fa-user-plus mr-2"></i>Explore Mentors
                      </button>
                    </>
                  )}
                  
                  {/* Parent-only quick start */}
                  {!userRoles.includes("student") && userRoles.includes("parent") && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Set Up Your Family Learning
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Add your children's profiles and discover amazing learning opportunities for them.
                      </p>
                      <div className="space-y-3">
                                                 <button
                           onClick={() => (window.location.href = "/user/younglearner")}
                           className={`w-full px-8 py-3 rounded-lg font-semibold transition-colors ${
                             youngLearners.length > 0 
                               ? 'bg-green-600 hover:bg-green-700 text-white' 
                               : 'bg-primary hover:bg-primary-dark text-white'
                           }`}
                         >
                           <i className={`fas ${youngLearners.length > 0 ? 'fa-cog' : 'fa-plus'} mr-2`}></i>
                           {youngLearners.length > 0 ? 'Manage Young Learners' : 'Add Your First Child'}
                         </button>
                        <button
                          onClick={() => (window.location.href = "/workshop/listing")}
                          className="w-full bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg hover:bg-primary-light transition-colors font-semibold"
                        >
                          <i className="fas fa-search mr-2"></i>Browse Classes for Kids
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Student + Parent quick start */}
                  {userRoles.includes("student") && userRoles.includes("parent") && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Start Learning Together
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Find mentors for yourself and set up learning for your children.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <button
                          onClick={() => (window.location.href = "/mentor/directory")}
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                        >
                          <i className="fas fa-user-graduate mr-2"></i>Find My Mentor
                        </button>
                                                 <button
                           onClick={() => (window.location.href = "/user/younglearner")}
                           className={`px-6 py-3 rounded-lg transition-colors font-semibold ${
                             youngLearners.length > 0 
                               ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                               : 'bg-green-600 hover:bg-green-700 text-white'
                           }`}
                         >
                           <i className={`fas ${youngLearners.length > 0 ? 'fa-cog' : 'fa-child'} mr-2`}></i>
                           {youngLearners.length > 0 ? 'Manage Children' : 'Add Children'}
                         </button>
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            </div>
          )}

          {bookings.length > 0 && (
            <>
              <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user.firstName}! 👋
                      </h1>
                      <p className="text-gray-600">
                        Your family learning journey continues today
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                      <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                        <i className="fas fa-video mr-2"></i>Join Today's
                        Session
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fas fa-search mr-2"></i>Find New Mentors
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Family Overview Stats */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    My Learning Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {user.role === "parent" && (
                      <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-users text-blue-600 text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">3</h3>
                        <p className="text-gray-600 text-sm">Active Learners</p>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-book text-green-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {bookingsClasses.reduce(
                          (total, bookingClass) =>
                            total +
                            (bookingClass.schedule.weeklySchedule.length || 0),
                          0
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm">Total Sessions</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-user-graduate text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {bookings.length}
                      </h3>
                      <p className="text-gray-600 text-sm">Mentors</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-star text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">40</h3>
                      <p className="text-gray-600 text-sm">Total Hours</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-book text-pink-600 text-xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">4</h3>
                      <p className="text-gray-600 text-sm">Total Classes</p>
                    </div>
                  </div>
                </section>

                {/* Upcoming Sessions & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Upcoming's Sessions
                        </h3>
                        {bookings.length > 3 && (
                          <button
                            onClick={() => setShowAllUpcomingSessions(!showAllUpcomingSessions)}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            {showAllUpcomingSessions ? "Show Less" : "View All"}
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {bookings.length > 0 ? (
                          (showAllUpcomingSessions ? bookings : bookings.slice(0, 3)).map((booking, index) => (
                            <div
                              key={booking.bookingId || `booking-${index}`}
                              className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-semibold">
                                    {booking.className?.charAt(0) || "C"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">
                                      {booking.className || "Class Session"}
                                    </h4>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        booking.status === "confirmed"
                                          ? "bg-green-100 text-green-800"
                                          : booking.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {booking.status || "Active"}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">
                                    Progress: {booking.completedSessions || 0}/
                                    {booking.totalSessions || 0} sessions
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span>
                                      <i className="fas fa-calendar mr-1"></i>
                                      {new Date(
                                        booking.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                    <span>
                                      <i className="fas fa-percentage mr-1"></i>
                                      {booking.progressPercentage || 0}%
                                      Complete
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openReviewModal(booking)}
                                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                                >
                                  Post Review
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <i className="fas fa-calendar-plus text-gray-400 text-xl"></i>
                            </div>
                            <p className="text-gray-600 mb-4">
                              No upcoming sessions
                            </p>
                            <button
                              onClick={() =>
                                (window.location.href = "/explore")
                              }
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
                        {/* <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                          <i className="fas fa-plus text-primary"></i>
                          <span className="font-medium">Add Young Learner</span>
                        </button> */}

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

                {/* <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Young Learners Progress
                    </h2>
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View Detailed Reports
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-primary">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            E
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Emma Johnson
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Age 12 • Music & Art
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Piano Progress</span>
                            <span className="text-purple-600">75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-primary h-2 rounded-full"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Watercolor Painting</span>
                            <span className="text-purple-600">60%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-primary h-2 rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          Next session: Today 4:00 PM
                        </span>
                        <button className="text-purple-primary hover:text-purple-600 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-primary">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            J
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Jake Johnson
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Age 15 • Coding & Maths
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Python Programming</span>
                            <span className="text-green-600">85%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-primary h-2 rounded-full"
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Advanced Algebra</span>
                            <span className="text-green-600">70%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-primary h-2 rounded-full"
                              style={{ width: "70%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          Next session: Today 6:00 PM
                        </span>
                        <button className="text-green-primary hover:text-green-600 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-check text-green-600 text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            Jake completed Python Basics - Module 3
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-star text-blue-600 text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            Emma received 5-star feedback from Marcus
                          </p>
                          <p className="text-xs text-gray-500">Yesterday</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-calendar text-purple-600 text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            You booked a session with Priya Sharma
                          </p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Messages & Updates
                    </h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Priya Sharma</p>
                            <p className="text-xs text-gray-500">
                              Classical Music Mentor
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">
                          "Great progress in today's lesson! Looking forward to
                          our next session."
                        </p>
                        <p className="text-xs text-gray-500 mt-2">1 hour ago</p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Alex Kumar</p>
                            <p className="text-xs text-gray-500">
                              Programming Mentor
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">
                          "Jake is doing excellent work with Python. Suggested
                          some extra practice exercises."
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
              <p className="text-gray-600">{selectedBooking.className}</p>
              <p className="text-sm text-gray-500">with {selectedBooking.mentorName}</p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Rating *</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this class..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={closeReviewModal}
                disabled={isSubmittingReview}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={isSubmittingReview || reviewRating === 0 || reviewText.trim() === ''}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
