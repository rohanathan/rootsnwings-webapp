"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import MentorSideBase from "@/components/MentorSideBase";
import { navItems } from "@/app/utils";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

export default function MyClass() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [user, setUser] = useState({});
  const [mentorDetails, setMentorDetails] = useState({});

  const [mentorClasses, setMentorClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState({
    active: [],
    waiting: [],
    completed: [],
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user.user);

    if (user?.user?.userType !== "mentor") {
      window.location.href = "/";
    }

    const mentor = JSON.parse(localStorage.getItem("mentor"));
    setMentorDetails(mentor);

    const fetchClasses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const uid = user.user.uid;

        // Fetch mentor classes using the same endpoint as dashboard
        const classesResponse = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/?mentorId=${uid}`
        );
        const classes = classesResponse.data.classes || [];

        console.log("Fetched mentor classes:", classes);
        setMentorClasses(classes);

        // Categorize classes by status
        const active = [];
        const waiting = [];
        const drafts = [];
        const completed = [];

        // Fetch bookings for each class and categorize
        for (const classObj of classes) {
          try {
            const bookingsResponse = await axios.get(
              `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings/?classId=${classObj.classId}`
            );
            const bookings = bookingsResponse.data.bookings || [];

            // Count confirmed bookings
            const confirmedBookings = bookings.filter(
              (booking) =>
                booking.status === "confirmed" ||
                booking.paymentStatus === "paid"
            );

            // Add enrollment data to class
            const enrichedClass = {
              ...classObj,
              enrolledCount: confirmedBookings.length,
              bookings: confirmedBookings,
              revenue: confirmedBookings.reduce(
                (sum, booking) =>
                  sum +
                  parseFloat(
                    booking.pricing?.subtotal || classObj.pricing?.subtotal || 0
                  ),
                0
              ),
            };

            // Categorize based on class status and enrollment
            if (
              classObj.status === "approved" &&
              confirmedBookings.length >= (classObj.capacity?.minStudents || 1)
            ) {
              active.push(enrichedClass);
            } else if (
              classObj.status === "approved" &&
              confirmedBookings.length < (classObj.capacity?.minStudents || 1)
            ) {
              waiting.push(enrichedClass);
            } else if (classObj.status === "pending") {
              drafts.push(enrichedClass);
            } else if (classObj.status === "completed") {
              completed.push(enrichedClass);
            }
          } catch (error) {
            console.error(
              `Error fetching bookings for class ${classObj.classId}:`,
              error
            );
            // Add class without booking data
            active.push(classObj);
          }
        }

        setClassData({ active, waiting, drafts, completed });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
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
      const profileDropdownBtn = document.getElementById(
        "profile-dropdown-btn"
      );
      const profileDropdown = document.getElementById("profile-dropdown");
      if (
        profileDropdownBtn &&
        profileDropdown &&
        !profileDropdownBtn.contains(e.target) &&
        !profileDropdown.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);

    // Auto-hide mobile sidebar on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Static classData removed - now using dynamic data from API

  // Dynamic stats are now calculated in the JSX section below

  return (
    <>
      <Head>
        <title>My Classes - Roots & Wings</title>
        <script
          dangerouslySetInnerHTML={{
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
          `,
          }}
        ></script>
      </Head>

      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                id="mobile-menu-btn"
                onClick={handleMobileMenuClick}
                className="md:hidden text-gray-600 hover:text-primary"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">
                Roots & Wings
              </h1>
              <span className="hidden md:block text-sm text-gray-500">
                Mentor Portal
              </span>
            </div>

            {/* Right: Profile Dropdown */}
            <MentorHeaderAccount
              isProfileDropdownOpen={isProfileDropdownOpen}
              handleProfileDropdownClick={handleProfileDropdownClick}
              user={user}
              mentorDetails={mentorDetails}
            />
          </div>
        </header>

        <div className="flex">
          <MentorSideBase
            isSidebarOpen={isSidebarOpen}
            navItems={navItems}
            activeTab={2}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Classes
                </h1>
                <p className="text-gray-600">
                  Manage your ongoing courses and regular sessions
                </p>
              </div>
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                <i className="fas fa-plus mr-2"></i>
                Create New Class
              </button>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {loading
                ? // Loading skeleton
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))
                : [
                    {
                      icon: "fas fa-play-circle",
                      iconBg: "bg-green-100",
                      iconColor: "text-green-600",
                      status: "Active",
                      statusColor: "text-green-500",
                      value: classData.active.length,
                      label: "Running Classes",
                    },
                    {
                      icon: "fas fa-users",
                      iconBg: "bg-blue-100",
                      iconColor: "text-blue-600",
                      status: "Total",
                      statusColor: "text-blue-500",
                      value:
                        classData.active.reduce(
                          (sum, cls) => sum + (cls.enrolledCount || 0),
                          0
                        ) +
                        classData.waiting.reduce(
                          (sum, cls) => sum + (cls.enrolledCount || 0),
                          0
                        ),
                      label: "Enrolled Students",
                    },
                    {
                      icon: "fas fa-hourglass-half",
                      iconBg: "bg-yellow-100",
                      iconColor: "text-yellow-600",
                      status: "Waiting",
                      statusColor: "text-yellow-500",
                      value: classData.waiting.length,
                      label: "Need Students",
                    },
                    {
                      icon: "fas fa-pound-sign",
                      iconBg: "bg-purple-100",
                      iconColor: "text-purple-600",
                      status: "Total earned",
                      statusColor: "text-green-500",
                      value: `£${classData.active
                        .reduce((sum, cls) => sum + (cls.revenue || 0), 0)
                        .toFixed(0)}`,
                      label: "Class Revenue",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}
                        >
                          <i className={`${stat.icon} ${stat.iconColor}`}></i>
                        </div>
                        <span
                          className={`${stat.statusColor} text-sm font-medium`}
                        >
                          {stat.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                  ))}
            </div>

            {/* Class Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${
                    activeTab === "active"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabClick("active")}
                >
                  Active Classes (
                  {
                    mentorClasses.filter(
                      (classObj) => classObj.status === "active"
                    ).length
                  }
                  )
                </button>
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${
                    activeTab === "waiting"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabClick("waiting")}
                >
                  Pending Approval (
                  {
                    mentorClasses.filter(
                      (classObj) => classObj.status === "pending"
                    ).length
                  }
                  )
                </button>
                <button
                  className={`px-6 py-3 border-b-2 font-semibold class-tab ${
                    activeTab === "completed"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabClick("completed")}
                >
                  Completed (
                  {
                    mentorClasses.filter(
                      (classObj) => classObj.status === "completed"
                    ).length
                  }
                  )
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl text-primary mb-4"></i>
                  <p className="text-gray-600">Loading your classes...</p>
                </div>
              ) : activeTab === "active" &&
                mentorClasses.filter(
                  (classObj) => classObj.status === "approved"
                ).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-chalkboard-teacher text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Active Classes
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first class to begin teaching
                  </p>
                  <button
                    onClick={() =>
                      (window.location.href = "/mentor/hostaclass")
                    }
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>Create Your First Class
                  </button>
                </div>
              ) : (
                activeTab === "active" &&
                mentorClasses
                  .filter((classObj) => classObj.status === "approved")
                  .map((classItem, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {classItem.title}
                            </h3>
                            <span
                              className={`${
                                classItem.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : classItem.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              } text-xs px-2 py-1 rounded-full font-medium`}
                            >
                              {classItem.status}
                            </span>
                            <span
                              className={`${
                                classItem.format === "in-person"
                                  ? "bg-blue-100 text-blue-800"
                                  : classItem.format === "online"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              } text-xs px-2 py-1 rounded-full font-medium`}
                            >
                              {classItem.format === "in-person"
                                ? "In-person"
                                : classItem.format === "online"
                                ? "Online"
                                : "Hybrid"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {classItem.description}
                          </p>

                          <div className="grid md:grid-cols-4 gap-6 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Students Enrolled
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {classItem.enrolledCount || 0}/
                                {classItem.capacity?.maxStudents || 0} students
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`${
                                    (classItem.enrolledCount /
                                      classItem.capacity?.maxStudents) *
                                      100 >
                                    50
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  } h-2 rounded-full`}
                                  style={{
                                    width: `${
                                      (classItem.enrolledCount /
                                        classItem.capacity?.maxStudents) *
                                        100 || 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Schedule</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {classItem.schedule?.weeklySchedule?.[0]?.day}
                              </p>
                              <p className="text-sm text-gray-600">
                                {
                                  classItem.schedule?.weeklySchedule?.[0]
                                    ?.startTime
                                }{" "}
                                -{" "}
                                {
                                  classItem.schedule?.weeklySchedule?.[0]
                                    ?.endTime
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {classItem.schedule?.totalSessions || 0}{" "}
                                sessions
                              </p>
                              <p className="text-sm text-gray-600">
                                {classItem.type}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Revenue</p>
                              <p className="text-lg font-semibold text-green-600">
                                £{(classItem.revenue || 0).toFixed(0)}
                              </p>
                              <p className="text-sm text-gray-600">
                                £{classItem.pricing?.basePrice || 0}/session
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {classItem.subject}
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                              {classItem.format}
                            </span>
                            {classItem.pricing?.discountPercentage && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                {classItem.pricing.discountPercentage}% off
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button className="text-gray-500 hover:text-gray-700 p-2">
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            (window.location.href = `/mentor/classes/${classItem.classId}`)
                          }
                          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-primary text-white hover:bg-primary-dark"
                        >
                          <i className="fas fa-users mr-2"></i>
                          View Students ({classItem.enrolledCount || 0})
                        </button>
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                          <i className="fas fa-calendar mr-2"></i>
                          Manage Schedule
                        </button>
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                          <i className="fas fa-edit mr-2"></i>
                          Edit Class
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {activeTab === "waiting" &&
                mentorClasses.filter(
                  (classObj) => classObj.status === "pending"
                ).length > 0 &&
                mentorClasses
                  .filter((classObj) => classObj.status === "pending")
                  .map((classItem, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-yellow-300 p-6"
                    >
                      123
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {classItem.title}
                            </h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              Pending Approval
                            </span>
                            <span
                              className={`${
                                classItem.format === "in-person"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              } text-xs px-2 py-1 rounded-full font-medium`}
                            >
                              {classItem.format === "in-person"
                                ? "In-person"
                                : "Online"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {classItem.description}
                          </p>

                          <div className="grid md:grid-cols-4 gap-6 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Students Enrolled
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {classItem.enrolledCount || 0}/
                                {classItem.capacity?.minStudents || 0} needed
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      ((classItem.enrolledCount || 0) /
                                        (classItem.capacity?.minStudents ||
                                          1)) *
                                        100 || 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Schedule</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {classItem.schedule?.weeklySchedule?.[0]?.day}
                              </p>
                              <p className="text-sm text-gray-600">
                                {
                                  classItem.schedule?.weeklySchedule?.[0]
                                    ?.startTime
                                }{" "}
                                -{" "}
                                {
                                  classItem.schedule?.weeklySchedule?.[0]
                                    ?.endTime
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-lg font-semibold text-orange-600">
                                Need{" "}
                                {(classItem.capacity?.minStudents || 0) -
                                  (classItem.enrolledCount || 0)}{" "}
                                more
                              </p>
                              <p className="text-sm text-gray-600">
                                to start class
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Potential Revenue
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                £
                                {(
                                  (classItem.capacity?.maxStudents || 0) *
                                  (classItem.pricing?.basePrice || 0) *
                                  (classItem.schedule?.totalSessions || 1)
                                ).toFixed(0)}
                              </p>
                              <p className="text-sm text-gray-600">when full</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {classItem.subject}
                            </span>
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              Under-enrolled
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600">
                          <i className="fas fa-bullhorn mr-2"></i>
                          Promote Class
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/mentor/classes/${classItem.classId}`)
                          }
                          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <i className="fas fa-users mr-2"></i>
                          View Students ({classItem.enrolledCount || 0})
                        </button>
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                          <i className="fas fa-edit mr-2"></i>
                          Edit Details
                        </button>
                      </div>
                    </div>
                  ))}

              {activeTab === "completed" && classData.completed.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-check-circle text-green-300 text-6xl mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Completed Classes Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your finished courses and their student feedback will appear
                    here
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Complete your first class to see results and feedback</p>
                  </div>
                </div>
              ) : (
                activeTab === "completed" &&
                classData.completed.map((classItem, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-green-300 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {classItem.title}
                          </h3>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Completed
                          </span>
                          <span
                            className={`${
                              classItem.format === "in-person"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            } text-xs px-2 py-1 rounded-full font-medium`}
                          >
                            {classItem.format === "in-person"
                              ? "In-person"
                              : "Online"}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {classItem.description}
                        </p>

                        <div className="grid md:grid-cols-4 gap-6 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Students Completed
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classItem.enrolledCount || 0} students
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classItem.schedule?.totalSessions || 0} sessions
                            </p>
                            <p className="text-sm text-gray-600">Completed</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Rating</p>
                            <p className="text-lg font-semibold text-gray-900">
                              4.8/5
                            </p>
                            <p className="text-sm text-gray-600">
                              Average rating
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Revenue
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              £{(classItem.revenue || 0).toFixed(0)}
                            </p>
                            <p className="text-sm text-gray-600">Earned</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            {classItem.subject}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Success
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-primary text-white hover:bg-primary-dark">
                        <i className="fas fa-star mr-2"></i>
                        View Feedback
                      </button>
                      <button className="px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                        <i className="fas fa-users mr-2"></i>
                        View Students
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div
          id="sidebar-overlay"
          onClick={handleSidebarOverlayClick}
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${
            isSidebarOpen ? "" : "hidden"
          }`}
        ></div>
      </body>
    </>
  );
}
