'use client'
import { navItems } from '@/app/utils';
import MentorSideBase from '@/components/MentorSideBase';
import { useState, useEffect, useRef } from 'react';

// Main App component
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const profileDropdownRef = useRef(null);

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Handle window resize to auto-hide mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handler for "Create Workshop" button clicks
  const handleCreateWorkshop = () => {
    // This would typically open a modal or navigate to a new page
    alert('Create Workshop form would open here');
  };

  // Define the workshops data to be displayed
  const workshops = {
    active: [
      {
        id: 1,
        title: "Kathak Performance Workshop",
        description: "Master the art of Kathak storytelling through dance and expression in this intensive weekend workshop.",
        status: "Active",
        type: "In-person",
        gradient: "from-purple-100 to-pink-100",
        icon: "fas fa-users text-purple-300",
        date: "Saturday, July 27 • 2:00 PM - 5:00 PM",
        location: "Birmingham Community Centre",
        participants: "8/12 participants",
        cost: "£45 per person",
        tags: [
          { label: "Adults", color: "purple" },
          { label: "Intermediate", color: "blue" },
          { label: "Limited Seats", color: "green" },
        ],
        actions: [
          { label: "Manage Workshop", type: "primary" },
          { label: "View Details", type: "secondary" },
        ],
      },
      {
        id: 2,
        title: "Introduction to Vedic Chanting",
        description: "Discover the ancient art of Vedic chanting and its spiritual significance in this beginner-friendly session.",
        status: "Active",
        type: "Online",
        gradient: "from-orange-100 to-yellow-100",
        icon: "fas fa-microphone text-orange-300",
        date: "Sunday, July 28 • 10:00 AM - 12:00 PM",
        location: "Online via Zoom",
        participants: "12/15 participants",
        cost: "Free Workshop",
        tags: [
          { label: "All Ages", color: "blue" },
          { label: "Beginner", color: "green" },
          { label: "Free", color: "yellow" },
        ],
        actions: [
          { label: "Manage Workshop", type: "primary" },
          { label: "View Details", type: "secondary" },
        ],
      },
      {
        id: 3,
        title: "Classical Dance for Beginners",
        description: "Perfect introduction to classical Indian dance forms, covering basic positions and simple choreography.",
        status: "Waiting",
        type: "Hybrid",
        gradient: "from-pink-100 to-rose-100",
        icon: "fas fa-music text-pink-300",
        date: "Saturday, August 3 • 3:00 PM - 6:00 PM",
        location: "Birmingham + Online",
        participants: "3/10 participants",
        cost: "£25 per person",
        tags: [
          { label: "Children", color: "green" },
          { label: "Beginner", color: "blue" },
          { label: "Need 7 more", color: "orange" },
        ],
        actions: [
          { label: "Promote Workshop", type: "primary" },
          { label: "Edit Details", type: "secondary" },
        ],
      },
      {
        id: 4,
        title: "Philosophy & Mindfulness Session",
        description: "Explore ancient philosophical concepts and modern mindfulness practices for inner peace and clarity.",
        status: "Active",
        type: "Online",
        gradient: "from-teal-100 to-cyan-100",
        icon: "fas fa-leaf text-teal-300",
        date: "Friday, August 2 • 7:00 PM - 9:00 PM",
        location: "Online via Zoom",
        participants: "6/8 participants",
        cost: "£12 per person",
        tags: [
          { label: "Adults", color: "indigo" },
          { label: "All Levels", color: "green" },
          { label: "Evening", color: "teal" },
        ],
        actions: [
          { label: "Manage Workshop", type: "primary" },
          { label: "View Details", type: "secondary" },
        ],
      },
    ],
    upcoming: [],
    past: [],
    drafts: [],
  };

  const tagColors = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    indigo: "bg-indigo-100 text-indigo-800",
    teal: "bg-teal-100 text-teal-800",
    rose: "bg-rose-100 text-rose-800",
    pink: "bg-pink-100 text-pink-800",
    cyan: "bg-cyan-100 text-cyan-800",
  };

  const getTabContent = (tab) => {
    switch (tab) {
      case 'active':
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            {workshops.active.map(workshop => (
              <div key={workshop.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`aspect-video bg-gradient-to-br ${workshop.gradient} relative`}>
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">{workshop.status}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`${tagColors[workshop.type === "Online" ? "green" : workshop.type === "In-person" ? "blue" : "purple"]} text-xs px-2 py-1 rounded-full font-medium`}>{workshop.type}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`${workshop.icon} text-4xl`}></i>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{workshop.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-calendar mr-3 text-gray-400"></i>
                      <span>{workshop.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className={`${workshop.type === "Online" ? "fas fa-globe" : "fas fa-map-marker-alt"} mr-3 text-gray-400`}></i>
                      <span>{workshop.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-users mr-3 text-gray-400"></i>
                      <span>{workshop.participants}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-tag mr-3 text-gray-400"></i>
                      <span>{workshop.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    {workshop.tags.map((tag, index) => (
                      <span key={index} className={`${tagColors[tag.color]} text-xs px-2 py-1 rounded-full`}>{tag.label}</span>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    {workshop.actions.map((action, index) => (
                      <button key={index} className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium
                        ${action.type === 'primary' ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'upcoming':
        return (
          <div className="text-center py-12">
            <i className="fas fa-calendar-plus text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Workshops</h3>
            <p className="text-gray-600 mb-6">You don't have any scheduled workshops yet.</p>
            <button
              onClick={handleCreateWorkshop}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              Create New Workshop
            </button>
          </div>
        );
      case 'past':
        return (
          <div className="text-center py-12">
            <i className="fas fa-history text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Past Workshops</h3>
            <p className="text-gray-600">Your completed workshops will appear here.</p>
          </div>
        );
      case 'drafts':
        return (
          <div className="text-center py-12">
            <i className="fas fa-edit text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Draft Workshops</h3>
            <p className="text-gray-600 mb-6">Continue working on your saved workshop drafts.</p>
            <button
              onClick={handleCreateWorkshop}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              Create New Workshop
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background font-sans">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #F9FBFF;
        }
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#00A2E8',
                        'primary-dark': '#00468C',
                        'primary-light': '#E6F7FF',
                        'background': '#F9FBFF',
                    }
                }
            }
          }
        `}}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button id="mobile-menu-btn" className="md:hidden text-gray-600 hover:text-primary" onClick={toggleSidebar}>
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
            <span className="hidden md:block text-sm text-gray-500">Mentor Portal</span>
          </div>
          <div className="relative" ref={profileDropdownRef}>
            <button id="profile-dropdown-btn" className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors" onClick={toggleProfileDropdown}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">PR</span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-gray-900">Priya Sharma</div>
                <div className="text-xs text-gray-500">Kathak Mentor</div>
              </div>
              <i className={`fas fa-chevron-down text-gray-400 text-sm transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div id="profile-dropdown" className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isProfileDropdownOpen ? 'block' : 'hidden'}`}>
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
              <a href="#" className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50">
                <i className="fas fa-sign-out-alt text-red-400"></i>
                <span>Log Out</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}

        <MentorSideBase
            isSidebarOpen={isSidebarOpen}
            navItems={navItems}
            activeTab={4}
          />


        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Workshops</h1>
              <p className="text-gray-600">Manage your special events and masterclasses</p>
            </div>
            <button
              onClick={handleCreateWorkshop}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Workshop
            </button>
          </div>

          {/* Workshop Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-green-600"></i>
                </div>
                <span className="text-green-500 text-sm font-medium">+2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4</h3>
              <p className="text-gray-600 text-sm">Active Workshops</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
                <span className="text-blue-500 text-sm font-medium">This month</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">47</h3>
              <p className="text-gray-600 text-sm">Total Attendees</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-purple-600"></i>
                </div>
                <span className="text-purple-500 text-sm font-medium">Avg rating</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
              <p className="text-gray-600 text-sm">Workshop Rating</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-pound-sign text-yellow-600"></i>
                </div>
                <span className="text-green-500 text-sm font-medium">+£180</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">£620</h3>
              <p className="text-gray-600 text-sm">Workshop Earnings</p>
            </div>
          </div>

          {/* Workshop Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('active')}
              >
                Active Workshops
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Events
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('past')}
              >
                Past Workshops
              </button>
              <button
                className={`px-6 py-3 border-b-2 font-semibold workshop-tab ${activeTab === 'drafts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('drafts')}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div id={`${activeTab}-tab`} className="tab-content">
            {getTabContent(activeTab)}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        id="sidebar-overlay"
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={toggleSidebar}
      ></div>
    </div>
  );
}
