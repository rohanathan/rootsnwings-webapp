"use client";

import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('🎯 All Categories');
  const [selectedLocation, setSelectedLocation] = useState('📍 All Locations');

  // Handle search button click or Enter key press
  const handleSearch = async () => {
    console.log('🔘 Search button clicked!');
    console.log('🔍 Search term:', searchTerm);
    console.log('🎯 Selected category:', selectedCategory);
    console.log('📍 Selected location:', selectedLocation);
    
    if (searchTerm.trim()) {
      console.log('✅ Search term is not empty, processing...');
      
      // For simple keyword searches, go directly without AI
      const isSimpleKeyword = searchTerm.trim().split(' ').length <= 2 && 
                              !searchTerm.toLowerCase().includes('i want') &&
                              !searchTerm.toLowerCase().includes('for ');
      
      console.log('🧠 Is simple keyword?', isSimpleKeyword);
      
      if (isSimpleKeyword) {
        console.log('🔍 Processing as simple keyword search...');
        // Build search parameters for simple queries
        const searchParams = new URLSearchParams({
          q: searchTerm.trim(),
        });
        
        // Add category filter if selected
        if (selectedCategory && selectedCategory !== '🎯 All Categories') {
          const cleanCategory = selectedCategory.replace('🎻 ', '').replace('🎨 ', '').replace('🧘 ', '').replace('🗣️ ', '').toLowerCase().replace(' ', '_');
          searchParams.append('category', cleanCategory);
          console.log('🎯 Added category filter:', cleanCategory);
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
        console.log('🤖 Processing as natural language search...');
        // For natural language queries, let the search page handle AI enhancement
        const searchParams = new URLSearchParams({
          q: searchTerm.trim(),
        });
        
        // Still add manual filters if selected
        if (selectedCategory && selectedCategory !== '🎯 All Categories') {
          const cleanCategory = selectedCategory.replace('🎻 ', '').replace('🎨 ', '').replace('🧘 ', '').replace('🗣️ ', '').toLowerCase().replace(' ', '_');
          searchParams.append('category', cleanCategory);
          console.log('🎯 Added category filter:', cleanCategory);
        }
        
        if (selectedLocation && selectedLocation !== '📍 All Locations') {
          searchParams.append('location', selectedLocation);
          console.log('📍 Added location filter:', selectedLocation);
        }
        
        const searchUrl = `/search?${searchParams.toString()}`;
        console.log('🚀 Navigating to:', searchUrl);
        
        // Navigate to search results page (AI enhancement happens there)
        window.location.href = searchUrl;
      }
    } else {
      console.log('❌ Search term is empty, nothing to search');
    }
  };

  // Handle category selection
  const handleCategoryClick = (categoryName) => {
    setSearchTerm(categoryName);
    setSelectedCategory(categoryName);
    // Automatically search when category is clicked
    handleSearch();
  };

  // Handle dropdown changes
  const handleFilterChange = (e, filterType) => {
    if (filterType === 'category') {
      setSelectedCategory(e.target.value);
    } else if (filterType === 'location') {
      setSelectedLocation(e.target.value);
    }
    // No automatic search on dropdown change - user needs to click search
  };

  return (
    <section id="home" className="bg-gradient-to-br from-primary-light to-accent-light pt-20 pb-16 mt-16">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-primary-dark mb-6 leading-tight">
              Find the Right Mentor for Your Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Explore deeply rooted skills and knowledge from experienced UK-based mentors
            </p>

            {/* Search Container */}
            <div className="mb-8">
              {/* Search Bar */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" aria-label="Search icon">🔍</span>
                <input
                  type="text"
                  className="w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-full text-base focus:border-primary focus:outline-none transition-colors"
                  placeholder='Try "piano for kids" or "I want online dance classes"'
                  aria-label="Search for mentors or skills"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  aria-label="Start searching"
                  onClick={handleSearch}
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
                  onChange={(e) => handleFilterChange(e, 'category')}
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
                  onChange={(e) => handleFilterChange(e, 'location')}
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
  );
};

export default HeroSection;
