"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
//import AccountDropDown from "@/components/AccountDropDown";
import axios from "axios";

const ReportDetailPage = () => {
  const params = useParams();
  const reportId = params.reportId;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [isTakingAction, setIsTakingAction] = useState(false);

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.user?.uid) {
          setError("Admin access required. Please log in.");
          setLoading(false);
          return;
        }
        
        setUser(userData.user);
        
        // Check admin role
        if (
          !(userData?.user?.roles?.includes("admin"))
        ) {
          setError("Admin access required. Insufficient permissions.");
          setLoading(false);
          return;
        }

        // Mock report data - replace with actual API call
        const mockReport = {
          id: reportId,
          type: "class",
          contentId: "class_123",
          contentTitle: "Advanced Piano Lessons",
          reportedBy: "user_456",
          reporterName: "Sarah Johnson",
          reporterEmail: "sarah.johnson@email.com",
          reason: "Inappropriate content",
          description: "The class description contains inappropriate language and misleading information about qualifications.",
          status: "pending",
          priority: "medium",
          createdAt: new Date().toISOString(),
          contentPreview: "Learn advanced piano techniques with our certified instructor. We guarantee you'll become a professional pianist in just 30 days! Don't waste time with other teachers who don't know what they're doing.",
          fullContent: `
            <h2>Advanced Piano Lessons - Master Level Course</h2>
            <p>Learn advanced piano techniques with our certified instructor. We guarantee you'll become a professional pianist in just 30 days! Don't waste time with other teachers who don't know what they're doing.</p>
            
            <h3>What You'll Learn:</h3>
            <ul>
              <li>Advanced classical techniques</li>
              <li>Jazz improvisation</li>
              <li>Professional performance skills</li>
              <li>Recording studio techniques</li>
            </ul>
            
            <h3>About Your Instructor:</h3>
            <p>John Smith has been playing piano for over 20 years and has performed at Carnegie Hall multiple times. He holds a PhD in Music Performance from Juilliard and has taught thousands of students to professional level.</p>
            
            <p><strong>SPECIAL OFFER:</strong> Book now and get 50% off! This offer won't last long as I'm the best piano teacher in the country!</p>
          `,
          contentAuthor: "John Smith",
          contentAuthorId: "mentor_789",
          contentAuthorEmail: "john.smith@email.com",
          previousReports: [
            {
              id: "prev_001",
              reason: "Misleading information",
              date: "2024-01-15",
              status: "dismissed"
            }
          ],
          adminNotes: [],
          relatedContent: [
            {
              type: "Other classes by this mentor",
              items: ["Beginner Piano Basics", "Music Theory Fundamentals"]
            }
          ]
        };

        setReport(mockReport);

      } catch (error) {
        console.error("Error loading report data:", error);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };
    
    if (reportId) {
      loadReportData();
    }
  }, [reportId]);

  const handleAction = async (action) => {
    setIsTakingAction(true);
    try {
      // Simulate API call - replace with actual endpoint
      console.log(`Taking action: ${action} on report ${reportId}`);
      console.log("Notes:", actionNotes);
      
      // Update report status
      setReport(prev => ({
        ...prev,
        status: action,
        adminNotes: [...prev.adminNotes, {
          action,
          notes: actionNotes,
          adminId: user.uid,
          adminName: user.displayName,
          timestamp: new Date().toISOString()
        }]
      }));
      
      setActionNotes("");
      alert(`Report has been ${action} successfully!`);
      
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      alert(`Failed to ${action} report. Please try again.`);
    } finally {
      setIsTakingAction(false);
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityStyles[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority} priority
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
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Report not found"}</p>
          <button 
            onClick={() => window.location.href = '/admin/content-moderation'}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Reports
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
            <button 
              onClick={() => window.location.href = '/admin/content-moderation'}
              className="text-gray-600 hover:text-primary"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Reports
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">Report Details</h1>
          </div>
          <AccountDropDown
            isProfileDropdownOpen={isProfileDropdownOpen}
            profileDropdownBtnRef={null}
            toggleProfileDropdown={toggleProfileDropdown}
            profileDropdownRef={null}
            user={user}
            mentorDetails={null}
          />
        </div>
      </header>

      <div className="flex">
        <AdminSidebar isSidebarOpen={isSidebarOpen} activeTab={12} />
        
        <div onClick={toggleSidebar} className={`${isSidebarOpen ? "" : "hidden"} md:hidden fixed inset-0 bg-black bg-opacity-50 z-20`}></div>

        <main className="flex-1 md:ml-0">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Report Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {report.contentTitle}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Report #{report.id} • {report.type} content
                  </p>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-calendar mr-1"></i>
                      Reported {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAction('resolved')}
                        disabled={isTakingAction}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-check mr-2"></i>Resolve
                      </button>
                      <button 
                        onClick={() => handleAction('dismissed')}
                        disabled={isTakingAction}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-times mr-2"></i>Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Report Details */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-500 mb-1">Reason for Report:</span>
                      <p className="text-gray-900">{report.reason}</p>
                    </div>
                    
                    <div>
                      <span className="block text-sm font-medium text-gray-500 mb-1">Reporter's Description:</span>
                      <p className="text-gray-900">{report.description}</p>
                    </div>
                    
                    <div>
                      <span className="block text-sm font-medium text-gray-500 mb-1">Reported by:</span>
                      <p className="text-gray-900">{report.reporterName} ({report.reporterEmail})</p>
                    </div>
                  </div>
                </div>

                {/* Content Under Review */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Under Review</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.fullContent }}></div>
                  </div>
                </div>

                {/* Action Notes */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Action</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action Notes (Required for resolution)
                      </label>
                      <textarea
                        rows="4"
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Explain the action taken and reasoning..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleAction('resolved')}
                        disabled={isTakingAction || !actionNotes.trim()}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isTakingAction ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</>
                        ) : (
                          <><i className="fas fa-check mr-2"></i>Resolve Report</>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => handleAction('dismissed')}
                        disabled={isTakingAction || !actionNotes.trim()}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-times mr-2"></i>Dismiss Report
                      </button>
                      
                      <button 
                        onClick={() => handleAction('escalated')}
                        disabled={isTakingAction || !actionNotes.trim()}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <i className="fas fa-arrow-up mr-2"></i>Escalate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Admin Notes History */}
                {report.adminNotes && report.adminNotes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Action History</h2>
                    
                    <div className="space-y-4">
                      {report.adminNotes.map((note, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{note.adminName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-1">Action: <strong>{note.action}</strong></p>
                          <p className="text-gray-600">{note.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Content Author Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Author</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-gray-900">{report.contentAuthor}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-gray-900">{report.contentAuthorEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">User ID:</span>
                      <p className="text-gray-900 font-mono text-sm">{report.contentAuthorId}</p>
                    </div>
                    <div className="pt-3">
                      <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        <i className="fas fa-user mr-2"></i>View User Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Previous Reports */}
                {report.previousReports && report.previousReports.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Reports</h3>
                    <div className="space-y-3">
                      {report.previousReports.map((prevReport, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{prevReport.reason}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              prevReport.status === 'dismissed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {prevReport.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{prevReport.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Content */}
                {report.relatedContent && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Content</h3>
                    <div className="space-y-3">
                      {report.relatedContent.map((section, index) => (
                        <div key={index}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{section.type}</h4>
                          <ul className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="text-sm text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                      <i className="fas fa-ban mr-2"></i>Suspend Content
                    </button>
                    <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      <i className="fas fa-exclamation-triangle mr-2"></i>Warn User
                    </button>
                    <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      <i className="fas fa-envelope mr-2"></i>Contact User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportDetailPage;

