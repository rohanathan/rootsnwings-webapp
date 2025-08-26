"use client";

import React, { useState, useEffect } from 'react';

const CulturalWorldMap = () => {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Cultural mapping - subjects to their countries of origin
  const culturalMapping = {
    'India': {
      flag: '🇮🇳',
      subjects: ['bollywood_dance', 'classical_indian_music', 'hindi_language', 'yoga', 'tabla', 'kathak', 'bharatanatyam', 'ayurveda'],
      displayName: 'Indian Cultural Arts'
    },
    'China': {
      flag: '🇨🇳', 
      subjects: ['martial_arts', 'mandarin', 'chinese_calligraphy', 'tai_chi', 'traditional_chinese_medicine', 'chinese_opera'],
      displayName: 'Chinese Traditional Arts'
    },
    'France': {
      flag: '🇫🇷',
      subjects: ['ballet', 'french_language', 'french_cuisine', 'classical_music', 'wine_making', 'patisserie'],
      displayName: 'French Cultural Arts'
    },
    'Nigeria': {
      flag: '🇳🇬',
      subjects: ['afrobeats', 'african_drumming', 'yoruba_language', 'african_textiles', 'traditional_african_dance'],
      displayName: 'Nigerian Cultural Arts'
    },
    'Japan': {
      flag: '🇯🇵',
      subjects: ['japanese_language', 'origami', 'ikebana', 'tea_ceremony', 'calligraphy', 'kendo', 'anime_art'],
      displayName: 'Japanese Traditional Arts'
    },
    'Spain': {
      flag: '🇪🇸',
      subjects: ['spanish_language', 'flamenco', 'spanish_guitar', 'paella_cooking', 'salsa_dance'],
      displayName: 'Spanish Cultural Arts'
    },
    'Italy': {
      flag: '🇮🇹',
      subjects: ['italian_language', 'italian_cuisine', 'opera', 'renaissance_art', 'wine_appreciation'],
      displayName: 'Italian Cultural Arts'
    },
    'Brazil': {
      flag: '🇧🇷',
      subjects: ['portuguese_language', 'samba', 'capoeira', 'brazilian_cuisine', 'bossa_nova'],
      displayName: 'Brazilian Cultural Arts'
    },
    'Russia': {
      flag: '🇷🇺',
      subjects: ['russian_language', 'ballet', 'classical_music', 'traditional_folk_dance', 'matryoshka_painting'],
      displayName: 'Russian Cultural Arts'
    },
    'Indonesia': {
      flag: '🇮🇩',
      subjects: ['balinese_dance', 'indonesian_language', 'traditional_crafts', 'gamelan_music'],
      displayName: 'Indonesian Cultural Arts'
    }
  };

  // Fetch available subjects from API and match with cultural mapping
  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      try {
        // Fetch subjects and mentors to see what's actually available
        const [subjectsResponse, mentorsResponse] = await Promise.all([
          fetch('https://rootsnwings-api-944856745086.europe-west2.run.app/metadata/subjects'),
          fetch('https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/')
        ]);

        const subjectsData = await subjectsResponse.json();
        const mentorsData = await mentorsResponse.json();

        // Get all subjects that mentors actually teach
        const mentorSubjects = mentorsData.mentors?.flatMap(mentor => mentor.subjects || []) || [];
        const availableSubjectsList = [...new Set(mentorSubjects)];

        // Map countries to their available subjects
        const countrySubjects = {};
        
        Object.entries(culturalMapping).forEach(([country, data]) => {
          const availableForCountry = data.subjects.filter(subject => 
            availableSubjectsList.some(mentorSubject => 
              mentorSubject.toLowerCase().includes(subject.toLowerCase()) ||
              subject.toLowerCase().includes(mentorSubject.toLowerCase())
            )
          );
          
          if (availableForCountry.length > 0) {
            countrySubjects[country] = {
              ...data,
              availableSubjects: availableForCountry,
              count: availableForCountry.length
            };
          }
        });

        setAvailableSubjects(countrySubjects);
      } catch (error) {
        console.error('Error fetching cultural subjects:', error);
      }
    };

    fetchAvailableSubjects();
  }, []);

  const handleCountryClick = (country) => {
    if (availableSubjects[country]) {
      setSelectedCountry(country);
      setShowModal(true);
    }
  };

  const handleSubjectClick = (subject) => {
    setShowModal(false);
    // Navigate to search with the subject
    window.location.href = `/search?q=${encodeURIComponent(subject)}`;
  };

  const WorldMapSVG = () => (
    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 text-6xl">🌍</div>
        <div className="absolute top-8 right-8 text-4xl">✈️</div>
        <div className="absolute bottom-8 left-12 text-3xl">🏛️</div>
        <div className="absolute bottom-4 right-4 text-5xl">🎭</div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Discover Your Cultural Heritage in the UK
        </h3>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Hover over your home country to find traditional subjects and cultural arts taught by UK-based mentors
        </p>
        
        {/* Interactive Country Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {Object.entries(culturalMapping).map(([country, data]) => {
            const isAvailable = availableSubjects[country];
            const count = isAvailable?.count || 0;
            
            return (
              <div
                key={country}
                className={`relative p-4 rounded-lg text-center transition-all duration-300 cursor-pointer ${
                  isAvailable 
                    ? 'bg-white hover:bg-blue-50 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-300' 
                    : 'bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
                onMouseEnter={() => isAvailable && setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick(country)}
              >
                <div className="text-3xl mb-2">{data.flag}</div>
                <div className="text-sm font-medium text-gray-800">{country}</div>
                {isAvailable && (
                  <div className="text-xs text-blue-600 font-semibold mt-1">
                    {count} subject{count !== 1 ? 's' : ''}
                  </div>
                )}
                
                {/* Availability badge */}
                {isAvailable && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredCountry && availableSubjects[hoveredCountry] && (
          <div className="mt-6 text-center">
            <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-lg border">
              <div className="text-sm font-semibold text-gray-800">
                {availableSubjects[hoveredCountry].flag} {hoveredCountry} Cultural Arts
              </div>
              <div className="text-xs text-blue-600">
                {availableSubjects[hoveredCountry].count} subjects available • Click to explore
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <WorldMapSVG />
      
      {/* Modal for showing country subjects */}
      {showModal && selectedCountry && availableSubjects[selectedCountry] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {availableSubjects[selectedCountry].flag} {availableSubjects[selectedCountry].displayName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">
                Available cultural subjects from {selectedCountry} taught by UK-based mentors:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {availableSubjects[selectedCountry].availableSubjects.map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubjectClick(subject)}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border hover:border-blue-200"
                  >
                    <div className="font-medium text-gray-800 capitalize">
                      {subject.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Click to find mentors
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CulturalWorldMap;