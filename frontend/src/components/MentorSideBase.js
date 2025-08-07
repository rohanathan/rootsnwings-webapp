export default function MentorSideBase({
    isSidebarOpen,
    navItems,
    activeTab,
}) {
    return (


        <nav
        id="sidebar"
        className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 sidebar-transition md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                  item.active === activeTab ? 'bg-primary text-white' : 'text-gray-700'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span className="font-medium">{item.text}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                <i className="fas fa-video mr-2"></i>
                Start Session Now
              </button>
              <button className="w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium">
                <i className="fas fa-plus mr-2"></i>
                Create Workshop
              </button>
            </div>
          </div>
        </div>
      </nav>
        
    )
}