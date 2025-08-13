"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Earnings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileDropdownClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user'));
    if(user?.user?.userType !== 'mentor'){
      window.location.href = '/';
    }

    // Logic to close dropdown on outside click
    const handleOutsideClick = (e) => {
      const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
      const profileDropdown = document.getElementById('profile-dropdown');
      if (profileDropdownBtn && profileDropdown && !profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);

    // Auto-hide mobile sidebar on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const earningsStats = [
    {
      id: 1,
      title: "Total Earnings",
      value: "£2,847",
      description: "All Time Earnings",
      icon: "fas fa-pound-sign",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      status: "Total",
      statusColor: "text-green-500",
    },
    {
      id: 2,
      title: "This Month",
      value: "£1,245",
      description: "July 2025",
      icon: "fas fa-calendar",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      status: "This Month",
      statusColor: "text-blue-500",
    },
    {
      id: 3,
      title: "Pending Payments",
      value: "£384",
      description: "Processing",
      icon: "fas fa-clock",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      status: "Pending",
      statusColor: "text-orange-500",
    },
    {
      id: 4,
      title: "Hourly Rate",
      value: "£45",
      description: "Per Hour",
      icon: "fas fa-star",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      status: "Rate",
      statusColor: "text-purple-500",
    },
  ];

  const monthlyOverview = [
    {
      id: 1,
      month: "July 2025",
      details: "Current month",
      earnings: "£1,245",
      status: "On track",
      statusColor: "text-green-600",
      bgColor: "bg-primary-light"
    },
    {
      id: 2,
      month: "June 2025",
      details: "18 sessions",
      earnings: "£1,680",
      status: null,
      statusColor: null,
      bgColor: "bg-gray-50"
    },
    {
      id: 3,
      month: "May 2025",
      details: "16 sessions",
      earnings: "£1,520",
      status: null,
      statusColor: null,
      bgColor: "bg-gray-50"
    },
    {
      id: 4,
      month: "April 2025",
      details: "14 sessions",
      earnings: "£1,260",
      status: null,
      statusColor: null,
      bgColor: "bg-gray-50"
    },
  ];

  const earningsByType = [
    {
      id: 1,
      type: "1-on-1 Sessions",
      details: "Individual Kathak lessons",
      earnings: "£1,890",
      percentage: "59%",
      icon: "fas fa-user",
      iconBg: "bg-primary-light",
      iconColor: "text-primary"
    },
    {
      id: 2,
      type: "Group Classes",
      details: "Weekend & evening batches",
      earnings: "£786",
      percentage: "31%",
      icon: "fas fa-users",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: 3,
      type: "Workshops",
      details: "Special events",
      earnings: "£271",
      percentage: "10%",
      icon: "fas fa-calendar",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      name: "Ananya Mehta",
      details: "1-on-1 Session • July 20, 2025",
      amount: "£45.00",
      status: "Completed",
      statusColor: "text-green-600",
      icon: "fas fa-user",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      bgColor: "bg-gray-50",
      isProcessing: false
    },
    {
      id: 2,
      name: "Weekend Kathak Batch",
      details: "Group Session • July 19, 2025",
      amount: "£135.00",
      status: "Completed",
      statusColor: "text-green-600",
      icon: "fas fa-users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      bgColor: "bg-gray-50",
      isProcessing: false
    },
    {
      id: 3,
      name: "Mindfulness Workshop",
      details: "Special Event • July 18, 2025",
      amount: "£65.00",
      status: "Completed",
      statusColor: "text-green-600",
      icon: "fas fa-calendar",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      bgColor: "bg-gray-50",
      isProcessing: false
    },
    {
      id: 4,
      name: "Raj Kumar",
      details: "1-on-1 Session • July 17, 2025",
      amount: "£45.00",
      status: "Processing",
      statusColor: "text-orange-600",
      icon: "fas fa-user",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      isProcessing: true
    },
    {
      id: 5,
      name: "Maya Rajan",
      details: "1-on-1 Session • July 16, 2025",
      amount: "£45.00",
      status: "Completed",
      statusColor: "text-green-600",
      icon: "fas fa-user",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      bgColor: "bg-gray-50",
      isProcessing: false
    },
  ];

  return (
    <>
      <Head>
        <title>Earnings - Roots & Wings</title>
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
          `
        }}></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

      <body className="bg-background font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button id="mobile-menu-btn" onClick={handleMobileMenuClick} className="md:hidden text-gray-600 hover:text-primary">
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="hidden md:block text-sm text-gray-500">Mentor Portal</span>
            </div>
            
            {/* Right: Profile Dropdown */}
            <div className="relative">
              <button id="profile-dropdown-btn" onClick={handleProfileDropdownClick} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">PS</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-xs text-gray-500">Kathak Mentor</div>
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
          <nav className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} id="sidebar">
            <div className="p-6">
              {/* Navigation Items */}
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
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-users text-lg"></i>
                  <span>Workshops</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span>Schedule</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-user-graduate text-lg"></i>
                  <span>Students</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1 bg-primary text-white">
                  <i className="fas fa-pound-sign text-lg"></i>
                  <span>Earnings</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                  <i className="fas fa-comments text-lg"></i>
                  <span>Messages</span>
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
                </a>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                    <i className="fas fa-envelope mr-2"></i>
                    Send Message
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
                <p className="text-gray-600">Track your income and manage your earnings</p>
              </div>
              <div className="flex space-x-3">
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                    <option>All Time</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  <i className="fas fa-download mr-2"></i>Export
                </button>
              </div>
            </div>

            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {earningsStats.map((stat) => (
                <div key={stat.id} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                      <i className={`${stat.icon} ${stat.iconColor}`}></i>
                    </div>
                    <span className={`${stat.statusColor} text-sm font-medium`}>{stat.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.description}</p>
                </div>
              ))}
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Earnings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
                  <span className="text-sm text-gray-500">Last 6 Months</span>
                </div>
                <div className="space-y-4">
                  {monthlyOverview.map((month) => (
                    <div key={month.id} className={`flex items-center justify-between p-3 rounded-lg ${month.bgColor}`}>
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-600">{month.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{month.earnings}</p>
                        {month.status && <p className={`text-sm ${month.statusColor}`}>{month.status}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Types */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings by Type</h3>
                <div className="space-y-4">
                  {earningsByType.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.iconBg}`}>
                          <i className={`${type.icon} ${type.iconColor}`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{type.type}</p>
                          <p className="text-sm text-gray-600">{type.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{type.earnings}</p>
                        <p className="text-sm text-gray-500">{type.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions & Payment Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-lg transition-transform hover:translate-x-1 hover:shadow-md ${transaction.bgColor}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.iconBg}`}>
                          <i className={`${transaction.icon} ${transaction.iconColor}`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.name}</p>
                          <p className="text-sm text-gray-500">{transaction.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{transaction.amount}</p>
                        <p className={`text-sm ${transaction.statusColor}`}>{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-6">
                {/* Next Payout */}
                <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
                  <h4 className="font-semibold mb-2">Next Payout</h4>
                  <p className="text-2xl font-bold">£1,245.83</p>
                  <p className="text-sm opacity-90 mb-4">July 25, 2025</p>
                  <div className="flex items-center">
                    <i className="fas fa-info-circle mr-2"></i>
                    <span className="text-sm opacity-90">Automatic bank transfer</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-primary-light rounded-lg hover:bg-primary text-primary hover:text-white transition-colors">
                      <div className="flex items-center">
                        <i className="fas fa-university mr-3"></i>
                        <span className="font-medium">Payout Settings</span>
                      </div>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <i className="fas fa-receipt mr-3 text-gray-600"></i>
                        <span className="font-medium text-gray-900">Tax Documents</span>
                      </div>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <i className="fas fa-download mr-3 text-gray-600"></i>
                        <span className="font-medium text-gray-900">Download Statement</span>
                      </div>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                    </button>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sessions Taught</span>
                      <span className="font-medium text-gray-900">28</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-1">4.9</span>
                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Hours</span>
                      <span className="font-medium text-gray-900">34 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div id="sidebar-overlay" onClick={handleSidebarOverlayClick} className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? '' : 'hidden'}`}></div>
      </body>
    </>
  );
}
