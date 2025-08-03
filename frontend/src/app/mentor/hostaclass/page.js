"use client"
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// Re-creating the Tailwind config for use in the component
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'primary': '#00A2E8',
        'primary-dark': '#00468C',
        'primary-light': '#E6F7FF',
        'background': '#F9FBFF',
      },
    },
  },
};

const navItems = [
  { icon: 'fas fa-home', text: 'Dashboard', href: '#' },
  { icon: 'fas fa-chalkboard-teacher', text: 'My Classes', href: '#' },
  { icon: 'fas fa-plus-circle', text: 'Host a Class', href: '#', active: true },
  { icon: 'fas fa-users', text: 'Workshops', href: '#' },
  { icon: 'fas fa-calendar-alt', text: 'Schedule', href: '#' },
  { icon: 'fas fa-students', text: 'Students', href: '#' },
  { icon: 'fas fa-pound-sign', text: 'Earnings', href: '#' },
  { icon: 'fas fa-comments', text: 'Messages', href: '#', badge: 3 },
];

const classTypes = [
  { id: 'one-on-one', icon: 'fas fa-user', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', title: 'One-on-One Sessions', description: 'Personalized learning experience with individual attention.', feature: 'Most popular • Highest earning potential' },
  { id: 'group', icon: 'fas fa-users', iconBg: 'bg-green-100', iconColor: 'text-green-600', title: 'Group Classes', description: 'Small group learning with collaborative environment.', feature: 'Great for building community' },
  { id: 'workshop', icon: 'fas fa-graduation-cap', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', title: 'Special Workshops', description: 'One-time events and masterclasses for unique topics.', feature: 'Flexible scheduling • High visibility' },
];

const HostClassPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [selectedClassType, setSelectedClassType] = useState('one-on-one');
  const [classDescription, setClassDescription] = useState('');
  const profileDropdownRef = useRef(null);
  const profileDropdownBtnRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileDropdownBtnRef.current &&
        !profileDropdownBtnRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileDropdownRef, profileDropdownBtnRef]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleClassTypeSelect = (type) => {
    setSelectedClassType(type);
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const maxLength = 500;
    if (text.length <= maxLength) {
      setClassDescription(text);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Class creation form submitted');
    // Replace with actual form submission logic
    // For now, we'll use a custom message box instead of alert()
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4';
    messageBox.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-lg">
        <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <i class="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p class="text-gray-600 mb-6">Class created successfully! It will be reviewed and published within 24 hours.</p>
        <button id="close-message-box" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('close-message-box').onclick = () => {
      document.body.removeChild(messageBox);
    };
  };

  return (
    <>
      <Head>
        <title>Host a Class - Roots & Wings</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          html, body { background-color: ${tailwindConfig.theme.extend.colors['background']}; }
          .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
          /* Custom transitions for sidebar */
          .sidebar-transition {
            transition-property: transform;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </Head>
      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button id="mobile-menu-btn" className="md:hidden text-gray-600 hover:text-primary" onClick={toggleSidebar}>
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="hidden md:block text-sm text-gray-500">Mentor Portal</span>
            </div>
            
            {/* Right: Profile Dropdown */}
            <div className="relative">
              <button
                id="profile-dropdown-btn"
                ref={profileDropdownBtnRef}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                onClick={toggleProfileDropdown}
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">PR</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-xs text-gray-500">Kathak Mentor</div>
                </div>
                <i className={`fas fa-chevron-down text-gray-400 text-sm transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Dropdown Menu */}
              <div
                id="profile-dropdown"
                ref={profileDropdownRef}
                className={`${isProfileDropdownOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2`}
              >
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
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 ${
                      item.active ? 'bg-primary text-white' : 'text-gray-700'
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

          {/* Main Content */}
          <main className="flex-1 md:ml-0 p-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Host a Class</h1>
                <p className="text-gray-600">Create a new class to share your expertise with students across the UK.</p>
            </div>

            {/* Class Type Selection */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {classTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleClassTypeSelect(type.id)}
                  className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    selectedClassType === type.id ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                >
                  <div className={`w-16 h-16 ${type.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                      <i className={`${type.icon} ${type.iconColor} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="flex items-center text-sm text-green-600">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>{type.feature}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Class Creation Form */}
            <div className="bg-white rounded-xl border border-gray-200" id="class-form">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900">Class Details</h2>
                    <p className="text-gray-600">Fill in the information below to create your class</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="classTitle" className="block text-sm font-semibold text-gray-900 mb-2">Class Title</label>
                                <input type="text" id="classTitle" placeholder="e.g., Beginner Kathak Dance for Teens" 
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                                <p className="text-xs text-gray-500 mt-1">Make it descriptive and engaging</p>
                            </div>
                            <div>
                                <label htmlFor="subjectCategory" className="block text-sm font-semibold text-gray-900 mb-2">Subject Category</label>
                                <select id="subjectCategory" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option>Select a category</option>
                                    <option>Music</option>
                                    <option>Dance</option>
                                    <option>Art & Craft</option>
                                    <option>Languages</option>
                                    <option>Coding</option>
                                    <option>Philosophy</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="classDescription" className="block text-sm font-semibold text-gray-900 mb-2">Class Description</label>
                            <textarea
                                id="classDescription"
                                rows="4"
                                value={classDescription}
                                onChange={handleDescriptionChange}
                                placeholder="Describe what students will learn, your teaching approach, and what makes this class special..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">Help students understand what to expect</p>
                                <span className={`text-xs ${classDescription.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {classDescription.length}/500 characters
                                </span>
                            </div>
                        </div>

                        {/* Level & Age Group */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Skill Level</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Beginner</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Intermediate</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Advanced</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Age Group</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Children (5-12 years)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Teens (13-17 years)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-gray-700">Adults (18+ years)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Class Format & Scheduling */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Schedule & Format</h3>
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-semibold text-gray-900 mb-2">Session Duration</label>
                                    <select id="duration" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>45 minutes</option>
                                        <option>60 minutes</option>
                                        <option>90 minutes</option>
                                        <option>120 minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="maxStudents" className="block text-sm font-semibold text-gray-900 mb-2">Max Students</label>
                                    <select id="maxStudents" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>1 (One-on-one)</option>
                                        <option>2-3 students</option>
                                        <option>4-6 students</option>
                                        <option>7-10 students</option>
                                        <option>10+ students</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="teachingMode" className="block text-sm font-semibold text-gray-900 mb-2">Teaching Mode</label>
                                    <select id="teachingMode" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>Online only</option>
                                        <option>In-person only</option>
                                        <option>Both online & in-person</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Available Days & Times</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                        <label key={day} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                            <span className="ml-3 font-medium">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-2">Start Time</label>
                                    <input type="time" id="startTime" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-2">End Time</label>
                                    <input type="time" id="endTime" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Pricing</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">Price per Session</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">£</span>
                                        <input type="number" id="price" placeholder="35" min="10" max="200"
                                               className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                                        <span className="absolute right-3 top-3 text-gray-500">/session</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Average rate: £25-45 per session</p>
                                </div>
                                <div>
                                    <label htmlFor="discount" className="block text-sm font-semibold text-gray-900 mb-2">Package Discount (Optional)</label>
                                    <select id="discount" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>No package discount</option>
                                        <option>5% off (4+ sessions)</option>
                                        <option>10% off (8+ sessions)</option>
                                        <option>15% off (12+ sessions)</option>
                                        <option>Custom discount</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Materials & Requirements */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Materials & Requirements</h3>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="bring" className="block text-sm font-semibold text-gray-900 mb-2">What students need to bring/have</label>
                                    <textarea id="bring" rows="3" placeholder="List any materials, equipment, or software students need for the class..."
                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="provide" className="block text-sm font-semibold text-gray-900 mb-2">What you'll provide</label>
                                    <textarea id="provide" rows="3" placeholder="Describe any materials, resources, or tools you'll provide during the class..."
                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-200 pt-8">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                                <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Save as Draft
                                </button>
                                <button type="button" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    Preview Class
                                </button>
                                <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                                    Publish Class
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            id="sidebar-overlay"
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
      </body>
    </>
  );
};

export default HostClassPage;
