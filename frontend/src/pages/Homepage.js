"use client";

import { formatDate } from "@/app/utils";
import axios from "axios";
import React, { useState, useEffect } from "react";

// Main App component to encapsulate the entire page
const Homepage = () => {
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("🎯 All Categories");
  const [selectedLocation, setSelectedLocation] = useState("📍 All Locations");

  // State for workshop dates, initialized as empty array
  const [workshopDates, setWorkshopDates] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);

  const [workshop, setWorkshop] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      const response = await axios.get(
        "https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/featured?limit=6"
      );
      setFeaturedMentors(response.data.featured);
    };

    const fetchWorkshop = async () => {
      const response = await axios.get(
        "https://rootsnwings-api-944856745086.europe-west2.run.app/classes/workshops/upcoming?page=1&pageSize=20"
      );

      setWorkshop(response.data.workshops);
    };

    fetchMentors();
    fetchWorkshop();
  }, []);


  // useEffect to handle dynamic content on component mount
  useEffect(() => {
    // Dynamically calculate and update workshop dates
    const updateWorkshopDates = () => {
      const today = new Date();
      const dates = [
        new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      ];

      const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      setWorkshopDates(
        dates.map((date) => date.toLocaleDateString("en-GB", options))
      );
    };

    updateWorkshopDates();
  }, []);

  // Event handler for the search button
  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log(`Searching for: ${searchTerm}`);
      // In a real application, this would redirect or fetch data
    }
  };

  // Event handler for category filter
  const handleCategoryClick = (categoryName) => {
    setSearchTerm(categoryName);
    console.log(`Selected category: ${categoryName}`);
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          tailwind.config = {
              theme: {
                  extend: {
                      colors: {
                          primary: '#00A2E8',
                          'primary-dark': '#00468C',
                          'primary-light': '#f8fbff',
                          'accent-light': '#e8f4ff'
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `,
        }}
      />

      <body className="font-sans text-gray-800 bg-white">
        {/* Navigation Component */}
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="text-2xl font-bold text-primary-dark">
                Roots & Wings
              </div>

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
                  <a
                    href="#mentors"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
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

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <a
                  href="#login"
                  className="text-primary-dark font-medium hover:text-primary transition-colors"
                >
                  Login
                </a>
                <a
                  href="#signup"
                  className="bg-primary hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Sign Up
                </a>
                <a
                  href="mentor/becomeamentor"
                  className="bg-primary-dark hover:bg-blue-900 text-white px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Become a Mentor
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section Component */}
        <section
          id="home"
          className="bg-gradient-to-br from-primary-light to-accent-light pt-20 pb-16 mt-16"
        >
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Hero Content */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-primary-dark mb-6 leading-tight">
                  Find the Right Mentor for Your Journey
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Explore deeply rooted skills and knowledge from experienced
                  UK-based mentors
                </p>

                {/* Search Container */}
                <div className="mb-8">
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <span
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                      aria-label="Search icon"
                    >
                      🔍
                    </span>
                    <input
                      type="text"
                      className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-full text-base focus:border-primary focus:outline-none transition-colors"
                      placeholder='Try "Tabla" or "Debating for Teens"'
                      aria-label="Search for mentors or skills"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                      aria-label="Start searching"
                    >
                      Start Searching
                    </button>
                  </div>

                  {/* Search Filters */}
                  <div className="flex flex-wrap gap-3">
                    <select
                      className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm hover:border-primary focus:border-primary focus:outline-none transition-colors"
                      aria-label="Filter by category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option>🎯 All Categories</option>
                      <option>🎻 Classical Music</option>
                      <option>🎨 Art & Craft</option>
                      <option>🧘 Mindfulness</option>
                      <option>🗣️ Spoken Word</option>
                    </select>
                    <select
                      className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm hover:border-primary focus:border-primary focus:outline-none transition-colors"
                      aria-label="Filter by location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option>📍 All Locations</option>
                      <option>London</option>
                      <option>Manchester</option>
                      <option>Birmingham</option>
                      <option>Online</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="h-80 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center text-white text-6xl shadow-2xl">
                🎓
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section Component */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
              Explore Learning Categories
            </h2>

            {/* Categories Scroller */}
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              {[
                "🎻 Classical Music",
                "🎨 Art & Craft",
                "🧘 Mindfulness",
                "🗣️ Spoken Word",
                "📜 Philosophy",
                "💻 Coding",
                "📚 Languages",
                "🎭 Drama",
              ].map((category, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 text-center p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl min-w-[140px] ${
                    searchTerm === category
                      ? "bg-primary text-white"
                      : "bg-primary-light hover:bg-primary hover:text-white"
                  }`}
                  role="button"
                  tabIndex="0"
                  aria-label={`Browse ${category} mentors`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="text-4xl mb-3" aria-hidden="true">
                    {category.split(" ")[0]}
                  </div>
                  <div className="font-semibold text-sm">
                    {category.substring(category.indexOf(" ") + 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Mentors Section Component */}
        <section id="mentors" className="py-20 bg-primary-light">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
              Featured Mentors
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mentor Card 1 */}

              {featuredMentors.map((eachMentor) => {
                return (
                  <>
                    <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                      <div
                        className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
                        data-name="Priya Sharma"
                        aria-label="Priya Sharma's profile picture"
                      >
                        P
                      </div>
                      <h3 className="text-xl font-semibold text-primary-dark mb-2">
                        {eachMentor.displayName}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {eachMentor.headline}
                      </p>
                      <div className="flex justify-center items-center mb-3">
                        <span
                          className="text-yellow-400 mr-2"
                          aria-label="5 star rating"
                        >
                          ★★★★★
                        </span>
                        <span className="text-sm text-gray-600">
                          {eachMentor.stats.avgRating} from{" "}
                          {eachMentor.stats.totalReviews} reviews
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {eachMentor.city}
                      </p>
                      {eachMentor.pricing.firstSessionFree && (
                        <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                          {`1st Lesson Free`}
                        </div>
                      )}
                      <button
                        className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500"
                        aria-label="View Priya Sharma's profile"
                      >
                        Explore Profile
                      </button>
                    </div>
                  </>
                );
              })}

              {/* Mentor Card 2 */}
              {/* <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6" data-name="James Mitchell" aria-label="James Mitchell's profile picture">
                  J
                </div>
                <h3 className="text-xl font-semibold text-primary-dark mb-2">James Mitchell</h3>
                <p className="text-gray-600 mb-4">Classical Piano & Music Theory</p>
                <div className="flex justify-center items-center mb-3">
                  <span className="text-yellow-400 mr-2" aria-label="5 star rating">★★★★★</span>
                  <span className="text-sm text-gray-600">4.8 from 35 reviews</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">London – In-Person</p>
                <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                  1st Lesson Free
                </div>
                <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500" aria-label="View James Mitchell's profile">
                  Join a Class
                </button>
              </div> */}

              {/* Mentor Card 3 */}
              {/* <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6" data-name="Amara Johnson" aria-label="Amara Johnson's profile picture">
                  A
                </div>
                <h3 className="text-xl font-semibold text-primary-dark mb-2">Amara Johnson</h3>
                <p className="text-gray-600 mb-4">Creative Writing & Poetry</p>
                <div className="flex justify-center items-center mb-3">
                  <span className="text-yellow-400 mr-2" aria-label="5 star rating">★★★★★</span>
                  <span className="text-sm text-gray-600">4.7 from 18 reviews</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Manchester – Online</p>
                <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                  1st Lesson Free
                </div>
                <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500" aria-label="View Amara Johnson's profile">
                  Start Learning
                </button>
              </div> */}
            </div>
          </div>
        </section>

        {/* Featured Workshops Section Component */}
        <section id="workshops" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
              Workshops You Can Join This Month
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Workshop Card 1 */}

              {workshop.map((eachworkshop) => {
                return (
                  <>
                    <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                      <div className="h-48 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-5xl">
                        🕉️
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-primary-dark mb-4">
                          Introduction to Vedic Chanting
                        </h3>
                        <div className="space-y-2 mb-5 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span id="workshop-date-1">
                              {eachworkshop.schedule.weeklySchedule[0].day}
                              {formatDate(eachworkshop.schedule.startDate)}
                              {
                                eachworkshop.schedule.weeklySchedule[0]
                                  .startTime
                              }{" "}
                              -{" "}
                              {eachworkshop.schedule.weeklySchedule[0].endTime}
                            </span>
                          </div>

                          {/* <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span id="workshop-date-1">
{eachworkshop.schedule.weeklySchedule[0].day} - 
{eachworkshop.schedule.endDate} - 
{eachworkshop.schedule.weeklySchedule[0].startTime} -  {eachworkshop.schedule.weeklySchedule[0].endTime}
                      </span>
                    </div> */}

                          <div className="flex items-center">
                            <span className="mr-2">👤</span>
                            <span>{eachworkshop.mentorName}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">💻</span>
                            <span>{eachworkshop.format.charAt(0).toUpperCase() + eachworkshop.format.slice(1)}</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-primary-dark mb-5">
                          Free
                        </div>
                        <button
                          className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors"
                          aria-label="View details for Vedic Chanting workshop"
                        >
                          Book Workshop
                        </button>
                      </div>
                    </div>
                  </>
                );
              })}

              {/* Workshop Card 2 */}
              {/* <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-48 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-5xl">
                  🎨
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary-dark mb-4">
                    Watercolour Landscapes
                  </h3>
                  <div className="space-y-2 mb-5 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span id="workshop-date-2">
                        {workshopDates[1] || "Loading..."}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span>Sarah Williams</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span>London</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary-dark mb-5">
                    £25
                  </div>
                  <button
                    className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors"
                    aria-label="View details for Watercolour Landscapes workshop"
                  >
                    Join Workshop
                  </button>
                </div>
              </div> */}

              {/* Workshop Card 3 */}
              {/* <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-48 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-5xl">
                  🎭
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary-dark mb-4">
                    Shakespearean Monologues
                  </h3>
                  <div className="space-y-2 mb-5 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span id="workshop-date-3">
                        {workshopDates[2] || "Loading..."}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span>Emma Thompson</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">💻</span>
                      <span>Online</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary-dark mb-5">
                    £15
                  </div>
                  <button
                    className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors"
                    aria-label="View details for Shakespearean Monologues workshop"
                  >
                    Reserve Spot
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* How It Works Section Component */}
        <section className="py-20 bg-primary-light">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-4xl font-bold text-center text-primary-dark mb-16">
              How It Works
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6"
                  aria-label="Search step"
                >
                  🔍
                </div>
                <h3 className="text-lg font-semibold text-primary-dark mb-4">
                  Search
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Filter by skill, mentor, or location to find your perfect
                  match
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6"
                  aria-label="View profile step"
                >
                  👤
                </div>
                <h3 className="text-lg font-semibold text-primary-dark mb-4">
                  View Profile
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  See ratings, skills, and class types from verified mentors
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6"
                  aria-label="Enrol step"
                >
                  📝
                </div>
                <h3 className="text-lg font-semibold text-primary-dark mb-4">
                  Enrol
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose a recurring class or a one-off workshop
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6"
                  aria-label="Connect step"
                >
                  🤝
                </div>
                <h3 className="text-lg font-semibold text-primary-dark mb-4">
                  Connect
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Begin your mentorship journey with 1-on-1 support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section Component */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <h2 className="text-4xl font-bold text-center text-primary-dark mb-16">
              What Our Community Says
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-primary-light p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold mx-auto mb-6">
                  S
                </div>
                <p className="italic text-gray-700 mb-6 leading-relaxed">
                  "My daughter learned Hindustani vocals with Ms. Anaya from
                  Manchester. The cultural depth and personal attention have
                  been incredible."
                </p>
                <h4 className="font-semibold text-primary-dark">Sarah K.</h4>
                <p className="text-sm text-gray-600">Parent</p>
                <div className="text-yellow-400 mt-2">★★★★★</div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-primary-light p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold mx-auto mb-6">
                  T
                </div>
                <p className="italic text-gray-700 mb-6 leading-relaxed">
                  "I gained confidence through public speaking sessions. The
                  mentors really understand how to bring out your potential."
                </p>
                <h4 className="font-semibold text-primary-dark">Tom M.</h4>
                <p className="text-sm text-gray-600">Student</p>
                <div className="text-yellow-400 mt-2">★★★★★</div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-primary-light p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold mx-auto mb-6">
                  R
                </div>
                <p className="italic text-gray-700 mb-6 leading-relaxed">
                  "I love passing on cultural knowledge and seeing young minds
                  flourish. This platform connects me with truly engaged
                  learners."
                </p>
                <h4 className="font-semibold text-primary-dark">Ravi P.</h4>
                <p className="text-sm text-gray-600">Mentor</p>
                <div className="text-yellow-400 mt-2">★★★★★</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section Component */}
        <section className="py-16 bg-primary-dark text-white text-center">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Start Learning with Purpose?
            </h2>
            <a
              href="#search"
              className="inline-block bg-primary hover:bg-blue-500 text-white px-10 py-4 rounded-full text-lg font-semibold transition-colors"
              aria-label="Search for mentors to start learning"
            >
              Explore Mentors
            </a>
          </div>
        </section>

        {/* Footer Component */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="text-primary font-semibold mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#home"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#workshops"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Workshops
                    </a>
                  </li>
                  <li>
                    <a
                      href="#enroll"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Enroll
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-primary font-semibold mb-6">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#privacy"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#terms"
                      className="text-gray-300 hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-primary font-semibold mb-6">Contact</h4>
                <p className="text-gray-300 mb-4">hello@rootsandwings.co.uk</p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    📘
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    📷
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    aria-label="Connect with us on LinkedIn"
                  >
                    💼
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; 2025 Roots & Wings – A Learning Platform by Students of
                the UK
              </p>
            </div>
          </div>
        </footer>
      </body>
    </>
  );
};

export default Homepage;
