'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { calculateTotalPayable, formatPrice } from '../../utils/pricingCalculator';
import ChildSelectionModal from '@/components/ChildSelectionModal';

// Helper functions for conditional visual styling (same as group-batches)
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
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const formatSchedule = (weeklySchedule) => {
  if (!weeklySchedule || weeklySchedule.length === 0) return 'Schedule TBD';
  
  const days = weeklySchedule.map(s => s.day.slice(0, 3)).join(' & ');
  const time = weeklySchedule[0].startTime + ' - ' + weeklySchedule[0].endTime;
  return `${days} | ${time}`;
};

const getWorkshopDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (days === 1) return 'Single day intensive';
  if (days <= 3) return `${days}-day intensive`;
  if (days <= 7) return `${days}-day program`;
  return 'Multi-week workshop';
};

// API-ready mock data for Workshops (type: "workshop")
const workshopsData = [
  {
    id: "workshop_001",
    type: "workshop",
    title: "Weekend Kathak Intensive",
    level: "intermediate",
    ageGroup: "adult",
    format: "in-person",
    subject: "kathak",
    description: "Intensive 2-day workshop focusing on advanced Kathak techniques, expressions, and performance skills. Perfect for dancers looking to deepen their practice in a concentrated format.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 120,
      perSession: 60,
      sessions: 2,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-16",
      endDate: "2025-08-17",
      weeklySchedule: [
        {day: "Saturday", startTime: "10:00", endTime: "16:00"},
        {day: "Sunday", startTime: "10:00", endTime: "16:00"}
      ],
      sessionDuration: 360
    },
    capacity: {
      maxStudents: 15,
      currentEnrollment: 8,
      available: 7
    }
  },
  {
    id: "workshop_002",
    type: "workshop",
    title: "Teen Dance Expression Bootcamp",
    level: "beginner",
    ageGroup: "teen",
    format: "hybrid",
    subject: "dance",
    description: "High-energy 3-day workshop designed for teens to explore creative movement, build confidence, and learn contemporary fusion techniques with traditional dance forms.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 180,
      perSession: 60,
      sessions: 3,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-23",
      endDate: "2025-08-25",
      weeklySchedule: [
        {day: "Friday", startTime: "16:00", endTime: "19:00"},
        {day: "Saturday", startTime: "10:00", endTime: "13:00"},
        {day: "Sunday", startTime: "10:00", endTime: "13:00"}
      ],
      sessionDuration: 180
    },
    capacity: {
      maxStudents: 20,
      currentEnrollment: 12,
      available: 8
    }
  },
  {
    id: "workshop_003",
    type: "workshop",
    title: "Master Class: Advanced Performance",
    level: "advanced",
    ageGroup: "adult",
    format: "online",
    subject: "performance",
    description: "Exclusive single-day masterclass focusing on stage presence, advanced choreography, and professional performance techniques. Limited to experienced dancers only.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 85,
      perSession: 85,
      sessions: 1,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-09-07",
      endDate: "2025-09-07",
      weeklySchedule: [
        {day: "Sunday", startTime: "14:00", endTime: "18:00"}
      ],
      sessionDuration: 240
    },
    capacity: {
      maxStudents: 12,
      currentEnrollment: 10,
      available: 2
    }
  },
  {
    id: "workshop_004",
    type: "workshop",
    title: "Kids Creative Movement Workshop",
    level: "beginner",
    ageGroup: "child",
    format: "in-person",
    subject: "creative_movement",
    description: "Fun-filled half-day workshop where children explore movement, rhythm, and storytelling through dance. Perfect introduction to dance for young learners with games and activities.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 45,
      perSession: 45,
      sessions: 1,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-08-30",
      endDate: "2025-08-30",
      weeklySchedule: [
        {day: "Saturday", startTime: "10:00", endTime: "12:30"}
      ],
      sessionDuration: 150
    },
    capacity: {
      maxStudents: 16,
      currentEnrollment: 4,
      available: 12
    }
  },
  {
    id: "workshop_005",
    type: "workshop",
    title: "Cultural Heritage Dance Workshop",
    level: "intermediate",
    ageGroup: "adult",
    format: "hybrid",
    subject: "cultural_dance",
    description: "Immersive 4-day workshop exploring the cultural significance and traditional techniques of classical Indian dance forms, combining theory with practical sessions.",
    mentorName: "Priya Sharma",
    mentorPhotoURL: "https://randomuser.me/api/portraits/women/45.jpg",
    mentorRating: 4.9,
    pricing: {
      total: 240,
      perSession: 60,
      sessions: 4,
      currency: "GBP"
    },
    schedule: {
      startDate: "2025-09-12",
      endDate: "2025-09-15",
      weeklySchedule: [
        {day: "Thursday", startTime: "18:00", endTime: "21:00"},
        {day: "Friday", startTime: "18:00", endTime: "21:00"},
        {day: "Saturday", startTime: "14:00", endTime: "17:00"},
        {day: "Sunday", startTime: "14:00", endTime: "17:00"}
      ],
      sessionDuration: 180
    },
    capacity: {
      maxStudents: 10,
      currentEnrollment: 3,
      available: 7
    }
  }
];

export default function Workshops() {
  
  const [filters, setFilters] = useState({
    level: '',
    ageGroup: '',
    format: '',
    subject: '',
  });
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  
  // Child selection modal state
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Fetch workshops from API
  useEffect(() => {
    const fetchWorkshopsData = async () => {
      setLoading(true);
      try {
        // Get mentorId from URL params or localStorage
          const urlParams = new URLSearchParams(window.location.search);
          const urlMentorId = urlParams.get('mentorId');
          const urlType = urlParams.get('type');
        
        let mentorId = urlMentorId;
        let mentor = null;
        
        // If no URL params, fetch all workshops
        if (!mentorId) {
          const storedMentor = localStorage.getItem("mentor");
          if (storedMentor) {
            mentor = JSON.parse(storedMentor);
            mentorId = mentor.uid;
          }
        }
        
        // Build API URL with query parameters
        let apiUrl = `https://rootsnwings-api-944856745086.europe-west2.run.app/classes?type=workshop`;
        if (mentorId) {
          apiUrl += `&mentorId=${mentorId}`;
        }
        
        console.log('Fetching workshops from:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('API Response:', response.data);
        console.log('Number of workshops returned:', response.data.classes?.length);
        console.log('Workshop mentorIds:', response.data.classes?.map(w => w.mentorId));
        setWorkshops(response.data.classes || []);
        
        // If we have URL params, also try to fetch mentor info for display
        if (urlMentorId && !mentor) {
          try {
            const mentorResponse = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/mentors/${urlMentorId}`);
            if (mentorResponse.data?.mentor) {
              localStorage.setItem('mentor', JSON.stringify(mentorResponse.data.mentor));
            }
          } catch (mentorError) {
            console.warn('Could not fetch mentor details:', mentorError);
          }
        }
        
      } catch (error) {
        console.error('Error fetching workshops data:', error);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopsData();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const idToken = await currentUser.getIdToken();
          const profileResponse = await axios.get(
            `https://rootsnwings-api-944856745086.europe-west2.run.app/users/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          
          const userData = profileResponse.data?.user || {};
          setUserRoles(userData.roles || []);
          
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRoles(['student']); // Default fallback
        }
      } else {
        setUser(null);
        setUserRoles([]);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Apply filters to workshops
  const filteredWorkshops = workshops.filter((workshop) => {
    const { level, ageGroup, format, subject } = filters;
    const levelMatch = !level || workshop.level?.toLowerCase() === level.toLowerCase();
    const ageMatch = !ageGroup || workshop.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
    const formatMatch = !format || workshop.format?.toLowerCase() === format.toLowerCase();
    const subjectMatch = !subject || workshop.subject?.toLowerCase().includes(subject.toLowerCase());
    return levelMatch && ageMatch && formatMatch && subjectMatch;
  });

  // Handle enrollment button click
  const handleEnrollNow = (workshop) => {
    // Check if user has student profile (required for all bookings)
    const isStudent = userRoles.includes('student');
    if (!isStudent) {
      alert('⚠️ Student Profile Required\n\nTo book classes, you need to have a student profile.\n\nPlease complete your student profile setup first.');
      return;
    }

    // Check if user needs to select a child for child/teen classes
    const isChildTeeenClass = workshop.ageGroup === 'child' || workshop.ageGroup === 'teen';
    const isParent = userRoles.includes('parent');
    
    if (isChildTeeenClass && isParent) {
      // Show child selection modal
      setSelectedWorkshop(workshop);
      setShowChildModal(true);
    } else if (isChildTeeenClass && !isParent) {
      // Show error message for non-parent users
      alert('⚠️ Parent Profile Required\n\nThis workshop is designed for children/teens. To book workshops for young learners, you need to have a parent profile.\n\nPlease contact support to add parent role to your account.');
    } else {
      // Direct enrollment for adult classes or non-parent users
      localStorage.setItem('selectedMentorClass', JSON.stringify(workshop));
      window.location.href = `/booking/confirmbooking/${workshop.classId}`;
    }
  };

  // Handle child selection from modal
  const handleChildSelected = (childData) => {
    if (selectedWorkshop) {
      // Store workshop data with child information
      const bookingData = {
        ...selectedWorkshop,
        selectedChild: childData
      };
      localStorage.setItem('selectedMentorClass', JSON.stringify(bookingData));
      window.location.href = `/booking/confirmbooking/${selectedWorkshop.classId}`;
    }
    setShowChildModal(false);
    setSelectedWorkshop(null);
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
        .workshop-card-animation {
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
            <a href="/" className="text-2xl font-bold text-primary-dark hover:text-primary transition-colors">Roots & Wings</a>
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
              {workshops[0]?.mentorPhotoURL ? (
                <img 
                  src={workshops[0].mentorPhotoURL} 
                  alt={workshops[0].mentorName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {workshops[0]?.mentorName?.charAt(0) || 'M'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold primary-dark">
                  {workshops[0]?.mentorName || 'Mentor Name'}
                </h2>
                <p className="text-sm text-gray-600">
                  {[...new Set(workshops.map(w => w.subject))].join(' & ').replace(/^\w/, c => c.toUpperCase())} Workshops
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-xs">★★★★★</div>
                  <span className="text-xs text-gray-600">
                    {workshops[0]?.mentorRating || 4.9} ({workshops[0]?.totalReviews || 0} reviews)
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full ml-2">
                    Workshop Specialist
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">🎯 Intensive Learning</span>
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
            <h1 className="text-4xl font-bold primary-dark mb-4">Intensive Workshops</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join focused, intensive workshops designed to teach specific skills in concentrated timeframes. 
              Perfect for skill acceleration, creative exploration, and diving deep into specialized techniques.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                <span>Focused intensive learning</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                <span>Skill acceleration</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🔥</span>
                <span>Short-term commitment</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎨</span>
                <span>Creative exploration</span>
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
                <label htmlFor="subject-filter" className="block text-sm font-semibold text-gray-700 mb-2">Focus Area</label>
                <select
                  id="subject-filter"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                >
                  <option value="">All Areas</option>
                  <option value="kathak">Kathak</option>
                  <option value="dance">General Dance</option>
                  <option value="performance">Performance</option>
                  <option value="creative">Creative Movement</option>
                  <option value="cultural">Cultural Heritage</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const { level, ageGroup, format, subject } = filters;
                    const filtered = workshopsData.filter(workshop => {
                      const levelMatch = !level || workshop.level?.toLowerCase() === level.toLowerCase();
                      const ageMatch = !ageGroup || workshop.ageGroup?.toLowerCase() === ageGroup.toLowerCase();
                      const formatMatch = !format || workshop.format?.toLowerCase() === format.toLowerCase();
                      const subjectMatch = !subject || workshop.subject?.toLowerCase().includes(subject.toLowerCase());
                      return levelMatch && ageMatch && formatMatch && subjectMatch;
                    });
                    setFilteredWorkshops(filtered);
                  }}
                  className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workshops...</p>
            </div>
          )}

          {/* Workshop Cards Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredWorkshops.length > 0 ? (
              filteredWorkshops.map((workshop) => {
                const levelBadge = getLevelBadge(workshop.level);
                const ageBadge = getAgeGroupBadge(workshop.ageGroup);
                const availabilityStatus = getAvailabilityStatus(workshop.capacity.available, workshop.capacity.maxStudents);
                const duration = getWorkshopDuration(workshop.schedule.startDate, workshop.schedule.endDate);
                
                return (
                  <div 
                    key={workshop.id} 
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 workshop-card-animation relative"
                  >
                    {/* Workshop Type Badge */}
                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-1 rounded-full text-sm font-bold">
                      🎯 Workshop
                    </div>

                    {/* Workshop Image */}
                    {workshop.classImage && (
                      <div className="mb-4">
                        <img 
                          src={workshop.classImage} 
                          alt={workshop.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold primary-dark mb-2">{workshop.title}</h3>
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
                        {(() => {
                          const pricing = calculateTotalPayable(workshop);
                          return (
                            <>
                              <div className="text-2xl font-bold primary-dark">
                                {formatPrice(pricing.finalPrice, pricing.currency)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pricing.totalSessions === 1 ? 'Single session' : `${pricing.totalSessions || 1} sessions`}
                                {pricing.discountAmount > 0 && (
                                  <div className="text-green-600 text-xs">
                                    Save {formatPrice(pricing.discountAmount, pricing.currency)}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {workshop.description}
                    </p>

                    {/* Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">📅</span>
                        <div>
                          <div className="font-semibold">
                            {formatDate(workshop.schedule.startDate)}
                            {workshop.schedule.startDate !== workshop.schedule.endDate && 
                              ` - ${formatDate(workshop.schedule.endDate)}`
                            }
                          </div>
                          <div className="text-sm text-gray-500">{duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">⏰</span>
                        <div>
                          <div className="font-semibold">{formatSchedule(workshop.schedule.weeklySchedule)}</div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(workshop.schedule.sessionDuration / 60)}h {workshop.schedule.sessionDuration % 60}m per session
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <span className="text-xl mr-3">{getFormatIcon(workshop.format)}</span>
                        <div>
                          <div className="font-semibold capitalize">{workshop.format}</div>
                          <div className="text-sm text-gray-500">
                            {workshop.format === 'online' && 'Interactive virtual workshop'}
                            {workshop.format === 'in-person' && 'Physical workshop space'}
                            {workshop.format === 'hybrid' && 'Online + in-person combined'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & CTA */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">👥</span>
                        <span className="text-sm text-gray-600">
                          {workshop.capacity.available} spots left
                        </span>
                      </div>
                      <div 
                        className={`w-3 h-3 rounded-full ${availabilityStatus.color}`} 
                        title={availabilityStatus.status}
                      ></div>
                    </div>

                    <button
                      onClick={() => handleEnrollNow(workshop)}
                      className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors"
                    >
                      Reserve Spot
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 text-lg md:col-span-2 lg:col-span-3">
                No workshops found matching your filters.
              </p>
            )}
            </div>
          )}

          {/* Bottom CTA Section */}
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold primary-dark mb-4">Looking for something specific?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Don't see the workshop you're looking for? Our mentors regularly create new intensive 
              workshops based on student interest and seasonal themes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                💬 Request Custom Workshop
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors">
                🔔 Get Workshop Alerts
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Or explore our <a href="#" className="text-primary hover:text-primary-dark font-semibold">group batches</a> for longer-term learning
            </div>
          </div>
        </div>
      </main>

      {/* Child Selection Modal */}
      <ChildSelectionModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSelectChild={handleChildSelected}
        classData={selectedWorkshop}
        user={user}
        userRoles={userRoles}
      />
    </>
  );
}