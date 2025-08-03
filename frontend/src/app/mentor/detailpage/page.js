"use client";

import React, { useState } from 'react';

// Main component for the Mentor Detail page.
const MentorDetail = () => {
    // State to manage the visibility of the full bio
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    // State to manage the active session type tab
    const [activeTab, setActiveTab] = useState('one-on-one');

    // Sample mentor data to make the component dynamic
    const mentorData = {
        name: "Priya Sharma",
        profileInitials: "P",
        rating: 4.9,
        reviews: 32,
        price: 35,
        location: "Birmingham & Online",
        languages: "English, Hindi, Gujarati",
        bio: `I'm a passionate Kathak dancer and instructor with over 10 years of experience teaching traditional Indian dance forms. Having trained under renowned masters in Mumbai and London, I bring authentic cultural knowledge combined with modern teaching methods. I specialize in helping students of all ages connect with their cultural heritage through dance, music, and storytelling. My approach focuses on building confidence while maintaining respect for traditional forms. I offer classes in Hindi, English, and Gujarati.`,
        shortBio: `I'm a passionate Kathak dancer and instructor with over 10 years of experience teaching traditional Indian dance forms. Having trained under renowned masters in Mumbai and London, I bring authentic cultural knowledge combined with modern teaching methods...`,
        badges: ["Music", "Cultural Arts", "Dance"],
        stats: [
            { icon: "✅", label: "Background Verified" },
            { icon: "⏰", label: "500+ Hours" },
            { icon: "🔄", label: "85% Repeat Students" },
            { icon: "💬", label: "Replies in 30min" },
        ],
        sessionTypes: {
            "one-on-one": {
                title: "Personalised Learning",
                description: "1-hour personalised sessions tailored to your specific learning goals. Choose any topic within my expertise areas.",
                features: ["Flexible scheduling", "Customised curriculum", "Progress tracking", "Recording provided"],
                price: "£35/session",
                availability: "Available slots throughout the week",
            },
            "weekend-group": [
                { title: "4-Week Program", details: "8 sessions • Sat & Sun • 1 hour each", price: "£240", popular: false },
                { title: "8-Week Program", details: "16 sessions • Sat & Sun • 1 hour each", price: "£420", popular: true, tag: "Most Popular" },
                { title: "12-Week Program", details: "24 sessions • Sat & Sun • 1 hour each", price: "£580", popular: false },
            ],
            "weekday-group": [
                { title: "4-Week Intensive", details: "20 sessions • Mon-Fri • 1 hour each", price: "£500", popular: false },
                { title: "8-Week Course", details: "40 sessions • Mon-Fri • 1 hour each", price: "£850", popular: true, tag: "Best Value" },
                { title: "12-Week Mastery", details: "60 sessions • Mon-Fri • 1 hour each", price: "£1,150", popular: false },
            ]
        }
    };

    // Handler for the "Read More" button
    const handleReadMoreClick = () => {
        setIsBioExpanded(!isBioExpanded);
    };

    // Handler for changing session tabs
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    // Helper function to render star ratings
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        return (
            <>
                {'★'.repeat(fullStars)}
                {'☆'.repeat(emptyStars)}
            </>
        );
    };

    return (
        <>
            {/* Tailwind CSS CDN and custom config */}
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
                                            <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                                {mentorData.profileInitials}
                                            </div>
                                            {/* Verified Badge */}
                                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" title="Verified Mentor">
                                                ✓
                                            </div>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-primary-dark mb-2">{mentorData.name}</h1>
                                            
                                            {/* Category Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {mentorData.badges.map((badge, index) => (
                                                    <span key={index} className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">{badge}</span>
                                                ))}
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="flex text-yellow-400">
                                                    {renderStars(mentorData.rating)}
                                                </div>
                                                <span className="text-lg font-semibold text-primary-dark">{mentorData.rating}</span>
                                                <span className="text-gray-600">({mentorData.reviews} reviews)</span>
                                            </div>

                                            {/* Stats Icons */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {mentorData.stats.map((stat, index) => (
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
                                        <h2 className="text-xl font-bold text-primary-dark mb-4">About {mentorData.name}</h2>
                                        <div id="bio-container">
                                            <p className="text-gray-700 leading-relaxed mb-4">
                                                {isBioExpanded ? mentorData.bio : mentorData.shortBio}
                                            </p>
                                            <button
                                                id="read-more-btn"
                                                className="text-primary hover:text-primary-dark font-medium transition-colors"
                                                onClick={handleReadMoreClick}
                                            >
                                                {isBioExpanded ? "Read Less" : "Read More"}
                                            </button>
                                        </div>
                                        
                                        {/* Languages & Region */}
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            <div>
                                                <span className="font-semibold text-gray-700">Spoken Languages:</span>
                                                <span className="text-gray-600 ml-2">{mentorData.languages}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Teaching Region:</span>
                                                <span className="text-gray-600 ml-2">{mentorData.location}</span>
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
                                        <div className="text-3xl font-bold text-primary-dark mb-2">£{mentorData.price}<span className="text-lg text-gray-500">/hour</span></div>
                                        <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                            ✅ First Session is Free
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-primary mr-3">✅</span>
                                            One-on-One Sessions
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-primary mr-3">✅</span>
                                            Group Classes Available
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-primary mr-3">✅</span>
                                            Online & In-Person
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
                                <button
                                    className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'weekend-group' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                    onClick={() => handleTabClick('weekend-group')}
                                >
                                    Weekend Group Batches
                                </button>
                                <button
                                    className={`session-tab px-6 py-3 border-b-2 font-semibold transition-colors ${activeTab === 'weekday-group' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
                                    onClick={() => handleTabClick('weekday-group')}
                                >
                                    Weekday Group Batches
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* One-on-One Sessions */}
                                {activeTab === 'one-on-one' && (
                                    <div id="one-on-one" className="tab-pane">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary-dark mb-3">{mentorData.sessionTypes["one-on-one"].title}</h3>
                                                <p className="text-gray-700 mb-4">{mentorData.sessionTypes["one-on-one"].description}</p>
                                                <ul className="space-y-2 text-gray-600">
                                                    {mentorData.sessionTypes["one-on-one"].features.map((feature, index) => (
                                                        <li key={index} className="flex items-center"><span className="text-green-500 mr-2">✓</span> {feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-primary-light p-6 rounded-xl">
                                                <div className="text-2xl font-bold text-primary-dark mb-2">{mentorData.sessionTypes["one-on-one"].price}</div>
                                                <div className="text-sm text-gray-600 mb-4">{mentorData.sessionTypes["one-on-one"].availability}</div>
                                                <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors">
                                                    Explore Sessions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Weekend Group Batches */}
                                {activeTab === 'weekend-group' && (
                                    <div id="weekend-group" className="tab-pane">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {mentorData.sessionTypes["weekend-group"].map((batch, index) => (
                                                <div key={index} className={`bg-gradient-to-br from-primary-light to-white p-6 rounded-xl border-2 ${batch.popular ? 'border-primary' : 'border-primary-light'}`}>
                                                    {batch.tag && <div className="inline-block bg-primary text-white px-2 py-1 rounded-full text-xs font-medium mb-2">{batch.tag}</div>}
                                                    <h4 className="text-lg font-semibold text-primary-dark mb-2">{batch.title}</h4>
                                                    <div className="text-sm text-gray-600 mb-4">{batch.details}</div>
                                                    <div className="text-2xl font-bold text-primary-dark mb-4">{batch.price}</div>
                                                    <button className="w-full bg-primary hover:bg-blue-500 text-white py-2 rounded-full font-medium transition-colors">
                                                        Explore Group Batches
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Weekday Group Batches */}
                                {activeTab === 'weekday-group' && (
                                    <div id="weekday-group" className="tab-pane">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {mentorData.sessionTypes["weekday-group"].map((batch, index) => (
                                                <div key={index} className={`bg-gradient-to-br from-primary-light to-white p-6 rounded-xl border-2 ${batch.popular ? 'border-primary' : 'border-primary-light'}`}>
                                                    {batch.tag && <div className="inline-block bg-primary text-white px-2 py-1 rounded-full text-xs font-medium mb-2">{batch.tag}</div>}
                                                    <h4 className="text-lg font-semibold text-primary-dark mb-2">{batch.title}</h4>
                                                    <div className="text-sm text-gray-600 mb-4">{batch.details}</div>
                                                    <div className="text-2xl font-bold text-primary-dark mb-4">{batch.price}</div>
                                                    <button className="w-full bg-primary hover:bg-blue-500 text-white py-2 rounded-full font-medium transition-colors">
                                                        Explore Group Batches
                                                    </button>
                                                </div>
                                            ))}
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
