"use client"
import React, { useState, useEffect } from 'react';

const MyBookings = () => {
    // State to manage the mobile sidebar's visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // State to manage the profile dropdown's visibility
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    // State to manage the active view (e.g., 'all', 'upcoming', 'past')
    const [activeView, setActiveView] = useState('all-bookings');
    // State to manage the active booking tab (e.g., 'upcoming', 'completed', 'cancelled')
    const [activeTab, setActiveTab] = useState('upcoming');

    // Effect to handle window resize and close the mobile sidebar on larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to handle clicks outside the profile dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
            const profileDropdown = document.getElementById('profile-dropdown');
            if (isProfileDropdownOpen && profileDropdownBtn && profileDropdown && !profileDropdownBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isProfileDropdownOpen]);

    // Function to toggle the mobile sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to toggle the profile dropdown
    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    // JSX for the component
    return (
        <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left: Logo & Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        <button id="mobile-menu-btn" onClick={toggleSidebar} className="md:hidden text-gray-600 hover:text-primary">
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
                        <span className="hidden md:block text-sm text-gray-500">Family Learning Hub</span>
                    </div>

                    {/* Center: View Switcher */}
                    <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveView('all-bookings')}
                            className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${activeView === 'all-bookings' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                        >
                            <i className="fas fa-calendar-alt mr-2"></i>All Bookings
                        </button>
                        <button
                            onClick={() => setActiveView('upcoming')}
                            className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${activeView === 'upcoming' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                        >
                            <i className="fas fa-clock mr-2"></i>Upcoming
                        </button>
                        <button
                            onClick={() => setActiveView('past')}
                            className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${activeView === 'past' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                        >
                            <i className="fas fa-history mr-2"></i>Past
                        </button>
                    </div>

                    {/* Right: Profile Dropdown */}
                    <div className="relative">
                        <button id="profile-dropdown-btn" onClick={toggleProfileDropdown} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">SJ</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                                <div className="text-xs text-gray-500">Parent & Learner</div>
                            </div>
                            <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div id="profile-dropdown" className={`${isProfileDropdownOpen ? '' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2`}>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-home text-gray-400"></i>
                                <span>Back to Dashboard</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-user text-gray-400"></i>
                                <span>Manage Profiles</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-cog text-gray-400"></i>
                                <span>Settings</span>
                            </a>
                            <hr className="my-2" />
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50">
                                <i className="fas fa-sign-out-alt text-red-400"></i>
                                <span>Log Out</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav
                    id="sidebar"
                    className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                >
                    <div className="p-6">
                        {/* Main Navigation */}
                        <div className="space-y-2 mb-8">
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-home text-lg"></i>
                                <span className="font-medium">Dashboard</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-search text-lg"></i>
                                <span>Explore Mentors</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                                <i className="fas fa-calendar-alt text-lg"></i>
                                <span className="font-medium">My Bookings</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-heart text-lg"></i>
                                <span>Saved Mentors</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-users text-lg"></i>
                                <span>Workshops</span>
                            </a>
                        </div>

                        {/* Young Learners Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Young Learners</h3>
                                <button id="add-learner-btn" className="text-purple-primary hover:text-purple-600 text-sm">
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <div className="space-y-2" id="young-learners-nav">
                                <a href="#" className="young-learner-nav flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-xs font-semibold">E</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Emma (12)</div>
                                        <div className="text-xs text-gray-500">4 active bookings</div>
                                    </div>
                                </a>
                                
                                <a href="#" className="young-learner-nav flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-green-50 hover:translate-x-1">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 text-xs font-semibold">J</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Jake (15)</div>
                                        <div className="text-xs text-gray-500">6 active bookings</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Filters</h3>
                            <div className="space-y-2">
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" data-filter="today">
                                    <span className="text-sm">Today's Sessions</span>
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3</span>
                                </button>
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" data-filter="this-week">
                                    <span className="text-sm">This Week</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">12</span>
                                </button>
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" data-filter="pending">
                                    <span className="text-sm">Needs Action</span>
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">2</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Overlay for mobile sidebar */}
                <div id="sidebar-overlay" onClick={toggleSidebar} className={`${isSidebarOpen ? '' : 'hidden'} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}></div>

                {/* Main Content */}
                <main className="flex-1 md:ml-0">
                    {/* Page Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                                    <p className="text-gray-600">Manage all your family's learning sessions</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                                    <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                                        <i className="fas fa-plus mr-2"></i>Book New Session
                                    </button>
                                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <i className="fas fa-download mr-2"></i>Export Calendar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Family Booking Summary */}
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Family Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-clock text-green-600 text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">13</h3>
                                    <p className="text-gray-600 text-sm">Upcoming Sessions</p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">47</h3>
                                    <p className="text-gray-600 text-sm">Completed Sessions</p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-user-graduate text-purple-600 text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">8</h3>
                                    <p className="text-gray-600 text-sm">Active Mentors</p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-calendar-times text-orange-600 text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">2</h3>
                                    <p className="text-gray-600 text-sm">Needs Reschedule</p>
                                </div>
                            </div>
                        </section>

                        {/* Today's Sessions (Priority) */}
                        <section className="mb-8">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Today's Sessions</h2>
                                        <p className="text-gray-600">Tuesday, July 22, 2025</p>
                                    </div>
                                    <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">3 sessions</span>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Sarah's Session */}
                                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold">SJ</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900">Classical Music Session</h4>
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">You</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">with Priya Sharma • 1-on-1 Session</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span><i className="fas fa-clock mr-1"></i>2:00 PM - 3:00 PM</span>
                                                        <span><i className="fas fa-video mr-1"></i>Online</span>
                                                        <span><i className="fas fa-circle text-green-500 mr-1"></i>Ready to join</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors">
                                                    <i className="fas fa-video mr-2"></i>Join Now
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emma's Session */}
                                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-primary transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-purple-600 font-semibold">E</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900">Art Fundamentals</h4>
                                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Emma</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">with Marcus Chen • Weekend Group Batch</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span><i className="fas fa-clock mr-1"></i>4:00 PM - 5:00 PM</span>
                                                        <span><i className="fas fa-video mr-1"></i>Online</span>
                                                        <span><i className="fas fa-circle text-yellow-500 mr-1"></i>Starts in 2h</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="bg-purple-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors">
                                                    <i className="fas fa-eye mr-2"></i>Monitor
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Jake's Session */}
                                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-primary transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-green-600 font-semibold">J</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900">Python Basics</h4>
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Jake</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">with Alex Kumar • Weekday Intensive</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span><i className="fas fa-clock mr-1"></i>6:00 PM - 7:00 PM</span>
                                                        <span><i className="fas fa-video mr-1"></i>Online</span>
                                                        <span><i className="fas fa-circle text-gray-400 mr-1"></i>Starts in 4h</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="bg-green-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                                                    <i className="fas fa-eye mr-2"></i>Monitor
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* All Bookings with Tabs */}
                        <section>
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* Tab Navigation */}
                                <div className="border-b border-gray-200">
                                    <nav className="flex">
                                        <button
                                            onClick={() => setActiveTab('upcoming')}
                                            className={`booking-tab flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${activeTab === 'upcoming' ? 'text-primary border-primary bg-primary-light' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                                        >
                                            Upcoming Sessions (13)
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('completed')}
                                            className={`booking-tab flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${activeTab === 'completed' ? 'text-primary border-primary bg-primary-light' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                                        >
                                            Completed (47)
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('cancelled')}
                                            className={`booking-tab flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${activeTab === 'cancelled' ? 'text-primary border-primary bg-primary-light' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                                        >
                                            Cancelled (3)
                                        </button>
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {/* Upcoming Sessions Tab */}
                                    <div id="upcoming-tab" className={`${activeTab === 'upcoming' ? '' : 'hidden'}`}>
                                        <div className="space-y-6">
                                            {/* This Week */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
                                                <div className="space-y-4">
                                                    {/* Tomorrow */}
                                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-500">Tomorrow, July 23</span>
                                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Confirmation needed</span>
                                                        </div>
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">Jake's Advanced Algebra</h4>
                                                                <p className="text-gray-600 text-sm">with Dr. Sarah Mills • 1-on-1 Session</p>
                                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                                    <span><i className="fas fa-clock mr-1"></i>3:00 PM - 4:00 PM</span>
                                                                    <span><i className="fas fa-video mr-1"></i>Online</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Confirm</button>
                                                                <button className="text-gray-400 hover:text-gray-600">
                                                                    <i className="fas fa-ellipsis-v"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Thursday */}
                                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-primary transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-500">Thursday, July 24</span>
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Confirmed</span>
                                                        </div>
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">Emma's Piano Practice</h4>
                                                                <p className="text-gray-600 text-sm">with Priya Sharma • 1-on-1 Session</p>
                                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                                    <span><i className="fas fa-clock mr-1"></i>5:00 PM - 6:00 PM</span>
                                                                    <span><i className="fas fa-video mr-1"></i>Online</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button className="text-blue-600 text-sm hover:underline">Reschedule</button>
                                                                <button className="text-gray-400 hover:text-gray-600">
                                                                    <i className="fas fa-ellipsis-v"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Next Week */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Week</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="border border-gray-200 rounded-lg p-4">
                                                        <div className="text-sm font-medium text-gray-500 mb-2">Mon, July 28 - Fri, Aug 1</div>
                                                        <h4 className="font-medium text-gray-900">Jake's Python Intensive</h4>
                                                        <p className="text-gray-600 text-sm">with Alex Kumar • Weekday Batch</p>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <span className="text-sm text-gray-500">Mon-Fri, 6:00-7:00 PM</span>
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Confirmed</span>
                                                        </div>
                                                    </div>

                                                    <div className="border border-gray-200 rounded-lg p-4">
                                                        <div className="text-sm font-medium text-gray-500 mb-2">Sat, July 26 & Sun, July 27</div>
                                                        <h4 className="font-medium text-gray-900">Emma's Art Workshop</h4>
                                                        <p className="text-gray-600 text-sm">with Marcus Chen • Weekend Batch</p>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <span className="text-sm text-gray-500">Sat-Sun, 4:00-5:00 PM</span>
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Confirmed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completed Sessions Tab */}
                                    <div id="completed-tab" className={`${activeTab === 'completed' ? '' : 'hidden'}`}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-gray-600">47 completed sessions across all family members</p>
                                                <button className="text-primary hover:text-primary-dark text-sm">Download Report</button>
                                            </div>
                                            
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">Classical Music Session</h4>
                                                        <p className="text-gray-600 text-sm">with Priya Sharma • You</p>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                            <span><i className="fas fa-calendar mr-1"></i>July 21, 2:00-3:00 PM</span>
                                                            <span><i className="fas fa-star text-yellow-500 mr-1"></i>5.0 rating</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-blue-600 text-sm hover:underline">Book Again</button>
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <i className="fas fa-ellipsis-v"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center py-8">
                                                <button className="text-primary hover:text-primary-dark">Load More Sessions</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancelled Sessions Tab */}
                                    <div id="cancelled-tab" className={`${activeTab === 'cancelled' ? '' : 'hidden'}`}>
                                        <div className="space-y-4">
                                            <p className="text-gray-600 mb-4">3 cancelled sessions</p>
                                            
                                            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">Emma's Art Session</h4>
                                                        <p className="text-gray-600 text-sm">with Marcus Chen • Cancelled by mentor</p>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                            <span><i className="fas fa-calendar mr-1"></i>July 19, 4:00-5:00 PM</span>
                                                            <span className="text-red-600">Refund processed</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-blue-600 text-sm hover:underline">Rebook</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyBookings;
