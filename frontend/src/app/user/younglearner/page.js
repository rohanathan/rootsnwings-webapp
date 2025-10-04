"use client";
import React, { useState, useEffect, useRef } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import UserSidebar from "@/components/UserSidebar";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const YoungLearnerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youngLearners, setYoungLearners] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null); // Track which card's menu is open

  // Add Young Learner Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    interests: [],
    learningGoals: '',
    learningStyle: '',
    specialNeeds: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = '/api';
  const optionsMenuRef = useRef(null);

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
          const idToken = await currentUser.getIdToken();
          const profileResponse = await axios.get(
            `${API_BASE_URL}/users/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          const userData = profileResponse.data?.user || {};
          setUserProfile(userData);
          setUserRoles(userData.roles || []);
          
          // Redirect if not a parent
          if (!userData.roles?.includes('parent')) {
            window.location.href = '/user/dashboard';
            return;
          }
          
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRoles(['student']); // Fallback
        }
        
        setLoading(false);
      } else {
        window.location.href = "/getstarted";
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch young learners when user is available
  useEffect(() => {
    if (!user || !userRoles.includes('parent')) return;
    
    fetchYoungLearners();
  }, [user, userRoles]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const fetchYoungLearners = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${API_BASE_URL}/young-learners?parent_uid=${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      
      setYoungLearners(response.data?.profiles || []);
      
    } catch (error) {
      console.error('Error fetching young learners:', error);
      setYoungLearners([]);
    }
  };

  const handleAddYoungLearner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const idToken = await user.getIdToken();
      
      // Format the data correctly for the backend
      const youngLearnerPayload = {
        ...formData,
        interests: Array.isArray(formData.interests) ? formData.interests : 
                   formData.interests.split(',').map(i => i.trim()).filter(i => i)
      };
      
      await axios.post(
        `${API_BASE_URL}/young-learners/`,
        youngLearnerPayload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      // Reset form and close modal
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        interests: [],
        learningGoals: '',
        learningStyle: '',
        specialNeeds: ''
      });
      setShowAddModal(false);
      
      // Refresh the list
      fetchYoungLearners();
      
    } catch (error) {
      console.error('Error creating young learner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteYoungLearner = async (childId) => {
    if (!confirm('Are you sure you want to remove this child? This action cannot be undone.')) {
      return;
    }

    try {
      const idToken = await user.getIdToken();
      await axios.delete(
        `${API_BASE_URL}/young-learners/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      
      // Refresh the list
      fetchYoungLearners();
      setShowOptionsMenu(null);
      
    } catch (error) {
      console.error('Error deleting young learner:', error);
      alert('Failed to delete child. Please try again.');
    }
  };

  const handleEditYoungLearner = (child) => {
    // TODO: Implement edit functionality
    console.log('Edit child:', child);
    setShowOptionsMenu(null);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Function to toggle the mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
        <UserSidebar 
          isSidebarOpen={isSidebarOpen} 
          activeTab={0}
          userRoles={userRoles}
          youngLearners={youngLearners}
        />
        
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
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Young Learners</h1>
                  <p className="text-gray-600">Manage your children's learning profiles</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors mt-4 md:mt-0"
                >
                  <i className="fas fa-plus mr-2"></i>Add Child
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {youngLearners.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-child text-gray-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No children added yet</h3>
                <p className="text-gray-600 mb-6">Start your family learning journey by adding your first child.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Add Your First Child
                </button>
              </div>
            ) : (
              // Children List
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {youngLearners.map((child) => (
                  <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Child Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                          <span className="text-primary-dark font-bold text-lg">
                            {getInitials(child.fullName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{child.fullName}</h3>
                          <p className="text-gray-600">Age {calculateAge(child.dateOfBirth)}</p>
                          {child.interests && child.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {child.interests.slice(0, 3).map((interest, index) => (
                                <span key={index} className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm">
                                  {interest}
                                </span>
                              ))}
                              {child.interests.length > 3 && (
                                <span className="text-gray-500 text-sm">+{child.interests.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="relative" ref={optionsMenuRef}>
                          <button 
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                            onClick={() => setShowOptionsMenu(showOptionsMenu === child.id ? null : child.id)}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                          
                          {/* Options Menu */}
                          {showOptionsMenu === child.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <div className="py-2">
                                <button
                                  onClick={() => handleEditYoungLearner(child)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                  <i className="fas fa-edit mr-3 text-gray-500"></i>
                                  Edit Profile
                                </button>
                                <button
                                  onClick={() => handleDeleteYoungLearner(child.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                  <i className="fas fa-trash mr-3 text-red-500"></i>
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Child Details */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {child.learningGoals && (
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Learning Goals</h4>
                            <p className="text-gray-600 text-sm">{child.learningGoals}</p>
                          </div>
                        )}
                        
                        {child.learningStyle && (
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Learning Style</h4>
                            <p className="text-gray-600 text-sm capitalize">{child.learningStyle.replace('_', ' ')}</p>
                          </div>
                        )}
                        
                        {child.specialNeeds && (
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Special Notes</h4>
                            <p className="text-gray-600 text-sm">{child.specialNeeds}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => window.location.href = '/workshop/listing'}
                          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-search mr-2"></i>Find Classes for {child.fullName}
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

      {/* Add Young Learner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-90vh overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Child</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddYoungLearner} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter child's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., music, art, coding, sports"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Goals
                  </label>
                  <textarea
                    value={formData.learningGoals}
                    onChange={(e) => setFormData({...formData, learningGoals: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="What would you like your child to achieve?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Style
                  </label>
                  <select
                    value={formData.learningStyle}
                    onChange={(e) => setFormData({...formData, learningStyle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select learning style</option>
                    <option value="visual">Visual Learner</option>
                    <option value="auditory">Auditory Learner</option>
                    <option value="kinesthetic">Hands-on Learner</option>
                    <option value="reading">Reading/Writing Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Needs or Notes
                  </label>
                  <textarea
                    value={formData.specialNeeds}
                    onChange={(e) => setFormData({...formData, specialNeeds: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any special requirements, allergies, or notes for mentors"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>Add Child
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YoungLearnerPage;