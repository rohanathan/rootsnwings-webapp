'use client';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('online');
  const [description, setDescription] = useState('');
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Workshop creation form submitted');
    alert('Workshop created successfully! It will be reviewed and published within 24 hours.');
  };

  const descMaxLength = 800;

  return (
    <div className="bg-background font-sans">
      <Head>
        <title>Create Workshop - Roots & Wings</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

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
                <div className="text-sm font-semibold text-gray-900"> Sharma</div>
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
        <nav
          id="sidebar"
          className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          <div className="p-6">
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-home text-lg"></i>
                <span className="font-medium">Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-chalkboard-teacher text-lg"></i>
                <span>My Classes</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-plus-circle text-lg"></i>
                <span>Host a Class</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                <i className="fas fa-users text-lg"></i>
                <span>Workshops</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-calendar-alt text-lg"></i>
                <span>Schedule</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-user-friends text-lg"></i>
                <span>Students</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-pound-sign text-lg"></i>
                <span>Earnings</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                <i className="fas fa-comments text-lg"></i>
                <span>Messages</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
              </a>
            </div>
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                  <i className="fas fa-plus mr-2"></i>
                  Create Workshop
                </button>
                <button className="w-full border border-primary text-primary px-4 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium">
                  <i className="fas fa-video mr-2"></i>
                  Start Session Now
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-0 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button onClick={() => window.history.back()} className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <i className="fas fa-arrow-left text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Workshop</h1>
                <p className="text-gray-600">Design a special event or masterclass to share your expertise</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <span className="text-primary font-medium">Workshop Details</span>
              <i className="fas fa-chevron-right text-gray-300"></i>
              <span className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <span className="text-gray-500">Schedule & Pricing</span>
              <i className="fas fa-chevron-right text-gray-300"></i>
              <span className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <span className="text-gray-500">Preview & Publish</span>
            </div>
          </div>

          {/* Workshop Type Selection */}
          <div className="bg-primary-light rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-primary-dark mb-4">Workshop Type</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input type="radio" name="workshop-type" value="masterclass" className="hidden" />
                <div className="border-2 border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-primary">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-graduation-cap text-purple-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Masterclass</h3>
                  <p className="text-sm text-gray-600 mt-1">Advanced intensive session</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="workshop-type" value="beginner" className="hidden" defaultChecked />
                <div className="border-2 border-primary rounded-lg p-4 bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-seedling text-green-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Beginner Workshop</h3>
                  <p className="text-sm text-gray-600 mt-1">Introduction for newcomers</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="workshop-type" value="community" className="hidden" />
                <div className="border-2 border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-primary">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-users text-blue-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Community Event</h3>
                  <p className="text-sm text-gray-600 mt-1">Open cultural gathering</p>
                </div>
              </label>
            </div>
          </div>

          {/* Workshop Form */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">Workshop Information</h2>
              <p className="text-gray-600">Fill in the details to create your workshop</p>
            </div>

            <div className="p-6">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Workshop Title *</label>
                    <input type="text" placeholder="e.g., Introduction to Vedic Chanting"
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    <p className="text-xs text-gray-500 mt-1">Make it descriptive and engaging for participants</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Subject Category *</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>Select a category</option>
                      <option>Classical Dance</option>
                      <option>Music & Chanting</option>
                      <option>Philosophy & Mindfulness</option>
                      <option>Art & Craft</option>
                      <option>Languages</option>
                      <option>Cultural Heritage</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Skill Level *</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>All Levels</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Workshop Description *</label>
                  <textarea
                    rows="4"
                    placeholder="Describe what participants will learn and experience in this workshop. Include your teaching approach and what makes it special..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={descMaxLength}
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Help participants understand what to expect</p>
                    <span className={`text-xs ${description.length > descMaxLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                      {description.length}/{descMaxLength} characters
                    </span>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Target Audience</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Age Groups *</label>
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
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                          <span className="ml-3 text-gray-700">Family Friendly (All ages)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Workshop Features</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                          <span className="ml-3 text-gray-700">Hands-on Activities</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                          <span className="ml-3 text-gray-700">Take-home Materials</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                          <span className="ml-3 text-gray-700">Certificate Provided</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                          <span className="ml-3 text-gray-700">Q&A Session Included</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule & Location */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Schedule & Location</h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Workshop Date *</label>
                      <input type="date"
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Start Time *</label>
                      <input type="time"
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Duration *</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>1 hour</option>
                        <option>1.5 hours</option>
                        <option>2 hours</option>
                        <option>3 hours</option>
                        <option>4 hours</option>
                        <option>Full day (6+ hours)</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery Mode */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Mode *</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="delivery-mode"
                          value="online"
                          className="hidden"
                          checked={deliveryMode === 'online'}
                          onChange={() => setDeliveryMode('online')}
                        />
                        <div className={`border-2 rounded-lg p-4 text-center transition-all duration-200 hover:border-primary ${deliveryMode === 'online' ? 'border-primary bg-primary-light' : 'border-gray-200'}`}>
                          <i className="fas fa-laptop text-green-600 text-2xl mb-2"></i>
                          <h4 className="font-semibold text-gray-900">Online</h4>
                          <p className="text-sm text-gray-600 mt-1">Via Zoom/Google Meet</p>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="delivery-mode"
                          value="in-person"
                          className="hidden"
                          checked={deliveryMode === 'in-person'}
                          onChange={() => setDeliveryMode('in-person')}
                        />
                        <div className={`border-2 rounded-lg p-4 text-center transition-all duration-200 hover:border-primary ${deliveryMode === 'in-person' ? 'border-primary bg-primary-light' : 'border-gray-200'}`}>
                          <i className="fas fa-map-marker-alt text-blue-600 text-2xl mb-2"></i>
                          <h4 className="font-semibold text-gray-900">In-Person</h4>
                          <p className="text-sm text-gray-600 mt-1">Physical location</p>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="delivery-mode"
                          value="hybrid"
                          className="hidden"
                          checked={deliveryMode === 'hybrid'}
                          onChange={() => setDeliveryMode('hybrid')}
                        />
                        <div className={`border-2 rounded-lg p-4 text-center transition-all duration-200 hover:border-primary ${deliveryMode === 'hybrid' ? 'border-primary bg-primary-light' : 'border-gray-200'}`}>
                          <i className="fas fa-globe text-purple-600 text-2xl mb-2"></i>
                          <h4 className="font-semibold text-gray-900">Hybrid</h4>
                          <p className="text-sm text-gray-600 mt-1">Both online & in-person</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Location Details - Conditionally rendered */}
                  {(deliveryMode === 'in-person' || deliveryMode === 'hybrid') && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Venue Name</label>
                        <input type="text" placeholder="e.g., Birmingham Community Centre"
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                        <input type="text" placeholder="Full address for participants"
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity & Pricing */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Capacity & Pricing</h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Maximum Participants *</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>5 participants</option>
                        <option>8 participants</option>
                        <option>10 participants</option>
                        <option>12 participants</option>
                        <option>15 participants</option>
                        <option>20 participants</option>
                        <option>25+ participants</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum to Run</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>1 participant</option>
                        <option>2 participants</option>
                        <option>3 participants</option>
                        <option>4 participants</option>
                        <option>5 participants</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Workshop runs if minimum is met</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Registration Deadline</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>1 day before</option>
                        <option>2 days before</option>
                        <option>3 days before</option>
                        <option>1 week before</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing Options */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Pricing Structure</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Workshop Price *</label>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="radio" name="pricing-type" value="free" className="w-4 h-4 text-primary focus:ring-primary" />
                            <span className="ml-3 text-gray-700">Free Workshop</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="pricing-type" value="paid" className="w-4 h-4 text-primary focus:ring-primary" defaultChecked />
                            <div className="ml-3 flex items-center space-x-3">
                              <span className="text-gray-700">Paid Workshop:</span>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">£</span>
                                <input type="number" placeholder="25" min="5" max="200"
                                       className="w-24 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                              </div>
                              <span className="text-gray-700">per person</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Early Bird Discount (Optional)</label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-primary focus:ring-primary rounded" />
                            <span className="text-gray-700 text-sm">Offer early bird pricing</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <input type="number" placeholder="10" min="5" max="50"
                                     className="w-full pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                              <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                            </div>
                            <span className="text-xs text-gray-500 flex items-center">discount before deadline</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Materials & Requirements */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Materials & Requirements</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">What participants should bring</label>
                      <textarea rows="4" placeholder="List any materials, clothing, or items participants need for the workshop..."
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                      <p className="text-xs text-gray-500 mt-1">e.g., comfortable clothing, notebook, water bottle</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">What you'll provide</label>
                      <textarea rows="4" placeholder="Describe materials, handouts, or refreshments you'll provide..."
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                      <p className="text-xs text-gray-500 mt-1">e.g., practice sheets, tea/coffee, instruments</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                    <div className="flex space-x-4">
                      <button type="button" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fas fa-save mr-2"></i>
                        Save as Draft
                      </button>
                      <button type="button" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <i className="fas fa-eye mr-2"></i>
                        Preview Workshop
                      </button>
                    </div>
                    <div className="flex space-x-4">
                      <button type="button" className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                        Schedule for Later
                      </button>
                      <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                        <i className="fas fa-rocket mr-2"></i>
                        Publish Workshop
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
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
