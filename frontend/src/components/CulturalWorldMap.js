"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });

const CulturalWorldMap = () => {
  const [culturalData, setCulturalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [worldwideSubjects, setWorldwideSubjects] = useState([]);
  const [showFilter, setShowFilter] = useState('all'); // 'cultural', 'worldwide', 'all'

  // Country coordinates for map markers
  const countryCoordinates = {
    'India': [20.5937, 78.9629],
    'China': [35.8617, 104.1954],
    'France': [46.2276, 2.2137],
    'Nigeria': [9.0820, 8.6753],
    'Japan': [36.2048, 138.2529],
    'Spain': [40.4637, -3.7492],
    'Italy': [41.8719, 12.5674],
    'Brazil': [-14.2350, -51.9253],
    'Russia': [61.5240, 105.3188],
    'Indonesia': [-0.7893, 113.9213],
    'Scotland': [56.4907, -4.2026],
    'United Kingdom': [55.3781, -3.4360],
    'UK': [55.3781, -3.4360],
    'Germany': [51.1657, 10.4515],
    'Greece': [39.0742, 21.8243],
    'Egypt': [26.0975, 30.0444],
    'Mexico': [23.6345, -102.5528],
    'Argentina': [-38.4161, -63.6167],
    'Australia': [-25.2744, 133.7751],
    'South Korea': [35.9078, 127.7669],
    'Thailand': [15.8700, 100.9925],
    'Iran': [32.4279, 53.6880],
    'Turkey': [38.9637, 35.2433],
    'Poland': [51.9194, 19.1451],
    'Morocco': [31.7917, -7.0926]
    'USA': [39.8283, -98.5795],
    'United States': [39.8283, -98.5795],
    'Jamaica': [18.1096, -77.2975],
    'Brazil': [-14.2350, -51.9253],
    'Indonesia': [-0.7893, 113.9213],
    'Thailand': [15.8700, 100.9925],
    'Turkey': [38.9637, 35.2433],
    'Saudi Arabia': [23.8859, 45.0792],
    'UAE': [23.4241, 53.8478],
    'Jordan': [30.5852, 36.2384],
    'Lebanon': [33.8547, 35.8623]

  // Country flag emojis
  const countryFlags = {
    'India': '🇮🇳',
    'China': '🇨🇳', 
    'France': '🇫🇷',
    'Nigeria': '🇳🇬',
    'Japan': '🇯🇵',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Brazil': '🇧🇷',
    'Russia': '🇷🇺',
    'Indonesia': '🇮🇩',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'United Kingdom': '🇬🇧',
    'UK': '🇬🇧',
    'Germany': '🇩🇪',
    'Greece': '🇬🇷',
    'Egypt': '🇪🇬',
    'Mexico': '🇲🇽',
    'Argentina': '🇦🇷',
    'Australia': '🇦🇺',
    'South Korea': '🇰🇷',
    'Thailand': '🇹🇭',
    'Iran': '🇮🇷',
    'Turkey': '🇹🇷',
    'Poland': '🇵🇱',
    'Morocco': '🇲🇦',
    'USA': '🇺🇸',
    'United States': '🇺🇸',
    'Jamaica': '🇯🇲',
    'Indonesia': '🇮🇩',
    'Thailand': '🇹🇭',
    'Turkey': '🇹🇷',
    'Saudi Arabia': '🇸🇦',
    'UAE': '🇦🇪',
    'Jordan': '🇯🇴',
    'Lebanon': '🇱🇧'
  };

  // Parse region and country from cultural_origin_region string
  const parseLocation = (regionString) => {
    if (!regionString) return { region: null, country: null };
    
    if (regionString.includes(',')) {
      const parts = regionString.split(',').map(part => part.trim());
      return {
        region: parts[0], // "Tamil Nadu"
        country: parts[1] // "India"
      };
    }
    
    // No comma - treat as country only
    return {
      region: null,
      country: regionString
    };
  };

  // Get coordinates for a location (region first, fallback to country)
  const getLocationCoordinates = async (region, country) => {
    // Try region first if available
    if (region) {
      const regionCoords = countryCoordinates[`${region}, ${country}`] || countryCoordinates[region];
      if (regionCoords) return regionCoords;
      
      // Try geocoding the region
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(region + ', ' + country)}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (error) {
        console.warn('Geocoding failed for region:', region, error);
      }
    }
    
    // Fallback to country coordinates
    return countryCoordinates[country] || null;
  };

  // Fetch cultural data from approved classes
  useEffect(() => {
    const fetchCulturalData = async () => {
      try {
        setLoading(true);
        // Fetch only approved classes
        const response = await fetch('https://rootsnwings-api-944856745086.europe-west2.run.app/classes/?status=approved');
        const data = await response.json();
        
        const culturalMap = {};
        const locationPromises = [];
        
        // Separate arrays for cultural and worldwide subjects
        const worldwideSubjectsData = [];
        
        // Process each approved class
        (data.classes || []).forEach(classItem => {
          const regionString = classItem.searchMetadata?.cultural_origin_region;
          
          // Handle worldwide subjects separately
          if (regionString === 'Worldwide' || regionString?.toLowerCase() === 'worldwide') {
            const subjectName = classItem.subject;
            const existingWorldwide = worldwideSubjectsData.find(item => item.subject === subjectName);
            
            if (!existingWorldwide) {
              worldwideSubjectsData.push({
                subject: subjectName,
                count: 1,
                classes: [classItem]
              });
            } else {
              existingWorldwide.count++;
              existingWorldwide.classes.push(classItem);
            }
          } else if (regionString && regionString !== 'Worldwide' && regionString.toLowerCase() !== 'worldwide') {
            const { region, country } = parseLocation(regionString);
            
            if (country) {
              // Use region as key if available, otherwise use country
              const locationKey = region || country;
              const displayName = region ? `${region}, ${country}` : country;
              
              if (!culturalMap[locationKey]) {
                culturalMap[locationKey] = {
                  region: region,
                  country: country,
                  displayName: displayName,
                  subjects: new Set(),
                  classes: [],
                  count: 0,
                  authenticityScores: [],
                  flag: countryFlags[country] || '🌍',
                  coordinates: null // Will be populated later
                };
                
                // Queue coordinate lookup
                locationPromises.push(
                  getLocationCoordinates(region, country).then(coords => {
                    if (coords) {
                      culturalMap[locationKey].coordinates = coords;
                    }
                  })
                );
              }
              
              culturalMap[locationKey].subjects.add(classItem.subject);
              culturalMap[locationKey].classes.push(classItem);
              culturalMap[locationKey].count++;
              
              const authenticity = classItem.searchMetadata?.cultural_authenticity_score || 0.5;
              culturalMap[locationKey].authenticityScores.push(authenticity);
            }
          }
        });
        
        // Wait for all coordinate lookups to complete
        await Promise.all(locationPromises);
        
        // Convert Sets to Arrays and calculate averages
        Object.keys(culturalMap).forEach(locationKey => {
          culturalMap[locationKey].subjects = Array.from(culturalMap[locationKey].subjects);
          
          const scores = culturalMap[locationKey].authenticityScores;
          culturalMap[locationKey].avgAuthenticity = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0.5;
        });
        
        // Filter out locations without coordinates
        Object.keys(culturalMap).forEach(locationKey => {
          if (!culturalMap[locationKey].coordinates) {
            console.warn('No coordinates found for location:', locationKey);
            delete culturalMap[locationKey];
          }
        });
        
        setCulturalData(culturalMap);
        setWorldwideSubjects(worldwideSubjectsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cultural data:', err);
        setError('Failed to load cultural heritage data');
      } finally {
        setLoading(false);
      }
    };

    fetchCulturalData();
  }, []);

  // Filter cultural data based on current filter
  const filteredCulturalData = useMemo(() => {
    if (showFilter === 'worldwide') return {};
    return culturalData;
  }, [culturalData, showFilter]);

  // Filter worldwide subjects based on current filter
  const filteredWorldwideSubjects = useMemo(() => {
    if (showFilter === 'cultural') return [];
    return worldwideSubjects;
  }, [worldwideSubjects, showFilter]);

  // Create markers for locations (regions/countries) with cultural classes
  const markers = useMemo(() => {
    return Object.entries(filteredCulturalData).map(([locationKey, data]) => {
      const coords = data.coordinates;
      if (!coords) return null;

      // Color based on cultural authenticity
      const color = data.avgAuthenticity >= 0.8 ? '#dc2626' : // High authenticity - red
                   data.avgAuthenticity >= 0.6 ? '#ea580c' : // Medium authenticity - orange  
                   '#3b82f6'; // Lower authenticity - blue

      return {
        locationKey,
        displayName: data.displayName,
        position: coords,
        data,
        color
      };
    }).filter(Boolean);
  }, [filteredCulturalData]);

  const handleMarkerClick = (locationKey) => {
    setSelectedCountry(locationKey);
    setShowModal(true);
  };

  const handleSubjectSearch = (subject) => {
    setShowModal(false);
    window.location.href = `/search?q=${encodeURIComponent(subject)}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading cultural heritage map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center">
        <div className="text-red-600 text-xl mb-2">🗺️</div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 overflow-hidden">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            🌍 Global Cultural Heritage on Our Platform
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover traditional arts and cultural subjects from around the world, taught by UK-based mentors. 
            Click on any marker to explore cultural offerings.
          </p>
          
          {/* Filter Controls */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setShowFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setShowFilter('cultural')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilter === 'cultural'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cultural Heritage
            </button>
            <button
              onClick={() => setShowFilter('worldwide')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilter === 'worldwide'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Global Skills
            </button>
          </div>
        </div>

        {Object.keys(filteredCulturalData).length === 0 && filteredWorldwideSubjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-gray-600">
              {showFilter === 'cultural' 
                ? 'No cultural heritage classes found with approved status'
                : showFilter === 'worldwide'
                ? 'No global skill classes found with approved status'
                : 'No classes found with approved status'}
            </p>
          </div>
        ) : (
          <>
            {/* Interactive World Map - Only show if we have cultural data or showing all */}
            {(showFilter === 'all' || showFilter === 'cultural') && Object.keys(filteredCulturalData).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6" style={{ height: '400px' }}>
                <MapContainer
                  center={[30, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  className="z-10"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {markers.map(({ locationKey, displayName, position, data, color }, index) => (
                    <CircleMarker
                      key={`${locationKey}-${index}`}
                      center={position}
                      radius={Math.min(20, 8 + data.count * 2)}
                      fillColor={color}
                      color="white"
                      weight={2}
                      opacity={0.9}
                      fillOpacity={0.7}
                      eventHandlers={{
                        click: () => handleMarkerClick(locationKey),
                      }}
                    >
                      <Popup>
                        <div className="text-center p-2">
                          <div className="text-2xl mb-1">{data.flag}</div>
                          <div className="font-semibold text-gray-800">{displayName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {data.count} cultural class{data.count !== 1 ? 'es' : ''}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {data.subjects.length} subject{data.subjects.length !== 1 ? 's' : ''} • Authenticity: {(data.avgAuthenticity * 100).toFixed(0)}%
                          </div>
                          <button 
                            onClick={() => handleMarkerClick(locationKey)}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Explore {data.region || data.country} Arts
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            )}

            {/* Global Skills Section - Only show if we have worldwide subjects */}
            {(showFilter === 'all' || showFilter === 'worldwide') && filteredWorldwideSubjects.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 mt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🌍 Global Skills Available
                </h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Universal subjects taught by our mentors, not tied to specific cultural traditions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWorldwideSubjects.map((subjectData, index) => (
                    <div
                      key={index}
                      onClick={() => handleSubjectSearch(subjectData.subject)}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border hover:border-green-300"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                          🌍
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 capitalize">
                            {subjectData.subject.replace(/_/g, ' ')}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {subjectData.count} class{subjectData.count !== 1 ? 'es' : ''} available
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 hover:text-green-700">
                        Click to explore mentors and classes
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend - Only show for cultural heritage view */}
            {(showFilter === 'all' || showFilter === 'cultural') && Object.keys(filteredCulturalData).length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span>High Authenticity (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  <span>Medium Authenticity (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span>General Cultural (60%)</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cultural Subjects Modal */}
      {showModal && selectedCountry && filteredCulturalData[selectedCountry] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {filteredCulturalData[selectedCountry].flag} 
                  {filteredCulturalData[selectedCountry].displayName} Cultural Heritage
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Classes Available:</span> {filteredCulturalData[selectedCountry].count}
                  </div>
                  <div>
                    <span className="font-semibold">Cultural Authenticity:</span> {(filteredCulturalData[selectedCountry].avgAuthenticity * 100).toFixed(0)}%
                  </div>
                </div>
                {filteredCulturalData[selectedCountry].region && (
                  <div className="mt-2 text-sm">
                    <span className="font-semibold">Region:</span> {filteredCulturalData[selectedCountry].region}, {filteredCulturalData[selectedCountry].country}
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">
                Cultural subjects from {filteredCulturalData[selectedCountry].displayName} available on our platform:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {filteredCulturalData[selectedCountry].subjects.map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubjectSearch(subject)}
                    className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border hover:border-blue-200 group"
                  >
                    <div className="font-medium text-gray-800 capitalize group-hover:text-blue-700">
                      {subject.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-600">
                      Click to find mentors and classes
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