'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';


export default function BookingConfirmation() {
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [bookingTotal, setBookingTotal] = useState(187.50);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [selectedMentorClass, setSelectedMentorClass] = useState({});
  const [mentor, setMentor] = useState({});


  useEffect(() => {
    const selectedMentorClass = JSON.parse(localStorage.getItem('selectedMentorClass'));
    setSelectedMentorClass(selectedMentorClass);
    const mentor = JSON.parse(localStorage.getItem('mentor'));
    setMentor(mentor);
  }, []);
  
  // Function to simulate a confetti effect (replicated from original JS)
  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = ['#00A2E8', '#00468C', '#FFD700', '#FF6B6B', '#4ECDC4'][i % 5];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = '50%';
      confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
      confettiContainer.appendChild(confetti);
    }
    
    // Add CSS animation for confetti
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            from {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 5000);
  };

  // Replicating the functions from the original HTML
  const proceedToPayment = async () => {
    if (!isTermsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }

    setIsProcessing(true);


    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user,'user user user');

    const response = await axios.post(
      'https://rootsnwings-api-944856745086.europe-west2.run.app/bookings/',
      {
        mentorId: mentor.uid,
        classId: selectedMentorClass.classId,
        studentId: user.user.uid,

pricing : {
  finalPrice:320,
  ...selectedMentorClass.pricing,
}

        
      }
    );
    console.log(response,'response response response');

    if(response.status === 200) {
      setShowSuccessModal(true);
      createConfetti();
    } else {
      setShowErrorAlert(true);
    }
    
  };

  const applyPromoCode = () => {
    const validCodes = { 'STUDENT10': 10, 'FIRST20': 20, 'ROOTS15': 15 };
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      alert('Please enter a promo code');
      return;
    }

    if (validCodes[code]) {
      const discountPercentage = validCodes[code];
      const initialTotal = 187.50;
      const discount = (initialTotal * discountPercentage) / 100;
      const newTotal = initialTotal - discount;

      setBookingTotal(newTotal);
      setDiscountAmount(discount);
      setIsPromoApplied(true);

      alert(`Promo code applied! ${discountPercentage}% discount saved you £${discount.toFixed(2)}`);
    } else {
      alert('Invalid promo code. Please check and try again.');
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date('2025-08-17T14:00:00');
    const endDate = new Date('2025-08-17T15:00:00');
    const title = '8-Week Weekend Batch - Intermediate Kathak with Priya Sharma';
    const location = 'Community Centre, Birmingham B12 8JA';
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&location=${encodeURIComponent(location)}&recur=RRULE:FREQ=WEEKLY;BYDAY=SA,SU;COUNT=16`;
    window.open(calendarUrl, '_blank');
  };

  const handleChatWithMentor = () => {
    // alert('Starting chat with Priya Sharma...\nShe typically responds within 30 minutes.');
  };

  const handleContactSupport = () => {
    // alert('Opening support chat...\nOur team is available 24/7 to help with your booking!');
  };

  useEffect(() => {
    // This effect handles the auto-hiding of the error alert
    if (showErrorAlert) {
      const timer = setTimeout(() => {
        setShowErrorAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorAlert]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short' 
    });
  };

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
  
  
  // Custom global CSS for body and animation
  const globalStyle = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
      color: #2d3748; /* text-gray-800 */
      background-color: #f7fafc; /* bg-gray-50 */
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `;

  const levelBadge = getLevelBadge(selectedMentorClass.level);
  const ageBadge = getAgeGroupBadge(selectedMentorClass.ageGroup);

  return (
    <>
      <style jsx global>{globalStyle}</style>

      {/* Navigation Component */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <a href="/mentor/directory" className="text-gray-600 hover:text-primary transition-colors">← Back to Sessions</a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">Help</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Step Indicator Component */}
      <div className="fixed top-16 w-full z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div className="ml-3">
                <div className="text-sm font-semibold text-green-600">Step 1</div>
                <div className="text-xs text-gray-500">Choose Mentor</div>
              </div>
            </div>
            <div className="flex-1 h-px bg-green-500 mx-4"></div>
            {/* Step 2 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div className="ml-3">
                <div className="text-sm font-semibold text-green-600">Step 2</div>
                <div className="text-xs text-gray-500">Select Session</div>
              </div>
            </div>
            <div className="flex-1 h-px bg-primary mx-4"></div>
            {/* Step 3 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="ml-3">
                <div className="text-sm font-semibold text-primary">Step 3</div>
                <div className="text-xs text-gray-500">Confirm Booking</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-dark mb-2">Confirm Your Booking</h1>
            <p className="text-gray-600">Review your selection before proceeding to payment</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Mentor Snapshot */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-40">
                <div className="text-center mb-6">
                  <div className="relative mx-auto mb-4">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">P</div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2">{mentor?.displayName}</h3>
                  <p className="text-gray-600 mb-3">{mentor?.headline}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex text-yellow-400">★★★★★</div>
                    <span className="text-sm text-gray-600">{mentor?.stats?.avgRating} ({mentor?.stats?.totalReviews} reviews)</span>
                  </div>
                  { mentor?.pricing?.firstSessionFree &&
                    <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">🎉 {mentor?.pricing?.firstSessionFree ? 'First Session is FREE' : ''}</div>}
                  <a href="#" className="text-primary hover:text-primary-dark font-semibold text-sm transition-colors">👤 View Full Profile →</a>
                </div>
                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-primary-dark">500+</div>
                      <div className="text-gray-500">Hours Taught</div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary-dark">85%</div>
                      <div className="text-gray-500">Repeat Students</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-primary-dark mb-6">Booking Summary</h2>
                <div className="space-y-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📚</span>
                      <div>
                        <div className="font-semibold text-gray-700">Session Type</div>
                        <div className="text-primary-dark font-bold">Weekend Group Batch</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Group Class</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🎯</span>
                    <div>
                      <div className="font-semibold text-gray-700">Batch Name</div>
                      <div className="text-primary-dark font-bold text-lg">{selectedMentorClass.title}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <div className="font-semibold text-gray-700">Schedule</div>
                      <div className="text-primary-dark font-bold">   {formatDate(selectedMentorClass.schedule?.startDate)} - {formatDate(selectedMentorClass.schedule?.endDate)}</div>
                      <div className="text-sm text-gray-500"> {Math.ceil((new Date(selectedMentorClass.schedule?.endDate) - new Date(selectedMentorClass.schedule?.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks program</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">💻</span>
                    <div>
                      <div className="font-semibold text-gray-700">Delivery Mode</div>
                      <div className="text-primary-dark font-bold">In-Person (Birmingham)</div>
                      <div className="text-sm text-gray-500">Community Centre, Birmingham B12 8JA</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">🎓</span>
                    <div>
                      <div className="font-semibold text-gray-700">Level & Age Group</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        {ageBadge?.icon} {ageBadge?.label}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                        {levelBadge?.icon} {levelBadge?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-primary-dark mb-4">💰 Fee Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">8-Week Batch (16 sessions)</span>
                      <span className="font-semibold">£200.00</span>
                    </div>
                    {discountAmount === 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>First Session Discount</span>
                        <span className="font-semibold">-£12.50</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Code ({promoCode.toUpperCase()})</span>
                        <span className="font-semibold">-£{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-bold text-lg">Total Payable</span>
                      <span className="font-bold text-xl text-primary-dark">£{bookingTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">≈ £11.72 per session (excellent value!)</div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <label htmlFor="promo-code" className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Have a promo code?</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        id="promo-code"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={isPromoApplied}
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={isPromoApplied}
                        className={`bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors ${!isPromoApplied ? 'hover:bg-gray-300' : 'opacity-50 cursor-not-allowed'}`}
                      >
                        {isPromoApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="mb-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="terms-checkbox"
                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                        required
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      />
                      <div className="text-sm text-gray-700 leading-relaxed">
                        I agree to the platform's <a href="#" className="text-primary hover:text-primary-dark font-semibold">terms of service</a> and <a href="#" className="text-primary hover:text-primary-dark font-semibold">cancellation policy</a>. I understand that group classes have a 48-hour cancellation policy.
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={proceedToPayment}
                  disabled={!isTermsAccepted || isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${isTermsAccepted && !isProcessing ? 'bg-primary hover:bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                >
                  {isProcessing ? 'Processing Payment...' : `🔒 Pay & Confirm Booking - £${bookingTotal.toFixed(2)}`}
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={handleContactSupport} className="w-full border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary py-3 rounded-lg font-semibold transition-colors">❓ Need Help? Contact Support</button>
                  <button onClick={handleChatWithMentor} className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-lg font-semibold transition-colors">💬 Chat with Mentor</button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-6 rounded-2xl">
                <h4 className="font-bold text-primary-dark mb-3">📋 What happens next?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Instant booking confirmation via email</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Mentor will contact you within 24 hours</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Calendar invite with Zoom/location details</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Access to course materials and group chat</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal Component */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Great! You're all set for the 8-Week Weekend Batch with Priya Sharma. Check your email for confirmation details.
            </p>
            <div className="space-y-3">
              <button onClick={handleAddToCalendar} className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">📅 Add to Calendar</button>
              <button onClick={() => setShowSuccessModal(false)} className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold transition-colors">View My Bookings</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Component */}
      {showErrorAlert && (
        <div className="fixed top-20 right-5 z-50 max-w-sm w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <div>
              <strong className="font-bold">Booking Unavailable!</strong>
              <p className="text-sm">This batch is now full. Please try another session or contact the mentor.</p>
            </div>
          </div>
          <button onClick={() => setShowErrorAlert(false)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}
    </>
  );
}
