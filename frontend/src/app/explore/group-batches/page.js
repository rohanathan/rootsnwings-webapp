'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { calculateTotalPayable, formatPrice } from '../../utils/pricingCalculator';
import ChildSelectionModal from '@/components/ChildSelectionModal';
// Helper functions for conditional visual styling
const getLevelBadge = (level) => {
  switch(level?.toLowerCase()) {
    case 'beginner': return { color: 'bg-blue-100 text-blue-700', icon: '⭐', label: 'Beginner' };
    case 'intermediate': return { color: 'bg-yellow-100 text-yellow-700', icon: '⚡', label: 'Intermediate' };
    case 'advanced': return { color: 'bg-red-100 text-red-700', icon: '🏆', label: 'Advanced' };
    default: return { color: 'bg-gray-100 text-gray-700', icon: '📚', label: 'All Levels' };
  }
};

const getAgeGroupBadge = (ageGroup) => {
  switch(ageGroup?.toLowerCase()) {
    case 'child': 
    case 'children': 
      return { color: 'bg-green-100 text-green-700', icon: '👶', label: 'Children (5-12)' };
    case 'teen': 
    case 'teens': 
      return { color: 'bg-purple-100 text-purple-700', icon: '🎓', label: 'Teens (13-17)' };
    case 'adult': 
    case 'adults': 
      return { color: 'bg-indigo-100 text-indigo-700', icon: '👩‍💼', label: 'Adults (18+)' };
    default: return { color: 'bg-gray-100 text-gray-700', icon: '👥', label: 'All Ages' };
  }
};

const getAvailabilityStatus = (available, max) => {
  const ratio = available / max;
  if (ratio > 0.5) return { status: 'Good availability', color: 'bg-green-400' };
  if (ratio > 0.2) return { status: 'Filling up fast', color: 'bg-orange-400 animate-pulse' };
  return { status: 'Almost full', color: 'bg-red-400 animate-pulse' };
};

const getFormatIcon = (format) => {
  switch(format?.toLowerCase()) {
    case 'online': return '💻';
    case 'in-person': return '🏠';
    case 'hybrid': return '🎭';
    default: return '📍';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'short' 
  });
};

const formatSchedule = (weeklySchedule) => {
  if (!weeklySchedule || weeklySchedule.length === 0) return 'Schedule TBD';

  // Get unique days by filtering duplicates
  const uniqueDays = [...new Set(weeklySchedule.map(s => s.day))];
  
  // Sort days according to day of week
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  // Format days to 3 letter abbreviation
  const days = uniqueDays.map(day => day.slice(0, 3)).join(' & ');

  // Get time from first schedule entry since they're all the same
  const time = weeklySchedule[0].startTime + ' - ' + weeklySchedule[0].endTime;

  return `${days} | ${time}`;
};



// {
//   "classId": "class_50ddb1a0",
//   "type": "group",
//   "title": "Guitar class",
//   "subject": "dance",
//   "category": "Dance",
//   "description": "Learn guitar fundamentals - updated",
//   "mentorId": "user_72b1365b989b",
//   "mentorName": "Tester",
//   "mentorPhotoURL": null,
//   "mentorRating": null,
//   "level": "beginner",
//   "ageGroup": "teen",
//   "format": "online",
//   "schedule": {
//       "startDate": "2025-08-01",
//       "endDate": "2025-08-31",
//       "weeklySchedule": [
//           {
//               "endTime": "11:00",
//               "day": "Monday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Tuesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Wednesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Monday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Tuesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Wednesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Monday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Tuesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Wednesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Monday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Tuesday",
//               "startTime": "10:00"
//           },
//           {
//               "endTime": "11:00",
//               "day": "Wednesday",
//               "startTime": "10:00"
//           }
//       ],
//       "sessionDuration": 60
//   },
//   "capacity": {
//       "maxStudents": 6,
//       "minStudents": 2,
//       "currentEnrollment": 0
//   },
//   "pricing": {
//       "perSessionRate": 120,
//       "totalSessions": 12,
//       "subtotal": 340,
//       "currency": "GBP"
//   },
//   "createdAt": "2025-08-06T10:13:30.451207",
//   "updatedAt": "2025-08-06T11:42:08.467058"
// }

export default function GroupBatches() {
  
  const [filters, setFilters] = useState({
    level: '',
    ageGroup: '',
    format: '',
    subject: '',
  });
  // const [filteredBatches, setFilteredBatches] = useState({});
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  
  // Child selection modal state
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  // Effect to apply filters whenever the filter state changes
  useEffect(() => {
    const applyFilters = () => {
      const { level, ageGroup, format, subject } = filters;
      // const newFilteredBatches = mentorClasses.filter((batch) => {
      //   const levelMatch = !level || batch.level?.toLowerCase() === level.toLowerCase();
      //   const ageMatch = !ageGroup || batch.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
      //   const formatMatch = !format || batch.format?.toLowerCase() === format.toLowerCase();
      //   const subjectMatch = !subject || batch.subject?.toLowerCase() === subject.toLowerCase();
      //   return levelMatch && ageMatch && formatMatch && subjectMatch;
      // });
      // setFilteredBatches(newFilteredBatches);
    };

    applyFilters();
  }, [filters]);


  const [mentorData, setMentorData] = useState(null);
  const [mentorClasses, setMentorClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassesData = async () => {
      setLoading(true);
      try {
        // Get mentorId from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlMentorId = urlParams.get('mentorId');
        const urlType = urlParams.get('type');
        
        let mentorId = urlMentorId;
        let mentor = null;
        
        // If no URL params, fall back to localStorage
        if (!mentorId) {
          const storedMentor = localStorage.getItem("mentor");
          if (storedMentor) {
            mentor = JSON.parse(storedMentor);
            mentorId = mentor.uid;
          }
        }
        
        if (!mentorId) {
          console.error('No mentor ID found in URL params or localStorage');
          setLoading(false);
          return;
        }
        
        // Build API URL with query parameters
        let apiUrl = `/api/classes?mentorId=${mentorId}`;
        if (urlType) {
          apiUrl += `&type=${urlType}`;
        }
        
        console.log('Fetching classes from:', apiUrl);
        
        const response = await axios.get(apiUrl);
        setMentorClasses(response.data.classes || []);
        localStorage.setItem('availableMentorClass', JSON.stringify(response.data.classes || []));
        
        // If we have URL params, also try to fetch mentor info for display
        if (urlMentorId && !mentor) {
          try {
            const mentorResponse = await axios.get(`/api/mentors/${urlMentorId}`);
            if (mentorResponse.data?.mentor) {
              localStorage.setItem('mentor', JSON.stringify(mentorResponse.data.mentor));
              setMentorData(mentorResponse.data.mentor);
            }
          } catch (mentorError) {
            console.warn('Could not fetch mentor details:', mentorError);
          }
        }
        
      } catch (error) {
        console.error('Error fetching classes data:', error);
        setMentorClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesData();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const idToken = await currentUser.getIdToken();
          const profileResponse = await axios.get(
            `/api/users/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          const userData = profileResponse.data?.user || {};
          setUserRoles(userData.roles || []);
          
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRoles(['student']); // Default fallback
        }
      } else {
        setUser(null);
        setUserRoles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(mentorData,'mentorData mentorClasses');
  

  // Handle enrollment button click
  const handleEnrollNow = (batch) => {
    // Check if user has student profile (required for all bookings)
    const isStudent = userRoles.includes('student');
    if (!isStudent) {
      alert('⚠️ Student Profile Required\n\nTo book classes, you need to have a student profile.\n\nPlease complete your student profile setup first.');
      return;
    }

    // Check if user needs to select a child for child/teen classes
    const isChildTeenClass = batch.ageGroup === 'child' || batch.ageGroup === 'teen';
    const isParent = userRoles.includes('parent');
    
    if (isChildTeenClass && isParent) {
      // Show child selection modal
      setSelectedBatch(batch);
      setShowChildModal(true);
    } else if (isChildTeenClass && !isParent) {
      // Show error message for non-parent users
      alert('⚠️ Parent Profile Required\n\nThis group batch is designed for children/teens. To book classes for young learners, you need to have a parent profile.\n\nPlease contact support to add parent role to your account.');
    } else {
      // Direct enrollment for adult classes or non-parent users
      localStorage.setItem('selectedMentorClass', JSON.stringify(batch));
      window.location.href = '/booking/confirmbooking/' + batch.classId;
    }
  };

  // Handle child selection from modal
  const handleChildSelected = (childData) => {
    if (selectedBatch) {
      // Store batch data with child information
      const bookingData = {
        ...selectedBatch,
        selectedChild: childData
      };
      localStorage.setItem('selectedMentorClass', JSON.stringify(bookingData));
      window.location.href = '/booking/confirmbooking/' + selectedBatch.classId;
    }
    setShowChildModal(false);
    setSelectedBatch(null);
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
          color: #2d3748;
          background-color: #f7fafc;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .batch-card-animation {
          animation: fadeIn 0.3s ease-in;
        }
        .primary-dark { color: #00468C; }
        .primary { color: #00A2E8; }
        .bg-primary { background-color: #00A2E8; }
        .bg-primary:hover { background-color: #0056b3; }
      `}</style>

      {/* Navigation Component */}
      <nav className=" top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold text-primary-dark hover:text-primary transition-colors">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Profile</a>
            </div>
          </div>
        </div>

             {/* Dynamic Mentor Info Header */}
      <div className="pt-50 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Dynamic Mentor Photo */}
              {mentorClasses[0]?.mentorPhotoURL ? (
                <img 
                  src={mentorClasses[0].mentorPhotoURL} 
                  alt={mentorClasses[0].mentorName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {mentorData?.displayName?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold primary-dark">
                  {mentorData?.displayName || 'Mentor Name'}
                </h2>
                <p className="text-sm text-gray-600">
                  {[...new Set(mentorClasses.map(b => b.subject))].join(' & ').replace(/^\w/, c => c.toUpperCase())} Specialist
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-xs">★★★★★</div>
                  <span className="text-xs text-gray-600">
                    {mentorClasses[0]?.mentorRating || 0.0} (0 reviews)
                  </span>
                  { mentorData?.subjects?.map(subject => 
                       <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full ml-2">
                        {subject}
                  </span>
                    )}

               
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">📚 Structured Programs</span>
              <button className="text-primary hover:text-primary-dark font-medium transition-colors text-sm">
                💬 Message
              </button>
            </div>
          </div>
        </div>
      </div>

      </nav>

 

      {/* Main Content */}
      <div className="mt-5 pb-16">
        <div className="max-w-7xl mx-auto px-5">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold primary-dark mb-4">Group Batches</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join structured group learning programs designed for collaborative skill development. 
              Learn alongside peers in focused, multi-week curricula with dedicated progression tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">👥</span>
                <span>Small group learning</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">📈</span>
                <span>Structured progression</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                <span>Goal-oriented curriculum</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🤝</span>
                <span>Peer collaboration</span>
              </div>
            </div>
          </div>

          {/* Clean Minimal Filter Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="level-filter" className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                <select
                  id="level-filter"
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="age-filter" className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
                <select
                  id="age-filter"
                  name="ageGroup"
                  value={filters.ageGroup}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Ages</option>
                  <option value="child">Children (5-12)</option>
                  <option value="teen">Teenagers (13-17)</option>
                  <option value="adult">Adults (18+)</option>
                </select>
              </div>
              <div>
                <label htmlFor="format-filter" className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                <select
                  id="format-filter"
                  name="format"
                  value={filters.format}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Formats</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject-filter" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  id="subject-filter"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Subjects</option>
                  <option value="kathak">Kathak</option>
                  <option value="dance">Dance</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const { level, ageGroup, format, subject } = filters;
                    const filtered = mentorClasses.filter(batch => {
                      const levelMatch = !level || batch.level?.toLowerCase() === level.toLowerCase();
                      const ageMatch = !ageGroup || batch.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
                      const formatMatch = !format || batch.format?.toLowerCase() === format.toLowerCase();
                      const subjectMatch = !subject || batch.subject?.toLowerCase() === subject.toLowerCase();
                      return levelMatch && ageMatch && formatMatch && subjectMatch;
                    });
                    setFilteredBatches(filtered);
                  }}
                  className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading classes...</p>
            </div>
          )}

          {/* Group Batch Cards Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {mentorClasses?.length > 0 ? (
              mentorClasses.map((batch) => {
                const levelBadge = getLevelBadge(batch.level);
                const ageBadge = getAgeGroupBadge(batch.ageGroup);
                const availabilityStatus = getAvailabilityStatus(batch.capacity.available, batch.capacity.maxStudents);
                
                return (
                  <div 
                    key={batch.id} 
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 batch-card-animation"
                  >
                    {/* Class Image */}
                    {batch.classImage && (
                      <div className="mb-4">
                        <img 
                          src={batch.classImage} 
                          alt={batch.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold primary-dark mb-2 leading-tight">{batch.title}</h3>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap inline-block ${ageBadge.color}`}>
                            {ageBadge.icon} {ageBadge.label}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap inline-block ${levelBadge.color}`}>
                            {levelBadge.icon} {levelBadge.label}
                          </span>
                          {batch.searchMetadata?.cultural_authenticity_score >= 0.7 && (
                            <span className="px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap inline-block bg-purple-100 text-purple-800">
                              🌍 {batch.searchMetadata.cultural_origin_region || 'Traditional'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          with {batch.mentorName}
                          {batch.avgRating && (
                            <span className="ml-2">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1">{batch.avgRating}</span>
                              {batch.totalReviews && (
                                <span className="text-gray-500 ml-1">({batch.totalReviews} reviews)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const pricing = calculateTotalPayable(batch);
                          return (
                            <>
                              <div className="text-2xl font-bold primary-dark">
                                {formatPrice(pricing.finalPrice, pricing.currency)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pricing.totalSessions} sessions
                                {pricing.discountAmount > 0 && (
                                  <div className="text-green-600 text-xs">
                                    Save {formatPrice(pricing.discountAmount, pricing.currency)}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {batch.description}
                    </p>

                    {/* Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">📅</span>
                        <div>
                          <div className="font-semibold">
                            Starts {formatDate(batch.schedule.startDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.ceil((new Date(batch.schedule.endDate) - new Date(batch.schedule.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks program • Ends {formatDate(batch.schedule.endDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">⏰</span>
                        <div>
                          <div className="font-semibold">{formatSchedule(batch.schedule.weeklySchedule)}</div>
                          <div className="text-sm text-gray-500">{batch.schedule.sessionDuration} min sessions</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">{getFormatIcon(batch.format)}</span>
                        <div>
                          <div className="font-semibold capitalize">{batch.format}</div>
                          <div className="text-sm text-gray-500">
                            {batch.format === 'online' && 'Interactive virtual sessions'}
                            {batch.format === 'in-person' && (batch.city ? `${batch.city}, ${batch.region || batch.country || 'UK'}` : 'Physical studio location')}
                            {batch.format === 'hybrid' && (batch.city ? `Online + ${batch.city} sessions` : 'Online + in-person combined')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & CTA */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">👥</span>
                        <span className="text-sm text-gray-600">
                          {batch.capacity.maxStudents - batch.capacity.currentEnrollment } seats left  
                        </span>
                      </div>
                      <div 
                        className={`w-3 h-3 rounded-full ${availabilityStatus.color}`} 
                        title={availabilityStatus.status}
                      ></div>
                    </div>

                    <button
                      onClick={() => handleEnrollNow(batch)}
                      className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 text-lg md:col-span-2 lg:col-span-3">
                No group batches found matching your filters.
              </p>
            )}
            </div>
          )}

          {/* Bottom CTA Section */}
          <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold primary-dark mb-4">Not finding a suitable batch?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Don't worry! Our mentors regularly start new batches based on demand. Share your preferences 
              and get notified when a perfect batch becomes available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                💬 Contact Mentor
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors">
                🔔 Get Notified of New Batches
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Or try our <a href="#" className="text-primary hover:text-primary-dark font-semibold">workshops</a> for shorter commitments
            </div>
          </div>
        </div>
      </div>

      {/* Child Selection Modal */}
      <ChildSelectionModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSelectChild={handleChildSelected}
        classData={selectedBatch}
        user={user}
        userRoles={userRoles}
      />
    </>
  );
}