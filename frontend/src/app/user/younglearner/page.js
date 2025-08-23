"use client";
import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import UserSidebar from "@/components/UserSidebar";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const YoungLearnerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [youngLearners, setYoungLearners] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingsByChild, setBookingsByChild] = useState({});

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

  const API_BASE_URL = 'https://rootsnwings-api-944856745086.europe-west2.run.app';

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
      
      // Fetch bookings for each young learner
      fetchBookingsForChildren(response.data?.profiles || []);
      
    } catch (error) {
      console.error('Error fetching young learners:', error);
      setYoungLearners([]);
    }
  };

  const fetchBookingsForChildren = async (children) => {
    try {
      const idToken = await user.getIdToken();
      const bookingsData = {};
      
      for (const child of children) {
        try {
          const bookingResponse = await axios.get(
            `${API_BASE_URL}/bookings?parentId=${user.uid}&youngLearnerName=${encodeURIComponent(child.fullName)}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          bookingsData[child.id] = bookingResponse.data?.bookings || [];
        } catch (error) {
          console.error(`Error fetching bookings for ${child.fullName}:`, error);
          bookingsData[child.id] = [];
        }
      }
      
      setBookingsByChild(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const getUpcomingBookings = (bookings) => {
    const today = new Date();
    return bookings.filter(booking => {
      if (booking.status !== 'confirmed') return false;
      
      if (booking.sessions && booking.sessions.length > 0) {
        return booking.sessions.some(session => 
          new Date(session.sessionDate) >= today && session.status === 'scheduled'
        );
      }
      
      return new Date(booking.startDate) >= today;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MentorHeaderAccount 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      
      <div className="flex">
        {/* Sidebar */}
        <UserSidebar 
          isSidebarOpen={isSidebarOpen} 
          activeTab={0}
          userRoles={userRoles}
        />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Children</h1>
                  <p className="text-gray-600">Manage your children's learning journey</p>
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
                {youngLearners.map((child) => {
                  const childBookings = bookingsByChild[child.id] || [];
                  const upcomingBookings = getUpcomingBookings(childBookings);
                  
                  return (
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
                          <button className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{childBookings.length}</div>
                            <div className="text-sm text-gray-600">Total Classes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{upcomingBookings.length}</div>
                            <div className="text-sm text-gray-600">Upcoming</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {childBookings.filter(b => b.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Sessions */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Upcoming Sessions</h4>
                        {upcomingBookings.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm mb-3">No upcoming sessions</p>
                            <button className="text-primary hover:text-primary-dark text-sm font-medium">
                              <i className="fas fa-plus mr-2"></i>Book New Class
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {upcomingBookings.slice(0, 2).map((booking, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                  <i className="fas fa-book text-primary text-sm"></i>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">
                                    {booking.classTitle || 'Class'}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {booking.sessions && booking.sessions[0] ? 
                                      new Date(booking.sessions[0].sessionDate).toLocaleDateString() :
                                      new Date(booking.startDate).toLocaleDateString()
                                    }
                                  </div>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Confirmed
                                </span>
                              </div>
                            ))}
                            {upcomingBookings.length > 2 && (
                              <button className="text-primary hover:text-primary-dark text-sm font-medium w-full text-center">
                                View all {upcomingBookings.length} sessions
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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