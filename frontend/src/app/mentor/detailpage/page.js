"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

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

const mentorMock = {
    "uid": "user_default_mentor",
    "displayName": "Arjun S",
    "photoURL": "https://randomuser.me/api/portraits/men/32.jpg",
    "category": "music",
    "searchKeywords": ["music", "guitar", "piano", "languages", "hindi", "spanish"],
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
    "coordinates": {
        "lat": 52.4862,
        "lng": -1.8904
    },
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
        "repeatStudentRate": 0.90
    },
    "status": "active",
    "isVerified": true,
    "backgroundChecked": true,
    "acceptingNewStudents": {
        "group": true,
        "oneOnOne": true
    },
    "qualifications": [
        {
            "id": "qual_001",
            "type": "degree",
            "title": "Bachelor of Music",
            "institution": "Birmingham Conservatoire",
            "year": "2018",
            "icon": "🎓",
            "certUrl": "https://example.com/cert1"
        },
        {
            "id": "qual_002",
            "type": "certification",
            "title": "TEFL Certificate",
            "institution": "International TEFL Academy",
            "year": "2020",
            "icon": "📜",
            "certUrl": "https://example.com/cert2"
        },
        {
            "id": "qual_003",
            "type": "diploma",
            "title": "Advanced Guitar Performance Diploma",
            "institution": "Trinity College London",
            "year": "2019",
            "icon": "🎸",
            "certUrl": "https://example.com/cert3"
        }
    ],
    "availabilitySummary": {
        "timezone": "Europe/London",
        "generallyAvailable": ["Mon", "Wed", "Fri", "Sat"],
        "preferredHours": ["afternoon", "evening"]
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-08-01T14:30:00Z"
};

// Main component for the Mentor Detail page.
const MentorDetail = () => {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('one-on-one');
    const [mentorData, setMentorData] = useState({});
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [mentorClasses, setMentorClasses] = useState({ classes: [] });

    
    useEffect(() => {
        const storedMentor = localStorage.getItem("mentor");
        
        if (!storedMentor) {
            window.location.href = "/mentor/directory";
            return;
        }
        const initialMentorData = JSON.parse(storedMentor);
        setMentorData(initialMentorData);

        // Get mentor's classes
        const fetchMentorClasses = async (mentorId) => {
            try {
                const response = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/classes?mentorId=${mentorId}`);
                if (response.data?.classes) {
                    // Store classes in localStorage for use in other pages
                    localStorage.setItem('availableMentorClass', JSON.stringify(response.data.classes));
                    setMentorClasses(prevData => ({
                        ...prevData,
                        classes: response.data.classes
                    }));
                } else {
                    // Ensure classes is always an array
                    setMentorClasses(prevData => ({
                        ...prevData,
                        classes: []
                    }));
                }
            } catch (error) {
                console.error('Error fetching mentor classes:', error);
                // Ensure classes is always an array even on error
                setMentorClasses(prevData => ({
                    ...prevData,
                    classes: []
                }));
            }
        };

        // Call fetchMentorClasses if we have a mentor ID
        if (initialMentorData?.uid) {
            fetchMentorClasses(initialMentorData.uid);
        }
    }, []);

    // Load reviews and fresh mentor data when mentor UID is available
    useEffect(() => {
        if (mentorData?.uid) {
            loadMentorReviews(mentorData.uid);
            loadFreshMentorData(mentorData.uid);
        }
    }, [mentorData?.uid]);

    const loadMentorReviews = async (mentorId) => {
        try {
            console.log('Starting to load reviews for mentor:', mentorId);
            setReviewsLoading(true);
            const response = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/reviews?type=mentor&id=${mentorId}`);
            console.log('Reviews API response:', response.data);
            console.log('Reviews array:', response.data.reviews);
            console.log('Reviews count:', response.data.reviews?.length || 0);
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            console.error('Error details:', error.response?.data);
            setReviews([]); // Fallback to empty array
        } finally {
            console.log('Reviews loading finished, setting loading to false');
            setReviewsLoading(false);
        }
    };

    const loadFreshMentorData = async (mentorId) => {
        try {
            console.log('Fetching mentor data for ID:', mentorId);
            const response = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${mentorId}`);
            if (response.data.mentor) {
                console.log('Fresh mentor data structure:', response.data.mentor);
                console.log('Qualifications field:', response.data.mentor.qualifications);
                console.log('QualificationsSummary field:', response.data.mentor.qualificationsSummary);
                setMentorData(response.data.mentor);
            }
        } catch (error) {
            console.error('Failed to load fresh mentor data. Error:', error.message);
            console.log('Using fallback data from localStorage/mock');
        }
    };


 

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
           { Object.keys(mentorData).length > 0 && <div className="min-h-screen font-sans text-gray-800 bg-gray-50">

                {/* Navigation Component */}
                <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
                    <div className="max-w-7xl mx-auto px-5">
                        <div className="flex justify-between items-center py-4">
                            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
                            <div className="flex items-center space-x-6">
                                <a href="/mentor/directory" className="text-gray-600 hover:text-primary transition-colors">← Back to Mentors</a>
                              
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
                                            {mentorData.bio?.length > 150 && (
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
                                        className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'group-batches' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                        onClick={() => handleTabClick('group-batches')}
                                    >
                                        Group Batches
                                    </button>
                                )}
                                <button
                                    className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'workshops' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                    onClick={() => handleTabClick('workshops')}
                                >
                                    Workshops
                                </button>
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
                                                <button 
                                                    onClick={() => {
                                                        // Store mentor data for one-on-one booking
                                                        localStorage.setItem('selectedMentor', JSON.stringify(mentorData));
                                                        window.location.href = '/explore/onetoone';
                                                    }}
                                                    className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                                                >
                                                    Explore Sessions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Group Batches */}
                                {activeTab === 'group-batches' && mentorData.acceptingNewStudents.group && (
                                    <div id="group-batches" className="tab-pane">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-dark mb-3">Group Learning Batches</h3>
                                                <p className="text-gray-700 mb-4">Join structured group batches for collaborative learning over multiple sessions. Perfect for comprehensive skill development with peers.</p>
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Structured curriculum over multiple weeks</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Interactive group environment</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cost-effective learning</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Learn from peers</li>
                                                </ul>
                                            </div>
                                            <div className="bg-primary-light p-6 rounded-xl">
                                                <div className="text-2xl font-bold text-primary-dark mb-2">{mentorData.pricing.currency}{mentorData.pricing.groupRate}/session</div>
                                                <div className="text-sm text-gray-600 mb-4">Multi-week structured learning programs</div>
                                                <button 
                                                
                                                    disabled={(mentorClasses.classes || []).filter(c => c.type === 'group').length === 0}
                                                    onClick={() => {
                                                        // Store mentor data for group classes
                                                        localStorage.setItem('selectedMentor', JSON.stringify(mentorData));
                                                        window.location.href = `/explore/group-batches?mentorId=${mentorData.uid}&type=group`;
                                                    }}
                                                    className={`w-full py-3 rounded-full font-semibold transition-colors ${
                                                        (mentorClasses.classes || []).filter(c => c.type === 'group').length === 0
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-primary hover:bg-blue-500 text-white'
                                                    }`}
                                                    title={(mentorClasses.classes || []).filter(c => c.type === 'group').length === 0 ? "No group classes available at the moment" : ""}
                                                >
                                                    Explore Sessions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Workshops */}
                                {activeTab === 'workshops' && (
                                    <div id="workshops" className="tab-pane">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-dark mb-3">Intensive Workshops</h3>
                                                <p className="text-gray-700 mb-4">Join focused, intensive workshops designed to teach specific skills or topics in a short timeframe. Perfect for learning new techniques or diving deep into particular areas.</p>
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Intensive focused learning</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Specific skill development</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Short-term commitment</li>
                                                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Project-based outcomes</li>
                                                </ul>
                                            </div>
                                            <div className="bg-primary-light p-6 rounded-xl">
                                                <div className="text-2xl font-bold text-primary-dark mb-2">Variable Pricing</div>
                                                <div className="text-sm text-gray-600 mb-4">Pricing depends on workshop duration and materials</div>
                                                <button 
                                                    onClick={() => {
                                                        // Store mentor data for workshops
                                                        localStorage.setItem('selectedMentor', JSON.stringify(mentorData));
                                                        window.location.href = `/explore/workshops?mentorId=${mentorData.uid}&type=workshop`;
                                                    }}
                                                    className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                                                >
                                                    Explore Sessions
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

                        {/* Two Column Layout: Availability + Reviews/Qualifications */}
                        <div className="grid lg:grid-cols-3 gap-8 mb-8">
                            
                            {/* Left Side: Availability + Reviews */}
                            <div className="lg:col-span-2 space-y-8">
                                
                                {/* Availability Component */}
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <h2 className="text-2xl font-bold text-primary-dark mb-6">Availability Snapshot</h2>
                                    
                                    {/* Check if availability summary exists */}
                                    {mentorData?.availabilitySummary ? (
                                        <>
                                            {/* Generally Available Days */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-700 mb-3">Generally Available</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {mentorData.availabilitySummary?.generallyAvailable && mentorData.availabilitySummary.generallyAvailable.length > 0 ? (
                                                        mentorData.availabilitySummary.generallyAvailable.map((day, index) => (
                                                            <span key={index} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                                                {day}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">Not specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Preferred Hours */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-700 mb-3">Preferred Hours</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {mentorData.availabilitySummary?.preferredHours && mentorData.availabilitySummary.preferredHours.length > 0 ? (
                                                        mentorData.availabilitySummary.preferredHours.map((hour, index) => (
                                                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium capitalize">
                                                                {hour}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500">Not specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Timezone */}
                                            {mentorData.availabilitySummary.timezone && (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-gray-700 mb-2">Timezone</h4>
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                        {mentorData.availabilitySummary.timezone}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="bg-primary-light p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    💡 This is a general availability overview. Specific slots and detailed scheduling will be available when booking individual sessions.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        /* No availability data - show alternate message */
                                        <div className="text-center py-8">
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                                <div className="text-yellow-600 mb-2">📅</div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Availability Not Set</h4>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    This mentor hasn't updated their general availability yet. You can still book sessions by contacting them directly or explore their available time slots in the booking flow.
                                                </p>
                                                <button 
                                                    onClick={() => {
                                                        localStorage.setItem('selectedMentor', JSON.stringify(mentorData));
                                                        window.location.href = '/explore/onetoone';
                                                    }}
                                                    className="text-primary hover:text-primary-dark font-medium text-sm"
                                                >
                                                    Check Available Slots →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Student Reviews Section */}
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-primary-dark">Student Reviews</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {renderStars(mentorData?.stats?.avgRating)}
                                            </div>
                                            <span className="font-semibold text-primary-dark">{mentorData?.stats?.avgRating?.toFixed(1)}</span>
                                            <span className="text-gray-600">({mentorData?.stats?.totalReviews} reviews)</span>
                                        </div>
                                    </div>

                                    {/* Real Reviews from API */}
                                    {reviewsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-500">Loading reviews...</div>
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review.reviewId} className="border-b border-gray-100 pb-6 last:border-b-0">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                                                            A
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-semibold text-gray-800">Anonymous</h4>
                                                                <div className="flex text-yellow-400 text-sm">
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                                                "{review.review}"
                                                            </p>
                                                            <span className="text-gray-500 text-xs">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-gray-500">No reviews yet</div>
                                        </div>
                                    )}

                                    {/* COMMENTED OUT - Hardcoded Reviews for Testing */}
                                    {/*
                                    <div className="space-y-6">
                                        <div className="border-b border-gray-100 pb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                                                    S
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-gray-800">Sarah M.</h4>
                                                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                                    </div>
                                                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                                        "Excellent teacher! Very patient and explains concepts clearly. My child has improved so much in just a few weeks."
                                                    </p>
                                                    <span className="text-gray-500 text-xs">2 weeks ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    */}
                                </div>
                            </div>

                            {/* Right Side: Qualifications + Subjects + Contact */}
                            <div className="lg:col-span-1 space-y-8">
                                
                                {/* Qualifications Component */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h2 className="text-xl font-bold text-primary-dark mb-4">Certifications & Education</h2>
                                    
                                    {mentorData?.qualifications && mentorData.qualifications.length > 0 ? (
                                        <div className="space-y-4">
                                            {mentorData.qualifications.map((qual, index) => (
                                                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                                                            {qual.icon || "🎓"}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-800">{qual.title}</h4>
                                                            <p className="text-sm text-gray-600">{qual.institution}</p>
                                                            {qual.year && <p className="text-sm text-gray-500">{qual.year}</p>}
                                                            {qual.type && <span className="text-xs text-primary bg-primary-light px-2 py-1 rounded-full mt-1 inline-block">{qual.type}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No qualifications listed yet.</p>
                                    )}
                                    
                                    {/* Background Check Status */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                                                {mentorData?.backgroundChecked ? "✅" : "⚠️"}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Background Check</h4>
                                                <p className="text-sm text-gray-600">
                                                    {mentorData?.backgroundChecked ? "Verified" : "Pending"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {mentorData?.backgroundChecked ? "Enhanced DBS cleared" : "Background check in progress"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subjects & Levels Component */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h2 className="text-xl font-bold text-primary-dark mb-4">Subjects & Levels</h2>
                                    
                                    {/* Subject Areas */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Subject Areas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mentorData?.subjects?.map((subject, index) => (
                                                <span key={index} className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                                                    {subject}
                                                </span>
                                            )) || <span className="text-gray-500">No subjects specified</span>}
                                        </div>
                                    </div>

                                    {/* Levels */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Levels</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mentorData?.teachingLevels?.map((level, index) => (
                                                <span key={index} className={`px-3 py-1 text-sm rounded-full ${
                                                    level.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-700' :
                                                    level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                    level.toLowerCase() === 'advanced' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </span>
                                            )) || <span className="text-gray-500">No levels specified</span>}
                                        </div>
                                    </div>

                                    {/* Age Groups */}
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3">Age Groups</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mentorData?.ageGroups?.map((ageGroup, index) => (
                                                <span key={index} className={`px-3 py-1 text-sm rounded-full ${
                                                    ageGroup.toLowerCase().includes('child') ? 'bg-blue-100 text-blue-700' :
                                                    ageGroup.toLowerCase().includes('teen') ? 'bg-purple-100 text-purple-700' :
                                                    ageGroup.toLowerCase().includes('adult') ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)}
                                                </span>
                                            )) || <span className="text-gray-500">No age groups specified</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Mentor Component */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h2 className="text-xl font-bold text-primary-dark mb-4">Contact Mentor</h2>
                                    
                                    <form className="space-y-4">
                                        {/* Subject */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none" 
                                                placeholder="What would you like to learn?"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                            <textarea 
                                                rows="4" 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none" 
                                                placeholder="Tell me about your learning goals..."
                                            ></textarea>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <button 
                                                type="button"
                                                className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                                            >
                                                Request Free Video Chat
                                            </button>
                                            <button 
                                                type="button"
                                                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 rounded-full font-semibold transition-colors"
                                            >
                                                Request Custom Batch
                                            </button>
                                            <button 
                                                type="button"
                                                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full font-semibold transition-colors"
                                            >
                                                Send Message
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>}
        </>
    );
};

export default MentorDetail;
