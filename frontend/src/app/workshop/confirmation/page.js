"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

const WorkshopConfirmationPage = () => {
    const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00' });
    
    // Hardcoded workshop data for demonstration
    const workshop = {
        title: 'Introduction to Vedic Chanting',
        mentor: 'Dr. Rajesh Patel',
        mentorTitle: 'Music & Spirituality Expert',
        workshopId: 'WS-2025-0847',
        icon: '🕉️',
        date: 'Saturday, July 27, 2025',
        time: '2:00 PM - 4:00 PM (BST)',
        duration: '2 hours of guided practice',
        platform: 'Zoom Meeting',
        price: 'FREE',
        category: 'Music & Spirituality',
        mentorColor: 'from-orange-500 to-red-500',
        nextSteps: [
            { icon: '📩', title: 'Check Your Email', description: 'Confirmation with Zoom link, preparation materials, and spiritual reading guide sent to your inbox' },
            { icon: '🕉️', title: 'Mentor Welcome', description: 'Dr. Rajesh will share a personal welcome video with Sanskrit pronunciation basics' },
            { icon: '🎯', title: 'Set Your Intention', description: 'Reflect on your spiritual goals and what you hope to gain from this sacred practice' }
        ],
        preparationChecklist: [
            'Create a quiet, sacred space in your home',
            'Watch Dr. Rajesh\'s welcome video',
            'Download Sanskrit pronunciation guide',
            'Practice 5 minutes of silent meditation',
            'Test your audio settings for chanting',
            'Set intention for your spiritual journey'
        ]
    };
    
    // Confetti and Countdown logic
    useEffect(() => {
        // Confetti animation
        const createConfetti = () => {
            const container = document.getElementById('confetti-container');
            if (!container) return;
            const colors = ['#FF8C00', '#FF6347', '#FFD700', '#FF69B4', '#DDA0DD', '#FFA500', '#F0E68C'];
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = Math.random() * 10 + 4 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.opacity = Math.random() * 0.8 + 0.2;
                
                const duration = Math.random() * 4 + 3;
                const delay = Math.random() * 2;
                
                confetti.style.animation = `confettiFall ${duration}s ${delay}s linear forwards`;
                container.appendChild(confetti);
            }
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 8000);
        };
        
        // Countdown timer
        const updateCountdown = () => {
            const workshopDate = new Date('2025-07-27T14:00:00');
            const now = new Date();
            const diff = workshopDate - now;
            
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                
                setCountdown({
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0')
                });
            } else {
                setCountdown({ days: '00', hours: '00', minutes: '00' });
            }
        };

        createConfetti();
        updateCountdown();
        const intervalId = setInterval(updateCountdown, 60000);
        
        // Auto-check some preparation items for a gamification effect
        const autoCheck = setTimeout(() => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            if (checkboxes.length > 1) {
                checkboxes[0].checked = true;
                checkboxes[1].checked = true;
            }
        }, 3000);

        // Auto-set reminders
        setTimeout(() => {
            // Replaced alert with a console log or a custom modal for Next.js best practice
            console.log('Workshop reminders set!');
        }, 5000);
        
        return () => {
            clearInterval(intervalId);
            clearTimeout(autoCheck);
        };
    }, []);

    // Placeholder functions for actions
    const handleAction = (message) => {
        // Replaced alert() with a console.log or custom modal logic
        console.log(message);
    };

    const handleShare = (url, width = 600, height = 400) => {
        window.open(url, '_blank', `width=${width},height=${height}`);
    };

    return (
        <>
            <Head>
                <title>Workshop Confirmed! - Roots & Wings</title>
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
                                    },
                                    keyframes: {
                                        bounceIn: {
                                          '0%': { transform: 'scale(0)', opacity: '0' },
                                          '50%': { transform: 'scale(1.1)', opacity: '1' },
                                          '100%': { transform: 'scale(1)', opacity: '1' }
                                        },
                                        slideUp: {
                                          '0%': { transform: 'translateY(30px)', opacity: '0' },
                                          '100%': { transform: 'translateY(0)', opacity: '1' }
                                        },
                                        pulse: {
                                          '0%, 100%': { transform: 'scale(1)' },
                                          '50%': { transform: 'scale(1.05)' }
                                        },
                                        confettiFall: {
                                            '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: 1 },
                                            '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 }
                                        }
                                    },
                                    animation: {
                                        bounceIn: 'bounceIn 0.8s ease-out',
                                        slideUp: 'slideUp 0.6s ease-out',
                                        pulseGentle: 'pulse 2s infinite',
                                    }
                                }
                            }
                        }
                    `
                }} />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .animation-delay-300 { animation-delay: 0.3s; }
                        .animation-delay-500 { animation-delay: 0.5s; }
                        .animation-delay-600 { animation-delay: 0.6s; }
                        .animation-delay-900 { animation-delay: 0.9s; }
                    `
                }} />
            </Head>
            <div className="font-sans text-gray-800 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 min-h-screen">
                {/* Floating Confetti Animation */}
                <div id="confetti-container" className="fixed inset-0 pointer-events-none z-10"></div>

                {/* Navigation Component */}
                <nav className="relative z-20 bg-white/90 backdrop-blur-sm shadow-lg">
                    <div className="max-w-7xl mx-auto px-5">
                        <div className="flex justify-between items-center py-4">
                            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
                            <div className="flex items-center space-x-6">
                                <span className="text-green-600 font-semibold">✅ Workshop Confirmed</span>
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
                                <div className={`w-32 h-32 bg-gradient-to-r ${workshop.mentorColor} rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulseGentle`}>
                                    <span className="text-6xl text-white">{workshop.icon}</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-ping opacity-60 animation-delay-300"></div>
                            </div>
                            <h1 className="text-5xl font-bold text-primary-dark mb-4">You're registered!</h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                🎉 Your spot is secured for the {workshop.title} workshop! {workshop.mentor} has been notified and is excited to guide you through this transformative experience.
                            </p>
                            <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold mt-6 animate-slideUp animation-delay-500">
                                🏆 Spiritual Learning Journey Begins!
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Workshop Summary Card - Main Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slideUp animation-delay-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-primary-dark">📋 Workshop Summary</h2>
                                        <div className="text-sm text-gray-500">
                                            ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{workshop.workshopId}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6 mb-8">
                                        <div className="relative">
                                            <div className={`w-20 h-20 bg-gradient-to-r ${workshop.mentorColor} rounded-full flex items-center justify-center text-white text-2xl`}>
                                                {workshop.icon}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                                ✓
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-primary-dark mb-2">{workshop.title}</h3>
                                            <p className="text-gray-600 mb-4">with {workshop.mentor} • {workshop.mentorTitle}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-semibold rounded-full">
                                                    🆓 {workshop.price} Workshop
                                                </span>
                                                <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 font-semibold rounded-full">
                                                    💻 Online Session
                                                </span>
                                                <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full">
                                                    👥 Group Experience
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">📅</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Workshop Date</div>
                                                    <div className="text-primary-dark font-bold">{workshop.date}</div>
                                                    <div className="text-sm text-gray-500">One-time workshop session</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">⏰</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Time</div>
                                                    <div className="text-primary-dark font-bold">{workshop.time}</div>
                                                    <div className="text-sm text-gray-500">{workshop.duration}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">💻</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Platform</div>
                                                    <div className="text-primary-dark font-bold">{workshop.platform}</div>
                                                    <div className="text-sm text-gray-500">Link sent 2 hours before session</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🎁</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Registration</div>
                                                    <div className="text-primary-dark font-bold text-lg">{workshop.price}</div>
                                                    <div className="text-sm text-green-600">✅ Community Outreach Program</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl mb-6">
                                        <h4 className="font-bold text-primary-dark mb-3">⏱️ Your workshop starts in:</h4>
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
                                                <span className="text-2xl">💻</span>
                                                <div>
                                                    <div className="font-semibold text-gray-700">Tech Check Recommended</div>
                                                    <div className="text-sm text-gray-600">Test your setup before the workshop</div>
                                                </div>
                                            </div>
                                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                    onClick={() => handleAction('🔧 Opening Zoom test meeting...')}>
                                                🔧 Test Zoom
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🧘‍♀️</span>
                                            <div>
                                                <div className="font-semibold text-gray-700">Prepare Your Mind & Space</div>
                                                <div className="text-sm text-gray-600">Create a peaceful environment for your chanting practice</div>
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
                                        <button className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                                                onClick={() => handleAction('Redirecting to your dashboard...')}>
                                            📊 Go to My Dashboard
                                        </button>
                                        <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                                                onClick={() => handleAction('Opening direct message with Dr. Rajesh Patel...')}>
                                            💬 Message Dr. Rajesh Patel
                                        </button>
                                        <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-xl font-semibold transition-all duration-300"
                                                onClick={() => handleAction('Showing you other spiritual and cultural workshops...')}>
                                            🔍 View More Workshops
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-primary-dark mb-4">📅 Add to Calendar</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleShare('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Introduction%20to%20Vedic%20Chanting%20-%20Roots%20%26%20Wings%20Workshop&dates=20250727T140000Z/20250727T160000Z&details=Online%20workshop%20with%20Dr.%20Rajesh%20Patel.%20Sacred%20sound%20meditation%20and%20Sanskrit%20chanting%20basics.%20Check%20email%20for%20Zoom%20link.')}>
                                            📅 Google
                                        </button>
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('Opening Outlook calendar integration...')}>
                                            📧 Outlook
                                        </button>
                                        <button className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('Generating Apple Calendar file...')}>
                                            🍎 Apple
                                        </button>
                                        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('Downloading .ics calendar file...')}>
                                            💾 .ICS File
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-gray-100 w-24 h-24 mx-auto rounded-lg flex items-center justify-center mb-2">
                                            <div className="w-20 h-20 bg-black" style={{backgroundImage: 'linear-gradient(90deg, black 50%, transparent 50%), linear-gradient(black 50%, transparent 50%)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px'}}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">Scan to add workshop</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-primary-dark mb-4">🔧 Zoom Setup Guide</h3>
                                    <div className="text-center mb-4">
                                        <div className="bg-gray-100 w-32 h-32 mx-auto rounded-lg flex items-center justify-center mb-3">
                                            <div className="w-28 h-28 bg-black" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, black 2px, transparent 2px), radial-gradient(circle at 75% 75%, black 2px, transparent 2px)', backgroundSize: '8px 8px'}}></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">Scan for setup tutorial</p>
                                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('📱 Opening comprehensive Zoom setup guide...')}>
                                            📱 Open Setup Guide
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-primary-dark mb-4">👤 Mentor Contact</h3>
                                    <div className="text-center">
                                        <div className="bg-gray-100 w-24 h-24 mx-auto rounded-lg flex items-center justify-center mb-3">
                                            <div className="w-20 h-20 bg-black" style={{background: 'repeating-linear-gradient(0deg, black, black 2px, transparent 2px, transparent 4px), repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)'}}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">Save Dr. Rajesh's contact</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl p-6">
                                    <h3 className="text-lg font-bold text-primary-dark mb-4">📱 Share Your Journey</h3>
                                    <p className="text-sm text-gray-600 mb-4">Let friends know about your spiritual learning adventure!</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent("Just registered for a Vedic Chanting workshop with Roots & Wings! 🕉️ Excited to explore Sanskrit sacred sounds and spiritual practice. #VedicChanting #SpiritualLearning #RootsAndWings #Sanskrit")}`)}>
                                            📘
                                        </button>
                                        <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('Opening Instagram story template...')}>
                                            📷
                                        </button>
                                        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleShare(`https://wa.me/?text=${encodeURIComponent("Just registered for a Vedic Chanting workshop with Roots & Wings! 🕉️ Exploring ancient Sanskrit chants and meditation. Such an amazing learning opportunity!")}`)}>
                                            💬
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps Section */}
                        <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl animate-slideUp animation-delay-900">
                            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">📋 What happens next?</h2>
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {workshop.nextSteps.map((step, index) => (
                                    <div key={index} className="text-center">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${index === 0 ? 'from-orange-500 to-red-500' : index === 1 ? 'from-purple-500 to-pink-500' : 'from-green-500 to-teal-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                            <span className="text-2xl text-white">{step.icon}</span>
                                        </div>
                                        <h4 className="font-bold text-primary-dark mb-2">{step.title}</h4>
                                        <p className="text-gray-600 text-sm">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl mb-6">
                                <h4 className="font-bold text-primary-dark mb-4">✅ Pre-Workshop Spiritual Preparation</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {workshop.preparationChecklist.map((item, index) => (
                                        <div className="space-y-2" key={index}>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="rounded border-gray-300 text-primary" />
                                                <span className="text-sm">{item}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-primary-dark mb-2">🌟 Join Our Learning Community</h4>
                                        <p className="text-sm text-gray-600">Connect with fellow spiritual seekers and continue your journey together!</p>
                                    </div>
                                    <div className="text-right">
                                        <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                onClick={() => handleAction('🌸 Joining the Vedic Chanting study group...')}>
                                            🌸 Join WhatsApp Group
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center text-gray-500 text-sm">
                            <p>Need to make changes? You can manage your workshop registration from your dashboard.</p>
                            <p className="mt-2">Questions about the workshop? Contact Dr. Rajesh directly or our support team at <a href="#" className="text-primary hover:text-primary-dark font-semibold">support@rootsandwings.co.uk</a></p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default WorkshopConfirmationPage;
