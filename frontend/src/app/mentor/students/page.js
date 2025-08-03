"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Students() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
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
  const studentStats = [
    { icon: "fas fa-user-graduate", iconBg: "bg-green-100", iconColor: "text-green-600", status: "Total", statusColor: "text-green-500", value: 24, label: "Active Students" },
    { icon: "fas fa-user", iconBg: "bg-blue-100", iconColor: "text-blue-600", status: "1-on-1", statusColor: "text-blue-500", value: 8, label: "Individual Students" },
    { icon: "fas fa-users", iconBg: "bg-purple-100", iconColor: "text-purple-600", status: "Groups", statusColor: "text-purple-500", value: 16, label: "Group Students" },
    { icon: "fas fa-star", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", status: "Average", statusColor: "text-yellow-500", value: 4.8, label: "Student Rating" },
  ];

  const students = [
    {
      id: 1,
      name: "Ananya Mehta",
      initials: "AM",
      initialBg: "bg-primary",
      type: "one-on-one",
      status: "Active",
      level: "Beginner",
      class: "Kathak Basics",
      joinDate: "2 months ago",
      age: "Teen (16 years)",
      nextSession: "Today 3:00 PM",
      sessionsCompleted: 8,
      rating: 4.9,
      actionBtns: [
        { text: "Join Session", icon: "fas fa-video", primary: true },
        { text: "Message", icon: "fas fa-envelope", primary: false }
      ]
    },
    {
      id: 2,
      name: "Shreya Patel",
      initials: "SP",
      initialBg: "bg-purple-500",
      type: "one-on-one",
      status: "Active",
      level: "Advanced",
      class: "Advanced Techniques",
      joinDate: "6 months ago",
      age: "Adult (24 years)",
      nextSession: "Today 6:00 PM",
      sessionsCompleted: 24,
      rating: 5.0,
      actionBtns: [
        { text: "View Progress", icon: "fas fa-eye", primary: false },
        { text: "Message", icon: "fas fa-envelope", primary: false }
      ]
    },
    {
      id: 3,
      name: "Raj Kumar",
      initials: "RK",
      initialBg: "bg-green-500",
      type: "group",
      status: "Active",
      level: "Intermediate",
      class: "Classical Rhythms",
      joinDate: "4 months ago",
      age: "Adult (28 years)",
      nextSession: "Wed 5:00 PM",
      sessionsCompleted: 16,
      rating: 4.7,
      actionBtns: [
        { text: "Message", icon: "fas fa-envelope", primary: false }
      ]
    },
    {
      id: 4,
      name: "Priya Singh",
      initials: "PS",
      initialBg: "bg-primary-dark",
      type: "group",
      status: "Active",
      level: "Beginner",
      class: "Weekend Kathak Batch",
      joinDate: "1 month ago",
      age: "Adult (30 years)",
      nextSession: "Sat 10:00 AM",
      sessionsCompleted: 4,
      rating: 4.8,
      actionBtns: [
        { text: "Message", icon: "fas fa-envelope", primary: false }
      ]
    },
    {
      id: 5,
      name: "Maya Sharma",
      initials: "MS",
      initialBg: "bg-yellow-500",
      type: "workshop",
      status: "Active",
      level: "Beginner",
      class: "Kathak Performance Workshop",
      joinDate: "1 week ago",
      age: "Teen (17 years)",
      nextSession: "Sat 2:00 PM",
      sessionsCompleted: 0,
      rating: null,
      actionBtns: [
        { text: "View Workshop", icon: "fas fa-users", primary: false }
      ]
    },
  ];

  const filteredStudents = students.filter(student => {
    if (activeFilter === 'all') return true;
    return student.type === activeFilter;
  });

  return (
    <>
      <Head>
        <title>Students - Roots & Wings</title>
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
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span>Schedule</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
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
                    <i className="fas fa-envelope mr-2"></i>
                    Send Message
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
                <p className="text-gray-600">Manage your student relationships and track their progress</p>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <input type="text" placeholder="Search students..." 
                         className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  <i className="fas fa-envelope mr-2"></i>
                  Send Group Message
                </button>
              </div>
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {studentStats.map((stat, index) => (
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

            {/* Student Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleFilterClick('all')} 
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  data-filter="all">
                  All Students ({students.length})
                </button>
                <button 
                  onClick={() => handleFilterClick('one-on-one')} 
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${activeFilter === 'one-on-one' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  data-filter="one-on-one">
                  1-on-1 ({students.filter(s => s.type === 'one-on-one').length})
                </button>
                <button 
                  onClick={() => handleFilterClick('group')} 
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${activeFilter === 'group' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  data-filter="group">
                  Group Classes ({students.filter(s => s.type === 'group').length})
                </button>
                <button 
                  onClick={() => handleFilterClick('workshop')} 
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${activeFilter === 'workshop' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  data-filter="workshop">
                  Workshop Attendees ({students.filter(s => s.type === 'workshop').length})
                </button>
              </div>
              <div className="ml-auto">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>Sort by: Last Session</option>
                  <option>Sort by: Name</option>
                  <option>Sort by: Progress</option>
                  <option>Sort by: Join Date</option>
                </select>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-4" id="students-list">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeFilter === 'all' && 'All Students'}
                    {activeFilter === 'one-on-one' && 'One-on-One Students'}
                    {activeFilter === 'group' && 'Group Students'}
                    {activeFilter === 'workshop' && 'Workshop Attendees'} ({filteredStudents.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${student.initialBg}`}>
                          <span className="text-white font-semibold text-lg">{student.initials}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">{student.status}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${student.level === 'Beginner' ? 'bg-blue-100 text-blue-800' : student.level === 'Advanced' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>{student.level}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{student.class} • Joined {student.joinDate} • {student.age}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-calendar text-gray-400"></i>
                              <span className="text-gray-600">Next: {student.nextSession}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-chart-line text-gray-400"></i>
                              <span className="text-gray-600">{student.sessionsCompleted} sessions completed</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-star text-yellow-400"></i>
                              <span className="text-gray-600">{student.rating ? `${student.rating} rating` : 'No rating'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {student.actionBtns.map((btn, btnIndex) => (
                            <button key={btnIndex} className={`px-4 py-2 rounded-lg text-sm transition-colors ${btn.primary ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                              {btn.icon && <i className={`${btn.icon} mr-1`}></i>}
                              {btn.text}
                            </button>
                          ))}
                          <button className="text-gray-500 hover:text-gray-700 p-2">
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
