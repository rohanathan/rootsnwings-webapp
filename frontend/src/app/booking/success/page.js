'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function BookingSuccess() {
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [firstClassDate, setFirstClassDate] = useState(null);

  // Firebase auth listener - only students should access booking pages
  useEffect(() => {
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        window.location.href = '/getstarted';
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Get first class date from stored data (client-side only)
  const getFirstClassDate = () => {
    try {
      // Guard against server-side rendering
      if (typeof window === 'undefined') {
        return new Date('2025-08-17T14:00:00'); // fallback for SSR
      }
      
      const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
      if (storedClass.schedule?.startDate) {
        const schedule = storedClass.schedule.weeklySchedule?.[0];
        const timeString = schedule?.startTime || '14:00';
        return new Date(`${storedClass.schedule.startDate}T${timeString}:00`);
      }
    } catch (e) {
      console.error('Error parsing class date:', e);
    }
    return new Date('2025-08-17T14:00:00'); // fallback
  };
  


  // Handle payment confirmation from Stripe redirect - only run when user is authenticated
  useEffect(() => {
    if (!user || authLoading) return;

    const confirmPaymentAndBooking = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
          // Payment came from Stripe Checkout - process the session
          const idToken = await user.getIdToken();
          const successResponse = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/payments/success?session_id=${sessionId}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          if (successResponse.data.success) {
            setBookingDetails(successResponse.data.booking);
            // Clear stored data since booking is now complete
            localStorage.removeItem('selectedMentorClass');
            localStorage.removeItem('mentor');
          }
        } else {
          // Direct booking success (free booking) - get from localStorage
          const storedBooking = localStorage.getItem('completedBooking');
          if (storedBooking) {
            setBookingDetails(JSON.parse(storedBooking));
            localStorage.removeItem('completedBooking');
          } else {
            // No session_id and no stored booking - redirect to error
            setError('No booking information found. Please check your bookings page.');
          }
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        setError('There was an issue confirming your payment, but your booking may still be successful.');
      } finally {
        setLoading(false);
      }
    };

    confirmPaymentAndBooking();
  }, [user, authLoading]);

  // Initialize first class date from localStorage (client-side only)
  useEffect(() => {
    setFirstClassDate(getFirstClassDate());
  }, []);

  // Calculate countdown time when firstClassDate is available
  useEffect(() => {
    if (!firstClassDate) return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const distance = firstClassDate.getTime() - now;

      if (distance < 0) {
        return { days: '00', hours: '00', minutes: '00', seconds: '00' };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      };
    };

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    // Set initial countdown
    setCountdown(calculateCountdown());

    return () => clearInterval(timer);
  }, [firstClassDate]);

  // Handler functions for button clicks
  const goToDashboard = () => {
    window.location.href = '/user/bookings';
  };

  const messageMentor = () => {
    alert(`Opening chat with ${bookingDetails?.mentorName || 'your mentor'}...`);
    // TODO: Implement messaging system later this week
  };

  const viewMoreClasses = () => {
    window.location.href = '/workshop/listing';
  };
  
  const addToGoogleCalendar = () => {
    // Use booking data or fallback to stored class data
    const className = bookingDetails?.className || 'Your Class';
    const mentorName = bookingDetails?.mentorName || 'Your Mentor';
    const title = `${className} with ${mentorName}`;
    
    // Use firstClassDate from state or fallback
    const classDate = firstClassDate || new Date('2025-08-17T14:00:00');
    const startDate = classDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(classDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; // Add 1 hour
    
    const location = 'Online Class via Zoom'; // Default to online
    const details = `Your class booking confirmation. Booking ID: ${bookingDetails?.bookingId || 'N/A'}`;
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  // Custom global CSS for body and animations
  const globalStyle = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
      color: #2d3748; /* text-gray-800 */
      background: linear-gradient(to bottom right, #f0fff4, #eff6ff, #f3e8ff); /* bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 */
      min-height: 100vh;
    }
    @keyframes bounceIn {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes slideUp {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
    .animate-slideUp { animation: slideUp 0.6s ease-out; }
    .animate-pulseGentle { animation: pulse 2s infinite; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animation-delay-600 { animation-delay: 0.6s; }
  `;

  // Show loading state while confirming payment or authenticating
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? "Authenticating..." : "Confirming your booking..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Booking Issue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/user/bookings'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{globalStyle}</style>

      {/* Confetti container for JS animations */}
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-10"></div>

      {/* Navigation Component */}
      <nav className="relative z-20 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold text-primary-dark hover:text-primary transition-colors">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <span className="text-green-600 font-semibold">✅ Booking Confirmed</span>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">Help</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-20 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-5">
            
          {/* Confirmation Banner Component */}
          <div className="text-center mb-12 animate-bounceIn">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulseGentle">
                <span className="text-6xl text-white">✅</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-ping opacity-60 animation-delay-300"></div>
            </div>
            <h1 className="text-5xl font-bold text-primary-dark mb-4">You're all set!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              🎉 Your booking is confirmed! We've reserved your spot and notified your mentor. 
              Get ready for an amazing learning journey!
            </p>
            <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold mt-6 animate-slideUp animation-delay-500">
              🏆 Achievement Unlocked: First Booking Complete!
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
                
            {/* Booking Summary Card - Main Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slideUp animation-delay-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-dark">📋 Booking Summary</h2>
                  <div className="text-sm text-gray-500">
                    ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{bookingDetails?.bookingId || 'Loading...'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {/* Use booking mentor data or fallback to stored mentor */}
                      {(() => {
                        if (bookingDetails?.mentorName) {
                          return bookingDetails.mentorName.charAt(0);
                        }
                        const storedMentor = JSON.parse(localStorage.getItem('mentor') || '{}');
                        return storedMentor.displayName?.charAt(0) || 'M';
                      })()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-dark mb-2">
                      {bookingDetails?.mentorName || (() => {
                        const storedMentor = JSON.parse(localStorage.getItem('mentor') || '{}');
                        return storedMentor.displayName || 'Mentor Name';
                      })()}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {(() => {
                        const storedMentor = JSON.parse(localStorage.getItem('mentor') || '{}');
                        return storedMentor.category || 'Subject Expert';
                      })()}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-primary-dark font-semibold rounded-full">
                        📚 {(() => {
                          const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                          return storedClass.type === 'workshop' ? 'Workshop' : 'Class';
                        })()}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 font-semibold rounded-full">
                        ⚡ {(() => {
                          const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                          return storedClass.level?.charAt(0).toUpperCase() + storedClass.level?.slice(1) || 'All Levels';
                        })()}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full">
                        👦 {(() => {
                          const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                          const ageLabels = {
                            'child': 'Children (5-12)',
                            'teen': 'Teens (13-17)',
                            'adult': 'Adults (18+)',
                            'family': 'Family Friendly'
                          };
                          return ageLabels[storedClass.ageGroup] || 'All Ages';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <div className="font-semibold text-gray-700">Class</div>
                        <div className="text-primary-dark font-bold">
                          {bookingDetails?.className || (() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            return storedClass.title || 'Class Title';
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            if (storedClass.schedule?.startDate) {
                              const startDate = new Date(storedClass.schedule.startDate);
                              const endDate = storedClass.schedule.endDate ? new Date(storedClass.schedule.endDate) : startDate;
                              
                              if (storedClass.schedule.startDate === storedClass.schedule.endDate || !storedClass.schedule.endDate) {
                                return startDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                              } else {
                                return `${startDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                              }
                            }
                            return 'Schedule TBD';
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <div className="font-semibold text-gray-700">Time & Duration</div>
                        <div className="text-primary-dark font-bold">
                          {(() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            const schedule = storedClass.schedule?.weeklySchedule?.[0];
                            if (schedule) {
                              return `${schedule.startTime || '10:00'} - ${schedule.endTime || '11:00'}`;
                            }
                            return 'Time TBD';
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            const totalSessions = storedClass.pricing?.totalSessions || 1;
                            const duration = storedClass.schedule?.sessionDuration || 60;
                            return `${totalSessions} session${totalSessions > 1 ? 's' : ''} • ${duration} min each`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="font-semibold text-gray-700">Location</div>
                        <div className="text-primary-dark font-bold">
                          {(() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            return storedClass.location || (storedClass.format === 'online' ? 'Online Class' : 'Location TBD');
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            return storedClass.format === 'online' ? 'Zoom link will be shared' : 'Address will be shared via email';
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <div className="font-semibold text-gray-700">Total Paid</div>
                        <div className="text-primary-dark font-bold text-lg">
                          {(() => {
                            // Try to get amount from booking data first, then fallback to localStorage
                            if (bookingDetails?.pricing?.finalPrice) {
                              // finalPrice is in pence, convert to pounds
                              const amount = bookingDetails.pricing.finalPrice / 100;
                              return amount === 0 ? 'FREE' : `£${amount}`;
                            }
                            
                            const paymentData = JSON.parse(localStorage.getItem('payment_data') || '{}');
                            if (paymentData.amount) {
                              return `£${paymentData.amount}`;
                            }
                            
                            const storedClass = JSON.parse(localStorage.getItem('selectedMentorClass') || '{}');
                            if (storedClass.pricing?.perSessionRate === 0) {
                              return 'FREE';
                            } else if (storedClass.pricing?.perSessionRate) {
                              const total = storedClass.pricing.perSessionRate * (storedClass.pricing.totalSessions || 1);
                              return `£${total}`;
                            }
                            
                            return 'Payment Processing...';
                          })()}
                        </div>
                        <div className="text-sm text-green-600">✅ {(() => {
                          if (bookingDetails?.paymentStatus === 'completed') {
                            return 'Payment Confirmed';
                          }
                          if (bookingDetails?.pricing?.finalPrice === 0) {
                            return 'Free Registration';
                          }
                          return 'Payment Confirmed';
                        })()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-light to-accent-light p-6 rounded-2xl">
                  <h4 className="font-bold text-primary-dark mb-3">⏱️ Your first class starts in:</h4>
                  <div className="flex justify-center gap-4 text-center">
                    <div className="bg-white p-3 rounded-xl shadow">
                      <div className="text-2xl font-bold text-primary-dark">{countdown.days}</div>
                      <div className="text-xs text-gray-600">DAYS</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow">
                      <div className="text-2xl font-bold text-primary-dark">{countdown.hours}</div>
                      <div className="text-xs text-gray-600">HOURS</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow">
                      <div className="text-2xl font-bold text-primary-dark">{countdown.minutes}</div>
                      <div className="text-xs text-gray-600">MINS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & QR Codes Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl animate-slideUp animation-delay-600">
                <h3 className="text-lg font-bold text-primary-dark mb-4">🚀 Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={goToDashboard} className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                    📊 View My Bookings
                  </button>
                  <button onClick={viewMoreClasses} className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-xl font-semibold transition-all duration-300">
                    🔍 View More Classes
                  </button>
                </div>
              </div>

              {/* Calendar Integration */}
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-primary-dark mb-4">📅 Add to Calendar</h3>
                <button onClick={addToGoogleCalendar} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  📅 Add to Google Calendar
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  You will also receive a calendar invite via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
