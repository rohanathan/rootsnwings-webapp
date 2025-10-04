'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ChildSelectionModal from '@/components/ChildSelectionModal';

// Helper function to format date strings
const formatDate = (date, formatOptions) => {
  return date.toLocaleDateString('en-GB', formatOptions);
};

// Helper to convert 24-hour to 12-hour format
const formatTime = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper to calculate if this is student's first session with mentor
const isFirstSession = (studentBookings, mentorId) => {
  return !studentBookings.some(booking => 
    booking.mentorId === mentorId && 
    ['confirmed', 'completed'].includes(booking.bookingStatus)
  );
};

export default function OneOnOneSessions() {
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentBookings, setStudentBookings] = useState([]);
  const [creatingClass, setCreatingClass] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [mentorId, setMentorId] = useState(null);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  
  // Child selection modal state
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState(null);

  // Load mentor data and availability
  useEffect(() => {
    const loadMentorData = async () => {
      setLoading(true);
      try {
        // Get mentorId from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let urlMentorId = urlParams.get('mentorId');
        
        // If no URL param, try to get from localStorage (from mentor detail page)
        if (!urlMentorId) {
          const storedMentor = localStorage.getItem('selectedMentor') || localStorage.getItem('mentor');
          if (storedMentor) {
            const mentorData = JSON.parse(storedMentor);
            urlMentorId = mentorData.uid;
            console.log('Using mentor from localStorage:', urlMentorId);
          } else {
            console.error('No mentor ID found in URL or localStorage');
            setError('No mentor selected. Please go back to mentor directory.');
            setLoading(false);
            return;
          }
        }
        
        console.log('Loading mentor data for:', urlMentorId);
        setMentorId(urlMentorId);
        
        // Load mentor details
        console.log('Fetching mentor details...');
        const mentorResponse = await axios.get(`/api/mentors/${urlMentorId}`);
        console.log('Mentor response:', mentorResponse.data);
        if (mentorResponse.data?.mentor) {
          setMentor(mentorResponse.data.mentor);
          console.log('Mentor data loaded:', mentorResponse.data.mentor);
        }

        // Load mentor availability
        try {
          console.log('Fetching mentor availability...');
          const availabilityResponse = await axios.get(`/api/availability/mentors/${urlMentorId}`);
          console.log('Availability response:', availabilityResponse.data);
          if (availabilityResponse.data) {
            setAvailability(availabilityResponse.data.availability);
            console.log('Availability set:', availabilityResponse.data.availability);
          }
        } catch (availabilityError) {
          console.error('Availability error details:', availabilityError.response?.data || availabilityError.message);
          if (availabilityError.response?.status === 404) {
            setError('This mentor has not set their availability yet.');
          } else {
            console.error('Error loading availability:', availabilityError);
            setError('Failed to load mentor availability');
          }
        }

        // Load student's previous bookings (for first session detection)
        // TODO: Replace with actual student ID from auth
        const bookingsResponse = await axios.get(`/api/bookings?studentId=user031`);
        if (bookingsResponse.data) {
          setStudentBookings(bookingsResponse.data.bookings || []);
        }
      } catch (error) {
        console.error('Error loading mentor data:', error);
        setError('Failed to load mentor information');
      } finally {
        setLoading(false);
      }
    };

    loadMentorData();
  }, []); // Only run once on component mount

  // Generate week data from mentor availability
  useEffect(() => {
    if (availability) {
      generateWeekData();
    }
  }, [availability, weekOffset]);

  // Function to handle window resizing for responsive calendar
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
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

  // Generate week data from mentor's availability
  const generateWeekData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const week = [];
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dayName = days[dayDate.getDay()];
      const fullDate = dayDate.toISOString().split('T')[0];

      // Find availability for this day
      const dayAvailability = availability?.availability?.find(d => d.day === dayName);
      const timeSlots = [];

      if (dayAvailability && dayAvailability.timeRanges) {
        dayAvailability.timeRanges.forEach(range => {
          // Generate 1-hour slots within each time range
          const startHour = parseInt(range.startTime.split(':')[0]);
          const endHour = parseInt(range.endTime.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            const slotTime = `${hour.toString().padStart(2, '0')}:00`;
            const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            
            // Check if this slot is in the past
            const slotDateTime = new Date(`${fullDate}T${slotTime}`);
            const now = new Date();
            const isPastSlot = slotDateTime < now;
            
            // Determine if this should be a free session
            const isFirstSessionForMentor = isFirstSession(studentBookings, mentorId);
            const slotType = isFirstSessionForMentor && timeSlots.length === 0 ? 'free' : 'paid';
            
            timeSlots.push({
              startTime: slotTime,
              endTime: slotEndTime,
              displayTime: formatTime(slotTime),
              type: slotType,
              available: !isPastSlot // Simple availability check for now
            });
          }
        });
      }

      week.push({
        dayOfWeek: dayName,
        date: dayDate.getDate(),
        month: months[dayDate.getMonth()],
        isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
        slots: timeSlots,
        fullDate: fullDate
      });
    }
    
    setWeekData(week);
  };

  // Handle multiple slot selection
  const handleSlotClick = (day, slot) => {
    const sessionDateTime = new Date(`${day.fullDate}T${slot.startTime}`);
    const basePrice = mentor?.pricing?.oneOnOneRate || 50;
    const slotId = `${day.fullDate}_${slot.startTime}`;
    
    // Check if slot is already selected
    const isSelected = selectedSessions.some(s => s.slotId === slotId);
    
    if (isSelected) {
      // Remove from selection
      setSelectedSessions(prev => prev.filter(s => s.slotId !== slotId));
    } else {
      // Check 5-slot limit
      if (selectedSessions.length >= 5) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 3000);
        return;
      }
      
      // Add to selection
      const newSession = {
        slotId,
        mentorId: mentorId,
        mentorName: mentor?.displayName || 'Mentor',
        date: day.fullDate,
        day: new Date(day.fullDate).toLocaleDateString('en-US', { weekday: 'long' }),
        startTime: slot.startTime,
        endTime: slot.endTime,
        displayTime: slot.displayTime,
        type: slot.type,
        price: slot.type === 'free' ? 0 : basePrice,
        displayDate: formatDate(sessionDateTime, { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric'
        }),
        subject: 'One-on-One Session',
        format: 'online'
      };
      
      setSelectedSessions(prev => [...prev, newSession]);
    }
  };

  // Check if slot is selected
  const isSlotSelected = (day, slot) => {
    const slotId = `${day.fullDate}_${slot.startTime}`;
    return selectedSessions.some(s => s.slotId === slotId);
  };

  // Handle booking confirmation - create class with multiple sessions
  const handleConfirmBooking = async () => {
    if (selectedSessions.length === 0) return;
    
    // Check if user has student profile (required for all bookings)
    const isStudent = userRoles.includes('student');
    if (!isStudent) {
      alert('⚠️ Student Profile Required\n\nTo book classes, you need to have a student profile.\n\nPlease complete your student profile setup first.');
      return;
    }
    
    // Check if user needs to select a child for child-appropriate subjects
    const childFriendlySubjects = ['music', 'art', 'drawing', 'piano', 'guitar', 'singing', 'dance'];
    const isChildFriendlySubject = childFriendlySubjects.some(subject => 
      selectedSessions[0].subject?.toLowerCase().includes(subject)
    );
    const isParent = userRoles.includes('parent');
    
    if (isChildFriendlySubject && isParent) {
      // Show child selection modal
      setSelectedClassData({
        title: `One-on-One ${selectedSessions[0].subject} Sessions`,
        subject: selectedSessions[0].subject,
        sessions: selectedSessions,
        ageGroup: 'flexible' // One-to-one can be for any age
      });
      setShowChildModal(true);
      return;
    } else if (isChildFriendlySubject && !isParent) {
      // Show error message for non-parent users
      alert('⚠️ Parent Profile Required\n\nThis subject is popular with young learners. To book sessions for children, you need to have a parent profile.\n\nPlease contact support to add parent role to your account.');
      return;
    }
    
    // Proceed with direct booking
    await proceedWithBooking();
  };

  // Handle child selection from modal
  const handleChildSelected = (childData) => {
    setShowChildModal(false);
    
    // Store child data for booking
    if (selectedClassData) {
      selectedClassData.selectedChild = childData;
    }
    
    // Proceed with booking
    proceedWithBooking();
    setSelectedClassData(null);
  };

  const proceedWithBooking = async () => {
    setCreatingClass(true);
    try {
      // Prepare request payload
      let requestPayload = {
        mentorId: selectedSessions[0].mentorId,
        studentId: 'user031', // TODO: Get from auth
        subject: selectedSessions[0].subject,
        format: selectedSessions[0].format,
        isFirstSession: selectedSessions.some(s => s.type === 'free'),
        totalSessions: selectedSessions.length
      };

      if (selectedSessions.length === 1) {
        // Single session: Use traditional sessionDate, startTime, endTime fields
        const session = selectedSessions[0];
        requestPayload = {
          ...requestPayload,
          sessionDate: session.date,
          startTime: session.startTime,
          endTime: session.endTime
        };
      } else {
        // Multiple sessions: Use weeklySchedule array
        requestPayload.weeklySchedule = selectedSessions.map(session => ({
          day: session.day,
          startTime: session.startTime,
          endTime: session.endTime,
          sessionDate: session.date // Include specific date for backend
        }));
      }

      // Create one-on-one class
      const response = await axios.post('/api/classes/one-on-one/create', requestPayload);

      if (response.data?.classId) {
        // Store class data for booking confirmation page
        localStorage.setItem('selectedMentorClass', JSON.stringify({
          classId: response.data.classId,
          title: response.data.title,
          totalSessions: response.data.totalSessions,
          pricing: {
            subtotal: response.data.finalPrice,
            totalSessions: response.data.totalSessions
          },
          schedule: {
            startDate: selectedSessions.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date,
            endDate: selectedSessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
          }
        }));

        // Store mentor data
        localStorage.setItem('mentor', JSON.stringify(mentor));
        
        // Redirect to existing booking confirmation page using dynamic route
        window.location.href = `/booking/confirmbooking/${response.data.classId}`;
      } else {
        alert('Failed to create booking: No class ID returned');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Failed to create booking: ${error.response?.data?.detail || error.message}`);
    } finally {
      setCreatingClass(false);
    }
  };


  // Handle week navigation
  const handlePrevWeek = () => {
    setWeekOffset(prev => Math.max(-2, prev - 1));
  };
  const handleNextWeek = () => {
    setWeekOffset(prev => Math.min(4, prev + 1));
  };

  const getWeekRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    return `${formatDate(startOfWeek, options)} - ${formatDate(endOfWeek, options)} ${startOfWeek.getFullYear()}`;
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
          color: #2d3748; /* text-gray-800 */
          background-color: #f7fafc; /* bg-gray-50 */
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-content-animation {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Navigation Component */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold text-primary-dark hover:text-primary transition-colors">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Profile</a>
              <a href="#" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mini Mentor Info Card Component (Sticky Header) */}
      <div className="fixed top-16 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-xl font-bold">
                P
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-dark">{mentor?.displayName || 'Loading...'}</h2>
                <p className="text-sm text-gray-600">{mentor?.headline || 'Loading...'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {mentor?.avgRating && (
                    <>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(Math.floor(mentor.avgRating))}{'☆'.repeat(5 - Math.floor(mentor.avgRating))}
                      </div>
                      <span className="text-sm text-gray-600">{mentor.avgRating} ({mentor.totalReviews || 0} reviews)</span>
                    </>
                  )}
                  {isFirstSession(studentBookings, mentorId) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full ml-2">
                      First Session Free
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button className="text-primary hover:text-primary-dark font-medium transition-colors">
                💬 Message Mentor
              </button>
              <a href="#calendar-section" className="bg-primary hover:bg-blue-500 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                Book Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-5">
          
          {/* Session Type Info Component */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-primary-dark mb-3">One-on-One Sessions</h1>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Book a personalised session at your convenience. Get individual attention and customised learning tailored to your specific goals.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">💰</span>
                      <div>
                        <div className="font-semibold">£{mentor?.pricing?.oneOnOneRate || 50} per session</div>
                        {isFirstSession(studentBookings, mentorId) && (
                          <div className="text-sm text-gray-500">First session is FREE</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">⏱️</span>
                      <div>
                        <div className="font-semibold">60 minutes</div>
                        <div className="text-sm text-gray-500">Full hour of focused learning</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">🌐</span>
                      <div>
                        <div className="font-semibold">Online & In-Person</div>
                        <div className="text-sm text-gray-500">Your choice of format</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-2xl mr-3">📅</span>
                      <div>
                        <div className="font-semibold">Flexible Scheduling</div>
                        <div className="text-sm text-gray-500">Book up to 2 weeks ahead</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-light to-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-primary-dark mb-4">Session Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold text-primary-dark">30 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Repeat Students</span>
                    <span className="font-semibold text-primary-dark">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancellation</span>
                    <span className="font-semibold text-primary-dark">24h notice</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Languages</span>
                    <span className="font-semibold text-primary-dark">EN, HI, GU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Slot Picker Component */}
          <div id="calendar-section" className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark">Select Date & Time</h2>
                <p className="text-sm text-gray-600 mt-1">You can select up to 5 sessions. Click slots to add/remove them.</p>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                  <span>Free Session</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <button 
                onClick={handlePrevWeek} 
                disabled={weekOffset <= -2} 
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                ← Previous Week
              </button>
              <h3 className="text-lg font-semibold text-gray-700">{getWeekRange()}</h3>
              <button 
                onClick={handleNextWeek} 
                disabled={weekOffset >= 4} 
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next Week →
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading mentor availability...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* 7-Day Calendar Grid */}
            {!loading && !error && (
              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-7'}`}>
                {weekData.map((day, dayIndex) => (
                  <div key={dayIndex} className="calendar-day">
                    <div className={`text-center mb-4 p-3 rounded-lg ${day.isWeekend ? 'bg-primary-light' : 'bg-gray-50'}`}>
                      <div className={`text-sm font-medium ${day.isWeekend ? 'text-primary' : 'text-gray-500'}`}>{day.dayOfWeek}</div>
                      <div className={`text-xl font-bold ${day.isWeekend ? 'text-primary-dark' : 'text-gray-800'}`}>{day.date}</div>
                      <div className={`text-xs ${day.isWeekend ? 'text-primary' : 'text-gray-500'}`}>{day.month}</div>
                    </div>
                    <div className="space-y-2">
                      {day.slots.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No availability
                        </div>
                      ) : (
                        day.slots.map((slot, slotIndex) => (
                          <button 
                            key={slotIndex}
                            onClick={() => slot.available && handleSlotClick(day, slot)}
                            disabled={!slot.available}
                            className={`w-full py-3 rounded-lg font-medium transition-colors relative
                              ${slot.available ? 
                                isSlotSelected(day, slot) ?
                                  'bg-primary text-white border-2 border-primary-dark' :
                                  (slot.type === 'free' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-green-100 hover:bg-green-200 text-green-800') : 
                                'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            {slot.displayTime}
                            {!slot.available && ' - Past'}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Summary and Book Button */}
          {selectedSessions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-dark">Selected Sessions ({selectedSessions.length}/5)</h3>
                <button 
                  onClick={() => setSelectedSessions([])}
                  className="text-gray-500 hover:text-red-600 text-sm"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3 mb-6 max-h-40 overflow-y-auto">
                {selectedSessions.map((session, index) => (
                  <div key={session.slotId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{session.day}, {session.displayDate}</div>
                      <div className="text-sm text-gray-600">{session.displayTime} (60 min)</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary-dark">
                        {session.price === 0 ? 'FREE' : `£${session.price}`}
                      </span>
                      <button
                        onClick={() => setSelectedSessions(prev => prev.filter(s => s.slotId !== session.slotId))}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                  <span className="text-xl font-bold text-primary-dark">
                    £{selectedSessions.reduce((total, session) => total + session.price, 0)}
                  </span>
                </div>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={creatingClass}
                  className="w-full bg-primary hover:bg-blue-500 text-white py-4 rounded-full font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingClass ? (
                    <>
                      <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Creating Sessions...
                    </>
                  ) : (
                    `Book ${selectedSessions.length} Session${selectedSessions.length === 1 ? '' : 's'}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Limit Warning */}
          {showLimitWarning && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
              You can select up to 5 sessions maximum
            </div>
          )}

          {/* Contact Option Component */}
          <div className="bg-gradient-to-r from-primary-light to-accent-light rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-primary-dark mb-3">Not finding a suitable time?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't see a time that works for you? {mentor?.displayName} offers flexible scheduling and can often accommodate special requests. Send a message to discuss custom timing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                💬 Contact Mentor
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors">
                📞 Request Phone Call
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Child Selection Modal */}
      <ChildSelectionModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSelectChild={handleChildSelected}
        classData={selectedClassData}
        user={user}
        userRoles={userRoles}
      />
    </>
  );
}
