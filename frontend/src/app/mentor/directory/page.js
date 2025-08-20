"use client";

import Navbar from "@/components/NavBar";
import axios from "axios";
import React, { useState, useEffect } from "react";

// This is the main component for the Mentor Profiles page.
const MentorDirectory = () => {
  // State to manage the filter values
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [priceRange, setPriceRange] = useState(100);
  const [sortBy, setSortBy] = useState("avgRating");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Metadata state
  const [categories, setCategories] = useState([]);

  const [user, setUser] = useState({});
  const [savedMentors, setSavedMentors] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('q', searchQuery);
      if (subjectFilter) params.append('category', subjectFilter);
      if (locationFilter) params.append('city', locationFilter);
      if (languageFilter) params.append('language', languageFilter);
      if (ageFilter) params.append('ageGroup', ageFilter);
      if (priceRange) params.append('maxRate', priceRange);
      
      // Sorting
      if (sortBy === 'price-low') {
        params.append('sortBy', 'oneOnOneRate');
        params.append('sortOrder', 'asc');
      } else if (sortBy === 'price-high') {
        params.append('sortBy', 'oneOnOneRate');
        params.append('sortOrder', 'desc');
      } else {
        params.append('sortBy', 'avgRating');
        params.append('sortOrder', 'desc');
      }
      
      params.append('page', '1');
      params.append('pageSize', '50');
      
      const response = await axios.get(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/?${params.toString()}`
      );
      
      if (response.data && response.data.mentors) {
        setMentors(response.data.mentors);
        setTotalResults(response.data.total || 0);
      } else {
        setMentors([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setMentors([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://rootsnwings-api-944856745086.europe-west2.run.app/metadata/categories"
      );
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSavedMentors = async () => {
    if (!user.uid) return;
    
    setLoadingSaved(true);
    try {
      const response = await axios.get(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=student`
      );
      
      if (response.data && response.data.profile && response.data.profile.savedMentors) {
        setSavedMentors(response.data.profile.savedMentors);
      }
    } catch (err) {
      console.error('Error fetching saved mentors:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const toggleSavedMentor = async (mentorId) => {
    if (!user.uid) {
      // User not logged in - could show a login prompt here
      console.log('User not logged in');
      return;
    }

    try {
      const isCurrentlySaved = savedMentors.includes(mentorId);
      const newSavedMentors = isCurrentlySaved 
        ? savedMentors.filter(id => id !== mentorId)
        : [...savedMentors, mentorId];

      // Optimistic update
      setSavedMentors(newSavedMentors);

      // Update backend
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${user.uid}?profile_type=student`,
        {
          savedMentors: newSavedMentors
        }
      );
    } catch (err) {
      console.error('Error updating saved mentors:', err);
      // Revert optimistic update on error
      setSavedMentors(savedMentors);
    }
  };

  useEffect(() => {
    // Fetch categories and mentors on initial load
    fetchCategories();
    fetchMentors();
    
    // Check if user is logged in for user-specific features
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.user) {
          setUser(user.user);
        }
      }
    } catch (error) {
      console.log("No user logged in, directory is publicly accessible");
    }
  }, []);

  // Fetch saved mentors when user is loaded
  useEffect(() => {
    if (user.uid) {
      fetchSavedMentors();
    }
  }, [user.uid]);
  
  // Auto-fetch when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, subjectFilter, ageFilter, locationFilter, languageFilter, priceRange, sortBy]);

  // Handler for applying filters
  const handleApplyFilters = () => {
    fetchMentors();
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSubjectFilter("");
    setAgeFilter("");
    setLocationFilter("");
    setLanguageFilter("");
    setAvailabilityFilter("");
    setPriceRange(100);
    setSortBy("avgRating");
  };

  // Use useEffect to handle side effects if needed, like fetching data on mount or filter changes.
  // For this static example, we just log a message.
  useEffect(() => {
    console.log("Component mounted and ready.");
  }, []);

  // Helper function to get initials for the mentor's profile picture
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || ""
    );
  };

  return (
    <>
      <body className="font-sans text-gray-800 bg-white">
        {/* Navigation Component */}

        <Navbar user={user} />

        {/* Hero Section Component */}
        <section className="bg-gradient-to-br from-primary-light to-accent-light pt-20 pb-12 mt-16">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-5xl font-bold text-primary-dark mb-4">
              Find the Right Mentor in the UK
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Browse based on your subject, interests, or preferred language.
              Connect with experienced mentors who share your cultural
              background and learning goals.
            </p>
          </div>
        </section>

        {/* Filter Panel Component */}
        <section className="bg-white shadow-lg  top-16 z-40 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 py-8">
            {/* Filters Grid */}
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-lg"
                  placeholder="Search mentors by name, subject, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search mentors"
                />
              </div>
            </div>
            
            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {/* Subject Filter */}
              <div>
                <label
                  className="block text-sm font-semibold text-primary-dark mb-2"
                  htmlFor="subject-filter"
                >
                  Subject / Field
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white"
                  id="subject-filter"
                  aria-label="Filter by subject"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName} ({category.subjectCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Group Filter */}
              <div>
                <label
                  className="block text-sm font-semibold text-primary-dark mb-2"
                  htmlFor="age-filter"
                >
                  Age Group
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white"
                  id="age-filter"
                  aria-label="Filter by age group"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                >
                  <option value="">All Ages</option>
                  <option value="children">Children (5-12)</option>
                  <option value="teenagers">Teenagers (13-17)</option>
                  <option value="adults">Adults (18+)</option>
                  <option value="all_ages">All Ages Welcome</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label
                  className="block text-sm font-semibold text-primary-dark mb-2"
                  htmlFor="location-filter"
                >
                  Location
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  >
                    📍
                  </span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    id="location-filter"
                    placeholder="City or postcode"
                    aria-label="Enter location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label
                  className="block text-sm font-semibold text-primary-dark mb-2"
                  htmlFor="language-filter"
                >
                  Language
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white"
                  id="language-filter"
                  aria-label="Filter by language"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                >
                  <option value="">Any Language</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="urdu">Urdu</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="arabic">Arabic</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label
                  className="block text-sm font-semibold text-primary-dark mb-2"
                  htmlFor="availability-filter"
                >
                  Availability
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white"
                  id="availability-filter"
                  aria-label="Filter by availability"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning (9AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-5PM)</option>
                  <option value="evening">Evening (5PM-9PM)</option>
                  <option value="weekend">Weekends</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-primary-dark min-w-[40px]">
                    £10
                  </span>
                  <input
                    type="range"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    id="price-slider"
                    min="10"
                    max="150"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    aria-label="Price range slider"
                  />
                  <span
                    className="text-sm font-medium text-primary-dark min-w-[40px]"
                    id="price-max"
                  >
                    £{priceRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Actions & Sort */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  className="bg-primary hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  aria-label="Apply filters"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
                <button
                  className="border-2 border-gray-300 hover:border-primary hover:text-primary text-gray-600 px-6 py-3 rounded-full font-medium transition-colors"
                  aria-label="Clear all filters"
                  onClick={handleClearFilters}
                >
                  Clear All
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-3">
                <label
                  className="text-sm font-semibold text-primary-dark"
                  htmlFor="sort-select"
                >
                  Sort by:
                </label>
                <select
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="sort-select"
                  aria-label="Sort mentors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="avgRating">Highest Rating</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Results Header Component */}
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              {loading ? (
                <span className="text-gray-500">Searching mentors...</span>
              ) : (
                <>
                  Showing{" "}
                  <strong id="results-count" className="text-primary-dark">
                    {mentors.filter(mentor => mentor.status === 'active').length}
                  </strong>{" "}
                  of <strong className="text-primary-dark">{totalResults}</strong> mentors
                  {(searchQuery || subjectFilter || locationFilter || languageFilter) && (
                    <span className="text-gray-500 ml-2">
                      (filtered results)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mentors Grid Component */}
        <main className="max-w-7xl mx-auto px-5 pb-16">
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="mentors-grid"
          >
            {mentors.filter(mentor => mentor.status === 'active').map((mentor, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative"
              >
                {/* Mentor Header */}
                <div className="flex items-start gap-5 mb-5">
                  {mentor.photoURL ? (
                    <img 
                      src={mentor.photoURL} 
                      alt={`${mentor.displayName}'s profile picture`}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                      data-name={mentor.displayName}
                      aria-label={`${mentor.displayName}'s profile picture`}
                    >
                      {getInitials(mentor.displayName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-dark mb-1">
                      {mentor.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {mentor.city}, {mentor.region}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.teachingModes.map((mode, modeIndex) => (
                        <span
                          key={modeIndex}
                          className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full text-green-700 bg-green-100 "
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </span>
                      ))}
                      {/* {mentor.online && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Online</span>}
                                            {mentor.inPerson && <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">In-person</span>}
                                       */}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-yellow-400"
                    aria-label={`${mentor.rating} star rating`}
                  >
                    {"★".repeat(Math.round(mentor.stats.avgRating)) +
                      "☆".repeat(5 - Math.round(mentor.rating))}
                  </span>
                  <span className="text-sm text-gray-600">
                    {mentor.stats.avgRating} ({mentor.stats.totalReviews}{" "}
                    reviews)
                  </span>
                </div>

                {/* Subject Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {mentor.subjects.map((subject, subjIndex) => (
                      <span
                        key={subjIndex}
                        className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full"
                      >
                        {subject.charAt(0).toUpperCase() +
                          subject.slice(1).replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Badges */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-2xl font-bold text-primary-dark">
                    £{mentor.pricing.oneOnOneRate || mentor.pricing.groupRate}
                    <span className="text-sm font-normal text-gray-500">
                      /hour
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {mentor.pricing.firstSessionFree && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full bg-orange-100 text-orange-700 ">
                        1st Lesson Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    className="flex-1 bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500"
                    aria-label={`View ${mentor.displayName}'s profile`}
                    onClick={() => {
                      localStorage.setItem("mentor", JSON.stringify(mentor));
                      window.location.href = "/mentor/detailpage";
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className={`w-11 h-11 border-2 rounded-full flex items-center justify-center transition-colors favorite-btn ${
                      savedMentors.includes(mentor.uid) 
                        ? 'border-red-400 text-red-400 bg-red-50' 
                        : 'border-gray-200 hover:border-red-400 hover:text-red-400'
                    }`}
                    aria-label={savedMentors.includes(mentor.uid) ? "Remove from favorites" : "Add to favorites"}
                    onClick={() => toggleSavedMentor(mentor.uid)}
                    disabled={loadingSaved}
                  >
                    {savedMentors.includes(mentor.uid) ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </body>
    </>
  );
};

export default MentorDirectory;