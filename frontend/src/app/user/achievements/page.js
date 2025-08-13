"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';

// This is a single component that recreates the full HTML page.
const AchievementsPage = () => {
  // State for the mobile sidebar's open/closed state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for the profile dropdown's open/closed state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // This useEffect handles the mobile sidebar toggle on window resize.
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user?.user?.userType !== 'student'){
      window.location.href = '/';
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // This useEffect handles closing the profile dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        !event.target.closest('#profile-dropdown-btn') &&
        !event.target.closest('#profile-dropdown')
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Helper function for the badge click
  const handleBadgeClick = (achievementStatus, requirement) => {
    if (achievementStatus === 'earned') {
      console.log('Achievement unlocked! Great job!');
    } else {
      console.log(`Keep learning! ${requirement} to unlock this badge.`);
    }
  };

  return (
    <>

    

      <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                id="mobile-menu-btn"
                className="md:hidden text-gray-600 hover:text-primary"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="hidden md:block text-sm text-gray-500">Family Learning Hub</span>
            </div>

            {/* Center: Emma's Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">E</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-900">Emma Johnson</div>
                <div className="text-xs text-gray-500">Level 5 Explorer • 850 XP</div>
              </div>
            </div>

            {/* Right: Profile Dropdown */}
            <div className="relative">
              <button
                id="profile-dropdown-btn"
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
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
              <div
                id="profile-dropdown"
                className={`${isProfileDropdownOpen ? '' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2`}
              >
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
            className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            id="sidebar"
          >
            <div className="p-6">
              {/* Emma's Navigation */}
              <div className="space-y-2 mb-8">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-home text-lg"></i>
                  <span className="font-medium">My Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span>My Schedule</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-book text-lg"></i>
                  <span>My Classes</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1 bg-purple-primary text-white">
                  <i className="fas fa-trophy text-lg"></i>
                  <span className="font-medium">Achievements</span>
                </a>
              </div>

              {/* Current Classes */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">My Classes</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-music text-purple-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Piano Lessons</div>
                      <div className="text-xs text-gray-500">with Priya</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-paint-brush text-pink-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Watercolor Art</div>
                      <div className="text-xs text-gray-500">with Marcus</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Family Navigation */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Family</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">S</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Mum's Classes</div>
                      <div className="text-xs text-gray-500">Classical Music</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-green-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-semibold">J</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Jake's Classes</div>
                      <div className="text-xs text-gray-500">Coding, Maths</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Overlay for mobile sidebar */}
          <div
            id="sidebar-overlay"
            className={`${isSidebarOpen ? '' : 'hidden'} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Main Content */}
          <main className="flex-1 md:ml-0">
            {/* Welcome Section */}
            <div className="gradient-section-gold">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">🏆 My Achievements</h1>
                    <p className="text-yellow-100">You're doing amazing! Keep learning and growing!</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold">Level 5</div>
                      <div className="text-sm text-yellow-100">Explorer</div>
                    </div>
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Progress Overview */}
              <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Total Points */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border-l-4 border-gold">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-star text-gold text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">850</h3>
                    <p className="text-gray-600 text-sm">Total Points</p>
                  </div>

                  {/* Badges Earned */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border-l-4 border-purple-primary">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-medal text-purple-primary text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">8</h3>
                    <p className="text-gray-600 text-sm">Badges Earned</p>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border-l-4 border-green-primary">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-fire text-green-primary text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">7</h3>
                    <p className="text-gray-600 text-sm">Day Streak</p>
                  </div>

                  {/* Sessions Completed */}
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-graduation-cap text-blue-500 text-xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">24</h3>
                    <p className="text-gray-600 text-sm">Sessions Done</p>
                  </div>
                </div>
              </section>

              {/* Level Progress Bar */}
              <section className="mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
                      <p className="text-gray-600 text-sm">150 more points to reach Level 6 Champion!</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gold">Level 5</span>
                      <p className="text-sm text-gray-500">Explorer</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div className="bg-gradient-to-r from-gold to-yellow-400 h-4 rounded-full relative" style={{ width: '85%' }}>
                      <div className="absolute right-0 top-0 h-4 w-4 bg-white rounded-full border-2 border-gold transform translate-x-2"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>800 XP</span>
                    <span>850 / 1000 XP</span>
                    <span>1000 XP</span>
                  </div>
                </div>
              </section>

              {/* Recent Achievements */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🎉 Recent Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* New Achievement */}
                  <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden border border-gold">
                    <div className="absolute top-0 right-0 bg-gold text-white text-xs px-2 py-1 rounded-bl-lg">
                      NEW!
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <i className="fas fa-star text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Session Master!</h3>
                      <p className="text-gray-600 text-sm mb-3">Completed 25 learning sessions</p>
                      <div className="flex justify-center items-center space-x-2">
                        <span className="bg-gold text-white text-xs px-2 py-1 rounded-full">+100 XP</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Achievement */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-fire text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Week Warrior</h3>
                      <p className="text-gray-600 text-sm mb-3">Learned for 7 days in a row</p>
                      <div className="flex justify-center items-center space-x-2">
                        <span className="bg-green-primary text-white text-xs px-2 py-1 rounded-full">+75 XP</span>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Challenge */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-clock text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">On Time Pro</h3>
                      <p className="text-gray-600 text-sm mb-3">Never missed a scheduled session</p>
                      <div className="flex justify-center items-center space-x-2">
                        <span className="bg-purple-primary text-white text-xs px-2 py-1 rounded-full">+60 XP</span>
                        <span className="text-xs text-gray-500">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* All Badges */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🏆 Badge Collection</h2>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {/* Earned Badges */}
                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('earned', '')}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <i className="fas fa-graduation-cap text-white text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-900">First Session</p>
                      <p className="text-xs text-green-600">✓ Earned</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('earned', '')}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <i className="fas fa-clock text-white text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-900">On Time</p>
                      <p className="text-xs text-green-600">✓ Earned</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('earned', '')}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <i className="fas fa-fire text-white text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Streak Starter</p>
                      <p className="text-xs text-green-600">✓ Earned</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('earned', '')}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <i className="fas fa-heart text-white text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Helpful Learner</p>
                      <p className="text-xs text-green-600">✓ Earned</p>
                    </div>

                    {/* Locked Badges */}
                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', 'Reach Level 10')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-crown text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Champion</p>
                      <p className="text-xs text-gray-400">Reach Level 10</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', '3 sessions in one day')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-rocket text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Speed Learner</p>
                      <p className="text-xs text-gray-400">3 sessions in one day</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('earned', '')}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <i className="fas fa-star text-white text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Star Learner</p>
                      <p className="text-xs text-green-600">✓ Earned</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', 'Join 5 workshops')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-users text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Social Learner</p>
                      <p className="text-xs text-gray-400">Join 5 workshops</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', '30 day streak')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-calendar text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Monthly Hero</p>
                      <p className="text-xs text-gray-400">30 day streak</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', '1000 points')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-gem text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Diamond Level</p>
                      <p className="text-xs text-gray-400">1000 points</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', '50 sessions')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-trophy text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Master Learner</p>
                      <p className="text-xs text-gray-400">50 sessions</p>
                    </div>

                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleBadgeClick('locked', '14 day streak')}
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <i className="fas fa-medal text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">Perfect Streak</p>
                      <p className="text-xs text-gray-400">14 day streak</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Current Challenges */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🎯 Current Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Challenge 1 */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-target text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Practice Pro</h3>
                        <p className="text-xs text-gray-500">Weekly Challenge</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Complete 5 sessions this week</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="text-blue-600">3/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">2 days left</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">+100 XP</span>
                    </div>
                  </div>

                  {/* Challenge 2 */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-fire text-green-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Streak Builder</h3>
                        <p className="text-xs text-gray-500">Daily Challenge</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Keep your learning streak going for 10 days</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="text-green-600">7/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">3 more days</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+150 XP</span>
                    </div>
                  </div>

                  {/* Challenge 3 */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-users text-purple-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Social Learner</h3>
                        <p className="text-xs text-gray-500">Monthly Challenge</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Join 2 group workshops this month</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="text-purple-600">1/2</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">20 days left</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">+200 XP</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AchievementsPage;
