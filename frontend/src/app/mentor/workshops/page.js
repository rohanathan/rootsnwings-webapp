"use client";
import { navItems } from "@/app/utils";
import MentorSideBase from "@/components/MentorSideBase";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Main App component
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [user, setUser] = useState({});
  const [mentorDetails, setMentorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [workshopData, setWorkshopData] = useState({
    active: [],
    upcoming: [],
    past: [],
    drafts: [],
  });
  const [workshopStats, setWorkshopStats] = useState({
    activeCount: 0,
    totalAttendees: 0,
    avgRating: 0,
    totalEarnings: 0,
  });

  const profileDropdownRef = useRef(null);

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user?.user?.userType !== 'mentor'){
      window.location.href = '/';
    }

    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Handle window resize to auto-hide mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler for "Create Workshop" button clicks
  const handleCreateWorkshop = () => {
    // Navigate to workshop creation page
    window.location.href = "/mentor/hostaclass?type=workshop";
  };

  // Fetch mentor workshops from API
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          window.location.href = "/getstarted";
          return;
        }

        const user = JSON.parse(userData);
        setUser(user.user);

        const mentorData = localStorage.getItem("mentor");
        if (mentorData) {
          setMentorDetails(JSON.parse(mentorData));
        }

        // Fetch workshops (type=workshop only)
        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/?mentorId=${user.user.uid}&type=workshop`
        );
        const workshops = response.data.classes || [];

        console.log("Fetched workshops:", workshops);

        // Categorize workshops
        const active = [];
        const upcoming = [];
        const past = [];
        const drafts = [];
        let totalAttendees = 0;
        let totalEarnings = 0;
        let totalRatings = 0;
        let ratingCount = 0;

        // Process each workshop
        for (const workshop of workshops) {
          try {
            // Fetch bookings for this workshop
            const bookingsResponse = await axios.get(
              `https://rootsnwings-api-944856745086.europe-west2.run.app/bookings/?classId=${workshop.classId}`
            );
            const bookings = bookingsResponse.data.bookings || [];

            // Count confirmed attendees
            const confirmedBookings = bookings.filter(
              (booking) =>
                booking.status === "confirmed" ||
                booking.paymentStatus === "paid"
            );

            totalAttendees += confirmedBookings.length;

            // Calculate earnings
            const workshopEarnings = confirmedBookings.reduce(
              (sum, booking) =>
                sum +
                parseFloat(
                  booking.pricing?.subtotal || workshop.pricing?.subtotal || 0
                ),
              0
            );
            totalEarnings += workshopEarnings;

            // Enhanced workshop object
            const enrichedWorkshop = {
              ...workshop,
              attendeeCount: confirmedBookings.length,
              earnings: workshopEarnings,
              bookings: confirmedBookings,
            };

            // Categorize by status and date
            const now = new Date();
            const workshopDate = workshop.schedule?.startDate
              ? new Date(workshop.schedule.startDate)
              : now;

            if (workshop.status === "pending") {
              drafts.push(enrichedWorkshop);
            } else if (workshopDate < now && workshop.status === "completed") {
              past.push(enrichedWorkshop);
            } else if (workshopDate > now && workshop.status === "approved") {
              if (
                confirmedBookings.length >=
                (workshop.capacity?.minStudents || 1)
              ) {
                active.push(enrichedWorkshop);
              } else {
                upcoming.push(enrichedWorkshop);
              }
            } else {
              active.push(enrichedWorkshop);
            }

            // Mock rating (in real app would fetch from reviews)
            totalRatings += 4.8;
            ratingCount += 1;
          } catch (error) {
            console.error(
              `Error fetching bookings for workshop ${workshop.classId}:`,
              error
            );
            // Add workshop without booking data
            if (workshop.status === "pending") {
              drafts.push(workshop);
            } else {
              active.push(workshop);
            }
          }
        }

        setWorkshopData({ active, upcoming, past, drafts });
        setWorkshopStats({
          activeCount: active.length,
          totalAttendees,
          avgRating: ratingCount > 0 ? totalRatings / ratingCount : 0,
          totalEarnings,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Helper function to get workshop gradient based on subject
  const getWorkshopGradient = (subject) => {
    const gradients = {
      Kathak: "from-purple-100 to-pink-100",
      Philosophy: "from-teal-100 to-cyan-100",
      Music: "from-orange-100 to-yellow-100",
      Dance: "from-pink-100 to-rose-100",
      Art: "from-blue-100 to-indigo-100",
      Yoga: "from-green-100 to-emerald-100",
      default: "from-gray-100 to-slate-100",
    };
    return gradients[subject] || gradients.default;
  };

  // Helper function to get workshop icon based on subject
  const getWorkshopIcon = (subject) => {
    const icons = {
      Kathak: "fas fa-music text-purple-300",
      Philosophy: "fas fa-leaf text-teal-300",
      Music: "fas fa-microphone text-orange-300",
      Dance: "fas fa-users text-pink-300",
      Art: "fas fa-palette text-blue-300",
      Yoga: "fas fa-om text-green-300",
      default: "fas fa-chalkboard-teacher text-gray-300",
    };
    return icons[subject] || icons.default;
  };

  const tagColors = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    indigo: "bg-indigo-100 text-indigo-800",
    teal: "bg-teal-100 text-teal-800",
    rose: "bg-rose-100 text-rose-800",
    pink: "bg-pink-100 text-pink-800",
    cyan: "bg-cyan-100 text-cyan-800",
  };

  const getTabContent = (tab) => {
    switch (tab) {
      case "active":
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            {loading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : workshopData.active.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-calendar-plus text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Active Workshops
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first workshop to start hosting special events
                </p>
                <button
                  onClick={handleCreateWorkshop}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Create Workshop
                </button>
              </div>
            ) : (
              workshopData.active.map((workshop) => (
                <div
                  key={workshop.classId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`aspect-video bg-gradient-to-br ${getWorkshopGradient(
                      workshop.subject
                    )} relative`}
                  >
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {workshop.status}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`${
                          tagColors[
                            workshop.format === "online"
                              ? "green"
                              : workshop.format === "in-person"
                              ? "blue"
                              : "purple"
                          ]
                        } text-xs px-2 py-1 rounded-full font-medium`}
                      >
                        {workshop.format === "in-person"
                          ? "In-person"
                          : workshop.format === "online"
                          ? "Online"
                          : "Hybrid"}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i
                        className={`${getWorkshopIcon(
                          workshop.subject
                        )} text-4xl`}
                      ></i>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {workshop.description}
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-calendar mr-3 text-gray-400"></i>
                        <span>
                          {workshop.schedule?.weeklySchedule?.[0]?.day} •
                          {workshop.schedule?.weeklySchedule?.[0]?.startTime} -
                          {workshop.schedule?.weeklySchedule?.[0]?.endTime}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i
                          className={`${
                            workshop.format === "online"
                              ? "fas fa-globe"
                              : "fas fa-map-marker-alt"
                          } mr-3 text-gray-400`}
                        ></i>
                        <span>
                          {workshop.format === "online"
                            ? "Online via Zoom"
                            : workshop.location || "In-person"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-users mr-3 text-gray-400"></i>
                        <span>
                          {workshop.attendeeCount || 0}/
                          {workshop.capacity?.maxStudents || 0} participants
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-tag mr-3 text-gray-400"></i>
                        <span>
                          {workshop.pricing?.basePrice === 0
                            ? "Free Workshop"
                            : `£${workshop.pricing?.basePrice || 0} per person`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {workshop.subject}
                      </span>
                      <span
                        className={`${
                          tagColors[
                            workshop.format === "online" ? "green" : "blue"
                          ]
                        } text-xs px-2 py-1 rounded-full`}
                      >
                        {workshop.format === "in-person"
                          ? "In-person"
                          : "Online"}
                      </span>
                      {workshop.pricing?.basePrice === 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() =>
                          (window.location.href = `/mentor/classes/${workshop.classId}`)
                        }
                        className="flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium bg-primary text-white hover:bg-primary-dark"
                      >
                        Manage Workshop
                      </button>
                      <button className="flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "upcoming":
        return (
          <div className="space-y-6">
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : workshopData.upcoming.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calendar-plus text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Upcoming Workshops
                </h3>
                <p className="text-gray-600 mb-6">
                  You don't have any scheduled workshops yet.
                </p>
                <button
                  onClick={handleCreateWorkshop}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  Create New Workshop
                </button>
              </div>
            ) : (
              workshopData.upcoming.map((workshop) => (
                <div
                  key={workshop.classId}
                  className="bg-white rounded-xl border border-yellow-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {workshop.title}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                          Needs Students
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {workshop.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <i className="fas fa-calendar mr-2"></i>
                          {new Date(
                            workshop.schedule?.startDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <i className="fas fa-users mr-2"></i>
                          {workshop.attendeeCount || 0}/
                          {workshop.capacity?.minStudents || 0} needed
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                          <i className="fas fa-bullhorn mr-2"></i>Promote
                          Workshop
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "past":
        return (
          <div className="space-y-6">
            {loading ? (
              [1].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                </div>
              ))
            ) : workshopData.past.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-history text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Past Workshops
                </h3>
                <p className="text-gray-600">
                  Your completed workshops will appear here.
                </p>
              </div>
            ) : (
              workshopData.past.map((workshop) => (
                <div
                  key={workshop.classId}
                  className="bg-white rounded-xl border border-green-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {workshop.title}
                        </h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <i className="fas fa-users mr-2"></i>
                          {workshop.attendeeCount || 0} attendees
                        </div>
                        <div>
                          <i className="fas fa-star mr-2"></i>
                          4.8/5 rating
                        </div>
                        <div>
                          <i className="fas fa-pound-sign mr-2"></i>£
                          {(workshop.earnings || 0).toFixed(0)} earned
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm">
                          <i className="fas fa-star mr-2"></i>View Feedback
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "drafts":
        return (
          <div className="space-y-6">
            {loading ? (
              [1].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : workshopData.drafts.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-edit text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Draft Workshops
                </h3>
                <p className="text-gray-600 mb-6">
                  Continue working on your saved workshop drafts.
                </p>
                <button
                  onClick={handleCreateWorkshop}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  Create New Workshop
                </button>
              </div>
            ) : (
              workshopData.drafts.map((workshop) => (
                <div
                  key={workshop.classId}
                  className="bg-white rounded-xl border border-gray-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {workshop.title}
                        </h3>
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                          Draft
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {workshop.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        Created:{" "}
                        {new Date(workshop.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            (window.location.href = `/mentor/hostaclass/edit/${workshop.classId}`)
                          }
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                          <i className="fas fa-edit mr-2"></i>Continue Editing
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          <i className="fas fa-eye mr-2"></i>Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background font-sans">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #f9fbff;
        }
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");
      `}</style>

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
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
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
          <MentorHeaderAccount
            isProfileDropdownOpen={isProfileDropdownOpen}
            handleProfileDropdownClick={toggleProfileDropdown}
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
          activeTab={4}
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Workshops
              </h1>
              <p className="text-gray-600">
                Manage your special events and masterclasses
              </p>
            </div>
            <button
              onClick={handleCreateWorkshop}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Workshop
            </button>
          </div>

          {/* Workshop Stats */}
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
                    icon: "fas fa-calendar-check",
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600",
                    value: workshopStats.activeCount,
                    label: "Active Workshops",
                    change:
                      workshopStats.activeCount > 0
                        ? `+${workshopStats.activeCount}`
                        : "0",
                    changeColor: "text-green-500",
                  },
                  {
                    icon: "fas fa-users",
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    value: workshopStats.totalAttendees,
                    label: "Total Attendees",
                    change: "This month",
                    changeColor: "text-blue-500",
                  },
                  {
                    icon: "fas fa-star",
                    iconBg: "bg-purple-100",
                    iconColor: "text-purple-600",
                    value: workshopStats.avgRating.toFixed(1),
                    label: "Workshop Rating",
                    change: "Avg rating",
                    changeColor: "text-purple-500",
                  },
                  {
                    icon: "fas fa-pound-sign",
                    iconBg: "bg-yellow-100",
                    iconColor: "text-yellow-600",
                    value: `£${workshopStats.totalEarnings.toFixed(0)}`,
                    label: "Workshop Earnings",
                    change:
                      workshopStats.totalEarnings > 0
                        ? `+£${workshopStats.totalEarnings.toFixed(0)}`
                        : "£0",
                    changeColor: "text-green-500",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                      >
                        <i className={`${stat.icon} ${stat.iconColor}`}></i>
                      </div>
                      <span
                        className={`${stat.changeColor} text-sm font-medium`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                ))}
          </div>

          {/* Workshop Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${
                  activeTab === "active"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("active")}
              >
                Active Workshops
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${
                  activeTab === "upcoming"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Events
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${
                  activeTab === "past"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("past")}
              >
                Past Workshops
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${
                  activeTab === "drafts"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("drafts")}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div id={`${activeTab}-tab`} className="tab-content">
            {getTabContent(activeTab)}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        id="sidebar-overlay"
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      ></div>
    </div>
  );
}
