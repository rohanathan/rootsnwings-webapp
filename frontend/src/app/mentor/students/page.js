"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import MentorSideBase from "@/components/MentorSideBase";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { navItems } from "@/app/utils";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Students() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [mentorDetails, setMentorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [studentStats, setStudentStats] = useState({
    total: 0,
    oneOnOne: 0,
    group: 0,
    avgRating: 0,
  });

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Not authenticated, redirect to login
        window.location.href = '/getstarted';
      }
    });

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
      unsubscribe();
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch students from mentor's bookings
  useEffect(() => {
    const fetchStudents = async (currentUser) => {
      if (!currentUser) return;
      
      try {
        setUser(currentUser);
        
        const mentorData = localStorage.getItem("mentor");
        if (mentorData) {
          const parsedMentorData = JSON.parse(mentorData);
          setMentorDetails(parsedMentorData);
          console.log("Mentor data from localStorage:", parsedMentorData);
        }

        console.log("Fetching students for mentor:", currentUser.uid);
        
        const idToken = await currentUser.getIdToken();

        // Step 1: Fetch all mentor's classes
        const classesResponse = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes?mentorId=${currentUser.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const mentorClasses = classesResponse.data.classes || [];

        console.log("Mentor classes:", mentorClasses);
        console.log("Number of classes found:", mentorClasses.length);

        const studentsMap = new Map(); // Use Map to avoid duplicates
        let totalOneOnOne = 0;
        let totalGroup = 0;
        let totalWorkshop = 0;
        let totalRatings = 0;
        let ratingCount = 0;

        // Step 2: For each class, fetch bookings and extract students
        for (const classObj of mentorClasses) {
          try {
            const bookingsResponse = await axios.get(
              `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings?classId=${classObj.classId}`,
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            const bookings = bookingsResponse.data.bookings || [];

            console.log(`Bookings for class ${classObj.classId}:`, bookings);
            console.log(`Total bookings found: ${bookings.length}`);

            // Filter confirmed bookings - match actual API structure
            const confirmedBookings = bookings.filter(
              (booking) =>
                booking.bookingStatus === "approved" ||
                booking.bookingStatus === "confirmed" ||
                booking.paymentStatus === "paid"
            );

            console.log(
              `Confirmed bookings after filter: ${confirmedBookings.length}`
            );

            // Step 3: For each confirmed booking, fetch student details
            for (const booking of confirmedBookings) {
              if (!booking.studentId) continue;

              try {
                // Check if we already have this student
                if (!studentsMap.has(booking.studentId)) {
                  let studentProfile = null;
                  let studentName = booking.studentName || "Unknown Student";

                  // Try to fetch detailed student profile
                  try {
                    const studentResponse = await axios.get(
                      `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${booking.studentId}`,
                      {
                        headers: {
                          'Authorization': `Bearer ${idToken}`,
                          'Content-Type': 'application/json'
                        }
                      }
                    );
                    studentProfile = studentResponse.data.user;
                    if (studentProfile) {
                      studentName =
                        studentProfile.displayName ||
                        `${studentProfile.firstName} ${studentProfile.lastName}` ||
                        studentName;
                    }
                  } catch (profileError) {
                    console.log(
                      `Could not fetch profile for student ${booking.studentId}, using booking data`
                    );
                  }

                  // Always create student record (even if profile fetch failed)
                  // Determine class type
                  let classType = "group";
                  if (classObj.type === "workshop") {
                    classType = "workshop";
                    totalWorkshop++;
                  } else if (
                    classObj.type === "one-on-one" ||
                    classObj.capacity?.maxStudents === 1
                  ) {
                    classType = "one-on-one";
                    totalOneOnOne++;
                  } else {
                    classType = "group";
                    totalGroup++;
                  }

                  // Create student object
                  const studentData = {
                    id: booking.studentId,
                    name: studentName,
                    initials: getInitials(studentName),
                    initialBg: getRandomBgColor(),
                    type: classType,
                    status: "Active",
                    level: "Beginner", // Default, could be enhanced
                    class: classObj.title,
                    classId: classObj.classId,
                    joinDate: formatJoinDate(booking.bookedAt),
                    age: getAgeCategory(studentProfile?.dateOfBirth),
                    nextSession: getNextSession(classObj.schedule),
                    sessionsCompleted: 0, // Could be calculated from session data
                    rating: 4.8, // Mock rating
                    studentProfile,
                    booking,
                    actionBtns: getActionButtons(classType),
                  };

                  studentsMap.set(booking.studentId, studentData);
                  totalRatings += 4.8;
                  ratingCount += 1;
                } else {
                  // Student already exists, just add class info if it's a different type
                  const existingStudent = studentsMap.get(booking.studentId);
                  // Update with additional class info if needed
                }
              } catch (error) {
                console.error(
                  `Error fetching student ${booking.studentId}:`,
                  error
                );
              }
            }
          } catch (error) {
            console.error(
              `Error fetching bookings for class ${classObj.classId}:`,
              error
            );
            console.error(
              `Full error details:`,
              error.response?.data || error.message
            );
            // Continue with next class instead of breaking the whole process
          }
        }

        const studentsArray = Array.from(studentsMap.values());
        setStudents(studentsArray);

        // Calculate stats
        setStudentStats({
          total: studentsArray.length,
          oneOnOne: totalOneOnOne,
          group: totalGroup + totalWorkshop, // Combine group and workshop
          avgRating: ratingCount > 0 ? totalRatings / ratingCount : 0,
        });

        console.log("Final students data:", studentsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchStudents(currentUser);
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/getstarted';
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper functions
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomBgColor = () => {
    const colors = [
      "bg-primary",
      "bg-purple-500",
      "bg-green-500",
      "bg-primary-dark",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getAgeCategory = (dateOfBirth) => {
    if (!dateOfBirth) return "Adult";
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 13) return `Child (${age} years)`;
    if (age < 18) return `Teen (${age} years)`;
    return `Adult (${age} years)`;
  };

  const getNextSession = (schedule) => {
    if (!schedule?.weeklySchedule?.[0]) return "TBD";
    const { day, startTime } = schedule.weeklySchedule[0];
    return `${day} ${startTime}`;
  };

  const getActionButtons = (classType) => {
    if (classType === "one-on-one") {
      return [
        { text: "Join Session", icon: "fas fa-video", primary: true },
        { text: "Message", icon: "fas fa-envelope", primary: false },
      ];
    } else if (classType === "workshop") {
      return [{ text: "View Workshop", icon: "fas fa-users", primary: false }];
    } else {
      return [{ text: "Message", icon: "fas fa-envelope", primary: false }];
    }
  };

  // Filter and search students
  const filteredStudents = students.filter((student) => {
    const matchesFilter =
      activeFilter === "all" || student.type === activeFilter;
    const matchesSearch =
      searchTerm === "" ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Head>
        <title>Students - Roots & Wings</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-background font-sans min-h-screen">
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
          {/* Sidebar */}

          <MentorSideBase
            isSidebarOpen={isSidebarOpen}
            navItems={navItems}
            activeTab={6}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Students
                </h1>
                <p className="text-gray-600">
                  Manage your student relationships and track their progress
                </p>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
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
              {loading
                ? [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))
                : [
                    {
                      icon: "fas fa-user-graduate",
                      iconBg: "bg-green-100",
                      iconColor: "text-green-600",
                      status: "Total",
                      statusColor: "text-green-500",
                      value: studentStats.total,
                      label: "Active Students",
                    },
                    {
                      icon: "fas fa-user",
                      iconBg: "bg-blue-100",
                      iconColor: "text-blue-600",
                      status: "1-on-1",
                      statusColor: "text-blue-500",
                      value: studentStats.oneOnOne,
                      label: "Individual Students",
                    },
                    {
                      icon: "fas fa-users",
                      iconBg: "bg-purple-100",
                      iconColor: "text-purple-600",
                      status: "Groups",
                      statusColor: "text-purple-500",
                      value: studentStats.group,
                      label: "Group Students",
                    },
                    {
                      icon: "fas fa-star",
                      iconBg: "bg-yellow-100",
                      iconColor: "text-yellow-600",
                      status: "Average",
                      statusColor: "text-yellow-500",
                      value: studentStats.avgRating.toFixed(1),
                      label: "Student Rating",
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

            {/* Student Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterClick("all")}
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${
                    activeFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-filter="all"
                >
                  All Students ({loading ? "..." : students.length})
                </button>
                <button
                  onClick={() => handleFilterClick("one-on-one")}
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${
                    activeFilter === "one-on-one"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-filter="one-on-one"
                >
                  1-on-1 (
                  {loading
                    ? "..."
                    : students.filter((s) => s.type === "one-on-one").length}
                  )
                </button>
                <button
                  onClick={() => handleFilterClick("group")}
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${
                    activeFilter === "group"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-filter="group"
                >
                  Group Classes (
                  {loading
                    ? "..."
                    : students.filter((s) => s.type === "group").length}
                  )
                </button>
                <button
                  onClick={() => handleFilterClick("workshop")}
                  className={`px-4 py-2 rounded-lg transition-colors student-filter ${
                    activeFilter === "workshop"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-filter="workshop"
                >
                  Workshop Attendees (
                  {loading
                    ? "..."
                    : students.filter((s) => s.type === "workshop").length}
                  )
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
                    {activeFilter === "all" && "All Students"}
                    {activeFilter === "one-on-one" && "One-on-One Students"}
                    {activeFilter === "group" && "Group Students"}
                    {activeFilter === "workshop" && "Workshop Attendees"}(
                    {loading ? "..." : filteredStudents.length})
                  </h3>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse"
                        >
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <i className="fas fa-user-graduate text-gray-400 text-xl"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm ? "No students found" : "No students yet"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm
                          ? `No students match "${searchTerm}"`
                          : "Students will appear here once they book your classes"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() =>
                            (window.location.href = "/mentor/hostaclass")
                          }
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <i className="fas fa-plus mr-2"></i>Create a Class
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${student.initialBg}`}
                          >
                            <span className="text-white font-semibold text-lg">
                              {student.initials}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {student.name}
                              </h4>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                {student.status}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  student.level === "Beginner"
                                    ? "bg-blue-100 text-blue-800"
                                    : student.level === "Advanced"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {student.level}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  student.type === "one-on-one"
                                    ? "bg-purple-100 text-purple-800"
                                    : student.type === "workshop"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-indigo-100 text-indigo-800"
                                }`}
                              >
                                {student.type === "one-on-one"
                                  ? "1-on-1"
                                  : student.type === "workshop"
                                  ? "Workshop"
                                  : "Group"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {student.class} • Joined {student.joinDate} •{" "}
                              {student.age}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <i className="fas fa-calendar text-gray-400"></i>
                                <span className="text-gray-600">
                                  Next: {student.nextSession}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <i className="fas fa-chart-line text-gray-400"></i>
                                <span className="text-gray-600">
                                  {student.sessionsCompleted} sessions completed
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <i className="fas fa-star text-yellow-400"></i>
                                <span className="text-gray-600">
                                  {student.rating
                                    ? `${student.rating} rating`
                                    : "No rating"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {student.actionBtns.map((btn, btnIndex) => (
                              <button
                                key={btnIndex}
                                onClick={() => {
                                  if (btn.text.includes("Session")) {
                                    // Navigate to class session
                                    window.location.href = `/mentor/classes${student.classId}/session`;
                                  } else if (btn.text.includes("Workshop")) {
                                    // Navigate to workshop details
                                    window.location.href = `/mentor/classes${student.classId}`;
                                  } else if (btn.text.includes("Message")) {
                                    // Open messaging (could be modal or separate page)
                                    alert("Messaging feature coming soon");
                                  } else if (btn.text.includes("Progress")) {
                                    // Navigate to student progress page
                                    window.location.href = `/mentor/students/${student.id}/progress`;
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                  btn.primary
                                    ? "bg-primary text-white hover:bg-primary-dark"
                                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {btn.icon && (
                                  <i className={`${btn.icon} mr-1`}></i>
                                )}
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
                  )}
                </div>
              </div>
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
      </div>
    </>
  );
}
