"use client"
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/NavBar";
import UserSidebar from "@/components/UserSidebar";
import axios from "axios";

// Placeholder for static data - will be replaced with real data
const mentorsData = [];

const SavedMentorsPage = () => {
  const [user, setUser] = useState({});
  const [savedMentors, setSavedMentors] = useState([]);
  const [mentorsData, setMentorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [learnerFilter, setLearnerFilter] = useState('all');
  const [subjectFilters, setSubjectFilters] = useState(['music', 'art', 'coding', 'maths', 'language']);
  
  // Mentor cards to display based on filters
  const [filteredMentors, setFilteredMentors] = useState([]);
  
  // Fetch user data and saved mentors
  const fetchUserAndSavedMentors = async () => {
    try {
      // Get user from localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.user) {
          setUser(user.user);
          
          // Fetch saved mentors
          const response = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.user.uid}?profile_type=student`
          );
          
          if (response.data && response.data.profile && response.data.profile.savedMentors) {
            setSavedMentors(response.data.profile.savedMentors);
            
            // Fetch mentor details for each saved mentor
            const mentorPromises = response.data.profile.savedMentors.map(mentorId =>
              axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${mentorId}`)
            );
            
            const mentorResponses = await Promise.all(mentorPromises);
            const mentors = mentorResponses
              .filter(response => response.data && response.data.mentor)
              .map(response => response.data.mentor);
            
            setMentorsData(mentors);
            setFilteredMentors(mentors);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching saved mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedMentor = async (mentorId) => {
    if (!user.uid) return;

    try {
      const newSavedMentors = savedMentors.filter(id => id !== mentorId);
      setSavedMentors(newSavedMentors);
      
      // Update backend
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=student`,
        {
          savedMentors: newSavedMentors
        }
      );
      
      // Update local data
      const newMentorsData = mentorsData.filter(mentor => mentor.uid !== mentorId);
      setMentorsData(newMentorsData);
      setFilteredMentors(newMentorsData);
    } catch (error) {
      console.error('Error removing saved mentor:', error);
    }
  };

  useEffect(() => {
    fetchUserAndSavedMentors();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isProfileDropdownOpen && !e.target.closest('#profile-dropdown-btn') && !e.target.closest('#profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    const applyFilters = () => {
      const newFilteredMentors = mentorsData.filter(mentor => {
        // For now, just return all mentors since we don't have learner/subject mapping
        // This can be enhanced later with proper data structure
        return true;
      });
      setFilteredMentors(newFilteredMentors);
    };
    applyFilters();
  }, [learnerFilter, subjectFilters, mentorsData]);

  const handleLearnerFilterClick = (filter) => {
    setLearnerFilter(filter);
  };

  const handleSubjectFilterChange = (subject) => {
    setSubjectFilters(prevSubjects =>
      prevSubjects.includes(subject)
        ? prevSubjects.filter(s => s !== subject)
        : [...prevSubjects, subject]
    );
  };
  
  // Helper function to get initials for the mentor's profile picture
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || ""
    );
  };

  // Helper function to render a mentor card
  const MentorCard = ({ mentor }) => (
    <div className="mentor-card bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {getInitials(mentor.displayName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{mentor.displayName}</h3>
              <i className="fas fa-check-circle text-blue-500 text-sm" title="Verified Mentor"></i>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {mentor.subjects && mentor.subjects.length > 0 
                ? mentor.subjects.slice(0, 2).join(" • ") 
                : "Mentor"}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-star text-yellow-500 mr-1"></i>
                <span>{mentor.stats?.avgRating || 0} ({mentor.stats?.totalReviews || 0} reviews)</span>
              </div>
              <span>{mentor.city}, {mentor.region}</span>
            </div>
          </div>
        </div>
        <button 
          className="text-red-500 hover:text-red-700 p-2" 
          title="Remove from saved"
          onClick={() => removeSavedMentor(mentor.uid)}
        >
          <i className="fas fa-heart text-lg"></i>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Saved</span>
        {mentor.teachingModes && mentor.teachingModes.map((mode, index) => (
          <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">From £{mentor.pricing?.oneOnOneRate || mentor.pricing?.groupRate || 0}/hour</span>
          {mentor.pricing?.firstSessionFree && (
            <span className="text-gray-400"> • First session free</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-primary hover:text-primary-dark text-sm">Message</button>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-colors"
            onClick={() => {
              localStorage.setItem("mentor", JSON.stringify(mentor));
              window.location.href = "/mentor/detailpage";
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <body className="font-sans text-gray-800 bg-white">
        <Navbar user={user} />

        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading saved mentors...</p>
            </div>
          </div>
        ) : (
          <div className="font-sans text-gray-800 bg-primary-light min-h-screen pt-16">

        <div className="flex">
          {/* Sidebar */}
          <UserSidebar isSidebarOpen={isMobileMenuOpen} activeTab={4} />
          {/* Overlay for mobile sidebar */}
          {isMobileMenuOpen && (
            <div id="sidebar-overlay" className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}
          {/* Main Content */}
          <main className="flex-1 md:ml-0">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Mentors</h1>
                    <p className="text-gray-600">Your family's favorite mentors for easy booking</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                    <button id="sort-dropdown-btn" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <i className="fas fa-sort mr-2"></i>Sort by Rating
                      <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                      <i className="fas fa-search mr-2"></i>Explore More Mentors
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
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
                    <h3 className="text-2xl font-bold text-gray-800">0</h3>
                    <p className="text-gray-600 text-sm">Previously Booked</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-clock text-blue-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{mentorsData.length}</h3>
                    <p className="text-gray-600 text-sm">Available Mentors</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-star text-purple-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {mentorsData.length > 0 
                        ? (mentorsData.reduce((sum, mentor) => sum + (mentor.stats?.avgRating || 0), 0) / mentorsData.length).toFixed(1)
                        : '0.0'
                      }
                    </h3>
                    <p className="text-gray-600 text-sm">Average Rating</p>
                  </div>
                </div>
              </section>
              {/* Recently Added */}
              <section className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Added</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Dr. Anjali Patel</h4>
                          <p className="text-gray-600 text-sm">Advanced Mathematics</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-500 text-xs"></i>
                              <span className="text-sm text-gray-600 ml-1">4.9 (42 reviews)</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Birmingham</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full text-center">Available</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full text-center">Jake</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Isabella Rodriguez</h4>
                          <p className="text-gray-600 text-sm">Watercolor Painting</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-500 text-xs"></i>
                              <span className="text-sm text-gray-600 ml-1">4.7 (28 reviews)</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Online</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full text-center">Busy</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full text-center">Emma</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* All Saved Mentors */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Saved Mentors</h2>
                  <span className="text-gray-600 text-sm">Showing {filteredMentors.length} mentors</span>
                </div>
                
                {filteredMentors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-heart text-gray-400 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved mentors yet</h3>
                    <p className="text-gray-600 mb-6">Start exploring mentors and save your favorites for easy access</p>
                    <a 
                      href="/mentor/directory" 
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Explore Mentors
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="mentors-grid">
                      {filteredMentors.map(mentor => (
                        <MentorCard key={mentor.uid} mentor={mentor} />
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
        )}
      </body>
    </>
  );
};

export default SavedMentorsPage;
