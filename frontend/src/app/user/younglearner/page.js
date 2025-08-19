//Can remove
"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';

// This is a single component that recreates the full HTML page.
const YoungLearnerProfile = () => {
  // State for the mobile sidebar's open/closed state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for toggling between student and parent views
  const [isParentView, setIsParentView] = useState(false);

  // This useEffect handles the mobile sidebar toggle on window resize.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to handle the back button click
  const handleBackButtonClick = () => {
    // In a real Next.js app, this would use the router for navigation
    window.history.back();
  };

  // Helper function for the view toggle buttons
  const handleViewToggle = (view) => {
    setIsParentView(view === 'parent');
  };

  // Helper function for the artwork click
  const handleArtworkClick = () => {
    // In a real app, this would open a modal
    console.log('Opening artwork in full view...');
  };

  return (
    <>

      <div className={`font-sans text-gray-800 bg-purple-light min-h-screen ${isParentView ? 'parent-view-active' : ''}`}>

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Back to Family + Emma's Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackButtonClick}
                className="text-gray-600 hover:text-primary flex items-center space-x-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span className="hidden md:inline">Back to Family</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">E</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Emma's Learning Space</h1>
                  <p className="text-sm text-gray-600">Age 12 • Music & Art Explorer</p>
                </div>
              </div>
            </div>

            {/* Center: Parent Oversight Toggle */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewToggle('student')}
                className={`view-toggle-btn px-4 py-2 rounded-md transition-all ${!isParentView ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <i className="fas fa-user mr-2"></i>Emma's View
              </button>
              <button
                onClick={() => handleViewToggle('parent')}
                className={`view-toggle-btn px-4 py-2 rounded-md transition-all ${isParentView ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <i className="fas fa-eye mr-2"></i>Parent View
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                id="mobile-menu-btn"
                className="md:hidden text-gray-600 hover:text-purple-primary p-2"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <button className="text-gray-600 hover:text-purple-primary p-2">
                <i className="fas fa-bell"></i>
              </button>
              <button className="bg-purple-primary text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                <i className="fas fa-plus mr-2"></i>Book Session
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <nav
            className={`bg-white w-64 min-h-screen shadow-sm border-r border-gray-200 fixed md:static z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            id="sidebar"
          >
            <div className="p-6">
              {/* Emma's Navigation */}
              <div className="space-y-2 mb-8">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-home text-lg"></i>
                  <span className="font-medium">My Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-calendar-alt text-lg"></i>
                  <span>My Schedule</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-book text-lg"></i>
                  <span>My Classes</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-palette text-lg"></i>
                  <span>My Art Gallery</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                  <i className="fas fa-trophy text-lg"></i>
                  <span>Achievements</span>
                </a>
              </div>

              {/* Current Classes */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">My Classes</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-music text-purple-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Piano Lessons</div>
                      <div className="text-xs text-gray-500">with Priya</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-purple-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-paint-brush text-pink-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Watercolor Art</div>
                      <div className="text-xs text-gray-500">with Marcus</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Family Navigation */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Family</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-light hover:translate-x-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">S</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Mum's Classes</div>
                      <div className="text-xs text-gray-500">Classical Music</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 transition-all duration-200 ease-in-out hover:bg-green-50 hover:translate-x-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-semibold">J</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Jake's Classes</div>
                      <div className="text-xs text-gray-500">Coding, Maths</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 md:ml-0">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello Emma! 🎨🎵</h1>
                    <p className="text-gray-600">Ready for another creative day of learning?</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                    <button className="bg-purple-primary text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
                      <i className="fas fa-play mr-2"></i>Start Art Session
                    </button>
                    <button className="border border-purple-300 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <i className="fas fa-palette mr-2"></i>View My Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Today's Schedule */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Sessions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Art Session */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-400">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-paint-brush text-pink-600"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Watercolor Landscapes</h3>
                        <p className="text-gray-600 text-sm mb-2">with Marcus Chen</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span><i className="fas fa-clock mr-1"></i>4:00 PM - 5:00 PM</span>
                          <span><i className="fas fa-video mr-1"></i>Online</span>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-3">
                          <p className="text-sm text-pink-700"><strong>Today's Focus:</strong> Mountain scenery and sky techniques</p>
                        </div>
                      </div>
                      <button className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600 transition-colors">
                        Join Now
                      </button>
                    </div>
                  </div>

                  {/* Music Practice */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-primary">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-music text-purple-600"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Piano Practice Time</h3>
                        <p className="text-gray-600 text-sm mb-2">Self-guided session</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span><i className="fas fa-clock mr-1"></i>6:00 PM - 6:30 PM</span>
                          <span><i className="fas fa-home mr-1"></i>Practice Room</span>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-sm text-purple-700"><strong>Practice Goal:</strong> "Für Elise" - measures 1-16</p>
                        </div>
                      </div>
                      <button className="bg-purple-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors">
                        Start Practice
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress Overview */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Piano Progress */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-music text-purple-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Piano Journey</h3>
                        <p className="text-gray-600 text-sm">with Priya Sharma</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Level 2</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Beginner Pieces</span>
                          <span className="text-purple-600">8/10 Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Music Reading</span>
                          <span className="text-purple-600">75% Progress</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-star text-yellow-500"></i>
                        <span className="text-sm font-medium text-purple-700">Next Milestone: Complete "Für Elise"</span>
                      </div>
                    </div>
                  </div>

                  {/* Art Progress */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-paint-brush text-pink-600"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Watercolor Art</h3>
                        <p className="text-gray-600 text-sm">with Marcus Chen</p>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">Beginner+</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Basic Techniques</span>
                          <span className="text-pink-600">6/8 Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Color Mixing</span>
                          <span className="text-pink-600">60% Progress</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-palette text-pink-500"></i>
                        <span className="text-sm font-medium text-pink-700">Next Project: Sunset Landscape</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Artwork & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* My Art Gallery */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">My Latest Artwork</h3>
                      <a href="#" className="text-pink-500 hover:text-pink-600 text-sm font-medium">View Gallery</a>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="relative group" onClick={handleArtworkClick}>
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-image text-blue-400 text-2xl"></i>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <i className="fas fa-eye text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">Ocean Waves</p>
                        <p className="text-xs text-gray-400 text-center">2 days ago</p>
                      </div>
                      <div className="relative group" onClick={handleArtworkClick}>
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-leaf text-green-400 text-2xl"></i>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <i className="fas fa-eye text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">Forest Path</p>
                        <p className="text-xs text-gray-400 text-center">1 week ago</p>
                      </div>
                      <div className="relative group" onClick={handleArtworkClick}>
                        <div className="aspect-square bg-gradient-to-br from-yellow-100 to-orange-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-sun text-orange-400 text-2xl"></i>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <i className="fas fa-eye text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">Sunny Day</p>
                        <p className="text-xs text-gray-400 text-center">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements & Messages */}
                <div className="space-y-6">
                  {/* Recent Achievements */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-trophy text-yellow-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-sm">First Piano Piece!</p>
                          <p className="text-xs text-gray-500">Twinkle Twinkle Little Star</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-medal text-pink-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Color Expert</p>
                          <p className="text-xs text-gray-500">Mixed 10 new colors</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages from Mentors */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-pink-600 text-xs font-semibold">M</span>
                          </div>
                          <span className="font-medium text-sm">Marcus</span>
                        </div>
                        <p className="text-sm text-gray-700">"Great work on your ocean painting, Emma! 🌊"</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-semibold">P</span>
                          </div>
                          <span className="font-medium text-sm">Priya</span>
                        </div>
                        <p className="text-sm text-gray-700">"Keep practicing the scales! You're doing amazing! 🎵"</p>
                        <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week's Sessions</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="text-center min-w-0">
                        <div className="text-sm font-semibold text-purple-600">WED</div>
                        <div className="text-lg font-bold text-gray-900">24</div>
                      </div>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-music text-purple-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Piano Lesson</h4>
                        <p className="text-gray-600 text-sm">with Priya Sharma • 3:00 PM - 4:00 PM</p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Upcoming</span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
                      <div className="text-center min-w-0">
                        <div className="text-sm font-semibold text-pink-600">FRI</div>
                        <div className="text-lg font-bold text-gray-900">26</div>
                      </div>
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-paint-brush text-pink-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Art Workshop</h4>
                        <p className="text-gray-600 text-sm">with Marcus Chen • 4:00 PM - 5:30 PM</p>
                      </div>
                      <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">Workshop</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default YoungLearnerProfile;
