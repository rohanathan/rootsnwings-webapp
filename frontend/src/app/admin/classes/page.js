"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
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
  
  // Modal states
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [actionMessage, setActionMessage] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" }
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "group", label: "Group Classes" },
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
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes?${params}`
        );
        
        if (response.data?.classes) {
          console.log("Loaded classes:", response.data.classes);
          console.log("First class status:", response.data.classes[0]?.status);
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

  // Handle opening view details modal
  const handleViewDetails = (classItem) => {
    console.log("Opening details for class:", classItem);
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  // Handle approve/reject action
  const handleClassAction = (classItem, action) => {
    console.log(`${action}ing class:`, classItem);
    setSelectedClass(classItem);
    setActionType(action);
    setActionMessage("");
    setIsActionModalOpen(true);
  };

  // Submit approve/reject with message
  const submitClassAction = async () => {
    if (!actionMessage.trim()) {
      alert("Please provide a message for this action.");
      return;
    }

    try {
      let updatePayload = {};
      
      if (actionType === 'approve') {
        // On approval: set all admin checks to true, update review status, clear admin notes
        updatePayload = {
          approvalWorkflow: {
            ...selectedClass.approvalWorkflow,
            reviewStatus: "approved",
            reviewedAt: new Date().toISOString(),
            reviewedBy: user.uid || "admin"
          },
          adminChecks: {
            capacityReasonable: true,
            contentClear: true,
            mentorQualified: true,
            pricingValid: true,
            scheduleValid: true
          },
          adminNotes: "", // Clear notes on approval
          status: "approved" // Set status to approved
        };
      } else {
        // On rejection: update review status, add admin notes
        updatePayload = {
          approvalWorkflow: {
            ...selectedClass.approvalWorkflow,
            reviewStatus: "rejected",
            reviewedAt: new Date().toISOString(),
            reviewedBy: user.uid || "admin"
          },
          adminNotes: actionMessage, // Store rejection reason
          status: "rejected"
        };
      }
      
      console.log("Sending update payload:", updatePayload);
      
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes${selectedClass.classId}`,
        updatePayload
      );
      
      // Remove the class from the list (since it's no longer pending)
      setClasses(prev => prev.filter(c => c.classId !== selectedClass.classId));
      
      // Close modal and reset states
      setIsActionModalOpen(false);
      setActionMessage("");
      setActionType("");
      setSelectedClass(null);
      
      alert(`Class ${actionType}d successfully! The mentor will be notified.`);
      
    } catch (error) {
      console.error(`Error ${actionType}ing class:`, error);
      alert(`Failed to ${actionType} class. Please try again.`);
    }
  };

  // Handle class status change for other statuses
  const handleStatusChange = async (classId, newStatus) => {
    try {
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes${classId}/`,
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
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
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
                                onClick={() => handleViewDetails(classItem)}
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                              >
                                <i className="fas fa-eye mr-1"></i>View Details
                              </button>
                              
                              {classItem.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleClassAction(classItem, 'approve')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                                  >
                                    <i className="fas fa-check mr-1"></i>Approve
                                  </button>
                                  <button 
                                    onClick={() => handleClassAction(classItem, 'reject')}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                  >
                                    <i className="fas fa-times mr-1"></i>Reject
                                  </button>
                                </>
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

      {/* Class Details Modal */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Class Details</h2>
              <button 
                onClick={() => {setIsModalOpen(false); setSelectedClass(null);}}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Class Header */}
              <div className="border-b border-gray-200 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass?.title || 'Untitled Class'}</h1>
                <p className="text-gray-600 mb-4">
                  {selectedClass?.subject || 'Unknown Subject'} • {selectedClass?.category || 'Unknown Category'} • by {selectedClass?.mentorName || 'Unknown Mentor'}
                </p>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(selectedClass?.status)}
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-calendar mr-1"></i>
                    Created {selectedClass?.createdAt ? new Date(selectedClass.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </span>
                  {selectedClass?.approvalWorkflow?.reviewStatus && (
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-clipboard-check mr-1"></i>
                      Review: {selectedClass.approvalWorkflow.reviewStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Description:</span>
                        <p className="text-gray-900">{selectedClass?.description || "No description provided"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Level:</span>
                          <p className="text-gray-900">{selectedClass?.level || "Not specified"}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Age Group:</span>
                          <p className="text-gray-900">{selectedClass?.ageGroup || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Format:</span>
                          <p className="text-gray-900">{selectedClass?.format || "Not specified"}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Type:</span>
                          <p className="text-gray-900">{selectedClass?.type || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mentor Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Name:</span>
                        <p className="text-gray-900">{selectedClass?.mentorName || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mentor ID:</span>
                        <p className="text-gray-900 font-mono text-sm">{selectedClass?.mentorId || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Capacity */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Per Session:</span>
                        <p className="text-gray-900">£{selectedClass?.pricing?.perSessionRate || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Total Sessions:</span>
                        <p className="text-gray-900">{selectedClass?.pricing?.totalSessions || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                        <p className="text-gray-900">£{selectedClass?.pricing?.subtotal || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Currency:</span>
                        <p className="text-gray-900">{selectedClass?.pricing?.currency || 'GBP'}</p>
                      </div>
                      {selectedClass.pricing?.discount && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Discount:</span>
                          <p className="text-gray-900">{selectedClass.pricing.discount.percentage}% ({selectedClass.pricing.discount.reason})</p>
                        </div>
                      )}
                      {selectedClass.pricing?.total && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Final Total:</span>
                          <p className="text-gray-900 font-semibold">£{selectedClass.pricing.total}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capacity Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Max Students:</span>
                        <p className="text-gray-900">{selectedClass?.capacity?.maxStudents || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Min Students:</span>
                        <p className="text-gray-900">{selectedClass?.capacity?.minStudents || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Current Enrollment:</span>
                        <p className="text-gray-900">{selectedClass?.capacity?.currentEnrollement || selectedClass?.capacity?.currentEnrollment || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  {selectedClass?.schedule && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Information</h3>
                      <div className="space-y-3">
                        {selectedClass.schedule.startDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Start Date:</span>
                            <p className="text-gray-900">{new Date(selectedClass.schedule.startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedClass.schedule.endDate && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">End Date:</span>
                            <p className="text-gray-900">{new Date(selectedClass.schedule.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedClass.schedule.sessionDuration && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Session Duration:</span>
                            <p className="text-gray-900">{selectedClass.schedule.sessionDuration} minutes</p>
                          </div>
                        )}
                        {selectedClass.schedule.weeklySchedule && selectedClass.schedule.weeklySchedule.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Weekly Schedule:</span>
                            <div className="mt-2 space-y-1">
                              {selectedClass.schedule.weeklySchedule.map((slot, index) => (
                                <p key={index} className="text-gray-900 bg-gray-50 px-2 py-1 rounded text-sm">
                                  {slot.day}: {slot.startTime} - {slot.endTime}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin Checks */}
                  {selectedClass?.adminChecks && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Checks</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${selectedClass.adminChecks.capacityReasonable ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}`}></i>
                          <span className="text-sm">Capacity Reasonable</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${selectedClass.adminChecks.contentClear ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}`}></i>
                          <span className="text-sm">Content Clear</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${selectedClass.adminChecks.mentorQualified ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}`}></i>
                          <span className="text-sm">Mentor Qualified</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${selectedClass.adminChecks.pricingValid ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}`}></i>
                          <span className="text-sm">Pricing Valid</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className={`fas ${selectedClass.adminChecks.scheduleValid ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}`}></i>
                          <span className="text-sm">Schedule Valid</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Meta */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Class ID:</span>
                    <p className="font-mono">{selectedClass?.classId || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p>{selectedClass?.createdAt ? new Date(selectedClass.createdAt).toLocaleString() : 'Unknown'}</p>
                  </div>
                  {selectedClass?.updatedAt && (
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <p>{new Date(selectedClass.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedClass?.approvalWorkflow?.reviewedAt && (
                    <div>
                      <span className="text-gray-500">Last Reviewed:</span>
                      <p>{new Date(selectedClass.approvalWorkflow.reviewedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedClass?.adminNotes && (
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Admin Notes:</span>
                      <p className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg mt-1">{selectedClass.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject with Message) */}
      {isActionModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Class
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  You are about to <strong>{actionType}</strong> the class: 
                </p>
                <p className="font-semibold text-gray-900">{selectedClass?.title || 'Unknown Class'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  by {selectedClass?.mentorName || 'Unknown Mentor'} • {selectedClass?.subject || 'Unknown Subject'}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to mentor (required):
                </label>
                <textarea
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  placeholder={`Enter your reason for ${actionType}ing this class...`}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button 
                  onClick={() => {setIsActionModalOpen(false); setActionMessage(""); setActionType(""); setSelectedClass(null);}}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitClassAction}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                    actionType === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve Class' : 'Reject Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassesPage;
