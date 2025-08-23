export default function UserSidebar({ isSidebarOpen, activeTab, userRoles = [], youngLearners = [] }) {
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
            href="/user/savedmentors"
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

          {/* Young Learners Section - Only show for parents */}
          {userRoles.includes("parent") && (
            <div className="space-y-2" id="young-learners-nav">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Young Learners</h3>
                <button
                  onClick={() => window.location.href = "/user/younglearner"}
                  className="text-primary hover:text-primary-dark transition-colors"
                  title={youngLearners.length > 0 ? "Manage Children" : "Add Child"}
                >
                  <i className={`fas ${youngLearners.length > 0 ? 'fa-cog' : 'fa-plus'} text-sm`}></i>
                </button>
              </div>
              
              {/* Show young learners if they exist, otherwise show add child message */}
              {youngLearners.length > 0 ? (
                <div className="space-y-2">
                  {youngLearners.map((learner, index) => (
                    <div key={learner.id || index} className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {learner.firstName?.charAt(0) || learner.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {learner.firstName || learner.name || 'Child'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age {learner.age || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => window.location.href = "/user/younglearner"}
                    className="w-full text-primary hover:text-primary-dark text-sm font-medium py-2 px-3 border border-primary rounded-lg hover:bg-primary-light transition-colors"
                  >
                    <i className="fas fa-cog mr-2"></i>Manage Young Learners
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No children added yet</p>
                  <button
                    onClick={() => window.location.href = "/user/younglearner"}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Your First Child
                  </button>
                </div>
              )}
            </div>
          )}


        {/* </div> */}

        {/* Profile Management */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Profile Management
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
