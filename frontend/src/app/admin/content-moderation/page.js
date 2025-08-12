"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { checkAdminAccess } from "@/utils/adminAuth";
import axios from "axios";

const ContentModerationPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  Filter states
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending Review" },
    { value: "reviewed", label: "Reviewed" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" }
  ];

  const typeOptions = [
    { value: "all", label: "All Content Types" },
    { value: "class", label: "Class Content" },
    { value: "profile", label: "Profile Content" },
    { value: "message", label: "Messages" },
    { value: "review", label: "Reviews" },
    { value: "other", label: "Other" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" }
  ];

  const reasonOptions = [
    "Inappropriate content",
    "Spam or misleading",
    "Harassment or bullying", 
    "Hate speech",
    "Violence or harmful content",
    "Copyright violation",
    "Privacy violation",
    "Fake information",
    "Other"
  ];

  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        // Check admin access using utility function
        const accessCheck = checkAdminAccess();
        if (!accessCheck.hasAccess) {
          setError(accessCheck.error);
          setLoading(false);
          return;
        }
        
        setUser(accessCheck.user);

        // Simulate API call - replace with actual endpoint
        const mockReports = [
          {
            id: "report_001",
            type: "class",
            contentId: "class_123",
            contentTitle: "Advanced Piano Lessons",
            reportedBy: "user_456",
            reporterName: "Sarah Johnson",
            reason: "Inappropriate content",
            description: "The class description contains inappropriate language and misleading information about qualifications.",
            status: "pending",
            priority: "medium",
            createdAt: new Date().toISOString(),
            contentPreview: "Learn advanced piano techniques with our certified instructor. We guarantee you'll become a professional pianist in just 30 days!",
            contentAuthor: "John Smith",
            contentAuthorId: "mentor_789"
          },
          {
            id: "report_002", 
            type: "profile",
            contentId: "mentor_234",
            contentTitle: "Mentor Profile - Lisa Chen",
            reportedBy: "user_567",
            reporterName: "Mike Wilson",
            reason: "Fake information",
            description: "This mentor is claiming fake qualifications and credentials that cannot be verified.",
            status: "pending",
            priority: "high",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            contentPreview: "PhD in Music from Harvard University, 20 years experience at Royal Opera House...",
            contentAuthor: "Lisa Chen",
            contentAuthorId: "mentor_234"
          },
          {
            id: "report_003",
            type: "review",
            contentId: "review_345",
            contentTitle: "Review for Guitar Lessons",
            reportedBy: "user_678", 
            reporterName: "Emma Davis",
            reason: "Harassment or bullying",
            description: "This review contains personal attacks against the mentor and inappropriate language.",
            status: "reviewed",
            priority: "high",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            contentPreview: "This mentor is terrible and doesn't know anything. Total waste of money and time. Avoid at all costs!",
            contentAuthor: "Anonymous User",
            contentAuthorId: "user_890"
          },
          {
            id: "report_004",
            type: "message",
            contentId: "msg_456",
            contentTitle: "Private Message",
            reportedBy: "user_789",
            reporterName: "Tom Brown",
            reason: "Spam or misleading",
            description: "Received spam messages promoting external services not related to platform.",
            status: "dismissed",
            priority: "low",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            contentPreview: "Hi! Check out my amazing new course on another platform. Use code SAVE50...",
            contentAuthor: "Spam User",
            contentAuthorId: "user_999"
          }
        ];

        // Filter reports based on current filters
        let filteredReports = mockReports;
        
        if (statusFilter !== "all") {
          filteredReports = filteredReports.filter(r => r.status === statusFilter);
        }
        if (typeFilter !== "all") {
          filteredReports = filteredReports.filter(r => r.type === typeFilter);
        }
        if (priorityFilter !== "all") {
          filteredReports = filteredReports.filter(r => r.priority === priorityFilter);
        }

        setReports(filteredReports);
        setTotalPages(Math.ceil(filteredReports.length / 10));

      } catch (error) {
        console.error("Error loading reports:", error);
        setError("Failed to load content reports");
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, [statusFilter, typeFilter, priorityFilter, currentPage]);

  // Handle report status change
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      // Simulate API call - replace with actual endpoint
      console.log(`Updating report ${reportId} status to ${newStatus}`);
      
      // Update the report in the state
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
      ));
      
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ') || 'Unknown'}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800", 
      low: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority} priority
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      class: "fas fa-book-open",
      profile: "fas fa-user",
      message: "fas fa-comment",
      review: "fas fa-star",
      other: "fas fa-flag"
    };
    
    return typeIcons[type] || "fas fa-flag";
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Loading content reports...</p>
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
            <h1 className="text-2xl font-bold text-primary-dark">Content Moderation</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar isSidebarOpen={isSidebarOpen} activeTab={12} />
        
        <div onClick={toggleSidebar} className={`${isSidebarOpen ? "" : "hidden"} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}></div>

        <main className="flex-1 md:ml-0">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
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
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow-sm">
              {reports.length > 0 ? (
                <div className="space-y-0">
                  {reports.map((report, index) => (
                    <div key={report.id} className={`p-6 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className={`${getTypeIcon(report.type)} text-red-600`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {report.contentTitle}
                                </h4>
                                {getStatusBadge(report.status)}
                                {getPriorityBadge(report.priority)}
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                <span>
                                  <i className="fas fa-flag mr-1"></i>
                                  {report.reason}
                                </span>
                                <span>
                                  <i className="fas fa-user mr-1"></i>
                                  Reported by {report.reporterName}
                                </span>
                                <span>
                                  <i className="fas fa-calendar mr-1"></i>
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                                <span>
                                  <i className="fas fa-tags mr-1"></i>
                                  {report.type}
                                </span>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Report Description:</strong> {report.description}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Content Preview:</strong> "{report.contentPreview}"
                                </p>
                              </div>

                              <div className="text-sm text-gray-500">
                                <span>Content by: {report.contentAuthor} ({report.contentAuthorId})</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button 
                                onClick={() => window.location.href = `/admin/content-moderation/${report.id}`}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                              >
                                <i className="fas fa-eye mr-1"></i>Review
                              </button>
                              
                              {report.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusChange(report.id, 'resolved')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                                  >
                                    <i className="fas fa-check mr-1"></i>Resolve
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(report.id, 'dismissed')}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                                  >
                                    <i className="fas fa-times mr-1"></i>Dismiss
                                  </button>
                                </>
                              )}
                              
                              <select
                                value={report.status}
                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                              >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                              </select>
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
                    <i className="fas fa-shield-alt text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-600">
                    No content reports match your current filter criteria.
                  </p>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.filter(r => r.status === 'pending').length}
                </h3>
                <p className="text-gray-600 text-sm">Pending Review</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.filter(r => r.status === 'resolved').length}
                </h3>
                <p className="text-gray-600 text-sm">Resolved</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.filter(r => r.priority === 'high').length}
                </h3>
                <p className="text-gray-600 text-sm">High Priority</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-line text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {reports.length}
                </h3>
                <p className="text-gray-600 text-sm">Total Reports</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContentModerationPage;
