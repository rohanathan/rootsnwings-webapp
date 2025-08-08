"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import MentorSideBase from "@/components/MentorSideBase";
import { navItems } from "@/app/utils/index";
import AccountDropDown from "@/components/AccountDropDown";
import axios from "axios";
// Re-creating the Tailwind config for use in the component
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: "#00A2E8",
        "primary-dark": "#00468C",
        "primary-light": "#E6F7FF",
        background: "#F9FBFF",
      },
    },
  },
};

const quickStats = [
  {
    icon: "fas fa-clock",
    title: "Total Hours Taught",
    value: "127",
    change: "+12%",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    changeColor: "text-green-500",
  },
  {
    icon: "fas fa-user-graduate",
    title: "Students Enrolled",
    value: "24",
    change: "+3",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    changeColor: "text-green-500",
  },
  {
    icon: "fas fa-calendar-check",
    title: "Upcoming Sessions",
    value: "8",
    change: "This week",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    changeColor: "text-purple-500",
  },
  {
    icon: "fas fa-pound-sign",
    title: "Earnings This Month",
    value: "£1,840",
    change: "+£240",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    changeColor: "text-green-500",
  },
];

const upcomingSessions = [
  {
    name: "Ananya Mehta",
    subject: "Kathak Basics • 1-on-1",
    time: "Today • 3:00 PM - 4:00 PM",
    initials: "AM",
    color: "bg-primary",
    action: "Join",
  },
  {
    name: "Raj Kumar",
    subject: "Classical Dance Workshop",
    time: "Tomorrow • 10:00 AM - 12:00 PM",
    initials: "RK",
    color: "bg-green-500",
    action: "Reschedule",
  },
  {
    name: "Shreya Patel",
    subject: "Advanced Techniques • 1-on-1",
    time: "Wednesday • 6:00 PM - 7:00 PM",
    initials: "SP",
    color: "bg-purple-500",
    action: "Prepare",
  },
];

const activeClasses = [
  {
    title: "Weekend Kathak Batch (8 weeks)",
    status: "Active",
    statusColor: "bg-green-100 text-green-800",
    students: "6/8 students",
    schedule: "Sat & Sun • 10 AM",
    progress: "Week 3 of 8",
    actions: ["Manage Class", "View Students"],
  },
  {
    title: "Beginner Classical Dance",
    status: "Waiting",
    statusColor: "bg-yellow-100 text-yellow-800",
    students: "2/6 students",
    schedule: "Weekdays • 5 PM",
    progress: "Need 4 more",
    actions: ["Promote Class", "Edit Details"],
  },
];

const pendingTasks = [
  {
    text: "Complete profile verification",
    subtext: "Upload DBS certificate",
    color: "bg-red-50",
    dotColor: "bg-red-500",
    action: "Complete",
  },
  {
    text: "Respond to messages",
    subtext: "3 unread from students",
    color: "bg-yellow-50",
    dotColor: "bg-yellow-500",
    action: "View",
  },
  {
    text: "Add profile picture",
    subtext: "Increase student trust",
    color: "bg-blue-50",
    dotColor: "bg-blue-500",
    action: "Upload",
  },
];

const ratingData = [
  { stars: 5, count: 40, width: "85%" },
  { stars: 4, count: 5, width: "10%" },
  { stars: 3, count: 1, width: "3%" },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);
  const [user, setUser] = useState({});

  const [mentorDetails, setMentorDetails] = useState({});
console.log(mentorDetails,'mentorDetails mentorDetails mentorDetails');

  useEffect(() => {
    // Fetch mentor details from API
    const fetchMentorDetails = async (user) => {
      try {
        if (user?.user?.uid) {
          const response = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${user.user.uid}`
          );
          console.log(response,'response response response');
          
          const mentorData = response.data?.mentor;
          setMentorDetails(mentorData);
          localStorage.setItem('mentor', JSON.stringify(mentorData));
        }
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      }
    };

    // Fix: Add null check to prevent crash when localStorage is empty
    // Error was: "Cannot read properties of null (reading 'user')"
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user && user.user) {
        setUser(user.user);
        fetchMentorDetails(user);
      }
    } else {
      console.warn("No user data found in localStorage - user needs to login");
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileDropdownBtnRef.current &&
        !profileDropdownBtnRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileDropdownRef, profileDropdownBtnRef]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleStatCardClick = (title) => {
    console.log(`Stat card clicked: ${title}`);
    // Add navigation logic here
  };

  return (
    <>
      <Head>
        <title>Mentor Dashboard - Roots & Wings</title>
        {/* <script src="https://cdn.tailwindcss.com"></script> */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
        />
        <style>{`
          html, body { background-color: ${tailwindConfig.theme.extend.colors["background"]}; }
          .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
          /* Custom transitions for sidebar */
          .sidebar-transition {
            transition-property: transform;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </Head>
      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                id="mobile-menu-btn"
                className="md:hidden text-gray-600 hover:text-primary"
                onClick={toggleSidebar}
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

            <AccountDropDown
              isProfileDropdownOpen={isProfileDropdownOpen}
              profileDropdownBtnRef={profileDropdownBtnRef}
              toggleProfileDropdown={toggleProfileDropdown}
              profileDropdownRef={profileDropdownRef}
              user={user}
              mentorDetails={mentorDetails}
            />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <MentorSideBase
            isSidebarOpen={isSidebarOpen}
            navItems={navItems}
            activeTab={1}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user.displayName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">
                    Let's inspire students today.
                  </p>
                  <p className="text-blue-200 text-sm">
                    <i className="fas fa-calendar mr-2"></i>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="hidden md:flex space-x-4">
                  <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    View Dashboard
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = "/mentor/hostaclass")
                    }
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Host Session Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-gray-200 cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => handleStatCardClick(stat.title)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <i
                        className={`${stat.icon} ${stat.iconColor} text-xl`}
                      ></i>
                    </div>
                    <span className={`${stat.changeColor} text-sm font-medium`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Upcoming Sessions */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Your Next Sessions
                    </h2>
                    <a
                      href="#"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      View all
                    </a>
                  </div>

                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 ${session.color} rounded-full flex items-center justify-center`}
                          >
                            <span className="text-white font-semibold text-sm">
                              {session.initials}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {session.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {session.subject}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {session.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors">
                            <i className="fas fa-video mr-1"></i>
                            {session.action}
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 p-2">
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Classes */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Active Classes & Batches
                    </h2>
                    <a
                      href="#"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Manage all
                    </a>
                  </div>

                  <div className="space-y-4">
                    {activeClasses.map((aclass, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {aclass.title}
                          </h3>
                          <span
                            className={`${aclass.statusColor} text-xs px-2 py-1 rounded-full font-medium`}
                          >
                            {aclass.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Students Enrolled</p>
                            <p className="font-semibold">{aclass.students}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Schedule</p>
                            <p className="font-semibold">{aclass.schedule}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Progress</p>
                            <p className="font-semibold">{aclass.progress}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors">
                            {aclass.actions[0]}
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            {aclass.actions[1]}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Pending Tasks */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Pending Tasks
                    </h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      {pendingTasks.length} new
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pendingTasks.map((task, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 ${task.color} rounded-lg`}
                      >
                        <div
                          className={`w-2 h-2 ${task.dotColor} rounded-full`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {task.text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.subtext}
                          </p>
                        </div>
                        <button className="text-xs text-primary hover:underline">
                          {task.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promote Yourself */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-bullhorn text-green-600 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Want more students?
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Boost your profile visibility and attract more learners!
                    </p>

                    <div className="space-y-2">
                      <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                        <i className="fas fa-star mr-2"></i>
                        Add Testimonial
                      </button>
                      <button className="w-full border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors">
                        <i className="fas fa-share mr-2"></i>
                        Share Profile
                      </button>
                      <button className="w-full border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors">
                        <i className="fas fa-award mr-2"></i>
                        Join Spotlight
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rating Summary */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Your Rating
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      4.9
                    </div>
                    <div className="flex justify-center mb-2">
                      <div className="flex text-yellow-400">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Based on 47 reviews
                    </p>

                    <div className="space-y-2 text-left">
                      {ratingData.map((rating, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-xs text-gray-500 w-8">
                            {rating.stars}★
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: rating.width }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {rating.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            id="sidebar-overlay"
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
      </body>
    </>
  );
};

export default Dashboard;
