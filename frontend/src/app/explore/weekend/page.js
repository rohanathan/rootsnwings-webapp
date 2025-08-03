'use client';

import { useState, useEffect } from 'react';

// Define the data for the batch cards to be easily mapped
const batchesData = [
  {
    id: 1,
    title: '4-Week Beginner Batch',
    level: 'beginner',
    levelLabel: 'Beginner',
    levelColor: 'bg-blue-100 text-blue-700',
    ageGroup: 'child',
    ageGroupLabel: 'Children (5-12)',
    ageGroupColor: 'bg-green-100 text-green-700',
    price: '£120',
    sessions: '8 sessions',
    dates: 'Sat 10 Aug - Sun 1 Sep',
    duration: '4 weekends',
    time: 'Sat & Sun | 10:00 AM - 11:00 AM',
    timeDetail: '1 hour each session',
    location: 'Online via Zoom',
    locationDetail: 'Interactive & engaging',
    seats: 3,
    seatStatus: 'Filling up fast',
    seatIndicatorColor: 'bg-orange-400 animate-pulse',
    isPopular: false,
  },
  {
    id: 2,
    title: '8-Week Intermediate Batch',
    level: 'intermediate',
    levelLabel: 'Intermediate',
    levelColor: 'bg-yellow-100 text-yellow-700',
    ageGroup: 'teen',
    ageGroupLabel: 'Teens (13-17)',
    ageGroupColor: 'bg-purple-100 text-purple-700',
    price: '£200',
    sessions: '16 sessions',
    dates: 'Sat 17 Aug - Sun 15 Sep',
    duration: '8 weekends',
    time: 'Sat & Sun | 2:00 PM - 3:00 PM',
    timeDetail: 'Perfect for school schedules',
    location: 'In-Person (Birmingham)',
    locationDetail: 'Community centre venue',
    seats: 2,
    seatStatus: 'Almost full',
    seatIndicatorColor: 'bg-red-400 animate-pulse',
    isPopular: true,
  },
  {
    id: 3,
    title: '12-Week Advanced Mastery',
    level: 'advanced',
    levelLabel: 'Advanced',
    levelColor: 'bg-red-100 text-red-700',
    ageGroup: 'adult',
    ageGroupLabel: 'Adults (18+)',
    ageGroupColor: 'bg-indigo-100 text-indigo-700',
    price: '£320',
    sessions: '24 sessions',
    dates: 'Sat 24 Aug - Sun 17 Nov',
    duration: '12 weekends',
    time: 'Sat & Sun | 6:00 PM - 7:00 PM',
    timeDetail: 'Evening sessions',
    location: 'Hybrid (Online + In-person)',
    locationDetail: 'Best of both worlds',
    seats: 6,
    seatStatus: 'Good availability',
    seatIndicatorColor: 'bg-green-400',
    isPopular: false,
  },
  {
    id: 4,
    title: '4-Week Adult Discovery',
    level: 'beginner',
    levelLabel: 'Beginner',
    levelColor: 'bg-blue-100 text-blue-700',
    ageGroup: 'adult',
    ageGroupLabel: 'Adults (18+)',
    ageGroupColor: 'bg-indigo-100 text-indigo-700',
    price: '£140',
    sessions: '8 sessions',
    dates: 'Sat 31 Aug - Sun 22 Sep',
    duration: '4 weekends',
    time: 'Sat & Sun | 11:00 AM - 12:00 PM',
    timeDetail: 'Perfect weekend start',
    location: 'In-Person (Birmingham)',
    locationDetail: 'Welcoming studio space',
    seats: 5,
    seatStatus: 'Good availability',
    seatIndicatorColor: 'bg-green-400',
    isPopular: false,
  },
  {
    id: 5,
    title: '8-Week Teen Performance',
    level: 'advanced',
    levelLabel: 'Advanced',
    levelColor: 'bg-red-100 text-red-700',
    ageGroup: 'teen',
    ageGroupLabel: 'Teens (13-17)',
    ageGroupColor: 'bg-purple-100 text-purple-700',
    price: '£240',
    sessions: '16 sessions',
    dates: 'Sat 7 Sep - Sun 2 Nov',
    duration: '8 weekends',
    time: 'Sat & Sun | 3:00 PM - 4:00 PM',
    timeDetail: 'Performance focused',
    location: 'Online via Zoom',
    locationDetail: 'Advanced techniques',
    seats: 4,
    seatStatus: 'Moderate availability',
    seatIndicatorColor: 'bg-yellow-400',
    isPopular: false,
  },
  {
    id: 6,
    title: '4-Week Child Improver',
    level: 'intermediate',
    levelLabel: 'Intermediate',
    levelColor: 'bg-yellow-100 text-yellow-700',
    ageGroup: 'child',
    ageGroupLabel: 'Children (5-12)',
    ageGroupColor: 'bg-green-100 text-green-700',
    price: '£130',
    sessions: '8 sessions',
    dates: 'Sat 14 Sep - Sun 6 Oct',
    duration: '4 weekends',
    time: 'Sat & Sun | 9:00 AM - 10:00 AM',
    timeDetail: 'Early bird sessions',
    location: 'Hybrid (Online + In-person)',
    locationDetail: 'Flexible format',
    seats: 7,
    seatStatus: 'Good availability',
    seatIndicatorColor: 'bg-green-400',
    isPopular: false,
  },
];

export default function WeekendGroupClasses() {
  const [filters, setFilters] = useState({
    level: '',
    ageGroup: '',
    time: '',
  });
  const [filteredBatches, setFilteredBatches] = useState(batchesData);

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Effect to apply filters whenever the filter state changes
  useEffect(() => {
    const applyFilters = () => {
      const { level, ageGroup, time } = filters;
      const newFilteredBatches = batchesData.filter((batch) => {
        const levelMatch = !level || batch.level === level;
        const ageMatch = !ageGroup || batch.ageGroup === ageGroup;
        const timeMatch = !time || batch.time.toLowerCase().includes(time.toLowerCase());
        return levelMatch && ageMatch && timeMatch;
      });
      setFilteredBatches(newFilteredBatches);
    };

    applyFilters();
  }, [filters]);

  // Handle reserve spot button click
  const handleReserveSpot = (batch) => {
    alert(`Great! You're interested in "${batch.title}". Redirecting to booking form...`);
    // In a real app, you would handle navigation here, e.g., router.push(`/book/${batch.id}`);
  };

  // Handle contact/notify button clicks
  const handleCtaClick = (type) => {
    if (type === 'contact') {
      alert('Opening contact form...\nShare your preferred level, age group, and timing!');
    } else {
      alert("You'll be notified when new batches matching your interests are available!");
    }
  };

  return (
    <>
      {/* Tailwind config script is not needed in Next.js, as Tailwind is configured globally */}
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
          color: #2d3748; /* text-gray-800 */
          background-color: #f7fafc; /* bg-gray-50 */
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .batch-card-animation {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
      
      {/* Navigation Component */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Profile</a>
              <a href="#" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mini Mentor Info Card Component */}
      <div className="fixed top-16 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold">
                P
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-dark">Priya Sharma</h2>
                <p className="text-sm text-gray-600">Kathak Dance & Cultural Arts</p>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-xs">★★★★★</div>
                  <span className="text-xs text-gray-600">4.9 (32 reviews)</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">🏠 Birmingham & Online</span>
              <button className="text-primary hover:text-primary-dark font-medium transition-colors text-sm">
                💬 Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-5">
          
          {/* Page Header Component */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary-dark mb-4">Weekend Group Classes</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Learn with a group every weekend. Affordable, structured learning with fellow enthusiasts. 
              Build friendships while mastering traditional dance forms.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">👥</span>
                <span>Small Groups (4-8 students)</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">📅</span>
                <span>Every Saturday & Sunday</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">💰</span>
                <span>Save up to 40% vs individual sessions</span>
              </div>
            </div>
          </div>

          {/* Filter Bar Component */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="level-filter" className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                <select
                  id="level-filter"
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="age-filter" className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
                <select
                  id="age-filter"
                  name="ageGroup"
                  value={filters.ageGroup}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Ages</option>
                  <option value="child">Children (5-12)</option>
                  <option value="teen">Teenagers (13-17)</option>
                  <option value="adult">Adults (18+)</option>
                </select>
              </div>
              <div>
                <label htmlFor="time-filter" className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                <select
                  id="time-filter"
                  name="time"
                  value={filters.time}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Times</option>
                  <option value="morning">Morning (9-12 PM)</option>
                  <option value="afternoon">Afternoon (12-5 PM)</option>
                  <option value="evening">Evening (5-8 PM)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilteredBatches(batchesData.filter(batch => {
                    const levelMatch = !filters.level || batch.level === filters.level;
                    const ageMatch = !filters.ageGroup || batch.ageGroup === filters.ageGroup;
                    const timeMatch = !filters.time || batch.time.toLowerCase().includes(filters.time.toLowerCase());
                    return levelMatch && ageMatch && timeMatch;
                  }))}
                  className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Batch Cards Grid Component */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 batch-card-animation"
                >
                  {batch.isPopular && (
                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                      🔥 Most Popular
                    </div>
                  )}
                  <div className={`flex items-start justify-between mb-4 ${batch.isPopular ? 'mt-2' : ''}`}>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary-dark mb-2">{batch.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${batch.ageGroupColor}`}>
                          {batch.ageGroup === 'child' && '👶'}
                          {batch.ageGroup === 'teen' && '👦'}
                          {batch.ageGroup === 'adult' && '👩‍🦳'}
                          {' '}{batch.ageGroupLabel}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${batch.levelColor}`}>
                          {batch.level === 'beginner' && '⭐'}
                          {batch.level === 'intermediate' && '⚡'}
                          {batch.level === 'advanced' && '🏆'}
                          {' '}{batch.levelLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-dark">{batch.price}</div>
                      <div className="text-sm text-gray-500">{batch.sessions}</div>
                    </div>
                  </div>

                  {/* Date & Time Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <span className="text-xl mr-3">📅</span>
                      <div>
                        <div className="font-semibold">{batch.dates}</div>
                        <div className="text-sm text-gray-500">{batch.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-xl mr-3">⏰</span>
                      <div>
                        <div className="font-semibold">{batch.time}</div>
                        <div className="text-sm text-gray-500">{batch.timeDetail}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-xl mr-3">
                        {batch.location.includes('Online') ? '💻' : batch.location.includes('In-Person') ? '🏠' : '🎭'}
                      </span>
                      <div>
                        <div className="font-semibold">{batch.location}</div>
                        <div className="text-sm text-gray-500">{batch.locationDetail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity & CTA */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">👥</span>
                      <span className="text-sm text-gray-600">{batch.seats} seats left</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${batch.seatIndicatorColor}`} title={batch.seatStatus}></div>
                  </div>

                  <button
                    onClick={() => handleReserveSpot(batch)}
                    className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                  >
                    Reserve Your Spot
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 text-lg md:col-span-2 lg:col-span-3">No batches found matching your filters.</p>
            )}
          </div>

          {/* Bottom CTA Section Component */}
          <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-dark mb-4">Not finding a suitable batch?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Don't worry! Priya regularly starts new batches based on demand. Share your preferences and she'll let you know when a perfect batch becomes available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCtaClick('contact')}
                className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                💬 Contact Mentor
              </button>
              <button
                onClick={() => handleCtaClick('notify')}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                🔔 Get Notified of New Batches
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Or try our <a href="#" className="text-primary hover:text-primary-dark font-semibold">one-on-one sessions</a> for immediate start
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

