"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
 
import { checkAdminAccess } from "@/utils/adminAuth";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const AdminMentorsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending_verification", label: "Pending Verification" },
    { value: "suspended", label: "Suspended" }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "music", label: "Music" },
    { value: "art", label: "Art" },
    { value: "academic", label: "Academic" },
    { value: "technology", label: "Technology" },
    { value: "language", label: "Language" },
    { value: "sports", label: "Sports" }
  ];

  // Load mentors
  useEffect(() => {
    const loadMentors = async () => {
      try {
        // Check admin access using utility function
        const accessCheck = checkAdminAccess();
        if (!accessCheck.hasAccess) {
          setError(accessCheck.error);
          setLoading(false);
          return;
        }
        
        setUser(accessCheck.user);

        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: "20"
        });

        if (searchQuery) params.append("q", searchQuery);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (categoryFilter !== "all") params.append("category", categoryFilter);

        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/?${params}`
        );
        
        if (response.data?.mentors) {
          setMentors(response.data.mentors);
          setTotalPages(response.data.totalPages || 1);
        }

      } catch (error) {
        console.error("Error loading mentors:", error);
        setError("Failed to load mentors");
      } finally {
        setLoading(false);
      }
    };
    
    loadMentors();
  }, [currentPage, searchQuery, statusFilter, categoryFilter]);

  // Handle mentor status change
  const handleStatusChange = async (mentorId, newStatus) => {
    try {
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${mentorId}`,
        { status: newStatus }
      );
      
      // Update the mentor in the state
      setMentors(prev => prev.map(m => 
        m.uid === mentorId ? { ...m, status: newStatus } : m
      ));
      
    } catch (error) {
      console.error("Error updating mentor status:", error);
      alert("Failed to update mentor status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending_verification: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ') || 'Unknown'}
      </span>
    );
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Loading mentors...</p>
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
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="md:hidden text-gray-600 hover:text-primary">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">Manage Mentors</h1>
          </div>
          <MentorHeaderAccount
            isProfileDropdownOpen={isProfileDropdownOpen}
            profileDropdownBtnRef={null}
            handleProfileDropdownClick={toggleProfileDropdown}
            profileDropdownRef={null}
            user={user}
            mentorDetails={null}
          />
        </div> 
      </header>

      <div className="flex">
        <AdminSidebar isSidebarOpen={isSidebarOpen} activeTab={3} />
        
        <div onClick={toggleSidebar} className={`${isSidebarOpen ? "" : "hidden"} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}></div>

        <main className="flex-1 md:ml-0">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search mentors by name, subject, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mentors List */}
            <div className="bg-white rounded-xl shadow-sm">
              {mentors.length > 0 ? (
                <div className="space-y-0">
                  {mentors.map((mentor, index) => (
                    <div key={mentor.uid} className={`p-6 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {mentor.photoURL ? (
                            <img 
                              src={mentor.photoURL} 
                              alt={mentor.displayName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {mentor.displayName?.charAt(0) || 'M'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {mentor.displayName}
                                </h4>
                                {getStatusBadge(mentor.status)}
                                {mentor.isVerified && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    <i className="fas fa-check-circle mr-1"></i>Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {mentor.category} • {mentor.subjects?.join(', ') || 'No subjects listed'}
                              </p>
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>
                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                  {mentor.city}, {mentor.country}
                                </span>
                                <span>
                                  <i className="fas fa-star mr-1"></i>
                                  {mentor.stats?.averageRating?.toFixed(1) || 'No rating'} ({mentor.stats?.totalReviews || 0} reviews)
                                </span>
                                <span>
                                  <i className="fas fa-pound-sign mr-1"></i>
                                  £{mentor.pricing?.hourlyRate || 'N/A'}/hour
                                </span>
                                <span>
                                  <i className="fas fa-users mr-1"></i>
                                  {mentor.stats?.totalStudents || 0} students
                                </span>
                              </div>
                              {mentor.headline && (
                                <p className="text-gray-700 text-sm mt-2 italic">"{mentor.headline}"</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => window.location.href = `/admin/mentors/${mentor.uid}`}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                              >
                                <i className="fas fa-eye mr-1"></i>View Profile
                              </button>
                              
                              <select
                                value={mentor.status}
                                onChange={(e) => handleStatusChange(mentor.uid, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending_verification">Pending Verification</option>
                                <option value="suspended">Suspended</option>
                              </select>

                              <button 
                                onClick={() => window.location.href = `/mentor/directory/${mentor.uid}`}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                              >
                                <i className="fas fa-external-link-alt mr-1"></i>View Public
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-search text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No mentors found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMentorsPage;
