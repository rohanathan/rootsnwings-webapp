"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
// import AccountDropDown from "@/components/AccountDropDown";
import axios from "axios";
import MentorHeaderAccount from "@/components/MentorHeaderAccount";

const AdminClassDetailPage = () => {
  const params = useParams();
  const classId = params.classId;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields (admin can modify these, not pricing/schedule)
  const [editableFields, setEditableFields] = useState({
    title: "",
    description: "",
    subject: "",
    category: "",
    level: "",
    ageGroup: "",
    format: "",
    status: ""
  });

  const statusOptions = [
    { value: "pending_approval", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const levelOptions = ["beginner", "intermediate", "advanced", "all-levels"];
  const ageGroupOptions = ["child", "teen", "adult", "all-ages"];
  const formatOptions = ["online", "in-person", "hybrid"];

  // Load class data
  useEffect(() => {
    const loadClassData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.user?.uid) {
          setError("Admin access required. Please log in.");
          setLoading(false);
          return;
        }
        
        setUser(userData.user);
        
        // Check admin role
        // const userRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
        if (
          !(userData?.user?.roles?.includes("admin"))
        ) {
          setError("Admin access required. Insufficient permissions.");
          setLoading(false);
          return;
        }

        // Load class data
        const response = await axios.get(
          `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/${classId}`
        );
        
        if (response.data) {
          setClassData(response.data);
          setEditableFields({
            title: response.data.title || "",
            description: response.data.description || "",
            subject: response.data.subject || "",
            category: response.data.category || "",
            level: response.data.level || "",
            ageGroup: response.data.ageGroup || "",
            format: response.data.format || "",
            status: response.data.status || "pending_approval"
          });
        }

      } catch (error) {
        console.error("Error loading class data:", error);
        setError("Failed to load class details");
      } finally {
        setLoading(false);
      }
    };
    
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/${classId}`,
        editableFields
      );
      
      // Update local state
      setClassData(prev => ({ ...prev, ...editableFields }));
      setIsEditing(false);
      alert("Class updated successfully!");
      
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'activate':
          newStatus = 'active';
          break;
        case 'deactivate':
          newStatus = 'inactive';
          break;
        default:
          return;
      }
      
      await axios.put(
        `https://rootsnwings-api-944856745086.europe-west2.run.app/classes/${classId}`,
        { status: newStatus }
      );
      
      setClassData(prev => ({ ...prev, status: newStatus }));
      setEditableFields(prev => ({ ...prev, status: newStatus }));
      
    } catch (error) {
      console.error(`Error ${action}ing class:`, error);
      alert(`Failed to ${action} class. Please try again.`);
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
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
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Class not found"}</p>
          <button 
            onClick={() => window.location.href = '/admin/classes'}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Classes
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
              onClick={() => window.location.href = '/admin/classes'}
              className="text-gray-600 hover:text-primary"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Classes
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">Class Details</h1>
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
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Class Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {classData.title}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {classData.subject} • {classData.category} • by {classData.mentorName}
                  </p>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(classData.status)}
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-calendar mr-1"></i>
                      Created {new Date(classData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <i className="fas fa-edit mr-2"></i>Edit Class
                      </button>
                      {classData.status === 'pending_approval' && (
                        <>
                          <button 
                            onClick={() => handleQuickAction('approve')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <i className="fas fa-check mr-2"></i>Approve
                          </button>
                          <button 
                            onClick={() => handleQuickAction('reject')}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <i className="fas fa-times mr-2"></i>Reject
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                        ) : (
                          <><i className="fas fa-save mr-2"></i>Save Changes</>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <i className="fas fa-times mr-2"></i>Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Editable Fields */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Class Information</h2>
                  
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Title
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editableFields.title}
                          onChange={(e) => setEditableFields(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{classData.title}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      {isEditing ? (
                        <textarea
                          rows="4"
                          value={editableFields.description}
                          onChange={(e) => setEditableFields(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{classData.description || "No description provided"}</p>
                      )}
                    </div>

                    {/* Subject & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.subject}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{classData.subject}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.category}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{classData.category}</p>
                        )}
                      </div>
                    </div>

                    {/* Level & Age Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.level}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select level...</option>
                            {levelOptions.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-900">{classData.level || "Not specified"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age Group
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.ageGroup}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, ageGroup: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select age group...</option>
                            {ageGroupOptions.map(age => (
                              <option key={age} value={age}>{age}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-900">{classData.ageGroup || "Not specified"}</p>
                        )}
                      </div>
                    </div>

                    {/* Format & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Format
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.format}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, format: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select format...</option>
                            {formatOptions.map(format => (
                              <option key={format} value={format}>{format}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-900">{classData.format || "Not specified"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            value={editableFields.status}
                            onChange={(e) => setEditableFields(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div>{getStatusBadge(classData.status)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Non-editable Info */}
              <div className="space-y-8">
                {/* Mentor Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-gray-900">{classData.mentorName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Mentor ID:</span>
                      <p className="text-gray-900 font-mono text-sm">{classData.mentorId}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing (Read-only)</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Per Session:</span>
                      <p className="text-gray-900">£{classData.pricing?.perSessionRate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Total Sessions:</span>
                      <p className="text-gray-900">{classData.pricing?.totalSessions || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                      <p className="text-gray-900">£{classData.pricing?.subtotal || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Capacity Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity (Read-only)</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Max Students:</span>
                      <p className="text-gray-900">{classData.capacity?.maxStudents || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Min Students:</span>
                      <p className="text-gray-900">{classData.capacity?.minStudents || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current Enrollment:</span>
                      <p className="text-gray-900">{classData.capacity?.currentEnrollment || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Class Meta */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Class ID:</span>
                      <p className="text-gray-900 font-mono text-sm">{classData.classId}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <p className="text-gray-900">{classData.type}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="text-gray-900">{new Date(classData.createdAt).toLocaleString()}</p>
                    </div>
                    {classData.updatedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                        <p className="text-gray-900">{new Date(classData.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
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

export default AdminClassDetailPage;

