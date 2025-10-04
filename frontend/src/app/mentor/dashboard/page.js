"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import MentorSideBase from "@/components/MentorSideBase";
import { calculateTotalHoursTaught, getUpcomingSessionsCount, navItems } from "@/app/utils/index";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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


// Static session data removed - using dynamic mentor classes

// Static data removed - now using dynamic data from API

// Static rating data removed - now using dynamic mentor stats

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);
  
  // Firebase auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [mentorDetails, setMentorDetails] = useState({});
  const [mentorClasses, setMentorClasses] = useState([]);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [totalHoursTaught, setTotalHoursTaught] = useState(0);
  const [totalBookings, setTotalBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [uniqueStudentCount, setUniqueStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  
  const quickStats = [
    {
      icon: "fas fa-clock",
      title: "Total Hours Taught",
      value: `${totalHoursTaught}`,
      change: "+12%",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-500",
    },
    {
      icon: "fas fa-user-graduate",
      title: "Students Enrolled",
      value: `${uniqueStudentCount}`,
      change: "Total unique",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-gray-500",
    },
    {
      icon: "fas fa-calendar-check",
      title: "Upcoming Sessions",
      value: `${upcomingSessionsCount}`,
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
  

  useEffect(() => {
    const fetchMentorClasses = async (uid, idToken) => {
      try {
        let apiUrl = `https://rootsnwings-api-944856745086.europe-west2.run.app/classes?mentorId=${uid}`;
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
        const classes = response.data.classes || [];
        
        console.log('Fetched mentor classes:', classes);
        setMentorClasses(classes);

        // Fetch all bookings and calculate metrics
        let allBookings = [];
        let totalEarnings = 0;
        let calculatedHours = 0;
        let calculatedUpcoming = 0;
        let uniqueStudents = new Set(); // Track unique students
        
        // Update class capacity with actual enrollment
        const updatedClasses = await Promise.all(classes.map(async (classObj) => {
          try {
            // Fetch bookings for this class
            const bookingsResponse = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/bookings?classId=${classObj.classId}`, {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              }
            });
            const classBookings = bookingsResponse.data.bookings || [];
            allBookings = [...allBookings, ...classBookings];
            
            // Count unique students for this class
            const confirmedBookings = classBookings.filter(booking => 
              booking.status === 'confirmed' || booking.paymentStatus === 'paid'
            );
            
            confirmedBookings.forEach(booking => {
              if (booking.studentId) {
                uniqueStudents.add(booking.studentId);
              }
            });
            
            // Calculate earnings from confirmed/paid bookings
            confirmedBookings.forEach(booking => {
              // Use booking subtotal first, then class pricing as fallback
              const bookingAmount = parseFloat(booking.pricing?.subtotal || 0);
              const classAmount = parseFloat(classObj.pricing?.subtotal || 0);
              totalEarnings += bookingAmount > 0 ? bookingAmount : classAmount;
            });
            
            // Update class with actual enrollment count
            return {
              ...classObj,
              capacity: {
                ...classObj.capacity,
                currentEnrollment: confirmedBookings.length
              }
            };
            
          } catch (error) {
            console.error(`Error fetching bookings for class ${classObj.classId}:`, error);
            return classObj;
          }
        }));
        
        // Calculate hours and upcoming sessions from updated classes
        for (const classObj of updatedClasses) {
          if (classObj.schedule && classObj.schedule.weeklySchedule) {
            calculatedHours += calculateTotalHoursTaught(classObj.schedule);
            calculatedUpcoming += getUpcomingSessionsCount(classObj.schedule);
          }
        }
        
        console.log('Calculated metrics:', { 
          allBookings, 
          totalEarnings, 
          calculatedHours, 
          calculatedUpcoming,
          uniqueStudentCount: uniqueStudents.size 
        });
        
        // Set updated classes with correct enrollment counts
        setMentorClasses(updatedClasses);
        setTotalBookings(allBookings);
        setTotalEarnings(totalEarnings);
        setTotalHoursTaught(calculatedHours);
        setUpcomingSessionsCount(calculatedUpcoming);
        
        // Store unique student count in state
        setUniqueStudentCount(uniqueStudents.size);
        
      } catch (error) {
        console.error('Error fetching mentor classes:', error);
      }
    };



    // Fetch mentor details from API
    const fetchMentorDetails = async (user, idToken) => {
      console.log(user,'user user user');
      
      try {
        if (user?.uid) {
          const response = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${user.uid}`,
            {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const mentorData = response.data?.mentor;
          setMentorDetails(mentorData);
          localStorage.setItem("mentor", JSON.stringify(mentorData));
          await fetchMentorClasses(mentorData.uid, idToken);
          
          // Generate pending tasks based on profile completeness
          const tasks = [];
          if (!mentorData.photoURL || mentorData.photoURL === '') {
            tasks.push({
              text: "Add profile picture",
              subtext: "Increase student trust",
              color: "bg-blue-50",
              dotColor: "bg-blue-500",
              action: "Upload"
            });
          }
          if (!mentorData.backgroundChecked) {
            tasks.push({
              text: "Complete background check",
              subtext: "Required for verification",
              color: "bg-red-50",
              dotColor: "bg-red-500",
              action: "Complete"
            });
          }
          setPendingTasks(tasks);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching mentor details:", error);
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          router.push('/getstarted');
          return;
        }
        setAuthError(error);
        setLoading(false);
      }
    };

    // Firebase auth state listener
    const authInstance = getFirebaseAuth();
    if (!authInstance) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        try {
          setUser(currentUser);
          setAuthLoading(false);

          if (currentUser) {
            // Get Firebase ID token
            const idToken = await currentUser.getIdToken();

            // Verify user is a mentor by calling Firebase auth endpoint
            try {
              const userProfileResponse = await axios.get(
                'https://rootsnwings-api-944856745086.europe-west2.run.app/firebase-auth/me',
                {
                  headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              const userProfile = userProfileResponse.data;
              if (!userProfile.roles.includes('mentor')) {
                router.push('/');
                return;
              }

              // Fetch mentor details with Firebase auth
              await fetchMentorDetails(currentUser, idToken);

            } catch (profileError) {
              console.error('Error fetching user profile:', profileError);
              if (profileError.response?.status === 401) {
                router.push('/getstarted');
                return;
              }
              setAuthError(profileError);
            }
          }
        } catch (error) {
          console.error('Firebase auth error:', error);
          setAuthError(error);
          setAuthLoading(false);
        }
      },
      (error) => {
        console.error('Firebase auth listener error:', error);
        setAuthError(error);
        setAuthLoading(false);
      }
    );

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [router]);


  console.log(totalBookings,'totalBookings totalBookings');


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

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Show loading state while Firebase auth loads
  if (authLoading || loading) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if Firebase auth failed
  if (authError) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard. Please try again.</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/getstarted')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    router.push('/getstarted');
    return null;
  }

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
            <MentorHeaderAccount
              isProfileDropdownOpen={isProfileDropdownOpen}
              handleProfileDropdownClick={handleProfileDropdownClick}
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
                    {mentorClasses.length > 0  &&  mentorClasses.filter(classObj => classObj.status === 'active').length ? mentorClasses.filter(classObj => classObj.status === 'active').slice(0, 3).map((classObj, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 bg-primary rounded-full flex items-center justify-center`}
                          >
                            <span className="text-white font-semibold text-sm">
                              {classObj.title?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {classObj.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {classObj.subject} • {classObj.type}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {classObj.schedule?.weeklySchedule?.[0]?.day} • {classObj.schedule?.weeklySchedule?.[0]?.startTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.location.href = `/mentor/classes${classObj.classId}`}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View Class
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 p-2">
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <i className="fas fa-chalkboard-teacher text-gray-400 text-xl"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Classes Yet</h4>
                        <p className="text-gray-600 mb-4">Start by hosting your first class to see sessions here</p>
                        <button 
                          onClick={() => window.location.href = '/mentor/hostaclass'}
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <i className="fas fa-plus mr-2"></i>Host a Class
                        </button>
                      </div>
                    )}
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
                    {mentorClasses.length > 0 ? mentorClasses.map((classObj, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {classObj.title}
                          </h3>
                          <span
                            className={`${classObj.status === 'approved' ? 'bg-green-100 text-green-800' : classObj.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'} text-xs px-2 py-1 rounded-full font-medium`}
                          >
                            {classObj.status || 'active'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Capacity</p>
                            <p className="font-semibold">{classObj.capacity?.currentEnrollment || 0}/{classObj.capacity?.maxStudents || 0} students</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Schedule</p>
                            <p className="font-semibold">{classObj.schedule?.weeklySchedule?.[0]?.day} • {classObj.schedule?.weeklySchedule?.[0]?.startTime}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Type & Format</p>
                            <p className="font-semibold">{classObj.type} • {classObj.format}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button 
                            onClick={() => window.location.href = `/mentor/classes${classObj.classId}`}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                          >
                            Manage Class
                          </button>
                          <button 
                            onClick={() => window.location.href = `/mentor/classes${classObj.classId}/students`}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                          >
                            View Students
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <i className="fas fa-plus-circle text-gray-400 text-xl"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Classes</h4>
                        <p className="text-gray-600 mb-4">Create your first class to start teaching</p>
                        <button 
                          onClick={() => window.location.href = '/mentor/hostaclass'}
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <i className="fas fa-plus mr-2"></i>Host a Class
                        </button>
                      </div>
                    )}
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
                      {mentorDetails.stats?.avgRating ? mentorDetails.stats.avgRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="flex justify-center mb-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i 
                            key={star}
                            className={`fas fa-star ${
                              star <= Math.round(mentorDetails.stats?.avgRating || 0) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Based on {mentorDetails.stats?.totalReviews || 0} reviews
                    </p>

                    {mentorDetails.stats?.totalReviews > 0 ? (
                      <div className="space-y-2 text-left">
                        <p className="text-sm text-gray-600 text-center">
                          Rating breakdown coming soon
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-2">No reviews yet</p>
                        <p className="text-xs text-gray-400">Start teaching to get your first review!</p>
                      </div>
                    )}
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
