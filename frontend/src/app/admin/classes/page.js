"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
// import AccountDropDown from "@/components/AccountDropDown";
import { checkAdminAccess } from "@/utils/adminAuth";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const AdminClassesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "one-on-one", label: "One-on-One" },
    { value: "batch", label: "Batch Classes" },
    { value: "workshop", label: "Workshops" }
  ];

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
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
        if (typeFilter !== "all") params.append("type", typeFilter);

        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/?${params}`
        );
        
        if (response.data?.classes) {
          setClasses(response.data.classes);
          setTotalPages(response.data.totalPages || 1);
        }

      } catch (error) {
        console.error("Error loading classes:", error);
        setError("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };
    
    loadClasses();
  }, [currentPage, searchQuery, statusFilter, typeFilter]);

  // Handle class status change
  const handleStatusChange = async (classId, newStatus) => {
    try {
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/${classId}/`,
        { status: newStatus }
      );
      
      // Update the class in the state
      setClasses(prev => prev.map(c => 
        c.classId === classId ? { ...c, status: newStatus } : c
      ));
      
    } catch (error) {
      console.error("Error updating class status:", error);
      alert("Failed to update class status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-blue-100 text-blue-800",
      inactive: "bg-gray-100 text-gray-800"
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
          <p className="text-gray-600">Loading classes...</p>
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
            <h1 className="text-2xl font-bold text-primary-dark">Manage Classes</h1>
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
        <AdminSidebar isSidebarOpen={isSidebarOpen} activeTab={2} />
        
        <div onClick={toggleSidebar} className={`${isSidebarOpen ? "" : "hidden"} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}></div>

        <main className="flex-1 md:ml-0">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search classes by title, subject, or mentor..."
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Classes List */}
            <div className="bg-white rounded-xl shadow-sm">
              {classes.length > 0 ? (
                <div className="space-y-0">
                  {classes.map((classItem, index) => (
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
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {classItem.title}
                                </h4>
                                {getStatusBadge(classItem.status)}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {classItem.subject} • {classItem.category} • by {classItem.mentorName}
                              </p>
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>
                                  <i className="fas fa-users mr-1"></i>
                                  {classItem.capacity?.maxStudents || 'N/A'} students max
                                </span>
                                <span>
                                  <i className="fas fa-pound-sign mr-1"></i>
                                  £{classItem.pricing?.perSessionRate || 'N/A'}/session
                                </span>
                                <span>
                                  <i className="fas fa-tag mr-1"></i>
                                  {classItem.type}
                                </span>
                                <span>
                                  <i className="fas fa-calendar mr-1"></i>
                                  {new Date(classItem.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => window.location.href = `/admin/classes/${classItem.classId}`}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                              >
                                <i className="fas fa-edit mr-1"></i>Edit
                              </button>
                              
                              {classItem.status === 'pending_approval' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusChange(classItem.classId, 'approved')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                                  >
                                    <i className="fas fa-check mr-1"></i>Approve
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(classItem.classId, 'rejected')}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                  >
                                    <i className="fas fa-times mr-1"></i>Reject
                                  </button>
                                </>
                              )}
                              
                              {classItem.status === 'approved' && (
                                <select
                                  value={classItem.status}
                                  onChange={(e) => handleStatusChange(classItem.classId, e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                  <option value="approved">Approved</option>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="rejected">Reject</option>
                                </select>
                              )}
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
                    No classes found
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

export default AdminClassesPage;
