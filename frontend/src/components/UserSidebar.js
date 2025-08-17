export default function UserSidebar({ isSidebarOpen, activeTab }) {
  return (
    <nav
      id="sidebar"
      className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="p-6">
        {/* Main Navigation */}
        <div className="space-y-2 mb-8">
          <a
            href="/user/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 1 ? "bg-primary text-white" : "text-gray-700"
            }`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">Dashboard</span>
          </a>
          <a
            href="/mentor/directory"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 2 ? "bg-primary text-white" : "text-gray-700"
            }`}
          >
            <i className="fas fa-search text-lg"></i>
            <span>Explore Mentors</span>
          </a>
          <a
            href="/user/bookings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 3 ? "bg-primary text-white" : "text-gray-700"
            }`}
          >
            <i className="fas fa-calendar-alt text-lg"></i>
            <span>My Bookings</span>
          </a>
          <a
            href="#"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 4 ? "bg-primary text-white" : "text-gray-700"
            }`}
          >
            <i className="fas fa-heart text-lg"></i>
            <span>Saved Mentors</span>
          </a>
          <a
            href="/user/workshop"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 5 ? "bg-primary text-white" : "text-gray-700"
            }`}
          >
            <i className="fas fa-users text-lg"></i>
            <span>Workshops</span>
          </a>
        </div>

        {/* Young Learners Section */}
        {/* <div className="border-t border-gray-200 pt-6"> */}

          {/* <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Young Learners
            </h3>
            <button
              id="add-learner-btn"
              className="text-purple-primary hover:text-purple-600 text-sm"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div> */}

          {/* <div className="space-y-2" id="young-learners-nav">
            <a
              href="#"
              className="young-learner-nav flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xs font-semibold">E</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Emma (12)</div>
                <div className="text-xs text-gray-500">Music, Art</div>
              </div>
            </a>

            <a
              href="#"
              className="young-learner-nav flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-green-50 hover:translate-x-1"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-semibold">J</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Jake (15)</div>
                <div className="text-xs text-gray-500">Coding, Maths</div>
              </div>
            </a>
          </div> */}


        {/* </div> */}

        {/* Family Management */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Family Management
          </h3>
          <div className="space-y-2">
            <a
              href="#"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 6 ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <i className="fas fa-chart-line text-lg"></i>
              <span>Progress Reports</span>
            </a>
            <a
              href="#"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 7 ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <i className="fas fa-credit-card text-lg"></i>
              <span>Billing & Payments</span>
            </a>
            <a
              href="#"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 8 ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <i className="fas fa-bell text-lg"></i>
              <span>Notifications</span>
            </a>
            <a
              href="/user/messages"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 9 ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <i className="fas fa-comments text-lg"></i>
              <span>Messages</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
