"use client";
import AccountDropDown from "@/components/AccountDropDown";
import UserSidebar from "@/components/UserSidebar";
import React, { useState, useEffect, useRef } from "react";

const Dashboard = () => {
  // State to manage the mobile sidebar's visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to manage the profile dropdown's visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // State to manage the active profile view (e.g., 'adult' or 'family')
  const [activeProfile, setActiveProfile] = useState("adult");

  const [user, setUser] = useState({});

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user.user);
  }, []);

  // Effect to handle window resize and close the mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to handle clicks outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        !event.target.closest("#profile-dropdown-btn") &&
        !event.target.closest("#profile-dropdown")
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-a0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              id="mobile-menu-btn"
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-primary"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">
              Roots & Wings
            </h1>
            <span className="hidden md:block text-sm text-gray-500">
              Family Learning Hub
            </span>
          </div>

          {/* Center: Profile Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              id="adult-profile-btn"
              onClick={() => setActiveProfile("adult")}
              className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                activeProfile === "adult"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <i className="fas fa-user mr-2"></i>My Profile
            </button>
            <button
              id="family-profile-btn"
              onClick={() => setActiveProfile("family")}
              className={`profile-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                activeProfile === "family"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <i className="fas fa-users mr-2"></i>Family View
            </button>
          </div>

          <div className="relative">
            <AccountDropDown
              isProfileDropdownOpen={isProfileDropdownOpen}
              profileDropdownBtnRef={profileDropdownBtnRef}
              toggleProfileDropdown={toggleProfileDropdown}
              profileDropdownRef={profileDropdownRef}
              user={user}
              mentorDetails={null}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <UserSidebar isSidebarOpen={isSidebarOpen} activeTab={1} />

        {/* Overlay for mobile sidebar */}
        <div
          id="sidebar-overlay"
          onClick={toggleSidebar}
          className={`${
            isSidebarOpen ? "" : "hidden"
          } md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}
        ></div>

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          {/* Welcome Section */}
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, Sarah! 👋
                  </h1>
                  <p className="text-gray-600">
                    Your family learning journey continues today
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                    <i className="fas fa-video mr-2"></i>Join Today's Session
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <i className="fas fa-search mr-2"></i>Find New Mentors
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Family Overview Stats */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Family Learning Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">3</h3>
                  <p className="text-gray-600 text-sm">Active Learners</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">24</h3>
                  <p className="text-gray-600 text-sm">Total Sessions</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-graduate text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">5</h3>
                  <p className="text-gray-600 text-sm">Mentors</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-star text-orange-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">4.9</h3>
                  <p className="text-gray-600 text-sm">Avg Rating</p>
                </div>
              </div>
            </section>

            {/* Upcoming Sessions & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today's Sessions
                    </h3>
                    <a
                      href="#"
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      View All
                    </a>
                  </div>

                  <div className="space-y-4">
                    {/* Adult Session */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">SJ</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Your Session - Classical Music
                            </h4>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              You
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            with Priya Sharma
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              <i className="fas fa-clock mr-1"></i>2:00 PM -
                              3:00 PM
                            </span>
                            <span>
                              <i className="fas fa-video mr-1"></i>Online
                            </span>
                          </div>
                        </div>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors">
                          Join
                        </button>
                      </div>
                    </div>

                    {/* Emma's Session */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-primary transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-semibold">
                            E
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Emma's Session - Art Fundamentals
                            </h4>
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              Emma
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            with Marcus Chen
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              <i className="fas fa-clock mr-1"></i>4:00 PM -
                              5:00 PM
                            </span>
                            <span>
                              <i className="fas fa-video mr-1"></i>Online
                            </span>
                          </div>
                        </div>
                        <button className="bg-purple-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors">
                          Monitor
                        </button>
                      </div>
                    </div>

                    {/* Jake's Session */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-primary transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-semibold">
                            J
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Jake's Session - Python Basics
                            </h4>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Jake
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            with Alex Kumar
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              <i className="fas fa-clock mr-1"></i>6:00 PM -
                              7:00 PM
                            </span>
                            <span>
                              <i className="fas fa-video mr-1"></i>Online
                            </span>
                          </div>
                        </div>
                        <button className="bg-green-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                          Monitor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Quick Actions
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-plus text-primary"></i>
                      <span className="font-medium">Add Young Learner</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-search text-primary"></i>
                      <span className="font-medium">Find New Mentors</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-calendar-plus text-primary"></i>
                      <span className="font-medium">Schedule Session</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light transition-colors">
                      <i className="fas fa-chart-line text-primary"></i>
                      <span className="font-medium">View Progress</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Young Learners Progress */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Young Learners Progress
                </h2>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  View Detailed Reports
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emma's Progress */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-primary">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">E</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Emma Johnson
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Age 12 • Music & Art
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Piano Progress</span>
                        <span className="text-purple-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-primary h-2 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Watercolor Painting</span>
                        <span className="text-purple-600">60%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-primary h-2 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Next session: Today 4:00 PM
                    </span>
                    <button className="text-purple-primary hover:text-purple-600 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Jake's Progress */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-primary">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">J</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Jake Johnson
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Age 15 • Coding & Maths
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Python Programming</span>
                        <span className="text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-primary h-2 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Advanced Algebra</span>
                        <span className="text-green-600">70%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-primary h-2 rounded-full"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Next session: Today 6:00 PM
                    </span>
                    <button className="text-green-primary hover:text-green-600 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Jake completed Python Basics - Module 3
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-star text-blue-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Emma received 5-star feedback from Marcus
                      </p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-calendar text-purple-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        You booked a session with Priya Sharma
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages & Notifications */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Messages & Updates
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Priya Sharma</p>
                        <p className="text-xs text-gray-500">
                          Classical Music Mentor
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      "Great progress in today's lesson! Looking forward to our
                      next session."
                    </p>
                    <p className="text-xs text-gray-500 mt-2">1 hour ago</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Alex Kumar</p>
                        <p className="text-xs text-gray-500">
                          Programming Mentor
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      "Jake is doing excellent work with Python. Suggested some
                      extra practice exercises."
                    </p>
                    <p className="text-xs text-gray-500 mt-2">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
