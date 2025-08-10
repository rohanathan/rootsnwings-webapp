export default function MentorHeaderAccount({ isProfileDropdownOpen, handleProfileDropdownClick, user, mentorDetails }) {


    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("mentor");
        window.location.href = "/getstarted";
    };

    return (
        <div className="relative">
        <button id="profile-dropdown-btn" onClick={handleProfileDropdownClick} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">PR</span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-gray-900">{user?.displayName}</div>
          {mentorDetails &&  <div className="text-xs text-gray-500">{mentorDetails?.category} Mentor</div>}
          </div>
          <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
        </button>

        {/* Dropdown Menu */}
        <div id="profile-dropdown" className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isProfileDropdownOpen ? '' : 'hidden'}`}>
          <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <i className="fas fa-user text-gray-400"></i>
            <span>View Profile</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <i className="fas fa-cog text-gray-400"></i>
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <i className="fas fa-question-circle text-gray-400"></i>
            <span>Help & Support</span>
          </a>
          <hr className="my-2" />
          <a href="/getstarted" onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50">
            <i className="fas fa-sign-out-alt text-red-400"></i>
            <span>Log Out</span>
          </a>
        </div>
      </div>
    )
}