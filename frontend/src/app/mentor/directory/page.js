"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";

// This is the main component for the Mentor Profiles page.
const MentorDirectory = () => {
  // State to manage the filter values
  const [subjectFilter, setSubjectFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [priceRange, setPriceRange] = useState(50);
  const [sortBy, setSortBy] = useState("relevance");
  const [mentors, setMentors] = useState([]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/?page=1&pageSize=20&sortBy=avgRating&sortOrder=desc"
      );
      if (response.data && response.data.mentors) {
        setMentors(response.data.mentors);
      } else {
        setMentors([]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handler for applying filters (currently a placeholder)
  const handleApplyFilters = () => {
    console.log("Applying filters with current state:", {
      subjectFilter,
      ageFilter,
      locationFilter,
      languageFilter,
      availabilityFilter,
      priceRange,
      sortBy,
    });
    // In a real application, this would trigger an API call to fetch filtered data.
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    setSubjectFilter("");
    setAgeFilter("");
    setLocationFilter("");
    setLanguageFilter("");
    setAvailabilityFilter("");
    setPriceRange(50);
    setSortBy("relevance");
    console.log("Filters cleared.");
    // In a real application, this would re-fetch the default mentor list.
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
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <a href="#" className="text-2xl font-bold text-primary-dark">
                Roots & Wings
              </a>

              {/* Desktop Menu */}
              <ul className="hidden md:flex space-x-8">
                <li>
                  <a
                    href="#home"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a href="#mentors" className="text-primary font-medium">
                    Mentor Profiles
                  </a>
                </li>
                <li>
                  <a
                    href="#workshops"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    Workshops
                  </a>
                </li>
                <li>
                  <a
                    href="#enroll"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    Enroll
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

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
                  <option value="music">Classical Music</option>
                  <option value="art">Art & Craft</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="spoken-word">Spoken Word</option>
                  <option value="philosophy">Philosophy</option>
                  <option value="coding">Coding</option>
                  <option value="languages">Languages</option>
                  <option value="drama">Drama</option>
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
                  <option value="teens">Teenagers (13-17)</option>
                  <option value="young-adults">Young Adults (18-25)</option>
                  <option value="adults">Adults (26+)</option>
                  <option value="seniors">Seniors (60+)</option>
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
                    max="100"
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
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rating</option>
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
              Showing{" "}
              <strong id="results-count" className="text-primary-dark">
                {mentors.length}
              </strong>{" "}
              mentors in the UK
            </div>
          </div>
        </div>

        {/* Mentors Grid Component */}
        <main className="max-w-7xl mx-auto px-5 pb-16">
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="mentors-grid"
          >
            {mentors.map((mentor, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative"
              >
                {/* Mentor Header */}
                <div className="flex items-start gap-5 mb-5">
                  <div
                    className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                    data-name={mentor.displayName}
                    aria-label={`${mentor.displayName}'s profile picture`}
                  >
                    {getInitials(mentor.displayName)}
                  </div>
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
                    className="w-11 h-11 border-2 border-gray-200 hover:border-red-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors favorite-btn"
                    aria-label="Add to favorites"
                  >
                    ♡
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
