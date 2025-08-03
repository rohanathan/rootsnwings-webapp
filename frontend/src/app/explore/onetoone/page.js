'use client';

import { useState, useEffect } from 'react';

// Helper function to format date strings
const formatDate = (date, formatOptions) => {
  return date.toLocaleDateString('en-GB', formatOptions);
};

// Data for time slots (a more scalable approach than hardcoding HTML)
const getWeekData = (startDate) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const week = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);

    const timeSlots = [
      { time: '9:00 AM', type: 'paid', available: true },
      { time: '11:00 AM', type: 'paid', available: false },
      { time: '1:00 PM', type: 'paid', available: true },
      { time: '4:00 PM', type: 'free', available: true },
    ];
    
    // Simulate some randomness for demo purposes
    if (Math.random() > 0.5) {
      timeSlots[0].available = false;
    }
    if (Math.random() > 0.7) {
      timeSlots[2].available = false;
    }

    week.push({
      dayOfWeek: days[dayDate.getDay()],
      date: dayDate.getDate(),
      month: months[dayDate.getMonth()],
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
      slots: timeSlots,
      fullDate: dayDate.toISOString().split('T')[0],
    });
  }
  return week;
};

export default function OneOnOneSessions() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Function to handle window resizing for responsive calendar
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    // Initial data load and resize listener
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + weekOffset * 7));
    setWeekData(getWeekData(startOfWeek));
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [weekOffset]);

  // Handle slot selection
  const handleSlotClick = (day, slot) => {
    setSelectedSession({
      date: day.fullDate,
      time: slot.time,
      type: slot.type,
      price: slot.type === 'free' ? 'FREE' : '£35',
      displayDate: formatDate(new Date(`${day.fullDate}T${slot.time.replace(/\sPM|\sAM/g, '')}:00`), { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    setShowModal(true);
  };

  // Handle modal actions
  const handleConfirmBooking = () => {
    alert(`Booking confirmed! You'll receive a confirmation email shortly. 
           \nSession: ${selectedSession.price} session with Priya Sharma
           \nDate: ${selectedSession.date} at ${selectedSession.time}`);
    setShowModal(false);
    setSelectedSession(null);
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
                <h2 className="text-xl font-bold text-primary-dark">Priya Sharma</h2>
                <p className="text-sm text-gray-600">Kathak Dance & Cultural Arts</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  <span className="text-sm text-gray-600">4.9 (32 reviews)</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full ml-2">
                    First Session Free
                  </span>
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
                        <div className="font-semibold">£35 per session</div>
                        <div className="text-sm text-gray-500">First session is FREE</div>
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

            {/* 7-Day Calendar Grid */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-7'}`}>
              {weekData.map((day, dayIndex) => (
                <div key={dayIndex} className="calendar-day">
                  <div className={`text-center mb-4 p-3 rounded-lg ${day.isWeekend ? 'bg-primary-light' : 'bg-gray-50'}`}>
                    <div className={`text-sm font-medium ${day.isWeekend ? 'text-primary' : 'text-gray-500'}`}>{day.dayOfWeek}</div>
                    <div className={`text-xl font-bold ${day.isWeekend ? 'text-primary-dark' : 'text-gray-800'}`}>{day.date}</div>
                    <div className={`text-xs ${day.isWeekend ? 'text-primary' : 'text-gray-500'}`}>{day.month}</div>
                  </div>
                  <div className="space-y-2">
                    {day.slots.map((slot, slotIndex) => (
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
                        {slot.time} {slot.type === 'free' && <span className="text-xs">(FREE)</span>}
                        {!slot.available && ' - Booked'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                  <span className="font-semibold text-primary-dark">Priya Sharma</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Session Type</span>
                  <span className="font-semibold text-primary-dark">One-on-One</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Date & Time</span>
                  <span className="font-semibold text-primary-dark" id="selected-datetime">{selectedSession.displayDate}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                  <span className="font-semibold text-primary-dark">60 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Price</span>
                  <span className={`font-bold text-lg ${selectedSession.type === 'free' ? 'text-green-600' : 'text-primary-dark'}`} id="session-price">{selectedSession.price}</span>
                </div>
              </div>

              {/* Session Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="format" value="online" className="text-primary mr-3" defaultChecked />
                    <span className="text-sm">📱 Online</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="format" value="in-person" className="text-primary mr-3" />
                    <span className="text-sm">🏠 In-Person</span>
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests (Optional)</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:border-primary focus:outline-none" rows="3" placeholder="Any specific topics or goals for this session?"></textarea>
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
                className="flex-1 bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
