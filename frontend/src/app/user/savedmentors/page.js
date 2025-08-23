"use client";
import UserSidebar from "@/components/UserSidebar";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const SavedMentorsPage = () => {
  // State to manage the mobile sidebar's visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to manage the profile dropdown's visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedMentorIds, setSavedMentorIds] = useState([]);
  const [savedMentors, setSavedMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [youngLearners, setYoungLearners] = useState([]);

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Fetch full user profile with roles
          const idToken = await currentUser.getIdToken();
          const profileResponse = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          const userData = profileResponse.data?.user || {};
          setUserProfile(userData);
          setUserRoles(userData.roles || []);
          
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

  // Load young learners data for parent users
  useEffect(() => {
    const loadYoungLearners = async () => {
      if (!userRoles.includes("parent") || !user?.uid) return;

      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=parent`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (response.data?.profile?.youngLearners) {
          setYoungLearners(response.data.profile.youngLearners);
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

  // Load data when user is available
  useEffect(() => {
    if (!user) return;

    // Fetch saved mentors
    const fetchSavedMentors = async () => {
      try {
        const idToken = await user.getIdToken();
        // Get saved mentor IDs from student profile
        const profileResponse = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=student`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        
        const mentorIds = profileResponse.data?.profile?.savedMentors || [];
        setSavedMentorIds(mentorIds);

        if (mentorIds.length > 0) {
          // Fetch all mentors and filter by saved IDs
          const mentorsResponse = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/`
          );
          
          const filteredMentors = mentorsResponse.data?.mentors?.filter(mentor => 
            mentorIds.includes(mentor.uid) && mentor.status === 'active'
          ) || [];
          
          setSavedMentors(filteredMentors);
        }
      } catch (error) {
        console.error("Error fetching saved mentors:", error);
      }
    };

    // Fetch categories for filtering
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://rootsnwings-api-944856745086.europe-west2.run.app/metadata/categories"
        );
        setCategories(response.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchSavedMentors();
    fetchCategories();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Remove mentor from saved list
  const removeSavedMentor = async (mentorId) => {
    if (!user) return;
    
    try {
      const idToken = await user.getIdToken();
      const updatedMentorIds = savedMentorIds.filter(id => id !== mentorId);
      
      // Update backend
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=student`,
        { savedMentors: updatedMentorIds },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      
      // Update local state
      setSavedMentorIds(updatedMentorIds);
      setSavedMentors(savedMentors.filter(mentor => mentor.uid !== mentorId));
    } catch (error) {
      console.error("Error removing saved mentor:", error);
    }
  };

  // Filter mentors by selected categories
  const filteredMentors = selectedCategories.length === 0 
    ? savedMentors 
    : savedMentors.filter(mentor => 
        mentor.subjects.some(subject => selectedCategories.includes(subject))
      );

  // Helper function to get initials
  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("") || "";
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
          <p className="text-gray-600">Loading saved mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
        <UserSidebar isSidebarOpen={isSidebarOpen} activeTab={4} userRoles={userRoles} youngLearners={youngLearners} />

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
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Mentors</h1>
                    <p className="text-gray-600 mt-1">
                      Showing {filteredMentors.length} of {savedMentors.length} saved mentors
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = "/mentor/directory"}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Explore More Mentors
                  </button>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center space-x-4">
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <i className="fas fa-filter text-gray-500"></i>
                      <span>
                        {selectedCategories.length === 0 
                          ? "Filter by Subject" 
                          : `${selectedCategories.length} subject${selectedCategories.length > 1 ? 's' : ''} selected`
                        }
                      </span>
                      <i className={`fas fa-chevron-down text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Filter by Subject</h4>
                            {selectedCategories.length > 0 && (
                              <button
                                onClick={() => setSelectedCategories([])}
                                className="text-xs text-primary hover:text-primary-dark"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categories.map((category) => (
                              <label key={category.categoryId} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={selectedCategories.includes(category.categoryId)}
                                  onChange={() => handleCategoryChange(category.categoryId)}
                                />
                                <span className="text-sm text-gray-700 flex-1">
                                  {category.categoryName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({category.subjectCount})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Categories Pills */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((categoryId) => {
                        const category = categories.find(c => c.categoryId === categoryId);
                        return (
                          <span
                            key={categoryId}
                            className="inline-flex items-center space-x-1 bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm"
                          >
                            <span>{category?.categoryName}</span>
                            <button
                              onClick={() => handleCategoryChange(categoryId)}
                              className="text-primary-dark hover:text-red-600 ml-1"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>

            {/* Saved Mentors Stats */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-heart text-red-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{savedMentors.length}</h3>
                  <p className="text-gray-600 text-sm">Saved Mentors</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-check text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">8</h3>
                  <p className="text-gray-600 text-sm">Previously Booked</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {savedMentors.filter(mentor => mentor.acceptingNewStudents?.oneOnOne).length}
                  </h3>
                  <p className="text-gray-600 text-sm">Available Today</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-star text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {savedMentors.length > 0 
                      ? (savedMentors.reduce((sum, mentor) => sum + mentor.stats.avgRating, 0) / savedMentors.length).toFixed(1)
                      : "0"
                    }
                  </h3>
                  <p className="text-gray-600 text-sm">Average Rating</p>
                </div>
              </div>
            </section>

            {/* Recently Added */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recently Added
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedMentors.slice(0, 2).map((mentor, index) => (
                      <div key={mentor.uid} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {getInitials(mentor.displayName)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {mentor.displayName}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {mentor.headline}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                <i className="fas fa-star text-yellow-500 text-xs"></i>
                                <span className="text-sm text-gray-600 ml-1">
                                  {mentor.stats.avgRating} ({mentor.stats.totalReviews} reviews)
                                </span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">
                                {mentor.city}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full text-center">
                              {mentor.acceptingNewStudents?.oneOnOne ? "Available" : "Busy"}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full text-center">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {savedMentors.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <p>No recently added mentors. Start saving your favorite mentors!</p>
                      </div>
                    )}
                    
                    {savedMentors.length === 1 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <i className="fas fa-plus text-2xl mb-2"></i>
                          <p className="text-sm">Save more mentors to see them here</p>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            {/* Mentors Grid */}
            {filteredMentors.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-heart text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {savedMentors.length === 0 ? "No Saved Mentors Yet" : "No mentors match your filters"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {savedMentors.length === 0 
                      ? "Browse our mentor directory and save your favorites"
                      : "Try adjusting your category filters"
                    }
                  </p>
                  {savedMentors.length === 0 && (
                    <button
                      onClick={() => window.location.href = "/mentor/directory"}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Browse Mentors
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => (
                    <div
                      key={mentor.uid}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Mentor Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {getInitials(mentor.displayName)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {mentor.displayName}
                              </h3>
                              {mentor.isVerified && (
                                <i className="fas fa-check-circle text-blue-500 text-sm" title="Verified"></i>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{mentor.headline}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <i className="fas fa-star text-yellow-500 mr-1"></i>
                              <span>{mentor.stats.avgRating} ({mentor.stats.totalReviews} reviews)</span>
                              <span className="mx-2">•</span>
                              <span>{mentor.city}, {mentor.region}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSavedMentor(mentor.uid)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove from saved"
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>

                      {/* Subject Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary text-white text-xs rounded-full"
                          >
                            {subject.charAt(0).toUpperCase() + subject.slice(1).replaceAll("_", " ")}
                          </span>
                        ))}
                        {mentor.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{mentor.subjects.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            £{mentor.pricing.oneOnOneRate || mentor.pricing.groupRate}/hour
                          </span>
                          {mentor.pricing.firstSessionFree && (
                            <span className="text-gray-500 ml-2">• First session free</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              localStorage.setItem("mentor", JSON.stringify(mentor));
                              window.location.href = "/mentor/detailpage";
                            }}
                            className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SavedMentorsPage;