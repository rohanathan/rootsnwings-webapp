"use client";
import UserSidebar from "@/components/UserSidebar";
import React, { useState, useEffect } from "react";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { classifySessions, getSessionsSummary } from "@/app/utils";
import { useRouter } from 'next/navigation';


const MyBookings = () => {
  const router = useRouter();
  
  // State to manage the mobile sidebar's visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to manage the profile dropdown's visibility
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // State to manage the active view (e.g., 'all', 'upcoming', 'past')
  const [activeView, setActiveView] = useState("all-bookings");
  // State to manage the active booking tab (e.g., 'upcoming', 'completed', 'cancelled')
  const [activeTab, setActiveTab] = useState("upcoming");
  const [user, setUser] = useState({});

  // State for bookings data
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [upClasses, setUpClasses] = useState([]);

  // Effect to handle window resize and close the mobile sidebar on larger screens
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user.user);

    // Fetch bookings data
    const fetchBookings = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        console.log("User data for bookings:", userData);

        if (!userData || !userData.user) {
          console.error("No user data found");
          setError("Please log in to view your bookings");
          setLoading(false);
          return;
        }

        // Check user type - allow students and others to view bookings
        if (userData.user.userType && userData.user.userType !== 'student') {
          console.log("User type:", userData.user.userType, "- redirecting to mentor dashboard");
          router.push('/mentor/dashboard');
          return;
        }
          
        if (!userData?.user?.uid) {
          throw new Error("User not found. Please log in again.");
        }

        console.log("Fetching bookings for user ID:", userData.user.uid);

        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings?studentId=${userData.user.uid}`
        );

        console.log("Bookings API response:", response.data);
        console.log("Bookings array:", response.data?.bookings);

        setBookings(response.data?.bookings || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(bookings, "bookings");

    if (bookings.length > 0) {
      bookings.forEach(async (booking) => {
        const { classId, mentorId } = booking;
        const classData = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/${classId}`
        );
        console.log(classData.data, "classData.data classData.data");
        setUpClasses((prev) => [...prev, classData.data.class]);
      });
    }
  }, [bookings]);

  console.log(upClasses, "upClasses upClasses");

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Effect to handle clicks outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileDropdownBtn = document.getElementById(
        "profile-dropdown-btn"
      );
      const profileDropdown = document.getElementById("profile-dropdown");
      if (
        isProfileDropdownOpen &&
        profileDropdownBtn &&
        profileDropdown &&
        !profileDropdownBtn.contains(event.target) &&
        !profileDropdown.contains(event.target)
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

  // JSX for the component
  return (
    <div className="font-sans text-gray-800 bg-primary-light min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
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

          {/* Center: View Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView("all-bookings")}
              className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                activeView === "all-bookings"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <i className="fas fa-calendar-alt mr-2"></i>All Bookings
            </button>
            <button
              onClick={() => setActiveView("upcoming")}
              className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                activeView === "upcoming"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <i className="fas fa-clock mr-2"></i>Upcoming
            </button>
            <button
              onClick={() => setActiveView("past")}
              className={`view-switch-btn px-4 py-2 rounded-md font-medium transition-all ${
                activeView === "past"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <i className="fas fa-history mr-2"></i>Past
            </button>
          </div>

          <MentorHeaderAccount
            isProfileDropdownOpen={isProfileDropdownOpen}
            handleProfileDropdownClick={handleProfileDropdownClick}
            user={user}
            mentorDetails={null}
          />
        </div>
      </header>

      <div className="flex">
        <UserSidebar isSidebarOpen={isSidebarOpen} activeTab={3} />

        {/* <div
          id="sidebar-overlay"
          onClick={toggleSidebar}
          className={`${
            isSidebarOpen ? "" : "hidden"
          } md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}
        ></div> */}

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Bookings
                  </h1>
                  <p className="text-gray-600">
                    Manage all your family's learning sessions
                  </p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {getSessionsSummary(upClasses).upcomingSessionCount}
                  </h3>
                  <p className="text-gray-600 text-sm">Upcoming Sessions</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {getSessionsSummary(upClasses).completedSessionCount}
                  </h3>
                  <p className="text-gray-600 text-sm">Completed Sessions</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-graduate text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {upClasses.length}
                  </h3>
                  <p className="text-gray-600 text-sm">Active Mentors</p>
                </div>

                {/* <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-calendar-times text-orange-600 text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">2</h3>
                                    <p className="text-gray-600 text-sm">Needs Reschedule</p>
                                </div> */}
              </div>
            </section>

            {/* Today's Sessions (Priority) */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upcoming's Sessions
                    </h2>
                    <p className="text-gray-600">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                    {getSessionsSummary(upClasses).upcomingSessionCount} sessions
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Sarah's Session */}

                  
                  {upClasses.map((classItem, index) => (
                    <div key={classItem.classId} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold">
                              {classItem.mentorName?.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {classItem.title}
                              </h4>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {classItem.type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              with {classItem.mentorName} • {classItem.type === 'group' ? 'Group Batch' : '1-on-1 Session'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                <i className="fas fa-clock mr-1"></i>
                                {classItem.schedule.weeklySchedule[0].startTime} - {classItem.schedule.weeklySchedule[0].endTime}
                              </span>
                              <span>
                                <i className="fas fa-video mr-1"></i>
                                {classItem.format}
                              </span>
                              <span>
                                <i className="fas fa-circle text-green-500 mr-1"></i>
                                {new Date(classItem.schedule.weeklySchedule[0].date).toLocaleDateString()}
                              </span>
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
                  ))}

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
