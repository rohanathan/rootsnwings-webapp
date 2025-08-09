"use client";
import { useState } from "react";
import ReportContentModal from "./ReportContentModal";

const ReportButton = ({ 
  contentType, 
  contentId, 
  contentTitle, 
  contentAuthor,
  className = "",
  variant = "icon" // "icon", "button", "text"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = () => {
    setIsModalOpen(true);
  };

  const baseClasses = "transition-colors duration-200";
  
  const variantClasses = {
    icon: "text-gray-400 hover:text-red-500 p-2",
    button: "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600",
    text: "text-red-500 hover:text-red-600 text-sm"
  };

  return (
    <>
      <button
        onClick={handleReport}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        title="Report this content"
      >
        {variant === "icon" && <i className="fas fa-flag"></i>}
        {variant === "button" && (
          <>
            <i className="fas fa-flag mr-2"></i>Report
          </>
        )}
        {variant === "text" && "Report"}
      </button>

      <ReportContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
        contentTitle={contentTitle}
        contentAuthor={contentAuthor}
      />
    </>
  );
};

export default ReportButton;

