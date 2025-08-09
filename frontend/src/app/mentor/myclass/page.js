"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import MentorSideBase from '@/components/MentorSideBase';
import { navItems } from '@/app/utils';
import axios from 'axios';
import MentorHeaderAccount from '@/components/MentorHeaderAccount';

export default function MyClass() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [user, setUser] = useState({});
  const [mentorDetails, setMentorDetails] = useState({});

  const [classStats1, setClassStats] = useState([]);
  const [classData1, setClassData] = useState({
    active: [],
    waiting: [],
    drafts: [],
    completed: {
      message: '',
      stats: []
    }
  });

  useEffect(() => {



    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user.user);

    const mentor = JSON.parse(localStorage.getItem("mentor"));
    setMentorDetails(mentor);


    const fetchClasses = async () => {
      try {

        const user = JSON.parse(localStorage.getItem("user"));
        const uid = user.user.uid;

        const response = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${uid}?include_classes=true`);
        console.log(response.data,'response.data response.data');
        
        const data = response.data;
        setClassStats(data.stats);
        setClassData(data.classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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

  const classData = {
    active: [
      {
        title: "Weekend Kathak Batch (8 weeks)",
        status: "Active",
        type: "In-person",
        description: "Intensive weekend sessions covering traditional Kathak techniques, storytelling, and performance skills for intermediate level students.",
        students: { enrolled: 6, total: 8, progress: 75 },
        schedule: "Sat & Sun",
        time: "10:00 AM - 12:00 PM",
        progress: { week: 3, total: 8, percentage: 37.5 },
        revenue: "£480",
        price: "£20/student/session",
        tags: ["Intermediate", "Teens & Adults", "Birmingham"],
        buttons: [
          { text: "View Students", icon: "fas fa-users", primary: true },
          { text: "Manage Schedule", icon: "fas fa-calendar" },
          { text: "Send Message", icon: "fas fa-comments" },
          { text: "Edit Class", icon: "fas fa-edit" },
        ],
      },
      {
        title: "One-on-One Kathak Sessions",
        status: "Active",
        type: "Online",
        description: "Personalized Kathak lessons tailored to individual student goals and skill levels. Flexible scheduling available.",
        students: { active: 8, new: "+2 this month" },
        schedule: "Flexible",
        time: "Student-booked",
        sessions: { thisMonth: 16, average: "Avg 2/student" },
        revenue: "£560",
        price: "£35/session",
        tags: ["All Levels", "All Ages", "Flexible Timing"],
        buttons: [
          { text: "View Students (8)", icon: "fas fa-users", primary: true },
          { text: "View Bookings", icon: "fas fa-calendar" },
          { text: "Set Availability", icon: "fas fa-clock" },
          { text: "Edit Class", icon: "fas fa-edit" },
        ],
      },
      {
        title: "Advanced Classical Dance Techniques",
        status: "Active",
        type: "Hybrid",
        description: "Master-level course focusing on complex footwork, expressions, and performance techniques for experienced dancers.",
        students: { enrolled: 4, total: 6, progress: 67 },
        schedule: "Thursdays",
        time: "6:00 PM - 8:00 PM",
        progress: { week: 2, total: 12, percentage: 17 },
        revenue: "£200",
        price: "£25/student/session",
        tags: ["Advanced", "Adults", "Need 2 more"],
        buttons: [
          { text: "View Students (4)", icon: "fas fa-users", primary: true },
          { text: "Promote Class", icon: "fas fa-bullhorn", secondary: "bg-yellow-500 text-white hover:bg-yellow-600" },
          { text: "Manage Schedule", icon: "fas fa-calendar" },
        ],
      }
    ],
    waiting: [
      {
        title: "Beginner Classical Dance",
        status: "Waiting",
        type: "In-person",
        description: "Perfect introduction to classical Indian dance forms for newcomers. Covering basic positions and simple choreography.",
        students: { enrolled: 2, total: 6, progress: 33 },
        schedule: "Weekdays",
        time: "5:00 PM - 6:00 PM",
        statusText: "Need 4 more",
        statusDetail: "to start class",
        potentialRevenue: "£480/month",
        potentialDetail: "when full",
        tags: ["Beginner", "Children & Teens", "Under-enrolled"],
        buttons: [
          { text: "Promote Class", icon: "fas fa-bullhorn", primary: true, secondary: "bg-yellow-500 text-white hover:bg-yellow-600" },
          { text: "View Students (2)", icon: "fas fa-users" },
          { text: "Edit Details", icon: "fas fa-edit" },
          { text: "Pause Class", icon: "fas fa-pause", secondary: "border-red-300 text-red-700 hover:bg-red-50" },
        ],
      },
      {
        title: "Weekend Philosophy Sessions",
        status: "Waiting",
        type: "Online",
        description: "Explore ancient philosophical concepts and their relevance to modern life. Interactive discussions and practical applications.",
        students: { enrolled: 1, total: 5, progress: 20 },
        schedule: "Sundays",
        time: "4:00 PM - 5:30 PM",
        statusText: "Need 4 more",
        statusDetail: "to start class",
        potentialRevenue: "£300/month",
        potentialDetail: "when full",
        tags: ["All Levels", "Adults", "Critical"],
        buttons: [
          { text: "Urgent: Promote", icon: "fas fa-exclamation-triangle", primary: true, secondary: "bg-red-500 text-white hover:bg-red-600" },
          { text: "Share on Social", icon: "fas fa-share" },
          { text: "Edit Details", icon: "fas fa-edit" },
        ],
      }
    ],
    completed: {
      message: "Your finished courses and their student feedback will appear here.",
      stats: [
        "4 classes completed successfully",
        "Average rating: 4.9/5 stars"
      ]
    },
    drafts: [
      {
        title: "Music Theory Fundamentals",
        status: "Draft",
        description: "Introduction to music theory concepts including scales, rhythms, and composition basics. (Work in progress)",
        lastEdited: "3 days ago",
        buttons: [
          { text: "Continue Editing", icon: "fas fa-edit", primary: true },
          { text: "Preview", icon: "fas fa-eye" },
          { text: "Delete Draft", icon: "fas fa-trash", secondary: "border-red-300 text-red-700 hover:bg-red-50" },
        ],
      }
    ]
  };

  const classStats = [
    { icon: "fas fa-play-circle", iconBg: "bg-green-100", iconColor: "text-green-600", status: "Active", statusColor: "text-green-500", value: 3, label: "Running Classes" },
    { icon: "fas fa-users", iconBg: "bg-blue-100", iconColor: "text-blue-600", status: "Total", statusColor: "text-blue-500", value: 24, label: "Enrolled Students" },
    { icon: "fas fa-hourglass-half", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", status: "Waiting", statusColor: "text-yellow-500", value: 2, label: "Need Students" },
    { icon: "fas fa-pound-sign", iconBg: "bg-purple-100", iconColor: "text-purple-600", status: "This month", statusColor: "text-green-500", value: "£1,240", label: "Class Revenue" },
  ];

  return (
    <>
      <Head>
        <title>My Classes - Roots & Wings</title>
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
            <MentorHeaderAccount isProfileDropdownOpen={isProfileDropdownOpen} handleProfileDropdownClick={handleProfileDropdownClick} user={user} mentorDetails={mentorDetails} />


            
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}

          <MentorSideBase isSidebarOpen={isSidebarOpen} navItems={navItems} activeTab={2} />
          

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
                <p className="text-gray-600">Manage your ongoing courses and regular sessions</p>
              </div>
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                <i className="fas fa-plus mr-2"></i>
                Create New Class
              </button>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {classStats.map((stat, index) => (
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

            {/* Class Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => handleTabClick('active')}
                >
                  Active Classes ({classData.active.length})
                </button>
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${activeTab === 'waiting' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => handleTabClick('waiting')}
                >
                  Waiting for Students ({classData.waiting.length})
                </button>
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => handleTabClick('completed')}
                >
                  Completed (4)
                </button>
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${activeTab === 'drafts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => handleTabClick('drafts')}
                >
                  Drafts ({classData.drafts.length})
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="space-y-6">
              {activeTab === 'active' && classData.active.map((classItem, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{classItem.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">{classItem.status}</span>
                        <span className={`${classItem.type === 'In-person' ? 'bg-blue-100 text-blue-800' : classItem.type === 'Online' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} text-xs px-2 py-1 rounded-full font-medium`}>{classItem.type}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{classItem.description}</p>
                      
                      <div className="grid md:grid-cols-4 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">{classItem.students.total ? 'Students Enrolled' : 'Active Students'}</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.students.total ? `${classItem.students.enrolled}/${classItem.students.total} students` : `${classItem.students.active} students`}</p>
                          {classItem.students.progress && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className={`${classItem.students.progress > 50 ? 'bg-green-500' : 'bg-yellow-500'} h-2 rounded-full`} style={{ width: `${classItem.students.progress}%` }}></div>
                            </div>
                          )}
                          {classItem.students.new && (
                            <p className="text-sm text-green-600">{classItem.students.new}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Schedule</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.schedule}</p>
                          <p className="text-sm text-gray-600">{classItem.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{classItem.progress ? 'Progress' : 'Sessions This Month'}</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.progress ? `Week ${classItem.progress.week} of ${classItem.progress.total}` : `${classItem.sessions.thisMonth} sessions`}</p>
                          {classItem.progress && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${classItem.progress.percentage}%` }}></div>
                            </div>
                          )}
                          {classItem.sessions && (
                            <p className="text-sm text-gray-600">{classItem.sessions.average}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Monthly Revenue</p>
                          <p className="text-lg font-semibold text-green-600">{classItem.revenue}</p>
                          <p className="text-sm text-gray-600">{classItem.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        {classItem.tags.map((tag, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${
                            tag.includes("Intermediate") ? 'bg-purple-100 text-purple-800' :
                            tag.includes("Beginner") ? 'bg-green-100 text-green-800' :
                            tag.includes("Advanced") ? 'bg-red-100 text-red-800' :
                            tag.includes("Adults") ? 'bg-indigo-100 text-indigo-800' :
                            tag.includes("Teens") ? 'bg-orange-100 text-orange-800' :
                            tag.includes("Birmingham") ? 'bg-gray-100 text-gray-800' :
                            tag.includes("Flexible Timing") ? 'bg-teal-100 text-teal-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button className="text-gray-500 hover:text-gray-700 p-2">
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {classItem.buttons.map((button, i) => (
                      <button key={i} className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${button.primary ? 'bg-primary text-white hover:bg-primary-dark' : button.secondary ? button.secondary : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <i className={`${button.icon} mr-2`}></i>
                        {button.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {activeTab === 'waiting' && classData.waiting.map((classItem, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{classItem.title}</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">{classItem.status}</span>
                        <span className={`${classItem.type === 'In-person' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs px-2 py-1 rounded-full font-medium`}>{classItem.type}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{classItem.description}</p>
                      
                      <div className="grid md:grid-cols-4 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Students Enrolled</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.students.enrolled}/{classItem.students.total} students</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${classItem.students.progress}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Schedule</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.schedule}</p>
                          <p className="text-sm text-gray-600">{classItem.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="text-lg font-semibold text-orange-600">{classItem.statusText}</p>
                          <p className="text-sm text-gray-600">{classItem.statusDetail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Potential Revenue</p>
                          <p className="text-lg font-semibold text-gray-900">{classItem.potentialRevenue}</p>
                          <p className="text-sm text-gray-600">{classItem.potentialDetail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        {classItem.tags.map((tag, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${
                            tag.includes("Beginner") ? 'bg-green-100 text-green-800' :
                            tag.includes("Children") ? 'bg-blue-100 text-blue-800' :
                            tag.includes("Under-enrolled") ? 'bg-red-100 text-red-800' :
                            tag.includes("All Levels") ? 'bg-indigo-100 text-indigo-800' :
                            tag.includes("Adults") ? 'bg-purple-100 text-purple-800' :
                            tag.includes("Critical") ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {classItem.buttons.map((button, i) => (
                      <button key={i} className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${button.primary ? 'bg-yellow-500 text-white hover:bg-yellow-600' : button.secondary ? button.secondary : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <i className={`${button.icon} mr-2`}></i>
                        {button.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {activeTab === 'completed' && (
                <div className="tab-content">
                  <div className="text-center py-12">
                    <i className="fas fa-check-circle text-green-300 text-6xl mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Completed Classes</h3>
                    <p className="text-gray-600 mb-6">{classData.completed.message}</p>
                    <div className="text-sm text-gray-500">
                      {classData.completed.stats.map((stat, index) => (
                        <p key={index}>{stat}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'drafts' && classData.drafts.map((classItem, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{classItem.title}</h3>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">{classItem.status}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{classItem.description}</p>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        Last edited: {classItem.lastEdited}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {classItem.buttons.map((button, i) => (
                      <button key={i} className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${button.primary ? 'bg-primary text-white hover:bg-primary-dark' : button.secondary ? button.secondary : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <i className={`${button.icon} mr-2`}></i>
                        {button.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div id="sidebar-overlay" onClick={handleSidebarOverlayClick} className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? '' : 'hidden'}`}></div>
      </body>
    </>
  );
}
