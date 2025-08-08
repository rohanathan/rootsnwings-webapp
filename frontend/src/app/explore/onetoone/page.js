'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentBookings, setStudentBookings] = useState([]);
  const [creatingClass, setCreatingClass] = useState(false);
  
  const searchParams = useSearchParams();
  const mentorId = searchParams.get('mentorId') || 'user_8956af6c6b35'; // Default for testing

  // Load mentor data and availability
  useEffect(() => {
    const loadMentorData = async () => {
      setLoading(true);
      try {
        // Load mentor details
        const mentorResponse = await fetch(`http://localhost:8000/mentors/${mentorId}`);
        if (mentorResponse.ok) {
          const mentorData = await mentorResponse.json();
          setMentor(mentorData);
        }

        // Load mentor availability
        const availabilityResponse = await fetch(`http://localhost:8000/availability/mentors/${mentorId}`);
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          setAvailability(availabilityData.availability);
        } else if (availabilityResponse.status === 404) {
          setError('This mentor has not set their availability yet.');
        }

        // Load student's previous bookings (for first session detection)
        // TODO: Replace with actual student ID from auth
        const bookingsResponse = await fetch(`http://localhost:8000/bookings/?studentId=user031`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setStudentBookings(bookingsData.bookings || []);
        }
      } catch (error) {
        console.error('Error loading mentor data:', error);
        setError('Failed to load mentor information');
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      loadMentorData();
    }
  }, [mentorId]);

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

  // Handle slot selection
  const handleSlotClick = (day, slot) => {
    const sessionDateTime = new Date(`${day.fullDate}T${slot.startTime}`);
    const basePrice = mentor?.pricing?.oneOnOneRate || 50;
    
    setSelectedSession({
      mentorId: mentorId,
      mentorName: mentor?.displayName || 'Mentor',
      date: day.fullDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      displayTime: slot.displayTime,
      type: slot.type,
      price: slot.type === 'free' ? 'FREE' : `£${basePrice}`,
      displayDate: formatDate(sessionDateTime, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      subject: 'One-on-One Session',
      format: 'online', // Default
      specialRequests: ''
    });
    setShowModal(true);
  };

  // Handle booking confirmation - create class and redirect to booking page
  const handleConfirmBooking = async () => {
    if (!selectedSession) return;
    
    setCreatingClass(true);
    try {
      // Create one-on-one class dynamically
      const response = await fetch('http://localhost:8000/classes/one-on-one/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId: selectedSession.mentorId,
          studentId: 'user031', // TODO: Get from auth
          sessionDate: selectedSession.date,
          startTime: selectedSession.startTime,
          endTime: selectedSession.endTime,
          subject: selectedSession.subject,
          format: selectedSession.format,
          specialRequests: selectedSession.specialRequests,
          isFirstSession: selectedSession.type === 'free'
        })
      });

      if (response.ok) {
        const { classId } = await response.json();
        // Redirect to existing booking confirmation page
        window.location.href = `/booking/confirmbooking?classId=${classId}`;
      } else {
        const errorData = await response.json();
        alert(`Failed to create booking: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setCreatingClass(false);
    }
  };

  // Update session details in modal
  const updateSessionDetails = (field, value) => {
    setSelectedSession(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelBooking = () => {
    setShowModal(false);
    setSelectedSession(null);
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
            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
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
              <h2 className="text-2xl font-bold text-primary-dark">Select Date & Time</h2>
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
                            className={`w-full py-3 rounded-lg font-medium transition-colors 
                              ${slot.available ? 
                                (slot.type === 'free' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-green-100 hover:bg-green-200 text-green-800') : 
                                'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            {slot.displayTime} {slot.type === 'free' && <span className="text-xs">(FREE)</span>}
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

          {/* Contact Option Component */}
          <div className="bg-gradient-to-r from-primary-light to-accent-light rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-primary-dark mb-3">Not finding a suitable time?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't see a time that works for you? Priya offers flexible scheduling and can often accommodate special requests. Send her a message to discuss custom timing.
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

      {/* Booking Confirmation Modal Component */}
      {showModal && selectedSession && (
        <div id="booking-modal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-content-animation">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-dark mb-2">Confirm Your Session</h3>
              <p className="text-gray-600">Review your booking details before confirming</p>
            </div>

            {/* Booking Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Mentor</span>
                  <span className="font-semibold text-primary-dark">{selectedSession?.mentorName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Session Type</span>
                  <span className="font-semibold text-primary-dark">One-on-One</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Date & Time</span>
                  <span className="font-semibold text-primary-dark">{selectedSession?.displayDate}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                  <span className="font-semibold text-primary-dark">60 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Price</span>
                  <span className={`font-bold text-lg ${selectedSession?.type === 'free' ? 'text-green-600' : 'text-primary-dark'}`}>{selectedSession?.price}</span>
                </div>
              </div>

              {/* Session Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="radio" 
                      name="format" 
                      value="online" 
                      className="text-primary mr-3" 
                      defaultChecked
                      onChange={(e) => updateSessionDetails('format', e.target.value)}
                    />
                    <span className="text-sm">📱 Online</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="radio" 
                      name="format" 
                      value="in-person" 
                      className="text-primary mr-3"
                      onChange={(e) => updateSessionDetails('format', e.target.value)}
                    />
                    <span className="text-sm">🏠 In-Person</span>
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Goals (Optional)</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:border-primary focus:outline-none" 
                  rows="3" 
                  placeholder="What would you like to focus on in this session?"
                  onChange={(e) => updateSessionDetails('specialRequests', e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleCancelBooking}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleConfirmBooking}
                disabled={creatingClass}
                className="flex-1 bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {creatingClass ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Creating Session...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
