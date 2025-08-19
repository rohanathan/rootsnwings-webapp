"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";
import MentorSideBase from "@/components/MentorSideBase";
import { navItems } from "@/app/utils";
import MentorAvailability from "@/components/MentorAvailability";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Schedule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [availability, setAvailability] = useState({
    availability: [],
    dateRange: { startDate: "", endDate: "" },
    timezone: "Europe/London",
  });
  const [loading, setLoading] = useState(false);
  const [mentorId, setMentorId] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [mentorDetails, setMentorDetails] = useState({});

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Load mentor availability
  const loadAvailability = async () => {
    if (!user || !mentorId) return;
    
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/availability/mentors/${mentorId}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      } else if (response.status === 404) {
        // No availability set yet
        setAvailability({
          availability: [],
          dateRange: { startDate: "", endDate: "" },
          timezone: "Europe/London",
        });
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      setMessage("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  // Save mentor availability
  const saveAvailability = async () => {
    if (!user || !mentorId) {
      setMessage("Please log in to save availability.");
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/availability/mentors/${mentorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify(availability),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
        setMessage("Availability saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage("Failed to save availability");
    } finally {
      setLoading(false);
    }
  };

  // Add day availability
  const addDayAvailability = (day) => {
    const existingIndex = availability.availability.findIndex(
      (d) => d.day === day
    );
    if (existingIndex === -1) {
      setAvailability((prev) => ({
        ...prev,
        availability: [
          ...prev.availability,
          {
            day: day,
            timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
          },
        ],
      }));
    }
  };

  // Remove day availability
  const removeDayAvailability = (day) => {
    setAvailability((prev) => ({
      ...prev,
      availability: prev.availability.filter((d) => d.day !== day),
    }));
  };

  // Update time range
  const updateTimeRange = (day, rangeIndex, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      availability: prev.availability.map((d) => {
        if (d.day === day) {
          const newRanges = [...d.timeRanges];
          newRanges[rangeIndex] = { ...newRanges[rangeIndex], [field]: value };
          return { ...d, timeRanges: newRanges };
        }
        return d;
      }),
    }));
  };

  // Add time range to day
  const addTimeRange = (day) => {
    setAvailability((prev) => ({
      ...prev,
      availability: prev.availability.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            timeRanges: [
              ...d.timeRanges,
              { startTime: "09:00", endTime: "17:00" },
            ],
          };
        }
        return d;
      }),
    }));
  };

  // Remove time range from day
  const removeTimeRange = (day, rangeIndex) => {
    setAvailability((prev) => ({
      ...prev,
      availability: prev.availability.map((d) => {
        if (d.day === day) {
          const newRanges = d.timeRanges.filter((_, i) => i !== rangeIndex);
          return { ...d, timeRanges: newRanges };
        }
        return d;
      }),
    }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setMentorId(currentUser.uid);
        // Get mentor details from localStorage (set by dashboard)
        const mentor = JSON.parse(localStorage.getItem("mentor") || "{}");
        setMentorDetails(mentor);
      } else {
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

  // Load availability when user and mentorId are set
  useEffect(() => {
    if (user && mentorId) {
      loadAvailability();
    }
  }, [user, mentorId]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const isDaySelected = (day) => {
    return availability.availability.some((d) => d.day === day);
  };

  return (
    <>
      <Head>
        <title>Schedule - Roots & Wings</title>
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
            activeTab={5}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <MentorAvailability />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Set Your Availability
                </h1>
                <p className="text-gray-600">
                  Define when you're available for one-on-one sessions
                </p>
              </div>
              <button
                onClick={saveAvailability}
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Availability
                  </>
                )}
              </button>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.includes("success")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Availability Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Weekly Schedule
              </h2>

              {/* Day Selection */}
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const dayData = availability.availability.find(
                    (d) => d.day === day
                  );
                  const isSelected = isDaySelected(day);

                  return (
                    <div
                      key={day}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={day}
                            checked={isSelected}
                            onChange={() =>
                              isSelected
                                ? removeDayAvailability(day)
                                : addDayAvailability(day)
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <label
                            htmlFor={day}
                            className="text-lg font-semibold text-gray-900 cursor-pointer"
                          >
                            {day}
                          </label>
                        </div>
                        {isSelected && (
                          <button
                            onClick={() => addTimeRange(day)}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            <i className="fas fa-plus mr-1"></i>
                            Add Time Slot
                          </button>
                        )}
                      </div>

                      {/* Time Ranges */}
                      {isSelected && dayData && (
                        <div className="space-y-3 ml-8">
                          {dayData.timeRanges.map((range, rangeIndex) => (
                            <div
                              key={rangeIndex}
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={range.startTime}
                                  onChange={(e) =>
                                    updateTimeRange(
                                      day,
                                      rangeIndex,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 rounded px-3 py-2 focus:ring-primary focus:border-primary"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={range.endTime}
                                  onChange={(e) =>
                                    updateTimeRange(
                                      day,
                                      rangeIndex,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 rounded px-3 py-2 focus:ring-primary focus:border-primary"
                                />
                              </div>
                              {dayData.timeRanges.length > 1 && (
                                <button
                                  onClick={() =>
                                    removeTimeRange(day, rangeIndex)
                                  }
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove time slot"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Date Range (Optional) */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Date Range (Optional)
                </h3>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={availability.dateRange?.startDate || ""}
                      onChange={(e) =>
                        setAvailability((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            startDate: e.target.value,
                          },
                        }))
                      }
                      className="border border-gray-300 rounded px-3 py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={availability.dateRange?.endDate || ""}
                      onChange={(e) =>
                        setAvailability((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            endDate: e.target.value,
                          },
                        }))
                      }
                      className="border border-gray-300 rounded px-3 py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={availability.timezone}
                      onChange={(e) =>
                        setAvailability((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded px-3 py-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="Europe/London">London (UTC+0)</option>
                      <option value="America/New_York">New York (UTC-5)</option>
                      <option value="Asia/Kolkata">India (UTC+5:30)</option>
                      <option value="Australia/Sydney">Sydney (UTC+11)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Select the days you're available for one-on-one sessions
                      </li>
                      <li>
                        Add multiple time slots per day (e.g., morning and
                        evening slots)
                      </li>
                      <li>
                        Students will be able to book sessions during your
                        available times
                      </li>
                      <li>You can update your availability anytime</li>
                    </ul>
                  </div>
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
      </body>
    </>
  );
}
