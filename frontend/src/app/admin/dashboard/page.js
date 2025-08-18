"use client";
import { useState, useEffect, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { checkAdminAccess } from "@/utils/adminAuth";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const AdminDashboard = () => {
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [classes, setClasses] = useState([]);
  const [pendingClasses, setPendingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalClasses: 0,
    pendingApproval: 0,
    approvedClasses: 0,
    rejectedClasses: 0,
    totalMentors: 0,
    totalStudents: 0
  });

  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Check admin access using utility function
        const accessCheck = checkAdminAccess();
        if (!accessCheck.hasAccess) {
          setError(accessCheck.error);
          setLoading(false);
          return;
        }
        
        setUser(accessCheck.user);

        // Try real API call first, fall back to mock data if it fails
        try {
          // Get auth token from localStorage
          const userData = JSON.parse(localStorage.getItem("user"));
          const token = userData?.access_token;
          
          const config = {
            headers: {
              'Content-Type': 'application/json',
            }
          };
          
          // Add Authorization header if token exists
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }

          const classResponse = await axios.get(
            "https://rootsnwings-api-944856745086.europe-west2.run.app/classes?status=pending_approval&pageSize=50",
            config
          );
          
          if (classResponse.data?.classes) {
            setPendingClasses(classResponse.data.classes);
          }

          const allClassesResponse = await axios.get(
            "https://rootsnwings-api-944856745086.europe-west2.run.app/classes?pageSize=100",
            config
          );
          
          if (allClassesResponse.data?.classes) {
            setClasses(allClassesResponse.data.classes);
            
            const allClasses = allClassesResponse.data.classes;
            const newStats = {
              totalClasses: allClasses.length,
              pendingApproval: allClasses.filter(c => c.status === 'pending_approval').length,
              approvedClasses: allClasses.filter(c => c.status === 'approved').length,
              rejectedClasses: allClasses.filter(c => c.status === 'rejected').length,
              totalMentors: new Set(allClasses.map(c => c.mentorId)).size,
              totalStudents: 0
            };
            setStats(newStats);
            return; // Success, exit early
          }
        } catch (apiError) {
          console.log("API call failed, using mock data:", apiError.message);
        }

        // Fallback to mock data if API fails
        const mockPendingClasses = [
          {
            classId: "class_001",
            title: "Advanced Piano Techniques",
            subject: "Music",
            category: "Classical",
            mentorName: "Sarah Johnson",
            mentorId: "mentor_001",
            status: "pending_approval",
            type: "one-on-one",
            pricing: { perSessionRate: 45 },
            capacity: { maxStudents: 1 },
            createdAt: new Date().toISOString()
          },
          {
            classId: "class_002", 
            title: "Beginner Guitar Workshop",
            subject: "Music",
            category: "Contemporary",
            mentorName: "Mike Wilson",
            mentorId: "mentor_002",
            status: "pending_approval",
            type: "workshop",
            pricing: { perSessionRate: 35 },
            capacity: { maxStudents: 8 },
            createdAt: new Date().toISOString()
          },
          {
            classId: "class_003",
            title: "Watercolor Basics",
            subject: "Art",
            category: "Visual Arts",
            mentorName: "Emma Davis",
            mentorId: "mentor_003", 
            status: "pending_approval",
            type: "batch",
            pricing: { perSessionRate: 25 },
            capacity: { maxStudents: 6 },
            createdAt: new Date().toISOString()
          }
        ];

        const mockAllClasses = [
          ...mockPendingClasses,
          {
            classId: "class_004",
            title: "Math Tutoring",
            subject: "Mathematics", 
            category: "Academic",
            mentorName: "John Smith",
            mentorId: "mentor_004",
            status: "approved",
            type: "one-on-one",
            pricing: { perSessionRate: 40 },
            capacity: { maxStudents: 1 },
            createdAt: new Date().toISOString()
          },
          {
            classId: "class_005",
            title: "Creative Writing",
            subject: "English",
            category: "Language Arts",
            mentorName: "Lisa Chen",
            mentorId: "mentor_005",
            status: "approved", 
            type: "batch",
            pricing: { perSessionRate: 30 },
            capacity: { maxStudents: 10 },
            createdAt: new Date().toISOString()
          }
        ];

        setPendingClasses(mockPendingClasses);
        setClasses(mockAllClasses);
        
        // Calculate stats from mock data
        const newStats = {
          totalClasses: mockAllClasses.length,
          pendingApproval: mockAllClasses.filter(c => c.status === 'pending_approval').length,
          approvedClasses: mockAllClasses.filter(c => c.status === 'approved').length,
          rejectedClasses: mockAllClasses.filter(c => c.status === 'rejected').length,
          totalMentors: new Set(mockAllClasses.map(c => c.mentorId)).size,
          totalStudents: 24 // Mock data
        };
        setStats(newStats);

      } catch (error) {
        console.error("Error loading admin data:", error);
        setError("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, []);

  // Handle window resize for mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicks outside profile dropdown
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle class approval
  const handleClassApproval = async (classId, action) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes${classId}/`,
        { status }
      );
      
      // Remove from pending classes
      setPendingClasses(prev => prev.filter(c => c.classId !== classId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingApproval: prev.pendingApproval - 1,
        approvedClasses: action === 'approve' ? prev.approvedClasses + 1 : prev.approvedClasses,
        rejectedClasses: action === 'reject' ? prev.rejectedClasses + 1 : prev.rejectedClasses
      }));
      
    } catch (error) {
      console.error(`Error ${action}ing class:`, error);
      alert(`Failed to ${action} class. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-primary"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">
              Admin Dashboard
            </h1>
            <span className="hidden md:block text-sm text-gray-500">
              Roots & Wings Management
            </span>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="relative">
          <MentorHeaderAccount
            isProfileDropdownOpen={isProfileDropdownOpen}
            profileDropdownBtnRef={null}
            handleProfileDropdownClick={toggleProfileDropdown}
            profileDropdownRef={null}
            user={user}
            mentorDetails={null}
          />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar isSidebarOpen={isSidebarOpen} activeTab={1} />

        {/* Overlay for mobile sidebar */}
        <div
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
                    Welcome back, {user.displayName || 'Admin'}! 👋
                  </h1>
                  <p className="text-gray-600">
                    Manage classes, mentors, and platform operations
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                  <button 
                    onClick={() => window.location.href = '/admin/classes'}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <i className="fas fa-list mr-2"></i>Manage Classes
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/mentors'}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-users mr-2"></i>Manage Mentors
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats Overview */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-book-open text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalClasses}</h3>
                  <p className="text-gray-600 text-sm">Total Classes</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.pendingApproval}</h3>
                  <p className="text-gray-600 text-sm">Pending Approval</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.approvedClasses}</h3>
                  <p className="text-gray-600 text-sm">Approved Classes</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-times-circle text-red-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.rejectedClasses}</h3>
                  <p className="text-gray-600 text-sm">Rejected Classes</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chalkboard-teacher text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalMentors}</h3>
                  <p className="text-gray-600 text-sm">Active Mentors</p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-graduate text-indigo-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
                  <p className="text-gray-600 text-sm">Total Students</p>
                </div>
              </div>
            </section>

            {/* Pending Classes for Review */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Classes Pending Review
                </h2>
                <a
                  href="/admin/classes"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View All Classes
                </a>
              </div>

              {pendingClasses.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="space-y-0">
                    {pendingClasses.slice(0, 5).map((classItem, index) => (
                      <div key={classItem.classId} className={`p-6 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold">
                              {classItem.subject?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {classItem.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-2">
                                  {classItem.subject} • {classItem.category} • by {classItem.mentorName}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    <i className="fas fa-users mr-1"></i>
                                    {classItem.capacity?.maxStudents || 'N/A'} students max
                                  </span>
                                  <span>
                                    <i className="fas fa-pound-sign mr-1"></i>
                                    £{classItem.pricing?.perSessionRate || 'N/A'}/session
                                  </span>
                                  <span>
                                    <i className="fas fa-calendar mr-1"></i>
                                    {classItem.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => window.location.href = `/admin/classes${classItem.classId}`}
                                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                >
                                  <i className="fas fa-edit mr-1"></i>Review
                                </button>
                                <button 
                                  onClick={() => handleClassApproval(classItem.classId, 'approve')}
                                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                                >
                                  <i className="fas fa-check mr-1"></i>Approve
                                </button>
                                <button 
                                  onClick={() => handleClassApproval(classItem.classId, 'reject')}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                >
                                  <i className="fas fa-times mr-1"></i>Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-check-circle text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    No classes are currently pending review.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button 
                  onClick={() => window.location.href = '/admin/classes'}
                  className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-list text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Classes</h3>
                  <p className="text-gray-600 text-sm">Review, approve, and edit classes</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/admin/mentors'}
                  className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-users text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Mentors</h3>
                  <p className="text-gray-600 text-sm">Review mentor profiles and verification</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-bar text-green-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-sm">Platform insights and reports</p>
                </button>

                <button 
                  onClick={() => window.location.href = '/admin/settings'}
                  className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cog text-gray-600 text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
                  <p className="text-gray-600 text-sm">Platform configuration and settings</p>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
