"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const mentorsData = [
  {
    id: 1,
    learner: 'sarah',
    subject: 'music',
    name: 'Priya Sharma',
    specialty: 'Classical Music • Hindustani Vocals',
    rating: '4.9 (67 reviews)',
    location: 'Manchester',
    availability: 'Online/In-person',
    price: '£35/hour',
    tags: ['You', 'Available Today', 'Previously Booked'],
    buttonColor: 'bg-primary',
    hoverBorder: 'hover:border-primary',
  },
  {
    id: 2,
    learner: 'emma',
    subject: 'art',
    name: 'Marcus Chen',
    specialty: 'Art & Craft • Digital Art',
    rating: '4.8 (45 reviews)',
    location: 'London',
    availability: 'Online',
    price: '£30/hour',
    tags: ['Emma', 'Available Today', 'Weekend Batches'],
    buttonColor: 'bg-purple-primary',
    hoverBorder: 'hover:border-purple-primary',
  },
  {
    id: 3,
    learner: 'jake',
    subject: 'coding',
    name: 'Alex Kumar',
    specialty: 'Programming • Python & Web Dev',
    rating: '4.9 (89 reviews)',
    location: 'Leeds',
    availability: 'Online/In-person',
    price: '£40/hour',
    tags: ['Jake', 'Busy until tomorrow', 'Weekday Intensive'],
    buttonColor: 'bg-green-primary',
    hoverBorder: 'hover:border-green-primary',
  },
  {
    id: 4,
    learner: 'jake',
    subject: 'maths',
    name: 'Dr. Sarah Mills',
    specialty: 'Mathematics • Advanced Algebra',
    rating: '4.9 (134 reviews)',
    location: 'Oxford',
    availability: 'Online',
    price: '£45/hour',
    tags: ['Jake', 'Available Today', 'PhD Qualified'],
    buttonColor: 'bg-green-primary',
    hoverBorder: 'hover:border-green-primary',
  },
  {
    id: 5,
    learner: 'sarah',
    subject: 'language',
    name: 'Luca Rossi',
    specialty: 'Italian Language • Native Speaker',
    rating: '4.7 (56 reviews)',
    location: 'Edinburgh',
    availability: 'Online/In-person',
    price: '£32/hour',
    tags: ['You', 'Evening slots', 'Conversation Focus'],
    buttonColor: 'bg-primary',
    hoverBorder: 'hover:border-primary',
  },
  {
    id: 6,
    learner: 'emma',
    subject: 'music',
    name: 'Amara Singh',
    specialty: 'Piano • Classical & Contemporary',
    rating: '4.8 (73 reviews)',
    location: 'Bristol',
    availability: 'Online/In-person',
    price: '£28/hour',
    tags: ['Emma', 'Available Today', 'Beginner Friendly'],
    buttonColor: 'bg-purple-primary',
    hoverBorder: 'hover:border-purple-primary',
  },
];

const SavedMentorsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [learnerFilter, setLearnerFilter] = useState('all');
  const [subjectFilters, setSubjectFilters] = useState(['music', 'art', 'coding', 'maths', 'language']);
  
  // Mentor cards to display based on filters
  const [filteredMentors, setFilteredMentors] = useState(mentorsData);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isProfileDropdownOpen && !e.target.closest('#profile-dropdown-btn') && !e.target.closest('#profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    const applyFilters = () => {
      const newFilteredMentors = mentorsData.filter(mentor => {
        const matchesLearner = learnerFilter === 'all' || mentor.learner === learnerFilter;
        const matchesSubject = subjectFilters.includes(mentor.subject);
        return matchesLearner && matchesSubject;
      });
      setFilteredMentors(newFilteredMentors);
    };
    applyFilters();
  }, [learnerFilter, subjectFilters]);

  const handleLearnerFilterClick = (filter) => {
    setLearnerFilter(filter);
  };

  const handleSubjectFilterChange = (subject) => {
    setSubjectFilters(prevSubjects =>
      prevSubjects.includes(subject)
        ? prevSubjects.filter(s => s !== subject)
        : [...prevSubjects, subject]
    );
  };
  
  // Helper function to render a mentor card
  const MentorCard = ({ mentor }) => (
    <div className={`mentor-card bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 ${mentor.hoverBorder}`} data-learner={mentor.learner} data-subject={mentor.subject}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
              <i className="fas fa-check-circle text-blue-500 text-sm" title="Verified Mentor"></i>
            </div>
            <p className="text-gray-600 text-sm mb-2">{mentor.specialty}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-star text-yellow-500 mr-1"></i>
                <span>{mentor.rating}</span>
              </div>
              <span>{mentor.location}</span>
              <span>{mentor.availability}</span>
            </div>
          </div>
        </div>
        <button className="text-red-500 hover:text-red-700 p-2" title="Remove from saved">
          <i className="fas fa-heart text-lg"></i>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        {mentor.tags.map((tag, index) => (
          <span key={index} className={`text-xs px-2 py-1 rounded-full ${index === 0 ? 'bg-blue-100 text-blue-800' : index === 1 ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">From {mentor.price}</span>
          <span className="text-gray-400"> • First session free</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-primary hover:text-primary-dark text-sm">Message</button>
          <button className={`${mentor.buttonColor} text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-colors`}>
            Book Session
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>

      <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button id="mobile-menu-btn" className="md:hidden text-gray-600 hover:text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="hidden md:block text-sm text-gray-500">Family Learning Hub</span>
            </div>
            
            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input type="text" placeholder="Search saved mentors..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            
            {/* Right: Profile Dropdown */}
            <div className="relative">
              <button id="profile-dropdown-btn" className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-xs text-gray-500">Parent & Learner</div>
                </div>
                <i className={`fas fa-chevron-down text-gray-400 text-sm transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : 'rotate-0'}`}></i>
              </button>
              
              {/* Dropdown Menu */}
              <div id="profile-dropdown" className={`${isProfileDropdownOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2`}>
                <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-home text-gray-400"></i>
                  <span>Back to Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-search text-gray-400"></i>
                  <span>Explore More Mentors</span>
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
          <nav className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} id="sidebar">
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
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                  <i className="fas fa-heart text-lg"></i>
                  <span className="font-medium">Saved Mentors</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-users text-lg"></i>
                  <span>Workshops</span>
                </a>
              </div>
              {/* Filter by Family Member */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Filter by Learner</h3>
                <div className="space-y-2">
                  <button className={`learner-filter w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${learnerFilter === 'all' ? 'bg-primary-light border border-primary-dark' : ''}`} onClick={() => handleLearnerFilterClick('all')}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <i className="fas fa-users text-white text-xs"></i>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">All Family</div>
                      <div className="text-xs text-gray-500">12 mentors</div>
                    </div>
                  </button>
                  <button className={`learner-filter w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${learnerFilter === 'sarah' ? 'bg-primary-light border border-primary-dark' : ''}`} onClick={() => handleLearnerFilterClick('sarah')}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">SJ</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Sarah (You)</div>
                      <div className="text-xs text-gray-500">4 mentors</div>
                    </div>
                  </button>
                  <button className={`learner-filter w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1 ${learnerFilter === 'emma' ? 'bg-purple-50 border border-purple-primary' : ''}`} onClick={() => handleLearnerFilterClick('emma')}>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs font-semibold">E</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Emma (12)</div>
                      <div className="text-xs text-gray-500">5 mentors</div>
                    </div>
                  </button>
                  <button className={`learner-filter w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-green-50 hover:translate-x-1 ${learnerFilter === 'jake' ? 'bg-green-50 border border-green-primary' : ''}`} onClick={() => handleLearnerFilterClick('jake')}>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-semibold">J</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Jake (15)</div>
                      <div className="text-xs text-gray-500">3 mentors</div>
                    </div>
                  </button>
                </div>
              </div>
              {/* Filter by Subject */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Filter by Subject</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 text-sm">
                    <input type="checkbox" className="subject-filter rounded text-primary" data-subject="music" checked={subjectFilters.includes('music')} onChange={() => handleSubjectFilterChange('music')} />
                    <span>Music (3)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm">
                    <input type="checkbox" className="subject-filter rounded text-primary" data-subject="art" checked={subjectFilters.includes('art')} onChange={() => handleSubjectFilterChange('art')} />
                    <span>Art & Craft (2)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm">
                    <input type="checkbox" className="subject-filter rounded text-primary" data-subject="coding" checked={subjectFilters.includes('coding')} onChange={() => handleSubjectFilterChange('coding')} />
                    <span>Coding (3)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm">
                    <input type="checkbox" className="subject-filter rounded text-primary" data-subject="maths" checked={subjectFilters.includes('maths')} onChange={() => handleSubjectFilterChange('maths')} />
                    <span>Mathematics (2)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm">
                    <input type="checkbox" className="subject-filter rounded text-primary" data-subject="language" checked={subjectFilters.includes('language')} onChange={() => handleSubjectFilterChange('language')} />
                    <span>Languages (2)</span>
                  </label>
                </div>
              </div>
            </div>
          </nav>
          {/* Overlay for mobile sidebar */}
          {isMobileMenuOpen && (
            <div id="sidebar-overlay" className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}
          {/* Main Content */}
          <main className="flex-1 md:ml-0">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Mentors</h1>
                    <p className="text-gray-600">Your family's favorite mentors for easy booking</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                    <button id="sort-dropdown-btn" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <i className="fas fa-sort mr-2"></i>Sort by Rating
                      <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                      <i className="fas fa-search mr-2"></i>Explore More Mentors
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Saved Mentors Stats */}
              <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-heart text-red-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">12</h3>
                    <p className="text-gray-600 text-sm">Saved Mentors</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar-check text-green-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">8</h3>
                    <p className="text-gray-600 text-sm">Previously Booked</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-clock text-blue-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">5</h3>
                    <p className="text-gray-600 text-sm">Available Today</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-star text-purple-600 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
                    <p className="text-gray-600 text-sm">Average Rating</p>
                  </div>
                </div>
              </section>
              {/* Recently Added */}
              <section className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Added</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Dr. Anjali Patel</h4>
                          <p className="text-gray-600 text-sm">Advanced Mathematics</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-500 text-xs"></i>
                              <span className="text-sm text-gray-600 ml-1">4.9 (42 reviews)</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Birmingham</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full text-center">Available</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full text-center">Jake</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Isabella Rodriguez</h4>
                          <p className="text-gray-600 text-sm">Watercolor Painting</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-500 text-xs"></i>
                              <span className="text-sm text-gray-600 ml-1">4.7 (28 reviews)</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Online</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full text-center">Busy</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full text-center">Emma</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* All Saved Mentors */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Saved Mentors</h2>
                  <span className="text-gray-600 text-sm">Showing {filteredMentors.length} mentors</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="mentors-grid">
                  {filteredMentors.map(mentor => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
                {/* Load More */}
                <div className="text-center mt-8">
                  <button className="text-primary hover:text-primary-dark font-medium">
                    Load More Mentors ({mentorsData.length - filteredMentors.length} remaining)
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SavedMentorsPage;
