"use client";

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const WorkshopBookingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModified, setIsFormModified] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const formRef = useRef(null);

    // Workshop data is hardcoded for this example, but would be fetched from an API in a real app
    const workshopData = {
        title: 'Introduction to Vedic Chanting',
        mentor: 'Dr. Rajesh Patel',
        mentorInitial: 'R',
        mentorColor: 'from-orange-500 to-red-500',
        icon: '🕉️',
        date: 'Saturday, July 27',
        time: '2:00 PM - 4:00 PM (BST)',
        duration: '2 hours',
        mode: 'Online via Zoom',
        location: 'Link sent after registration',
        category: 'Music & Spirituality',
        level: 'Beginner',
        age: 'Adults',
        capacity: 5,
        price: 'FREE',
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = formRef.current.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    errors[field.id || field.name] = 'This field is required.';
                }
            } else if (!field.value.trim()) {
                errors[field.id || field.name] = 'This field is required.';
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const confirmWorkshopBooking = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsModalOpen(true);
        } else {
            alert('Please fill in all required fields and accept the terms.');
        }
    };

    const closeSuccessModal = () => {
        setIsModalOpen(false);
    };

    const addToCalendar = () => {
        const startDate = new Date('2025-07-27T14:00:00').toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date('2025-07-27T16:00:00').toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const title = 'Introduction to Vedic Chanting - Roots & Wings Workshop';
        const details = 'Online workshop with Dr. Rajesh Patel. Check email for Zoom link.';
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;
        window.open(url, '_blank');
        closeSuccessModal();
    };

    const viewMyBookings = () => {
        closeSuccessModal();
        alert('Redirecting to your dashboard where you can view all your bookings...');
    };

    const handleFormChange = () => {
        setIsFormModified(true);
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isFormModified) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isFormModified]);

    return (
        <>
            <Head>
                <title>Book Workshop - Roots & Wings</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        primary: '#00A2E8',
                                        'primary-dark': '#00468C',
                                        'primary-light': '#f8fbff',
                                        'accent-light': '#e8f4ff'
                                    },
                                    fontFamily: {
                                        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
                                    }
                                }
                            }
                        }
                    `
                }} />
            </Head>
            <div className="font-sans text-gray-800 bg-gray-50">
                {/* Navigation Component */}
                <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
                    <div className="max-w-7xl mx-auto px-5">
                        <div className="flex justify-between items-center py-4">
                            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
                            <div className="flex items-center space-x-6">
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Workshops</a>
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">Help</a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Step Indicator Component */}
                <div className="fixed top-16 w-full z-40 bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-5 py-6">
                        <div className="flex items-center justify-center">
                            {/* Step 1: Browse Workshops */}
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-semibold text-green-600">Step 1</div>
                                    <div className="text-xs text-gray-500">Browse Workshops</div>
                                </div>
                            </div>

                            {/* Connector Line */}
                            <div className="flex-1 h-px bg-primary mx-4"></div>

                            {/* Step 2: Book Workshop */}
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-semibold text-primary">Step 2</div>
                                    <div className="text-xs text-gray-500">Book Workshop</div>
                                </div>
                            </div>

                            {/* Connector Line */}
                            <div className="flex-1 h-px bg-gray-300 mx-4"></div>

                            {/* Step 3: Confirmation */}
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-semibold text-gray-500">Step 3</div>
                                    <div className="text-xs text-gray-500">Confirmation</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="pt-40 pb-16">
                    <div className="max-w-7xl mx-auto px-5">
                        
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-primary-dark mb-2">Book Your Workshop</h1>
                            <p className="text-gray-600">Review details and complete your registration</p>
                        </div>

                        {/* Main Layout: Workshop Summary + Booking Form */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            
                            {/* Workshop Summary Card - Right Panel */}
                            <div className="lg:col-span-1 lg:order-2">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-40">
                                    {/* Workshop Hero */}
                                    <div className={`h-32 bg-gradient-to-br ${workshopData.mentorColor.replace('from-', 'from-')}`} >
                                        <div className="h-32 flex items-center justify-center relative">
                                            <span className="text-5xl text-white">{workshopData.icon}</span>
                                            {/* Free Badge */}
                                            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                🆓 {workshopData.price}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Workshop Title */}
                                        <h2 className="text-xl font-bold text-primary-dark mb-4">{workshopData.title}</h2>

                                        {/* Mentor Info */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-14 h-14 bg-gradient-to-r ${workshopData.mentorColor.replace('from-', 'from-')}`} >
                                                <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold">
                                                    {workshopData.mentorInitial}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{workshopData.mentor}</div>
                                                <div className="text-sm text-gray-500">🎓 Certified Mentor</div>
                                                <div className="flex text-yellow-400 text-xs">★★★★★</div>
                                            </div>
                                        </div>

                                        {/* Workshop Details */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">📅</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Date & Time</div>
                                                    <div className="text-primary-dark font-bold">{workshopData.date}</div>
                                                    <div className="text-sm text-gray-500">{workshopData.time}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">⏱️</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Duration</div>
                                                    <div className="text-primary-dark font-bold">{workshopData.duration}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">💻</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Mode</div>
                                                    <div className="text-primary-dark font-bold">{workshopData.mode}</div>
                                                    <div className="text-sm text-gray-500">{workshopData.location}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">🎯</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Category</div>
                                                    <div className="text-primary-dark font-bold">{workshopData.category}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">🎓</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Level & Age</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{workshopData.level}</span>
                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">{workshopData.age}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">👥</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Capacity</div>
                                                    <div className="text-primary-dark font-bold">Maximum 15 participants</div>
                                                    <div className="text-sm text-green-600">✅ {workshopData.capacity} spots remaining</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Summary */}
                                        <div className="border-t pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-lg font-semibold text-gray-700">Workshop Fee</span>
                                                <span className="text-2xl font-bold text-green-600">{workshopData.price}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-4">
                                                ✨ This workshop is offered free as part of our community outreach program
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl">
                                                <h4 className="font-semibold text-green-800 mb-2">What's Included:</h4>
                                                <ul className="text-sm text-green-700 space-y-1">
                                                    <li>✓ 2-hour interactive session</li>
                                                    <li>✓ Digital practice materials</li>
                                                    <li>✓ Recording for 7-day access</li>
                                                    <li>✓ Certificate of participation</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Form - Left Section */}
                            <div className="lg:col-span-2 lg:order-1">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                    <h2 className="text-2xl font-bold text-primary-dark mb-6">Registration Details</h2>

                                    <form id="workshop-booking-form" ref={formRef} onChange={handleFormChange}>
                                        {/* Primary Learner Section */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-primary-dark mb-4">👤 Learner Information</h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                                                    <input type="text" className={`w-full px-4 py-3 border rounded-lg focus:border-primary focus:outline-none ${validationErrors['firstName'] ? 'border-red-500' : 'border-gray-200'}`} 
                                                           placeholder="Enter first name" defaultValue="Sarah" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                                                    <input type="text" className={`w-full px-4 py-3 border rounded-lg focus:border-primary focus:outline-none ${validationErrors['lastName'] ? 'border-red-500' : 'border-gray-200'}`} 
                                                           placeholder="Enter last name" defaultValue="Johnson" required />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                                    <input type="email" className={`w-full px-4 py-3 border rounded-lg focus:border-primary focus:outline-none ${validationErrors['email'] ? 'border-red-500' : 'border-gray-200'}`} 
                                                           placeholder="Enter email" defaultValue="sarah.johnson@email.com" required />
                                                    <p className="text-xs text-gray-500 mt-1">Workshop link will be sent to this email</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                                    <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none" 
                                                           placeholder="Enter phone number" defaultValue="+44 7123 456789" />
                                                    <p className="text-xs text-gray-500 mt-1">For workshop reminders (optional)</p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                                                <select className={`w-full px-4 py-3 border rounded-lg focus:border-primary focus:outline-none bg-white ${validationErrors['age'] ? 'border-red-500' : 'border-gray-200'}`} required>
                                                    <option value="">Select age range</option>
                                                    <option value="18-25">18-25 years</option>
                                                    <option value="26-35" selected>26-35 years</option>
                                                    <option value="36-50">36-50 years</option>
                                                    <option value="51-65">51-65 years</option>
                                                    <option value="65+">65+ years</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Special Requirements */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-primary-dark mb-4">📋 Additional Information</h3>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                                                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white">
                                                    <option value="complete-beginner" selected>Complete beginner</option>
                                                    <option value="some-exposure">Some exposure to chanting/meditation</option>
                                                    <option value="familiar">Familiar with Sanskrit basics</option>
                                                    <option value="experienced">Experienced practitioner</option>
                                                </select>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Restrictions/Accessibility Needs</label>
                                                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none" 
                                                          rows="3" placeholder="Any special accommodations we should know about? (Optional)"></textarea>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">How did you hear about this workshop?</label>
                                                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white">
                                                    <option value="">Please select</option>
                                                    <option value="website">Roots & Wings website</option>
                                                    <option value="social-media">Social media</option>
                                                    <option value="friend">Friend recommendation</option>
                                                    <option value="mentor">Mentor referral</option>
                                                    <option value="google">Google search</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Terms and Agreements */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-primary-dark mb-4">✅ Terms & Agreements</h3>
                                            
                                            <div className="space-y-4">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" required />
                                                    <div className={`text-sm leading-relaxed ${validationErrors['terms-of-service'] ? 'text-red-600' : 'text-gray-700'}`}>
                                                        I agree to the 
                                                        <a href="#" className="text-primary hover:text-primary-dark font-semibold">Terms of Service</a> 
                                                        and 
                                                        <a href="#" className="text-primary hover:text-primary-dark font-semibold">Privacy Policy</a>
                                                    </div>
                                                </label>

                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" required />
                                                    <div className={`text-sm leading-relaxed ${validationErrors['cancellation-policy'] ? 'text-red-600' : 'text-gray-700'}`}>
                                                        I understand the workshop cancellation policy: Free cancellation up to 2 hours before the session starts.
                                                    </div>
                                                </label>

                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                                                    <div className="text-sm text-gray-700 leading-relaxed">
                                                        I consent to the session being recorded for educational purposes. Recordings are only shared with participants.
                                                    </div>
                                                </label>

                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                                                    <div className="text-sm text-gray-700 leading-relaxed">
                                                        I'd like to receive email updates about future workshops and events from Roots & Wings.
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 space-y-4">
                                    {/* Main CTA */}
                                    <button 
                                        className="w-full bg-primary hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        id="confirm-booking-btn" 
                                        onClick={confirmWorkshopBooking}
                                    >
                                        ✅ Confirm Free Registration
                                    </button>

                                    {/* Secondary Actions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            className="w-full border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary py-3 rounded-lg font-semibold transition-colors"
                                            onClick={() => alert('Opening message thread with Dr. Rajesh Patel...\n\n"Hi Dr. Patel! I\'m excited about the Vedic Chanting workshop. Do you have any preparation recommendations for a complete beginner?"')}
                                        >
                                            💬 Message Dr. Rajesh Patel
                                        </button>
                                        <button 
                                            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-lg font-semibold transition-colors"
                                            onClick={() => alert('Workshop saved to your wishlist!\n\nYou can complete registration anytime before the workshop. We\'ll send you a reminder 24 hours before registration closes.')}
                                        >
                                            📌 Save for Later
                                        </button>
                                    </div>
                                </div>

                                {/* Important Notice */}
                                <div className="mt-6 bg-blue-50 p-6 rounded-2xl">
                                    <h4 className="font-bold text-primary-dark mb-3">📧 What happens after registration?</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">✓</span>
                                            <span><strong>Instant confirmation:</strong> You'll receive an email confirmation immediately</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">✓</span>
                                            <span><strong>Workshop materials:</strong> Pre-session reading and practice materials sent 24 hours before</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">✓</span>
                                            <span><strong>Zoom link:</strong> Workshop link and instructions sent 2 hours before start time</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">✓</span>
                                            <span><strong>Mentor contact:</strong> Dr. Rajesh will personally welcome you to the session</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Success Modal Component (Initially Hidden) */}
                <div 
                    id="success-modal" 
                    className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${isModalOpen ? '' : 'hidden'}`}
                    onClick={(e) => e.target.id === 'success-modal' && closeSuccessModal()}
                >
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary-dark mb-4">Registration Confirmed!</h3>
                        <p className="text-gray-600 mb-6">
                            Wonderful! You're registered for "Introduction to Vedic Chanting" with Dr. Rajesh Patel. 
                            Check your email for confirmation and workshop materials.
                        </p>
                        <div className="space-y-3">
                            <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                                    onClick={addToCalendar}>
                                📅 Add to Calendar
                            </button>
                            <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold transition-colors"
                                    onClick={viewMyBookings}>
                                View My Workshops
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WorkshopBookingPage;
