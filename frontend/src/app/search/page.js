"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Footer';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [enhancementMessage, setEnhancementMessage] = useState('');
  const [user, setUser] = useState({});

  const router = useRouter();
  const API_BASE_URL = 'https://rootsnwings-api-944856745086.europe-west2.run.app';

  // Check if query looks like natural language that needs AI enhancement
  const isNaturalLanguageQuery = (query) => {
    const naturalLanguageIndicators = [
      // Question words
      'what', 'who', 'when', 'where', 'which', 'how',
      // Full sentences/preferences
      'i want', 'i need', 'looking for', 'find me', 'for my',
      // Descriptive terms
      'for kids', 'for children', 'for adults', 'for teens', 'online', 'in person',
      'cheap', 'affordable', 'beginner', 'advanced', 'near me'
    ];
    
    const lowerQuery = query.toLowerCase();
    return naturalLanguageIndicators.some(indicator => lowerQuery.includes(indicator)) ||
           query.split(' ').length > 3; // More than 3 words likely natural language
  };

  // Parse AI response to extract search parameters - KISS approach
  const parseAIResponse = (aiText) => {
    const filters = {};
    
    // Simple line-by-line parsing - much simpler than regex
    const lines = aiText.split('\n');
    
    lines.forEach(line => {
      if (line.includes('search_terms:')) {
        filters.search_terms = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
      if (line.includes('category:')) {
        filters.category = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
      if (line.includes('age_group:')) {
        filters.age_group = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
      if (line.includes('format:')) {
        filters.format = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
      if (line.includes('location:')) {
        filters.location = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
      if (line.includes('matched_subjects:')) {
        filters.matched_subjects = line.split(':')[1]?.trim().replace(/[\[\]]/g, '') || '';
      }
    });
    
    return filters;
  };

  // Enhance search query using AI
  const enhanceSearchWithAI = async (userQuery) => {
    try {
      if (!isNaturalLanguageQuery(userQuery)) {
        return { q: userQuery }; // Return simple query for keywords
      }

      console.log('Enhancing query with AI:', userQuery);
      
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Using available subjects metadata, extract and enhance search parameters from: "${userQuery}". 

Find semantic matches using synonyms and keywords from our subjects database.
For example: "kite making" should match "kite crafting", "3d printing" should match "additive manufacturing".

Return exactly this format:
search_terms: [enhanced search terms including synonyms]
category: [subject category like music, dance, art, stem]  
age_group: [child, teen, adult, or null]
format: [online, in-person, hybrid, or null]
location: [city name or null]
matched_subjects: [list of subjects found in metadata]`
        })
      });
      
      const aiData = await response.json();
      
      if (response.ok && aiData.response) {
        const enhancedFilters = parseAIResponse(aiData.response);
        console.log('AI enhanced filters:', enhancedFilters);
        
        // Build final search parameters - KISS approach
        const searchParams = {
          q: enhancedFilters.search_terms || userQuery
        };
        
        // Add filters if they exist and aren't null/undefined
        Object.entries(enhancedFilters).forEach(([key, value]) => {
          if (value && value !== 'null' && value !== 'undefined' && key !== 'search_terms') {
            // Map AI keys to backend keys
            const keyMap = {
              'category': 'category',
              'age_group': 'ageGroup', 
              'format': 'format',
              'location': 'city' // Map location to city for backend
            };
            
            if (keyMap[key]) {
              searchParams[keyMap[key]] = value;
            }
          }
        });
        
        setAiEnhanced(true);
        let message = ` AI enhanced your search for "${userQuery}"`;
        
        if (enhancedFilters.matched_subjects) {
          message += ` → Found matches in: ${enhancedFilters.matched_subjects}`;
        } else {
          message += ` with ${Object.keys(searchParams).length - 1} smart filters`;
        }
        
        setEnhancementMessage(message);
        
        return searchParams;
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }
    
    // Fallback to original query
    return { q: userQuery };
  };

  useEffect(() => {
    // Load user from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }

      // Get search parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q') || '';
      const category = urlParams.get('category') || '';
      const location = urlParams.get('location') || '';
      
      setSearchQuery(query);
      
      if (query) {
        // Try AI enhancement first, then perform search
        handleAIEnhancedSearch(query, { category, location });
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleAIEnhancedSearch = async (originalQuery, existingFilters = {}) => {
    try {
      // Get AI-enhanced search parameters
      const enhancedParams = await enhanceSearchWithAI(originalQuery);
      
      // Simple merge: AI suggestions + URL params (URL wins if conflict)
      const finalFilters = { ...enhancedParams, ...existingFilters };
      
      // Perform search with enhanced parameters
      await performSearch(finalFilters.q || enhancedParams.search_terms || originalQuery, finalFilters);
      
    } catch (error) {
      console.error('AI enhancement failed, using original query:', error);
      // Fallback to regular search
      performSearch(originalQuery, existingFilters);
    }
  };

  const performSearch = async (query, filters = {}) => {
    console.log('🚀 performSearch called with:', { query, filters });
    setLoading(true);
    setError('');
    
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...filters
      });
      
      console.log('🔍 Search URL:', `${API_BASE_URL}/search/?${searchParams}`);
      console.log('🔍 Search filters:', filters);
      
      const response = await fetch(`${API_BASE_URL}/search/?${searchParams}`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (response.ok) {
        setSearchResults(data.results || []);
        setTotalResults(data.results?.length || 0);
        console.log('✅ Search results set:', data.results?.length || 0, 'results');
      } else {
        setError('Search failed. Please try again.');
        console.log('❌ Search failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setError('Unable to perform search. Please check your connection.');
    } finally {
      setLoading(false);
      console.log('🏁 Search completed, loading set to false');
    }
  };

  const handleViewDetails = (result) => {
    if (result.type === 'mentor') {
      // Store the actual mentor data, not the search result wrapper
      localStorage.setItem("mentor", JSON.stringify(result.data));
      window.location.href = "/mentor/detailpage";
    } else if (result.type === 'class') {
      // All class types go directly to booking page
      router.push(`/booking/confirmbooking/${result.id}`);
    }
  };

  const formatPrice = (price) => {
    return price ? `£${price}/session` : 'Price on request';
  };

  const formatLocation = (location) => {
    if (!location || location === 'None, None') return 'Location flexible';
    return location;
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
              Search Results
            </h1>
            {searchQuery && (
              <p className="text-lg text-gray-600 leading-relaxed">
                Found {totalResults} results for "{searchQuery}"
              </p>
            )}
          </div>
        </section>

        {/* AI Enhancement Message */}
        {aiEnhanced && enhancementMessage && (
          <section className="bg-blue-50 border-b border-blue-200">
            <div className="max-w-6xl mx-auto px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🤖</span>
                <p className="text-blue-700 text-sm">{enhancementMessage}</p>
              </div>
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <section className="bg-red-50 border-b border-red-200">
            <div className="max-w-6xl mx-auto px-5 py-4">
              <p className="text-red-700">{error}</p>
            </div>
          </section>
        )}

        {/* Results Section */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-5">
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for "{searchQuery}"...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or browse our categories.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Result Type Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.type === 'mentor' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {result.type === 'mentor' ? '👨‍🏫 Mentor' : '📚 Class'}
                          </span>
                          {result.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {result.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {result.description}
                        </p>

                        {/* Details Row */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span>{result.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>{formatPrice(result.price)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{formatLocation(result.location)}</span>
                          </div>
                          {result.type === 'class' && result.data.schedule && (
                            <div className="flex items-center gap-1">
                              <span>📅</span>
                              <span>Starts {new Date(result.data.schedule.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {result.type === 'class' && result.data.capacity && (
                            <div className="flex items-center gap-1">
                              <span>👥</span>
                              <span>{result.data.capacity.currentEnrollment}/{result.data.capacity.maxStudents} spots</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {result.tags.slice(0, 5).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {result.tags.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{result.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Image and Action */}
                      <div className="flex flex-col items-end gap-4 ml-6">
                        {result.imageUrl && (
                          <img
                            src={result.imageUrl}
                            alt={result.title}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <button
                          onClick={() => handleViewDetails(result)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {result.type === 'mentor' ? 'View Profile' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Back to search */}
            {!loading && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  ← New Search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer Component */}
        <Footer />
      </body>
    </>
  );
};

export default SearchResults;