"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Helper function to render star ratings
const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    // Ensure rating is between 0 and 5 for display purposes
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStarsCount = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 >= 0.5;
    const emptyStarsCount = 5 - fullStarsCount - (hasHalfStar ? 1 : 0);

    return (
        <>
            {'★'.repeat(fullStarsCount)}
            {hasHalfStar && '½'}
            {'☆'.repeat(emptyStarsCount)}
        </>
    );
};

const mentorMock =  {
    "uid": "user_default_mentor",
    "displayName": "Arjun S",
    "photoURL": "",
    "category": "music",
    "searchKeywords": [],
    "headline": "Experienced Music & Language Tutor",
    "bio": "I'm a passionate tutor with a deep love for music and languages. I have extensive experience teaching various instruments and helping students master new languages. My approach is patient and tailored to each student's unique learning style, focusing on building a strong foundation while making learning enjoyable. I believe in fostering a supportive environment where students feel comfortable to explore and grow. Let's embark on a rewarding learning journey together!",
    "languages": ["English", "Hindi", "Gujarati"],
    "teachingLevels": ["beginner", "intermediate", "advanced"],
    "ageGroups": ["children", "teens", "adults"],
    "teachingModes": ["in-person", "online"],
    "subjects": ["Music", "Languages", "Guitar", "Piano", "Spanish"],
    "city": "Birmingham",
    "region": "West Midlands",
    "country": "UK",
    "postcode": "B1 1AA",
    "coordinates": null,
    "pricing": {
        "oneOnOneRate": 40,
        "groupRate": 25,
        "currency": "GBP",
        "firstSessionFree": true
    },
    "stats": {
        "avgRating": 4.7,
        "totalReviews": 45,
        "totalStudents": 80,
        "totalSessions": 620,
        "responseTimeMinutes": 25,
        "repeatStudentRate": 0.90 // 90%
    },
    "status": "active",
    "isVerified": true,
    "backgroundChecked": true,
    "acceptingNewStudents": {
        "group": true,
        "oneOnOne": true
    },
    "qualifications": [],
    "availabilitySummary": null,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-08-01T14:30:00Z"
};

// Main component for the Mentor Detail page.
const MentorDetail = () => {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('one-on-one');
    const [mentorData, setMentorData] = useState(mentorMock);

    useEffect(() => {
        const storedMentor = localStorage?.getItem("mentor");
        
        if (!storedMentor) {
            window.location.href = "/mentor/directory";
            return;
        }

        const initialMentorData = JSON.parse(storedMentor);
        setMentorData(initialMentorData);
        console.log(initialMentorData, 'initialMentorData initialMentorData');
    }, []);


 

    // const mentorData = initialMentorData;

    // Handler for the "Read More" button
    const handleReadMoreClick = () => {
        setIsBioExpanded(!isBioExpanded);
    };

    // Handler for changing session tabs
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    // Derive initials from displayName
    const profileInitials = mentorData?.displayName ? mentorData?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';

    // Derive short bio
    const shortBio = mentorData?.bio?.length > 150 ? mentorData?.bio?.substring(0, 150) + '...' : mentorData?.bio;

    // Construct location string
    let locationString = mentorData?.teachingModes?.includes('online') ? 'Online' : '';

    if (mentorData?.teachingModes?.includes('in-person') && mentorData?.city) {
        if (locationString) {
            locationString += ` & ${mentorData?.city}`;
        } else {
            locationString += mentorData.city;
        }
    } else if (!locationString) {
        locationString = 'Not specified'; // Fallback if neither online nor in-person city is available
    }

    // Map new stats to old display format
    const mentorStats = [
        { icon: mentorData?.backgroundChecked ? "✅" : "⚠️", label: mentorData?.backgroundChecked ? "Background Verified" : "Background Check Pending" },
        { icon: "⏰", label: `${mentorData?.stats?.totalSessions}+ Sessions` }, // Changed from hours to sessions
        { icon: "🔄", label: `${(mentorData?.stats?.repeatStudentRate * 100).toFixed(0)}% Repeat Students` },
        { icon: "💬", label: `Replies in ${mentorData?.stats?.responseTimeMinutes}min` },
    ];

    return (
        <>
        
            <body className="font-sans text-gray-800 bg-gray-50">

                {/* Navigation Component */}
                <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
                    <div className="max-w-7xl mx-auto px-5">
                        <div className="flex justify-between items-center py-4">
                            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
                            <div className="flex items-center space-x-6">
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Mentors</a>
                                <a href="#" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="pt-20">
                    <div className="max-w-7xl mx-auto px-5 py-8">
                        
                        {/* Top Section: Profile + Pricing */}
                        <div className="grid lg:grid-cols-3 gap-8 mb-8">
                            
                            {/* Mentor Profile Card Component */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                                        {/* Profile Picture */}
                                        <div className="relative">
                                            {mentorData.photoURL ? (
                                                <img src={mentorData.photoURL} alt={`${mentorData.displayName}'s profile`} className="w-32 h-32 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                                    {profileInitials}
                                                </div>
                                            )}
                                            {/* Verified Badge */}
                                            {mentorData.backgroundChecked && (
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" title="Verified Mentor">
                                                    ✓
                                                </div>
                                            )}
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-primary-dark mb-2">{mentorData.displayName}</h1>
                                            
                                            {/* Category Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {mentorData?.subjects?.map((subject, index) => (
                                                    <span key={index} className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">{subject}</span>
                                                ))}
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="flex text-yellow-400">
                                                    {renderStars(mentorData?.stats?.avgRating)}
                                                </div>
                                                <span className="text-lg font-semibold text-primary-dark">{mentorData?.stats?.avgRating?.toFixed(1)}</span>
                                                <span className="text-gray-600">({mentorData?.stats?.totalReviews} reviews)</span>
                                            </div>

                                            {/* Stats Icons */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {mentorStats.map((stat, index) => (
                                                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <div className="text-2xl mb-1">{stat.icon}</div>
                                                        <div className="text-xs text-gray-600">{stat.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* About Section Component */}
                                    <div className="border-t pt-6">
                                        <h2 className="text-xl font-bold text-primary-dark mb-4">About {mentorData.displayName}</h2>
                                        <div id="bio-container">
                                            <p className="text-gray-700 leading-relaxed mb-4">
                                                {isBioExpanded ? mentorData.bio : shortBio}
                                            </p>
                                            {mentorData.bio.length > 150 && (
                                                <button
                                                    id="read-more-btn"
                                                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                                                    onClick={handleReadMoreClick}
                                                >
                                                    {isBioExpanded ? "Read Less" : "Read More"}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Languages & Region */}
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            <div>
                                                <span className="font-semibold text-gray-700">Spoken Languages:</span>
                                                <span className="text-gray-600 ml-2">{mentorData?.languages?.join(', ')}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Teaching Region:</span>
                                                <span className="text-gray-600 ml-2">{locationString}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Panel Component */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                                    {/* Pricing Header */}
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-primary-dark mb-2">
                                            {mentorData.pricing.currency}{mentorData.pricing.oneOnOneRate}
                                            <span className="text-lg text-gray-500">/hour</span>
                                        </div>
                                        {mentorData.pricing.firstSessionFree && (
                                            <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                ✅ First Session is Free
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-primary mr-3">✅</span>
                                            One-on-One Sessions
                                        </div>
                                        {mentorData?.acceptingNewStudents?.group && (
                                            <div className="flex items-center text-gray-700">
                                                <span className="text-primary mr-3">✅</span>
                                                Group Classes Available
                                            </div>
                                        )}
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-primary mr-3">✅</span>
                                            {mentorData?.teachingModes?.map(mode => mode.charAt(0).toUpperCase() + mode.slice(1)).join(' & ')}
                                        </div>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">
                                            Reserve Now
                                        </button>
                                        <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-full font-semibold transition-colors">
                                            Book Free Video Chat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session Types Component */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <h2 className="text-2xl font-bold text-primary-dark mb-6">Select Session Type</h2>
                            
                            {/* Tab Navigation */}
                            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                                <button
                                    className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'one-on-one' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                    onClick={() => handleTabClick('one-on-one')}
                                >
                                    One-on-One Sessions
                                </button>
                                {mentorData?.acceptingNewStudents?.group && (
                                    <button
                                        className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'group' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                        onClick={() => handleTabClick('group')}
                                    >
                                        Group Sessions
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* One-on-One Sessions */}
                                {activeTab === 'one-on-one' && (
                                    <div id="one-on-one" className="tab-pane">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-dark mb-3">Personalised Learning</h3>
                                                <p className="text-gray-700 mb-4">1-hour personalised sessions tailored to your specific learning goals. Choose any topic within my expertise areas.</p>
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Flexible scheduling</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Customised curriculum</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Progress tracking</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Recording provided</li>
                                                </ul>
                                            </div>
                                            <div className="bg-primary-light p-6 rounded-xl">
                                                <div className="text-2xl font-bold text-primary-dark mb-2">{mentorData.pricing.currency}{mentorData.pricing.oneOnOneRate}/session</div>
                                                <div className="text-sm text-gray-600 mb-4">Available slots throughout the week</div>
                                                <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">
                                                    Explore Sessions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Group Sessions */}
                                {activeTab === 'group' && mentorData.acceptingNewStudents.group && (
                                    <div id="group-sessions" className="tab-pane">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-dark mb-3">Group Learning Sessions</h3>
                                                <p className="text-gray-700 mb-4">Join small group sessions for collaborative learning and shared experiences. Perfect for general topics and skill-building.</p>
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Interactive group environment</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cost-effective learning</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Learn from peers</li>
                                                </ul>
                                            </div>
                                            <div className="bg-primary-light p-6 rounded-xl">
                                                <div className="text-2xl font-bold text-primary-dark mb-2">{mentorData.pricing.currency}{mentorData.pricing.groupRate}/session</div>
                                                <div className="text-sm text-gray-600 mb-4">Availability varies, check schedule for upcoming batches.</div>
                                                <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">
                                                    Explore Group Batches
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Custom Class Option */}
                            <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
                                <p className="text-gray-600 mb-3">❓ Not able to find a suitable session?</p>
                                <button className="text-primary hover:text-primary-dark font-semibold transition-colors"> Contact Mentor for Custom Class </button>
                            </div>
                        </div>

                    </div>
                </main>
            </body>
        </>
    );
};

export default MentorDetail;
