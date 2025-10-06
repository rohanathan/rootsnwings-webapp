"use client";

import { formatDate } from "@/app/utils";

import Navbar from "@/components/NavBar";
import CulturalWorldMap from "@/components/CulturalWorldMap";
import axios from "axios";
import React, { useState, useEffect } from "react";

// Main App component to encapsulate the entire page
const Homepage = () => {
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("🎯 All Categories");
  const [selectedLocation, setSelectedLocation] = useState("📍 All Locations");

  // State for workshop dates, initialized as an empty array
  const [workshopDates, setWorkshopDates] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);

  const [workshop, setWorkshop] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const API_PREFIX = '/api';
    const fetchMentors = async () => {
      const response = await axios.get(
        `${API_PREFIX}/mentors/?featured=true&pageSize=6`
      );
      setFeaturedMentors(response.data.mentors);
    };

    const fetchWorkshop = async () => {
      const response = await axios.get(
        `${API_PREFIX}/classes?type=workshop&upcoming=true&pageSize=3`
      );

      setWorkshop(response.data.classes);
    };

    const fetchTestimonials = async () => {
       const response = await axios.get(
         `${API_PREFIX}/reviews?type=testimonials&limit=10`
       );
       setTestimonials(response.data.testimonials);
    };

    const fetchCategories = async () => {
      const response = await axios.get(
        `${API_PREFIX}/metadata/categories`
      );
      setCategories(response.data.categories);
    };

    const fetchCities = async () => {
      const response = await axios.get(
        `${API_PREFIX}/mentors/?pageSize=100`
      );
      const uniqueCities = [...new Set(response.data.mentors.map(mentor => mentor.city))].sort();
      setCities(uniqueCities);
    };

    fetchMentors();
    fetchWorkshop();
    fetchTestimonials();
    fetchCategories();
    fetchCities();
  }, []);


  // useEffect to handle dynamic content on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUser(user?.user);
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
    console.log('🔘 Search button clicked!');
    console.log('🔍 Search term:', searchTerm);
    console.log('🎯 Selected category:', selectedCategory);
    console.log('📍 Selected location:', selectedLocation);
    
    if (searchTerm.trim()) {
      console.log('✅ Search term is not empty, processing...');
      
      // Build search parameters
      const searchParams = new URLSearchParams({
        q: searchTerm.trim(),
      });
      
      // Add category filter if selected
      if (selectedCategory && selectedCategory !== '🎯 All Categories') {
        searchParams.append('category', selectedCategory.toLowerCase().replace(' ', '_'));
        console.log('🎯 Added category filter:', selectedCategory);
      }
      
      // Add location filter if selected
      if (selectedLocation && selectedLocation !== '📍 All Locations') {
        searchParams.append('location', selectedLocation);
        console.log('📍 Added location filter:', selectedLocation);
      }
      
      const searchUrl = `/search?${searchParams.toString()}`;
      console.log('🚀 Navigating to:', searchUrl);
      
      // Navigate to search results page
      window.location.href = searchUrl;
    } else {
      console.log('❌ Search term is empty, nothing to search');
    }
  };

  // Event handler for category filter
  const handleCategoryClick = (categoryName) => {
    setSearchTerm(categoryName);
    setSelectedCategory(categoryName);
    console.log(`Selected category: ${categoryName}`);
    // Automatically search when category is clicked
    setTimeout(() => handleSearch(), 100); // Small delay to ensure state is updated
  };

  // Get category image from Firebase Storage
  const getCategoryImage = (categoryId) => {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/rootsnwings-465610.firebasestorage.app/o/category-icons%2F';
    const token = '?alt=media'; // Firebase requires this for public access
    
    const imageMap = {
      'crafts_and_hobbies': `${baseUrl}crafts_and_hobbies.jpg${token}`,
      'culinary_arts': `${baseUrl}culinary_arts.webp${token}`,
      'visual_arts': `${baseUrl}visual_arts.jpg${token}`,
      'music': `${baseUrl}music.jpg${token}`,
      'performing_arts': `${baseUrl}performing_arts.jpg${token}`,
      'stem': `${baseUrl}stem.jpg${token}`,
      'water_sports': `${baseUrl}water_sports.jpg${token}`,
      'languages': `${baseUrl}languages.jpg${token}`,
      'wellness': `${baseUrl}wellness.jpg${token}`,
      'fitness': `${baseUrl}fitness.jpg${token}`,
      'academics': `${baseUrl}academics.jpg${token}`,
      'business': `${baseUrl}business.jpg${token}`,
      'technology': `${baseUrl}technology.jpg${token}`,
      'philosophy': `${baseUrl}philosophy.jpg${token}`
    };
    
    return imageMap[categoryId] || `${baseUrl}default.jpg${token}`;
  };

  // Fallback emoji if image fails to load
  const getCategoryEmoji = (categoryId) => {
    const emojiMap = {
      'visual_arts': '🎨',
      'music': '🎵',
      'performing_arts': '🎭', 
      'culinary_arts': '👨‍🍳',
      'crafts_and_hobbies': '✂️',
      'stem': '🔬',
      'water_sports': '🏊‍♀️',
      'languages': '📚',
      'wellness': '🧘',
      'technology': '💻',
      'fitness': '💪',
      'academics': '📖',
      'business': '💼',
      'philosophy': '📜'
    };
    return emojiMap[categoryId] || '🎯';
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

      <div className="font-sans text-gray-800 bg-white">

        <Navbar user={user} /> 

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
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryName}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                    <select
                      className="px-4 py-2 border-2 border-gray-200 rounded-full text-sm hover:border-primary focus:border-primary focus:outline-none transition-colors"
                      aria-label="Filter by location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option>📍 All Locations</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
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

        {/* Cultural Heritage World Map Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            {/* Enhanced Cultural World Map with more space */}
            <CulturalWorldMap />
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
                      {eachMentor.photoURL ? (
                        <img
                          src={eachMentor.photoURL}
                          alt={`${eachMentor.displayName}'s profile`}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-6"
                        />
                      ) : (
                        <div
                          className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
                          aria-label={`${eachMentor.displayName}'s profile picture`}
                        >
                          {eachMentor.displayName ? eachMentor.displayName.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-primary-dark mb-2">
                        {eachMentor.displayName || 'Mentor Name'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {eachMentor.headline || 'No headline available'}
                      </p>
                      <div className="flex justify-center items-center mb-3">
                        <span
                          className="text-yellow-400 mr-2"
                          aria-label={`${eachMentor.stats?.avgRating || 0} star rating`}
                        >
                          {'★'.repeat(Math.floor(eachMentor.stats?.avgRating || 0))}
                          {'☆'.repeat(5 - Math.floor(eachMentor.stats?.avgRating || 0))}
                        </span>
                        <span className="text-sm text-gray-600">
                          {eachMentor.stats?.avgRating?.toFixed(1) || 'N/A'} from{" "}
                          {eachMentor.stats?.totalReviews || 0} reviews
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {eachMentor.city || 'Location not specified'}
                      </p>
                      
                      {/* Cultural and Offer Badges */}
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {/* Cultural Heritage Badge */}
                        {eachMentor.searchMetadata?.cultural_origin_region && 
                         eachMentor.searchMetadata.cultural_origin_region !== 'worldwide' && (
                          <div className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                            🌍 {eachMentor.searchMetadata.cultural_origin_region}
                          </div>
                        )}
                        
                        {/* Traditional Training Badge */}
                        {eachMentor.qualifications && 
                         eachMentor.qualifications.some(q => 
                           ['traditional_lineage', 'cultural_apprenticeship', 'cultural_immersion'].includes(q.type)
                         ) && (
                          <div className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                            🙏 Traditional Training
                          </div>
                        )}
                        
                        {/* Cultural Authenticity Badge */}
                        {eachMentor.searchMetadata?.cultural_authenticity_score >= 0.7 && (
                          <div className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                            ⭐ Authentic
                          </div>
                        )}
                        
                        {/* First Session Free Badge */}
                        {eachMentor.pricing?.firstSessionFree && (
                          <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            1st Lesson Free
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("mentor", JSON.stringify(eachMentor));
                          window.location.href = "/mentor/detailpage";
                        }}
                        className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500"
                        aria-label={`View ${eachMentor.displayName}'s profile`}
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
               {workshop.length > 0 ? `Featured Workshops` : 'No Workshops Available'}
             </h2>

                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Workshop Cards */}
               {workshop.length > 0 ? (
                                  workshop.map((eachworkshop, index) => {
                   return (
                     <div key={eachworkshop.id || `workshop-${index}`} className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                     {eachworkshop.imageUrl ? (
                       <img 
                         src={eachworkshop.imageUrl} 
                         alt={eachworkshop.title}
                         className="h-48 w-full object-cover"
                       />
                     ) : (
                       <div className="h-48 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-5xl">
                         📚
                       </div>
                     )}
                     <div className="p-6">
                       <h3 className="text-lg font-semibold text-primary-dark mb-4">
                         {eachworkshop.title || 'Workshop Title'}
                       </h3>
                                                 <div className="space-y-2 mb-5 text-sm text-gray-600">
                           <div className="flex items-center">
                             <span className="mr-2">📅</span>
                             <span>
                               {eachworkshop.schedule?.weeklySchedule?.[0]?.day || 'TBD'} - {eachworkshop.schedule?.startDate ? formatDate(eachworkshop.schedule.startDate) : 'Date TBD'}
                             </span>
                           </div>
                           <div className="flex items-center">
                             <span className="mr-2">⏰</span>
                             <span>
                               {eachworkshop.schedule?.weeklySchedule?.[0]?.startTime || 'TBD'} - {eachworkshop.schedule?.weeklySchedule?.[0]?.endTime || 'TBD'}
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
                             <span>{eachworkshop.mentorName || 'Mentor TBD'}</span>
                           </div>
                           <div className="flex items-center">
                             <span className="mr-2">💻</span>
                             <span>{eachworkshop.format ? eachworkshop.format.charAt(0).toUpperCase() + eachworkshop.format.slice(1) : 'Format TBD'}</span>
                           </div>
                        </div>
                                                 <div className="text-2xl font-bold text-primary-dark mb-5">
                           {eachworkshop.pricing?.total ? `£${eachworkshop.pricing.total}` : 'Free'}
                         </div>
                         <button
                           onClick={() => {
                             localStorage.setItem('selectedWorkshop', JSON.stringify(eachworkshop));
                             window.location.href = '/workshop/listing';
                           }}
                           className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors"
                           aria-label={`Explore ${eachworkshop.title || 'workshop'} details`}
                         >
                           Explore Workshop
                                                  </button>
                       </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="col-span-full text-center py-12">
                   <div className="text-gray-400 text-6xl mb-4">📚</div>
                   <h3 className="text-xl font-semibold text-gray-900 mb-2">No workshops available</h3>
                   <p className="text-gray-600 mb-6">
                     Check back soon for upcoming workshops and learning opportunities.
                   </p>
                   <button
                     onClick={() => window.location.href = '/explore/workshops'}
                     className="bg-primary hover:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                   >
                     Browse All Workshops
                   </button>
                 </div>
               )}

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
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-primary-light p-8 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold mx-auto mb-6">
                    {testimonial.studentInitial}
                  </div>
                  <p className="italic text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                  <h4 className="font-semibold text-primary-dark">{testimonial.studentName}</h4>
                  <p className="text-sm text-gray-600">{testimonial.userType}</p>
                  <div className="text-yellow-400 mt-2">
                    {'★'.repeat(testimonial.rating)}
                  </div>
                  {testimonial.className && (
                    <p className="text-xs text-gray-500 mt-2">
                      Class: {testimonial.className}
                    </p>
                  )}
                </div>
              ))}
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
      </div>
            </>
    );
  };

export default Homepage;
