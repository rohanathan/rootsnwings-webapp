'use client';

import { useState, useEffect } from 'react';

// Helper functions for conditional visual styling
const getLevelBadge = (level) => {
  switch(level?.toLowerCase()) {
    case 'beginner': return { color: 'bg-blue-100 text-blue-700', icon: '⭐', label: 'Beginner' };
    case 'intermediate': return { color: 'bg-yellow-100 text-yellow-700', icon: '⚡', label: 'Intermediate' };
    case 'advanced': return { color: 'bg-red-100 text-red-700', icon: '🏆', label: 'Advanced' };
    default: return { color: 'bg-gray-100 text-gray-700', icon: '📚', label: 'All Levels' };
  }
};

const getAgeGroupBadge = (ageGroup) => {
  switch(ageGroup?.toLowerCase()) {
    case 'child': 
    case 'children': 
      return { color: 'bg-green-100 text-green-700', icon: '👶', label: 'Children (5-12)' };
    case 'teen': 
    case 'teens': 
      return { color: 'bg-purple-100 text-purple-700', icon: '🎓', label: 'Teens (13-17)' };
    case 'adult': 
    case 'adults': 
      return { color: 'bg-indigo-100 text-indigo-700', icon: '👩‍💼', label: 'Adults (18+)' };
    default: return { color: 'bg-gray-100 text-gray-700', icon: '👥', label: 'All Ages' };
  }
};

const getAvailabilityStatus = (available, max) => {
  const ratio = available / max;
  if (ratio > 0.5) return { status: 'Good availability', color: 'bg-green-400' };
  if (ratio > 0.2) return { status: 'Filling up fast', color: 'bg-orange-400 animate-pulse' };
  return { status: 'Almost full', color: 'bg-red-400 animate-pulse' };
};

const getFormatIcon = (format) => {
  switch(format?.toLowerCase()) {
    case 'online': return '💻';
    case 'in-person': return '🏠';
    case 'hybrid': return '🎭';
    default: return '📍';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'short' 
  });
};

const formatSchedule = (weeklySchedule) => {
  if (!weeklySchedule || weeklySchedule.length === 0) return 'Schedule TBD';
  
  const days = weeklySchedule.map(s => s.day.slice(0, 3)).join(' & ');
  const time = weeklySchedule[0].startTime + ' - ' + weeklySchedule[0].endTime;
  return `${days} | ${time}`;
};

// API-ready mock data for Group Batches (type: "batch" or "group")
const groupBatchesData = [
  {
    id: "class_batch_001",
    type: "batch",
    title: "4-Week Evening Intensive",
    level: "beginner",
    ageGroup: "adult",
    format: "online",
    subject: "kathak",
    description: "Learn Kathak fundamentals in this structured 4-week intensive program with daily practice sessions.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 280,
      perSession: 14,
      sessions: 20,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-05",
      endDate: "2025-08-30",
      weeklySchedule: [
        {day: "Monday", startTime: "18:00", endTime: "19:00"},
        {day: "Tuesday", startTime: "18:00", endTime: "19:00"},
        {day: "Wednesday", startTime: "18:00", endTime: "19:00"},
        {day: "Thursday", startTime: "18:00", endTime: "19:00"},
        {day: "Friday", startTime: "18:00", endTime: "19:00"}
      ],
      sessionDuration: 60
    },
    capacity: {
      maxStudents: 8,
      currentEnrollment: 4,
      available: 4
    }
  },
  {
    id: "class_batch_002",
    type: "batch",
    title: "8-Week Teen Accelerator",
    level: "intermediate",
    ageGroup: "teen",
    format: "in-person",
    subject: "dance",
    description: "Accelerated learning program for teens with performance opportunities and skill advancement.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 480,
      perSession: 12,
      sessions: 40,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-12",
      endDate: "2025-10-04",
      weeklySchedule: [
        {day: "Monday", startTime: "16:00", endTime: "17:00"},
        {day: "Tuesday", startTime: "16:00", endTime: "17:00"},
        {day: "Wednesday", startTime: "16:00", endTime: "17:00"},
        {day: "Thursday", startTime: "16:00", endTime: "17:00"},
        {day: "Friday", startTime: "16:00", endTime: "17:00"}
      ],
      sessionDuration: 60
    },
    capacity: {
      maxStudents: 10,
      currentEnrollment: 8,
      available: 2
    }
  },
  {
    id: "class_batch_003",
    type: "batch",
    title: "12-Week Master Program",
    level: "advanced",
    ageGroup: "adult",
    format: "hybrid",
    subject: "kathak",
    description: "Comprehensive mastery program combining traditional techniques with modern performance styles.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 850,
      perSession: 14.17,
      sessions: 60,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-19",
      endDate: "2025-11-08",
      weeklySchedule: [
        {day: "Monday", startTime: "10:00", endTime: "11:00"},
        {day: "Wednesday", startTime: "10:00", endTime: "11:00"},
        {day: "Friday", startTime: "10:00", endTime: "11:00"},
        {day: "Saturday", startTime: "14:00", endTime: "15:00"},
        {day: "Sunday", startTime: "14:00", endTime: "15:00"}
      ],
      sessionDuration: 60
    },
    capacity: {
      maxStudents: 6,
      currentEnrollment: 0,
      available: 6
    }
  },
  {
    id: "class_batch_004",
    type: "batch",
    title: "6-Week Kids Foundation",
    level: "beginner",
    ageGroup: "child",
    format: "in-person",
    subject: "dance",
    description: "Fun and engaging foundation program designed specifically for young learners with age-appropriate activities.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 350,
      perSession: 11.67,
      sessions: 30,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-26",
      endDate: "2025-10-04",
      weeklySchedule: [
        {day: "Monday", startTime: "15:30", endTime: "16:30"},
        {day: "Tuesday", startTime: "15:30", endTime: "16:30"},
        {day: "Wednesday", startTime: "15:30", endTime: "16:30"},
        {day: "Thursday", startTime: "15:30", endTime: "16:30"},
        {day: "Friday", startTime: "15:30", endTime: "16:30"}
      ],
      sessionDuration: 60
    },
    capacity: {
      maxStudents: 8,
      currentEnrollment: 3,
      available: 5
    }
  }
];

export default function GroupBatches() {
  const [filters, setFilters] = useState({
    level: '',
    ageGroup: '',
    format: '',
    subject: '',
  });
  const [filteredBatches, setFilteredBatches] = useState(groupBatchesData);

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
      const { level, ageGroup, format, subject } = filters;
      const newFilteredBatches = groupBatchesData.filter((batch) => {
        const levelMatch = !level || batch.level?.toLowerCase() === level.toLowerCase();
        const ageMatch = !ageGroup || batch.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
        const formatMatch = !format || batch.format?.toLowerCase() === format.toLowerCase();
        const subjectMatch = !subject || batch.subject?.toLowerCase() === subject.toLowerCase();
        return levelMatch && ageMatch && formatMatch && subjectMatch;
      });
      setFilteredBatches(newFilteredBatches);
    };

    applyFilters();
  }, [filters]);

  // Handle enrollment button click
  const handleEnrollNow = (batch) => {
    alert(`Enrolling you in "${batch.title}". Redirecting to payment...`);
    // TODO: Replace with actual navigation when API integration is ready
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
          color: #2d3748;
          background-color: #f7fafc;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .batch-card-animation {
          animation: fadeIn 0.3s ease-in;
        }
        .primary-dark { color: #00468C; }
        .primary { color: #00A2E8; }
        .bg-primary { background-color: #00A2E8; }
        .bg-primary:hover { background-color: #0056b3; }
      `}</style>

      {/* Navigation Component */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <a href="#" className="text-2xl font-bold primary-dark">Roots & Wings</a>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">← Back to Profile</a>
              <a href="#" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Dynamic Mentor Info Header */}
      <div className="fixed top-16 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Dynamic Mentor Photo */}
              {groupBatchesData[0]?.mentorPhotoURL ? (
                <img 
                  src={groupBatchesData[0].mentorPhotoURL} 
                  alt={groupBatchesData[0].mentorName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {groupBatchesData[0]?.mentorName?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold primary-dark">
                  {groupBatchesData[0]?.mentorName || 'Mentor Name'}
                </h2>
                <p className="text-sm text-gray-600">
                  {[...new Set(groupBatchesData.map(b => b.subject))].join(' & ').replace(/^\w/, c => c.toUpperCase())} Specialist
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-xs">★★★★★</div>
                  <span className="text-xs text-gray-600">
                    {groupBatchesData[0]?.mentorRating || 4.9} (32 reviews)
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full ml-2">
                    Group Batch Specialist
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">📚 Structured Programs</span>
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
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold primary-dark mb-4">Group Batches</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join structured group learning programs designed for collaborative skill development. 
              Learn alongside peers in focused, multi-week curricula with dedicated progression tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">👥</span>
                <span>Small group learning</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">📈</span>
                <span>Structured progression</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                <span>Goal-oriented curriculum</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🤝</span>
                <span>Peer collaboration</span>
              </div>
            </div>
          </div>

          {/* Clean Minimal Filter Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <label htmlFor="format-filter" className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                <select
                  id="format-filter"
                  name="format"
                  value={filters.format}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Formats</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject-filter" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  id="subject-filter"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Subjects</option>
                  <option value="kathak">Kathak</option>
                  <option value="dance">Dance</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const { level, ageGroup, format, subject } = filters;
                    const filtered = groupBatchesData.filter(batch => {
                      const levelMatch = !level || batch.level?.toLowerCase() === level.toLowerCase();
                      const ageMatch = !ageGroup || batch.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
                      const formatMatch = !format || batch.format?.toLowerCase() === format.toLowerCase();
                      const subjectMatch = !subject || batch.subject?.toLowerCase() === subject.toLowerCase();
                      return levelMatch && ageMatch && formatMatch && subjectMatch;
                    });
                    setFilteredBatches(filtered);
                  }}
                  className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Group Batch Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => {
                const levelBadge = getLevelBadge(batch.level);
                const ageBadge = getAgeGroupBadge(batch.ageGroup);
                const availabilityStatus = getAvailabilityStatus(batch.capacity.available, batch.capacity.maxStudents);
                
                return (
                  <div 
                    key={batch.id} 
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 batch-card-animation"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold primary-dark mb-2">{batch.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${ageBadge.color}`}>
                            {ageBadge.icon} {ageBadge.label}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${levelBadge.color}`}>
                            {levelBadge.icon} {levelBadge.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold primary-dark">
                          {batch.pricing.currency}{batch.pricing.total}
                        </div>
                        <div className="text-sm text-gray-500">
                          {batch.pricing.sessions} sessions
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {batch.description}
                    </p>

                    {/* Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">📅</span>
                        <div>
                          <div className="font-semibold">
                            {formatDate(batch.schedule.startDate)} - {formatDate(batch.schedule.endDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.ceil((new Date(batch.schedule.endDate) - new Date(batch.schedule.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks program
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">⏰</span>
                        <div>
                          <div className="font-semibold">{formatSchedule(batch.schedule.weeklySchedule)}</div>
                          <div className="text-sm text-gray-500">{batch.schedule.sessionDuration} min sessions</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">{getFormatIcon(batch.format)}</span>
                        <div>
                          <div className="font-semibold capitalize">{batch.format}</div>
                          <div className="text-sm text-gray-500">
                            {batch.format === 'online' && 'Interactive virtual sessions'}
                            {batch.format === 'in-person' && 'Physical studio location'}
                            {batch.format === 'hybrid' && 'Online + in-person combined'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & CTA */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">👥</span>
                        <span className="text-sm text-gray-600">
                          {batch.capacity.available} seats left
                        </span>
                      </div>
                      <div 
                        className={`w-3 h-3 rounded-full ${availabilityStatus.color}`} 
                        title={availabilityStatus.status}
                      ></div>
                    </div>

                    <button
                      onClick={() => handleEnrollNow(batch)}
                      className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 text-lg md:col-span-2 lg:col-span-3">
                No group batches found matching your filters.
              </p>
            )}
          </div>

          {/* Bottom CTA Section */}
          <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold primary-dark mb-4">Not finding a suitable batch?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Don't worry! Our mentors regularly start new batches based on demand. Share your preferences 
              and get notified when a perfect batch becomes available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                💬 Contact Mentor
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors">
                🔔 Get Notified of New Batches
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Or try our <a href="#" className="text-primary hover:text-primary-dark font-semibold">workshops</a> for shorter commitments
            </div>
          </div>
        </div>
      </main>
    </>
  );
}