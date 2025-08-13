export default function AdminSidebar({ isSidebarOpen, activeTab }) {
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
            href="/admin/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 1 ? 'bg-primary text-white' : 'text-gray-700'
            }`}
          >
            <i className="fas fa-tachometer-alt text-lg"></i>
            <span className="font-medium">Dashboard</span>
          </a>
          
          <a
            href="/admin/classes"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 2 ? 'bg-primary text-white' : 'text-gray-700'
            }`}
          >
            <i className="fas fa-book-open text-lg"></i>
            <span>Manage Classes</span>
          </a>
          
          <a
            href="/admin/mentors"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 3 ? 'bg-primary text-white' : 'text-gray-700'
            }`}
          >
            <i className="fas fa-chalkboard-teacher text-lg"></i>
            <span>Manage Mentors</span>
          </a>
          
          <a
            href="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 4 ? 'bg-primary text-white' : 'text-gray-700'
            }`}
          >
            <i className="fas fa-users text-lg"></i>
            <span>Manage Users</span>
          </a>
          
          <a
            href="/admin/bookings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
              activeTab === 5 ? 'bg-primary text-white' : 'text-gray-700'
            }`}
          >
            <i className="fas fa-calendar-check text-lg"></i>
            <span>Bookings</span>
          </a>
        </div>

        {/* Content Moderation */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Content Moderation
          </h3>
          <div className="space-y-2">
            <a
              href="/admin/content-moderation"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 12 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-shield-alt text-lg"></i>
              <span>Review Reports</span>
            </a>
            
            <a
              href="/admin/flagged-content"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 13 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-flag text-lg"></i>
              <span>Flagged Content</span>
            </a>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Analytics & Reports
          </h3>
          <div className="space-y-2">
            <a
              href="/admin/analytics"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 6 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-chart-bar text-lg"></i>
              <span>Platform Analytics</span>
            </a>
            
            <a
              href="/admin/reports"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 7 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-file-alt text-lg"></i>
              <span>Platform Reports</span>
            </a>
            
            <a
              href="/admin/revenue"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 8 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-chart-line text-lg"></i>
              <span>Revenue Tracking</span>
            </a>
          </div>
        </div>

        {/* System Management */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            System Management
          </h3>
          <div className="space-y-2">
            <a
              href="/admin/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 9 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-cog text-lg"></i>
              <span>Platform Settings</span>
            </a>
            

            
            <a
              href="/admin/logs"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                activeTab === 11 ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              <i className="fas fa-list-ul text-lg"></i>
              <span>System Logs</span>
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              <i className="fas fa-plus mr-2"></i>
              Create Announcement
            </button>
            <button className="w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium">
              <i className="fas fa-download mr-2"></i>
              Export Data
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
