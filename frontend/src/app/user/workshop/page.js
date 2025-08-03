"use client";

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const tailwindConfig = {
    theme: {
        extend: {
            colors: {
                primary: '#00A2E8',
                'primary-dark': '#00468C',
                'primary-light': '#f8fbff',
                'accent-light': '#e8f4ff',
                'purple-primary': '#8B5CF6',
                'green-primary': '#10B981',
                'orange-primary': '#F59E0B'
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
            }
        }
    }
};

const workshopsData = [
    {
        id: 1,
        title: 'Digital Art Masterclass',
        description: 'Learn professional digital painting techniques from award-winning artist',
        date: 'Saturday, July 26',
        time: '2:00-5:00 PM',
        price: '£45',
        tags: [
            { name: 'Art', color: 'bg-purple-100 text-purple-800' },
            { name: 'Online', color: 'bg-blue-100 text-blue-800' },
            { name: 'Adult', color: 'bg-yellow-100 text-yellow-800' }
        ],
        icon: 'fas fa-palette',
        iconColor: 'text-orange-600',
        bgGradient: 'bg-gradient-to-br from-orange-100 to-red-100',
        status: { text: '3 spots left', color: 'bg-red-500' },
        category: 'art',
    },
    {
        id: 2,
        title: 'Kids Coding Bootcamp',
        description: 'Introduction to programming for children using fun games and projects',
        date: 'Sunday, July 27',
        time: '10:00 AM-12:00 PM',
        price: '£25',
        tags: [
            { name: 'Technology', color: 'bg-green-100 text-green-800' },
            { name: 'Online', color: 'bg-blue-100 text-blue-800' },
            { name: 'Children', color: 'bg-pink-100 text-pink-800' }
        ],
        icon: 'fas fa-code',
        iconColor: 'text-purple-600',
        bgGradient: 'bg-gradient-to-br from-purple-100 to-blue-100',
        status: { text: 'Available', color: 'bg-green-500' },
        category: 'tech',
    },
    {
        id: 3,
        title: 'Family Music Circle',
        description: 'Musical storytelling and instrument exploration for the whole family',
        date: 'Saturday, July 26',
        time: '4:00-5:30 PM',
        price: 'Free',
        tags: [
            { name: 'Music', color: 'bg-blue-100 text-blue-800' },
            { name: 'London', color: 'bg-orange-100 text-orange-800' },
            { name: 'Family', color: 'bg-purple-100 text-purple-800' }
        ],
        icon: 'fas fa-music',
        iconColor: 'text-green-600',
        bgGradient: 'bg-gradient-to-br from-green-100 to-teal-100',
        status: { text: '7 spots left', color: 'bg-blue-500' },
        category: 'music',
    },
    {
        id: 4,
        title: 'Watercolor Landscapes',
        description: 'Create beautiful landscape paintings using watercolor techniques',
        date: 'July 28',
        time: '2:00-4:00 PM',
        price: '£30',
        tags: [
            { name: 'Art', color: 'bg-purple-100 text-purple-800' },
            { name: 'Online', color: 'bg-blue-100 text-blue-800' },
            { name: 'Teen', color: 'bg-yellow-100 text-yellow-800' }
        ],
        icon: 'fas fa-paint-brush',
        iconColor: 'text-pink-600',
        bgGradient: 'bg-gradient-to-br from-pink-100 to-purple-100',
        status: { text: 'Available', color: 'bg-green-500' },
        category: 'art',
    },
    {
        id: 5,
        title: 'Acoustic Guitar Basics',
        description: 'Learn fundamental guitar chords and simple songs',
        date: 'July 29',
        time: '6:00-8:00 PM',
        price: '£35',
        tags: [
            { name: 'Music', color: 'bg-blue-100 text-blue-800' },
            { name: 'Birmingham', color: 'bg-orange-100 text-orange-800' },
            { name: 'Adult', color: 'bg-green-100 text-green-800' }
        ],
        icon: 'fas fa-guitar',
        iconColor: 'text-blue-600',
        bgGradient: 'bg-gradient-to-br from-blue-100 to-indigo-100',
        status: { text: '5 spots left', color: 'bg-orange-500' },
        category: 'music',
    },
    {
        id: 6,
        title: 'AI for Beginners',
        description: 'Introduction to artificial intelligence and machine learning concepts',
        date: 'July 30',
        time: '7:00-9:00 PM',
        price: 'Free',
        tags: [
            { name: 'Technology', color: 'bg-green-100 text-green-800' },
            { name: 'Online', color: 'bg-blue-100 text-blue-800' },
            { name: 'Adult', color: 'bg-yellow-100 text-yellow-800' }
        ],
        icon: 'fas fa-robot',
        iconColor: 'text-green-600',
        bgGradient: 'bg-gradient-to-br from-green-100 to-emerald-100',
        status: { text: 'Available', color: 'bg-green-500' },
        category: 'tech',
    },
    {
        id: 7,
        title: 'Mindfulness for Families',
        description: 'Practice meditation and mindfulness techniques as a family',
        date: 'Aug 1',
        time: '10:00 AM-12:00 PM',
        price: '£20',
        tags: [
            { name: 'Wellness', color: 'bg-orange-100 text-orange-800' },
            { name: 'Manchester', color: 'bg-orange-100 text-orange-800' },
            { name: 'Family', color: 'bg-purple-100 text-purple-800' }
        ],
        icon: 'fas fa-lotus',
        iconColor: 'text-orange-600',
        bgGradient: 'bg-gradient-to-br from-orange-100 to-amber-100',
        status: { text: '12 spots left', color: 'bg-blue-500' },
        category: 'wellness',
    },
    {
        id: 8,
        title: 'Spanish Conversation',
        description: 'Practice conversational Spanish in a friendly group setting',
        date: 'Aug 2',
        time: '7:00-8:30 PM',
        price: '£15',
        tags: [
            { name: 'Languages', color: 'bg-pink-100 text-pink-800' },
            { name: 'Online', color: 'bg-blue-100 text-blue-800' },
            { name: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' }
        ],
        icon: 'fas fa-globe',
        iconColor: 'text-pink-600',
        bgGradient: 'bg-gradient-to-br from-pink-100 to-rose-100',
        status: { text: 'Available', color: 'bg-green-500' },
        category: 'language',
    },
    {
        id: 9,
        title: 'Paper Crafts for Kids',
        description: 'Create amazing paper crafts and origami with children',
        date: 'Aug 3',
        time: '3:00-5:00 PM',
        price: '£18',
        tags: [
            { name: 'Art', color: 'bg-purple-100 text-purple-800' },
            { name: 'Leeds', color: 'bg-orange-100 text-orange-800' },
            { name: 'Children', color: 'bg-pink-100 text-pink-800' }
        ],
        icon: 'fas fa-scissors',
        iconColor: 'text-indigo-600',
        bgGradient: 'bg-gradient-to-br from-indigo-100 to-purple-100',
        status: { text: '2 spots left', color: 'bg-red-500' },
        category: 'art',
    }
];

const Workshop = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const profileDropdownRef = useRef(null);

    const handleResize = () => {
        if (window.innerWidth >= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleClickOutside = (event) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
            setIsProfileDropdownOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const featuredWorkshops = workshopsData.slice(0, 3);
    const filteredWorkshops = workshopsData.filter(workshop => 
        selectedCategory === 'all' || workshop.category === selectedCategory
    );

    const WorkshopCard = ({ workshop, isFeatured = false }) => (
        <div className={`workshop-card bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 ${isFeatured ? 'border-orange-200' : ''}`} data-category={workshop.category}>
            <div className="relative mb-4">
                <div className={`w-full h-32 rounded-lg flex items-center justify-center ${workshop.bgGradient}`}>
                    <i className={`${workshop.icon} text-3xl ${workshop.iconColor}`}></i>
                </div>
                {workshop.status && (
                    <span className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${workshop.status.color}`}>{workshop.status.text}</span>
                )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{workshop.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span><i className="fas fa-calendar mr-1"></i>{workshop.date}</span>
                <span><i className="fas fa-clock mr-1"></i>{workshop.time}</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                {workshop.tags.map((tag, index) => (
                    <span key={index} className={`${tag.color} text-xs px-2 py-1 rounded-full`}>{tag.name}</span>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{workshop.price}</span>
                <button className={`text-white px-4 py-2 rounded-lg text-sm transition-colors ${isFeatured ? 'bg-orange-primary hover:bg-orange-600' : 'bg-primary hover:bg-primary-dark'}`}>
                    Register {isFeatured ? 'Now' : ''}
                </button>
            </div>
        </div>
    );
    

    return (
        <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
            <Head>
                <title>Workshops - Roots & Wings</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
                <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        body { font-family: 'Inter', sans-serif; }
                    `}
                </style>
            </Head>

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left: Logo & Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-600 hover:text-primary">
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
                        <span className="hidden md:block text-sm text-gray-500">Family Learning Hub</span>
                    </div>
                    
                    {/* Center: Search & Filter */}
                    <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
                        <div className="relative flex-1">
                            <input type="text" placeholder="Search workshops..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>
                        <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-primary focus:border-primary">
                            <option value="">All Locations</option>
                            <option value="online">Online</option>
                            <option value="london">London</option>
                            <option value="manchester">Manchester</option>
                            <option value="birmingham">Birmingham</option>
                        </select>
                    </div>
                    
                    {/* Right: Profile Dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">SJ</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                                <div className="text-xs text-gray-500">Parent & Learner</div>
                            </div>
                            <i className={`fas fa-chevron-down text-gray-400 text-sm transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isProfileDropdownOpen ? '' : 'hidden'}`}>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-home text-gray-400"></i>
                                <span>Back to Dashboard</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-calendar-plus text-gray-400"></i>
                                <span>Create Workshop</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                                <i className="fas fa-bookmark text-gray-400"></i>
                                <span>My Bookings</span>
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
                <nav className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
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
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-calendar-alt text-lg"></i>
                                <span>My Bookings</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                                <i className="fas fa-heart text-lg"></i>
                                <span>Saved Mentors</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                                <i className="fas fa-users text-lg"></i>
                                <span className="font-medium">Workshops</span>
                            </a>
                        </div>

                        {/* Workshop Categories */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">All Workshops</span>
                                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">9</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('art')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'art' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">Art & Craft</span>
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{workshopsData.filter(w => w.category === 'art').length}</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('music')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'music' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">Music</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{workshopsData.filter(w => w.category === 'music').length}</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('tech')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'tech' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">Technology</span>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{workshopsData.filter(w => w.category === 'tech').length}</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('wellness')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'wellness' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">Wellness</span>
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{workshopsData.filter(w => w.category === 'wellness').length}</span>
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('language')}
                                    className={`category-filter w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-primary-light rounded-lg transition-colors ${selectedCategory === 'language' ? 'bg-primary-light border border-primary-dark' : ''}`}
                                >
                                    <span className="text-sm">Languages</span>
                                    <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">{workshopsData.filter(w => w.category === 'language').length}</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Filters</h3>
                            <div className="space-y-2">
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-sm">Today</span>
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">2</span>
                                </button>
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-sm">This Weekend</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">7</span>
                                </button>
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-sm">Free Events</span>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">5</span>
                                </button>
                                <button className="filter-btn w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-sm">Family Friendly</span>
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">9</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Overlay for mobile sidebar */}
                <div onClick={() => setIsSidebarOpen(false)} className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 ${isSidebarOpen ? '' : 'hidden'}`}></div>

                {/* Main Content */}
                <main className="flex-1 md:ml-0">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Workshops & Events</h1>
                                    <p className="text-gray-600">Discover one-time workshops and special learning events</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                                        <i className="fas fa-filter mr-2"></i>Advanced Filters
                                    </button>
                                    <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                                        <i className="fas fa-plus mr-2"></i>Create Workshop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Featured Workshops */}
                        <section className="mb-12">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Featured This Week</h2>
                                    <p className="text-gray-600">Don't miss these special workshops with limited spots</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredWorkshops.map(workshop => (
                                        <WorkshopCard key={workshop.id} workshop={workshop} isFeatured={true} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Upcoming Workshops */}
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Upcoming Workshops</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 text-gray-400 hover:text-primary transition-colors rounded ${viewMode === 'grid' ? 'bg-primary-light' : ''}`}
                                    >
                                        <i className="fas fa-th-large"></i>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 text-gray-400 hover:text-primary transition-colors rounded ${viewMode === 'list' ? 'bg-primary-light' : ''}`}
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Workshop Grid/List View */}
                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                                {filteredWorkshops.map(workshop => (
                                    <WorkshopCard key={workshop.id} workshop={workshop} />
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="text-center mt-8">
                                <button className="text-primary hover:text-primary-dark font-medium">
                                    Load More Workshops
                                </button>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Workshop;
