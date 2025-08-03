'use client';

import { useState, useEffect } from 'react';

export default function BookingSuccess() {
  const firstClassDate = new Date('2025-08-17T14:00:00'); // Example date, same as original HTML
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  // Calculate countdown time on component mount and every second
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const distance = firstClassDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
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

    return () => clearInterval(timer);
  }, []);

  // Handler functions for button clicks
  const goToDashboard = () => {
    alert('Redirecting to your dashboard...');
    // In a real app: router.push('/dashboard');
  };

  const messageMentor = () => {
    alert('Opening chat with Priya Sharma...');
    // In a real app: router.push('/chat/priya-sharma');
  };

  const viewMoreClasses = () => {
    alert('Redirecting to all classes...');
    // In a real app: router.push('/classes');
  };
  
  const addToGoogleCalendar = () => {
    const title = '8-Week Weekend Batch – Intermediate Kathak with Priya Sharma';
    const startDate = '20250817T140000Z'; // Example start date from original HTML
    const endDate = '20250817T150000Z'; // Example end date
    const location = 'Community Centre Birmingham, 12 Washwood Heath Rd, B8 2AA';
    const details = 'Your first class for the 8-Week Weekend Intensive with Priya Sharma.';
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

  return (
    <>
      <style jsx global>{globalStyle}</style>

      {/* Confetti container for JS animations */}
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-10"></div>

      {/* Navigation Component */}
      <nav className="relative z-20 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
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
              🎉 Your booking is confirmed! We've reserved your spot and notified Priya Sharma. 
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
                    ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">RW-2025-0847</span>
                  </div>
                </div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      P
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-dark mb-2">Priya Sharma</h3>
                    <p className="text-gray-600 mb-4">Kathak Dance & Cultural Arts Expert</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-primary-dark font-semibold rounded-full">
                        📚 Weekend Group Batch
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 font-semibold rounded-full">
                        ⚡ Intermediate Level
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full">
                        👦 Teens (13-17)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <div className="font-semibold text-gray-700">Schedule</div>
                        <div className="text-primary-dark font-bold">8-Week Weekend Intensive</div>
                        <div className="text-sm text-gray-500">Aug 17 - Sep 15, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <div className="font-semibold text-gray-700">Time</div>
                        <div className="text-primary-dark font-bold">Sat & Sun | 2:00-3:00 PM</div>
                        <div className="text-sm text-gray-500">16 total sessions</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="font-semibold text-gray-700">Location</div>
                        <div className="text-primary-dark font-bold">Community Centre Birmingham</div>
                        <div className="text-sm text-gray-500">12 Washwood Heath Rd, B8 2AA</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <div className="font-semibold text-gray-700">Total Paid</div>
                        <div className="text-primary-dark font-bold text-lg">£187.50</div>
                        <div className="text-sm text-green-600">✅ Payment Confirmed</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-light to-accent-light p-6 rounded-2xl mb-6">
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

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌤️</span>
                      <div>
                        <div className="font-semibold text-gray-700">Weather for your first class</div>
                        <div className="text-sm text-gray-600">Saturday, Aug 17 in Birmingham</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-dark">22°C</div>
                      <div className="text-xs text-gray-600">Partly Cloudy</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <div className="font-semibold text-gray-700">Estimated travel time</div>
                      <div className="text-sm text-gray-600">From your location: ~15 minutes by car, 25 minutes by bus</div>
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
                    📊 Go to My Dashboard
                  </button>
                  <button onClick={messageMentor} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                    💬 Message Priya Sharma
                  </button>
                  <button onClick={viewMoreClasses} className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-xl font-semibold transition-all duration-300">
                    🔍 View More Classes
                  </button>
                </div>
              </div>

              {/* Calendar Integration */}
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-primary-dark mb-4">📅 Add to Calendar</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={addToGoogleCalendar} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
                    📅 Google
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
                    📧 Outlook
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
                    🍎 Apple
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
                    🗓️ Other
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  You will receive a separate calendar invite with a recurring schedule.
                </p>
              </div>

              {/* QR Code section */}
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-primary-dark mb-4">🎟️ Your Ticket QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  For in-person classes, show this QR code at the reception.
                </p>
                <div className="flex justify-center items-center">
                  <img src="https://placehold.co/200x200/e2e8f0/4a5568?text=QR+Code+Here" alt="QR Code" className="w-48 h-48 rounded-xl shadow-md"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
