"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Schedule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [calendarView, setCalendarView] = useState('week');

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const handleCalendarNavigation = (direction) => {
    // Placeholder for actual calendar navigation logic
    if (direction === 'prev') {
      console.log('Previous week');
    } else if (direction === 'next') {
      console.log('Next week');
    } else if (direction === 'today') {
      console.log('Go to today');
    }
  };

  useEffect(() => {
    // Logic to close dropdown on outside click
    const handleOutsideClick = (e) => {
      const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
      const profileDropdown = document.getElementById('profile-dropdown');
      if (profileDropdownBtn && profileDropdown && !profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);

    // Auto-hide mobile sidebar on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Static data for the component
  const scheduleStats = [
    { icon: "fas fa-calendar-check", iconBg: "bg-green-100", iconColor: "text-green-600", status: "This week", statusColor: "text-green-500", value: 12, label: "Scheduled Sessions" },
    { icon: "fas fa-clock", iconBg: "bg-blue-100", iconColor: "text-blue-600", status: "Available", statusColor: "text-blue-500", value: 18, label: "Open Time Slots" },
    { icon: "fas fa-users", iconBg: "bg-purple-100", iconColor: "text-purple-600", status: "Upcoming", statusColor: "text-purple-500", value: 2, label: "Workshops" },
    { icon: "fas fa-hourglass-half", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", status: "This week", statusColor: "text-yellow-500", value: 20, label: "Teaching Hours" },
  ];

  const upcomingSessions = [
    {
      date: "Today - Tuesday, July 23",
      sessions: [
        {
          initials: "AM", initialBg: "bg-primary", name: "Ananya Mehta", title: "One-on-One Session", time: "3:00 PM - 4:00 PM", details: "Online • Kathak Basics", actionBtn: { text: "Join", icon: "fas fa-video", primary: true }
        },
        {
          initials: "RK", initialBg: "bg-green-500", name: "Raj Kumar", title: "One-on-One Session", time: "5:00 PM - 6:00 PM", details: "In-person • Advanced Techniques", actionBtn: { text: "Prepare", icon: "", primary: false }
        },
        {
          initials: "SP", initialBg: "bg-purple-500", name: "Shreya Patel", title: "One-on-One Session", time: "6:00 PM - 7:00 PM", details: "Online • Performance Preparation", actionBtn: { text: "Prepare", icon: "", primary: false }
        }
      ]
    },
    {
      date: "Tomorrow - Wednesday, July 24",
      sessions: [
        {
          initials: "MR", initialBg: "bg-blue-500", name: "Maya Rajan", title: "One-on-One Session", time: "4:00 PM - 5:00 PM", details: "Online • Intermediate Level", actionBtn: { text: "Prepare", icon: "", primary: false }
        }
      ]
    },
    {
      date: "Weekend - Saturday & Sunday",
      sessions: [
        {
          icon: "fas fa-users", iconBg: "bg-green-600", name: "Weekend Kathak Batch", details: "Sat & Sun 10:00 AM - 12:00 PM • 6 students enrolled", actionBtn: { text: "Manage", primary: true, btnBg: "bg-green-500 hover:bg-green-600" }
        },
        {
          icon: "fas fa-graduation-cap", iconBg: "bg-purple-600", name: "Kathak Performance Workshop", details: "Saturday 2:00 PM - 5:00 PM • 8/12 participants", actionBtn: { text: "Manage", primary: true, btnBg: "bg-purple-500 hover:bg-purple-600" }
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Schedule - Roots & Wings</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'primary': '#00A2E8',
                    'primary-dark': '#00468C',
                    'primary-light': '#E6F7FF',
                    'background': '#F9FBFF',
                  }
                }
              }
            }
          `
        }}></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button id="mobile-menu-btn" onClick={handleMobileMenuClick} className="md:hidden text-gray-600 hover:text-primary">
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="hidden md:block text-sm text-gray-500">Mentor Portal</span>
            </div>
            
            {/* Right: Profile Dropdown */}
            <div className="relative">
              <button id="profile-dropdown-btn" onClick={handleProfileDropdownClick} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">PR</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-xs text-gray-500">Kathak Mentor</div>
                </div>
                <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
              </button>
              
              {/* Dropdown Menu */}
              <div id="profile-dropdown" className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isProfileDropdownOpen ? '' : 'hidden'}`}>
                <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-user text-gray-400"></i>
                  <span>View Profile</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-cog text-gray-400"></i>
                  <span>Settings</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-question-circle text-gray-400"></i>
                  <span>Help & Support</span>
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
          <nav className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} id="sidebar">
            <div className="p-6">
              {/* Navigation Items */}
              <div className="space-y-2">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-home text-lg"></i>
                  <span className="font-medium">Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-chalkboard-teacher text-lg"></i>
                  <span>My Classes</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-plus-circle text-lg"></i>
                  <span>Host a Class</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-users text-lg"></i>
                  <span>Workshops</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span>Schedule</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-graduation-cap text-lg"></i>
                  <span>Students</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-pound-sign text-lg"></i>
                  <span>Earnings</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-comments text-lg"></i>
                  <span>Messages</span>
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
                </a>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                    <i className="fas fa-clock mr-2"></i>
                    Set Availability
                  </button>
                  <button className="w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium">
                    <i className="fas fa-video mr-2"></i>
                    Start Session Now
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
                <p className="text-gray-600">Manage your sessions, workshops, and availability</p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <i className="fas fa-download mr-2"></i>
                  Export Schedule
                </button>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  <i className="fas fa-clock mr-2"></i>
                  Set Availability
                </button>
              </div>
            </div>

            {/* Schedule Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {scheduleStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                      <i className={`${stat.icon} ${stat.iconColor}`}></i>
                    </div>
                    <span className={`${stat.statusColor} text-sm font-medium`}>{stat.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleCalendarNavigation('prev')} className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <i className="fas fa-chevron-left text-gray-600"></i>
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">July 22 - 28, 2025</h2>
                  <button onClick={() => handleCalendarNavigation('next')} className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <i className="fas fa-chevron-right text-gray-600"></i>
                  </button>
                </div>
                <button onClick={() => handleCalendarNavigation('today')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Today
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button onClick={() => handleViewChange('week')} className={`px-4 py-2 rounded-lg transition-colors view-btn ${calendarView === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Week
                </button>
                <button onClick={() => handleViewChange('month')} className={`px-4 py-2 rounded-lg transition-colors view-btn ${calendarView === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Month
                </button>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Week View (Hardcoded for now) */}
              {calendarView === 'week' && (
                <div id="week-view">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-8 border-b border-gray-200">
                    <div className="p-4 font-semibold text-gray-600 text-sm">Time</div>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={index} className="p-4 text-center border-l border-gray-200">
                        <div className="font-semibold text-gray-900">{day}</div>
                        <div className={`text-2xl font-bold ${day === 'Tue' ? 'text-primary' : 'text-gray-900'}`}>{22 + index}</div>
                        <div className="text-xs text-gray-500">Jul</div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body (Hardcoded for now) */}
                  <div className="max-h-96 overflow-y-auto">
                    {/* Time rows - this would be dynamically generated in a real app */}
                    {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map((time, timeIndex) => (
                      <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 min-h-16">
                        <div className="p-3 text-sm text-gray-500 border-r border-gray-200">{time}</div>
                        <div className="border-l border-gray-200 p-2"></div>
                        <div className="border-l border-gray-200 p-2"></div>
                        <div className="border-l border-gray-200 p-2"></div>
                        <div className="border-l border-gray-200 p-2"></div>
                        <div className="border-l border-gray-200 p-2"></div>
                        <div className="border-l border-gray-200 p-2">
                           {time === '10:00 AM' && (
                              <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 text-xs">
                                  <div className="font-semibold text-purple-800">Kathak Workshop</div>
                                  <div className="text-purple-600">2:00-5:00 PM</div>
                                  <div className="text-purple-600">8 participants</div>
                              </div>
                          )}
                           {time === '11:00 AM' && (
                              <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
                                  <div className="font-semibold text-green-800">Weekend Kathak</div>
                                  <div className="text-green-600">10:00 AM-12:00 PM</div>
                                  <div className="text-green-600">6 students</div>
                              </div>
                          )}
                        </div>
                        <div className="border-l border-gray-200 p-2">
                          {time === '10:00 AM' && (
                            <div className="bg-orange-100 border border-orange-300 rounded-lg p-2 text-xs">
                                <div className="font-semibold text-orange-800">Vedic Chanting</div>
                                <div className="text-orange-600">10:00 AM-12:00 PM</div>
                                <div className="text-orange-600">Free Workshop</div>
                            </div>
                          )}
                          {time === '11:00 AM' && (
                              <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-xs">
                                  <div className="font-semibold text-green-800">Weekend Kathak</div>
                                  <div className="text-green-600">10:00 AM-12:00 PM</div>
                                  <div className="text-green-600">6 students</div>
                              </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Placeholder for Month View */}
              {calendarView === 'month' && (
                <div id="month-view" className="p-6 text-center text-gray-500">
                  Month view would be implemented here.
                </div>
              )}
            </div>

            {/* Upcoming Sessions List */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Next 7 Days</h3>
              <div className="space-y-4">
                {upcomingSessions.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{day.date}</h4>
                      {day.date.includes("Today") && <span className="text-sm text-primary font-medium">3 sessions</span>}
                      {day.date.includes("Tomorrow") && <span className="text-sm text-gray-600 font-medium">1 session</span>}
                      {day.date.includes("Weekend") && <span className="text-sm text-green-600 font-medium">4 events</span>}
                    </div>
                    <div className="space-y-3">
                      {day.sessions.map((session, sessionIndex) => (
                        <div key={sessionIndex} className={`flex items-center space-x-4 p-3 rounded-lg ${
                          session.name?.includes("Kathak Batch") ? 'bg-green-50' :
                          session.name?.includes("Workshop") ? 'bg-purple-50' :
                          'bg-gray-50'
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.initials ? session.initials.length > 0 && session.initials.length < 3 ? 'bg-primary' : session.initials.length === 3 ? 'bg-green-500' : 'bg-primary' : session.iconBg}`}>
                            {session.initials ? <span className="text-white font-semibold text-sm">{session.initials}</span> : <i className={`${session.icon} text-white`}></i>}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{session.name || `${session.initials} ${session.name}`}</h5>
                            <p className="text-sm text-gray-600">{session.time || session.details}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${session.actionBtn?.primary ? session.actionBtn?.btnBg || 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                              {session.actionBtn.icon && <i className={`${session.actionBtn.icon} mr-1`}></i>}
                              {session.actionBtn.text}
                            </button>
                            {!session.icon && (
                              <button className="text-gray-500 hover:text-gray-700 p-2">
                                <i className="fas fa-ellipsis-h"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div id="sidebar-overlay" onClick={handleSidebarOverlayClick} className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? '' : 'hidden'}`}></div>
      </body>
    </>
  );
}
