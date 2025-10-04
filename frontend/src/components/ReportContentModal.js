"use client";
import { useState } from "react";
import axios from "axios";

const ReportContentModal = ({ isOpen, onClose, contentType, contentId, contentTitle, contentAuthor }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      alert("Please select a reason and provide a description.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user?.uid) {
        alert("Please log in to report content.");
        return;
      }

      const reportData = {
        contentType,
        contentId,
        contentTitle,
        contentAuthor,
        reason,
        description: description.trim(),
        reportedBy: user.user.uid,
        reporterName: user.user.displayName || "Anonymous",
        reporterEmail: user.user.email,
        timestamp: new Date().toISOString(),
        status: "pending",
        priority: "medium" // Default priority, can be adjusted by algorithm
      };

      // Simulate API call - replace with actual endpoint
      console.log("Submitting report:", reportData);
      
      // In a real implementation, this would be:
      // await axios.post("/api/reports", reportData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setSubmitted(false);
        setReason("");
        setDescription("");
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setDescription("");
      setSubmitted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {submitted ? (
          // Success State
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Submitted</h2>
            <p className="text-gray-600 mb-4">
              Thank you for reporting this content. Our moderation team will review it shortly.
            </p>
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </div>
        ) : (
          // Report Form
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Report Content</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Content Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Reporting:</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Type:</strong> {contentType}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Title:</strong> {contentTitle}
                </p>
                {contentAuthor && (
                  <p className="text-sm text-gray-600">
                    <strong>Author:</strong> {contentAuthor}
                  </p>
                )}
              </div>

              {/* Reason Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a reason...</option>
                  {reportReasons.map((reasonOption) => (
                    <option key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please provide more details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why you're reporting this content. Be specific about what violates our community guidelines..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your report will be reviewed by our moderation team.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason || !description.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-flag mr-2"></i>
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportContentModal;

