"use client"; // This is needed to enable client-side interactivity in Next.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/NavBar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// API Configuration
const API_BASE_URL = 'https://rootsnwings-api-944856745086.europe-west2.run.app';

export default function Home() {
  const router = useRouter();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    age: '',
    mode: '',
    date: '',
    price: '',
  });
  const [categories, setCategories] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [notification, setNotification] = useState(null);

  // Fetch workshops from API
  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Always fetch workshops
      params.append('type', 'workshop');
      params.append('status', 'approved'); // Only show approved workshops
      
      // Add search query
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      // Add filters - fix parameter names to match backend
      if (filters.subject) {
        // Map frontend category names to backend category values
        const categoryMapping = {
          'Music': 'music',
          'Art & Craft': 'visual_arts',
          'Dance': 'performing_arts',
          'Technology': 'technology',
          'Cooking': 'culinary_arts',
          'Yoga': 'wellness',
          'Language': 'languages',
          'Martial Arts': 'martial_arts'
        };
        const mappedCategory = categoryMapping[filters.subject] || filters.subject.toLowerCase().replace(' ', '_');
        params.append('category', mappedCategory);
      }
      
      if (filters.age) {
        params.append('ageGroup', filters.age);
      }
      
      if (filters.mode) {
        // Map frontend mode values to backend format values
        const modeMapping = {
          'online': 'online',
          'in-person': 'in-person',
          'hybrid': 'hybrid'
        };
        const mappedMode = modeMapping[filters.mode] || filters.mode;
        params.append('format', mappedMode);
      }
      
      // Price filtering (convert price categories to actual ranges)
      if (filters.price === 'free') {
        params.append('maxPrice', '0');
      } else if (filters.price === 'under-20') {
        params.append('maxPrice', '19.99');
      } else if (filters.price === '20-50') {
        params.append('minPrice', '20');
        params.append('maxPrice', '50');
      } else if (filters.price === 'over-50') {
        params.append('minPrice', '50.01');
      }
      
      // Date filtering for upcoming workshops
      if (filters.date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        let startDateFrom = null;
        let startDateTo = null;
        
        switch (filters.date) {
          case 'today':
            startDateFrom = today.toISOString().split('T')[0];
            startDateTo = today.toISOString().split('T')[0];
            break;
          case 'tomorrow':
            startDateFrom = tomorrow.toISOString().split('T')[0];
            startDateTo = tomorrow.toISOString().split('T')[0];
            break;
          case 'this-week':
            startDateFrom = today.toISOString().split('T')[0];
            startDateTo = nextWeek.toISOString().split('T')[0];
            break;
          case 'next-week':
            startDateFrom = nextWeek.toISOString().split('T')[0];
            const weekAfterNext = new Date(nextWeek);
            weekAfterNext.setDate(weekAfterNext.getDate() + 7);
            startDateTo = weekAfterNext.toISOString().split('T')[0];
            break;
          case 'this-month':
            startDateFrom = today.toISOString().split('T')[0];
            startDateTo = nextMonth.toISOString().split('T')[0];
            break;
        }
        
        if (startDateFrom) {
          params.append('startDateFrom', startDateFrom);
        }
        if (startDateTo) {
          params.append('startDateTo', startDateTo);
        }
      } else {
        // If no date filter, only show upcoming workshops
        params.append('startDateFrom', new Date().toISOString().split('T')[0]);
      }
      
      // Sorting and pagination
      params.append('sortBy', 'startDate');
      params.append('sortOrder', 'asc');
      params.append('page', '1');
      params.append('pageSize', '50');
      
      const apiUrl = `${API_BASE_URL}/classes/?${params.toString()}`;
      console.log('=== WORKSHOP FETCH DEBUG ===');
      console.log('API URL:', apiUrl);
      console.log('Current filters:', filters);
      console.log('Search query:', searchQuery);
      console.log('Params object:', Object.fromEntries(params));
      
      const response = await axios.get(apiUrl);
      console.log('API Response total:', response.data.total);
      console.log('API Response classes count:', response.data.classes?.length);
      console.log('API Response data:', response.data);
      const data = response.data;
      
      // The API returns workshops in data.classes array
      const workshopClasses = data.classes || [];
      setTotalResults(data.total || 0);
      
      console.log('Raw workshop classes:', workshopClasses);
      
      // Transform API data to match the component's expected format
      const transformedWorkshops = workshopClasses.map(cls => {
        console.log('Processing class:', cls);
        return {
          id: cls.classId,
          title: cls.title,
          mentor: cls.mentorName || 'TBD',
          mentorInitial: cls.mentorName?.charAt(0) || 'M',
          mentorColor: getColorFromSubject(cls.subject),
          description: cls.description,
          date: formatDate(cls.schedule),
          duration: `${cls.schedule?.sessionDuration || 60} minutes`,
          location: cls.format === 'online' ? 'Online' : 'In-person',
          subject: getSubjectCategory(cls.subject),
          age: cls.ageGroup,
          mode: cls.format,
          price: cls.pricing?.perSessionRate === 0 ? 'free' : getPriceCategory(cls.pricing?.perSessionRate || 0),
          dateFilter: getDateFilter(cls.schedule),
          badges: getBadges(cls),
          skills: getSkills(cls),
          icon: getIcon(cls.subject),
          capacity: (cls.capacity?.maxStudents || 0) - (cls.capacity?.currentEnrollment || 0),
          initialCapacity: cls.capacity?.maxStudents || 0,
          totalSessions: cls.pricing?.totalSessions || 1,
          level: cls.level,
          rating: cls.avgRating
        };
      });
      
      console.log('Transformed workshops:', transformedWorkshops);
      setWorkshops(transformedWorkshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError('Failed to load workshops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from:', `${API_BASE_URL}/metadata/categories`);
      const response = await axios.get(`${API_BASE_URL}/metadata/categories`);
      console.log('Categories response:', response.data);
      if (response.data && response.data.categories) {
        console.log('Setting categories:', response.data.categories.length, 'categories');
        setCategories(response.data.categories);
      } else {
        console.log('No categories in response');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Helper functions for data transformation
  const formatDate = (schedule) => {
    if (!schedule || !schedule.startDate) return 'TBD';
    
    try {
      const startDate = new Date(schedule.startDate);
      const endDate = schedule.endDate ? new Date(schedule.endDate) : startDate;
      
      // Get the first scheduled session time
      const firstSession = schedule.weeklySchedule?.[0];
      const timeString = firstSession ? `${firstSession.startTime} - ${firstSession.endTime}` : '';
      
      if (schedule.startDate === schedule.endDate || !schedule.endDate) {
        // Single day workshop
        return `${startDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}${timeString ? ` • ${timeString}` : ''}`;
      } else {
        // Multi-day workshop
        return `${startDate.toLocaleDateString('en-GB', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })} - ${endDate.toLocaleDateString('en-GB', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })}${timeString ? ` • ${timeString}` : ''}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error, schedule);
      return 'TBD';
    }
  };

  const getSubjectCategory = (subject) => {
    const subjectMap = {
      'music': 'music',
      'anime': 'art',
      'art': 'art',
      'dance': 'dance',
      'technology': 'tech',
      'cooking': 'cooking',
      'yoga': 'yoga',
      'language': 'language',
      'visual-arts': 'art',
      'martial-arts': 'wellness'
    };
    return subjectMap[subject] || 'other';
  };
  
  const getColorFromSubject = (subject) => {
    const colorMap = {
      'music': 'from-purple-500 to-pink-500',
      'anime': 'from-orange-500 to-red-500',
      'art': 'from-yellow-500 to-orange-500',
      'dance': 'from-pink-500 to-purple-500',
      'technology': 'from-blue-500 to-indigo-600',
      'cooking': 'from-green-500 to-teal-600',
      'yoga': 'from-teal-400 to-blue-500',
      'language': 'from-indigo-500 to-purple-600',
      'visual-arts': 'from-yellow-500 to-orange-500',
      'martial-arts': 'from-red-500 to-pink-500'
    };
    return colorMap[subject] || 'from-gray-500 to-gray-600';
  };

  const getAgeGroupLabel = (ageGroup) => {
    const ageLabels = {
      'child': 'Children (5-12)',
      'teen': 'Teenagers (13-17)',
      'adult': 'Adults (18+)',
      'family': 'Family Friendly',
      'young-learner': 'Young Learners (3-8)'
    };
    return ageLabels[ageGroup] || 'All Ages';
  };

  const getPriceCategory = (price) => {
    if (price === 0) return 'free';
    if (price < 20) return 'under-20';
    if (price <= 50) return '20-50';
    return 'over-50';
  };

  const getDateFilter = (schedule) => {
    if (!schedule || !schedule.startDate) return 'this-month';
    
    try {
      const startDate = new Date(schedule.startDate);
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (startDate.toDateString() === now.toDateString()) return 'today';
      if (startDate.toDateString() === tomorrow.toDateString()) return 'tomorrow';
      if (startDate <= nextWeek) return 'this-week';
      return 'this-month';
    } catch (error) {
      console.error('Error getting date filter:', error, schedule);
      return 'this-month';
    }
  };

  const getBadges = (cls) => {
    const badges = [];
    if (cls.pricing?.perSessionRate === 0) {
      badges.push({ text: 'Free', color: 'bg-green-500' });
    }
    if (cls.pricing?.totalSessions > 1) {
      badges.push({ text: `${cls.pricing?.totalSessions} Sessions`, color: 'bg-blue-500' });
    }
    const spotsLeft = (cls.capacity?.maxStudents || 0) - (cls.capacity?.currentEnrollment || 0);
    if (spotsLeft <= 2 && spotsLeft > 0) {
      badges.push({ text: `${spotsLeft} spots left!`, color: 'bg-red-500 animate-pulse' });
    }
    if (cls.avgRating && cls.avgRating >= 4.5) {
      badges.push({ text: 'Highly Rated', color: 'bg-yellow-500' });
    }
    return badges;
  };

  const getSkills = (cls) => {
    const skills = [];
    
    // Age group
    const ageLabel = getAgeGroupLabel(cls.ageGroup);
    skills.push({ text: ageLabel, color: 'bg-indigo-100 text-indigo-700' });
    
    // Level
    const levelColors = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-yellow-100 text-yellow-700',
      'advanced': 'bg-red-100 text-red-700'
    };
    const levelText = cls.level ? cls.level.charAt(0).toUpperCase() + cls.level.slice(1) : 'All Levels';
    skills.push({ text: levelText, color: levelColors[cls.level] || 'bg-gray-100 text-gray-700' });
    
    return skills;
  };

  const getIcon = (subject) => {
    const iconMap = {
      'music': '🎵',
      'anime': '🎨',
      'art': '🎨',
      'dance': '💃',
      'technology': '💻',
      'cooking': '👨‍🍳',
      'yoga': '🧘‍♀️',
      'language': '🗣️',
      'visual-arts': '🎨',
      'martial-arts': '🥋'
    };
    return iconMap[subject] || '📚';
  };

  // Function to apply filters
  const applyFilters = () => {
    fetchWorkshops();
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({ subject: '', age: '', mode: '', date: '', price: '' });
  };

  // Fetch workshops and categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchWorkshops();
  }, []);

  // Apply filters when filter state changes (debounced) - individual dependencies to avoid infinite re-renders
  useEffect(() => {
    console.log('Filter useEffect triggered:', { searchQuery, filters });
    const timer = setTimeout(() => {
      console.log('Debounced fetch triggered');
      fetchWorkshops();
    }, 300);
    
    return () => {
      console.log('Clearing timeout');
      clearTimeout(timer);
    };
  }, [searchQuery, filters.subject, filters.age, filters.mode, filters.date, filters.price]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    const filterKey = id.replace('-filter', '');
    console.log('Filter changed:', filterKey, '=', value);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [filterKey]: value };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
  };

  const registerWorkshop = (workshopId) => {
    const workshop = workshops.find(w => w.id === workshopId);
    if (!workshop || workshop.capacity <= 0) return;

    // Store workshop data in localStorage for the booking page
    const classData = {
      classId: workshop.id,
      title: workshop.title,
      subject: workshop.subject,
      description: workshop.description,
      level: workshop.level,
      ageGroup: workshop.age,
      format: workshop.mode,
      schedule: {
        startDate: workshop.date,
        sessionDuration: parseInt(workshop.duration),
        weeklySchedule: [{
          day: workshop.date.split(',')[0], // Extract day from date
          startTime: workshop.date.split('•')[1]?.split('-')[0]?.trim() || '14:00',
          endTime: workshop.date.split('•')[1]?.split('-')[1]?.trim() || '16:00'
        }]
      },
      capacity: {
        maxStudents: workshop.initialCapacity,
        currentEnrollment: workshop.initialCapacity - workshop.capacity
      },
      pricing: {
        perSessionRate: workshop.price === 'free' ? 0 : parseFloat(workshop.price.split('-')[0] || '25'),
        totalSessions: workshop.totalSessions || 1,
        currency: 'GBP'
      },
      type: 'workshop'
    };

    const mentorData = {
      uid: workshop.id, // Using workshop ID as fallback
      displayName: workshop.mentor,
      category: workshop.subject,
      pricing: {
        oneOnOneRate: classData.pricing.perSessionRate,
        groupRate: classData.pricing.perSessionRate,
        currency: 'GBP',
        firstSessionFree: workshop.price === 'free'
      }
    };

    // Store data for booking page
    localStorage.setItem('selectedMentorClass', JSON.stringify(classData));
    localStorage.setItem('mentor', JSON.stringify(mentorData));

    // Redirect to common booking confirmation page
    router.push(`/booking/confirmbooking/${workshopId}`);
  };

  // This function simulates the JS logic from the original HTML file.
  // It's not attached to any button, but the logic is included for reference.
  const loadMoreWorkshops = () => {
    const moreWorkshops = [
      {
        id: 'advanced-drama',
        title: 'Advanced Drama Workshop',
        mentor: 'Elena Petrova',
        mentorInitial: 'E',
        mentorColor: 'from-pink-500 to-purple-500',
        description: 'Explore character development and stage presence in this intensive drama workshop.',
        date: 'Saturday, August 10 • 10:00 AM - 1:00 PM',
        duration: '3 hours',
        location: 'Online via Zoom',
        subject: 'art',
        age: 'adult',
        mode: 'online',
        price: 'over-50',
        dateFilter: 'next-week',
        badges: [],
        skills: [{ text: 'Adults', color: 'bg-indigo-100 text-indigo-700' }, { text: 'Advanced', color: 'bg-red-100 text-red-700' }],
        icon: '🎭',
        capacity: 10,
        initialCapacity: 10,
      },
      // ... more workshops
    ];
    // In a real app, you would fetch more data here and append it.
    console.log('Simulating loading more workshops:', moreWorkshops);
  };

  return (
    <>
      <Head>
        <title>Upcoming Workshops - Roots & Wings</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: #00A2E8;
              --primary-dark: #00468C;
              --primary-light: #f8fbff;
              --accent-light: #e8f4ff;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
          `
        }} />
      </Head>
      <div className="font-sans text-gray-800 bg-gray-50">

        {/* Navigation Component */}
        <Navbar   />

        {/* <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex justify-between items-center py-4">
              <a href="#" className="text-2xl font-bold text-primary-dark">Roots & Wings</a>
              <ul className="hidden md:flex space-x-8">
                <li><a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Mentors</a></li>
                <li><a href="#" className="text-primary font-medium">Workshops</a></li>
                <li><a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">About</a></li>
              </ul>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">Login</a>
                <a href="#" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors">Sign Up</a>
              </div>
            </div>
          </div>
        </nav> */}

        {/* Page Header Component */}
        <section className="bg-gradient-to-br from-primary-light to-accent-light pt-20 pb-12 mt-16">
          <div className="max-w-7xl mx-auto px-5 text-center">
            <h1 className="text-5xl font-bold text-primary-dark mb-4">Upcoming Workshops</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Join special one-time events hosted by expert mentors. Explore new skills, dive deep into specific topics, and connect with fellow learners.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                <span>Focused learning sessions</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">👥</span>
                <span>Small group experiences</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🆓</span>
                <span>Many free workshops</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">📅</span>
                <span>Flexible one-time commitment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Bar Component */}
        <section className="bg-white shadow-lg sticky top-16 z-40 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 py-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-lg"
                  placeholder="Search workshops by title, subject, or mentor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search workshops"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="subject-filter" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="subject-filter"
                  value={filters.subject}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Music">Music</option>
                  <option value="Art & Craft">Art & Craft</option>
                  <option value="Dance">Dance</option>
                  <option value="Technology">Technology</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Language">Language</option>
                  <option value="Martial Arts">Martial Arts</option>
                </select>
              </div>

              {/* Age Group Filter */}
              <div>
                <label htmlFor="age-filter" className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="age-filter"
                  value={filters.age}
                  onChange={handleFilterChange}
                >
                  <option value="">All Ages</option>
                  <option value="child">Children (5-12)</option>
                  <option value="teen">Teenagers (13-17)</option>
                  <option value="adult">Adults (18+)</option>
                  <option value="family">Family Friendly</option>
                </select>
              </div>

              {/* Mode Filter */}
              <div>
                <label htmlFor="mode-filter" className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="mode-filter"
                  value={filters.mode}
                  onChange={handleFilterChange}
                >
                  <option value="">All Modes</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label htmlFor="date-filter" className="block text-sm font-semibold text-gray-700 mb-2">When</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="date-filter"
                  value={filters.date}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This Week</option>
                  <option value="next-week">Next Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label htmlFor="price-filter" className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="price-filter"
                  value={filters.price}
                  onChange={handleFilterChange}
                >
                  <option value="">All Prices</option>
                  <option value="free">Free</option>
                  <option value="under-20">Under £20</option>
                  <option value="20-50">£20 - £50</option>
                  <option value="over-50">Over £50</option>
                </select>
              </div>

              {/* Apply Filters */}
              <div className="flex items-end">
                <button
                  className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center text-gray-600">
              {loading ? (
                <span className="text-gray-500">Searching workshops...</span>
              ) : (
                <>
                  <span id="results-count">
                    Showing {workshops.length} of {totalResults} workshop{workshops.length !== 1 ? 's' : ''}
                  </span>
                  {(searchQuery || filters.subject || filters.age || filters.mode || filters.date || filters.price) && (
                    <span className="text-gray-500 ml-2">(filtered results)</span>
                  )}
                  {' '} •{' '}
                </>
              )}
              <button className="text-primary hover:text-primary-dark font-semibold" onClick={clearAllFilters}>
                Clear all filters
              </button>
            </div>
          </div>
        </section>

        {/* Workshops Grid Component */}
        <main className="max-w-7xl mx-auto px-5 py-12">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-4 text-gray-600">Loading workshops...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                onClick={fetchWorkshops} 
                className="ml-4 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}
          
          {!loading && !error && workshops.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No workshops found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new workshops.</p>
            </div>
          )}
          
          {!loading && !error && workshops.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="workshops-grid">
              {workshops.map((workshop) => (
              <div
                key={workshop.id}
                className="workshop-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                style={{ animation: 'fadeIn 0.3s ease-in' }}
              >
                {/* Workshop Image */}
                <div className={`h-48 bg-gradient-to-br ${workshop.mentorColor.replace('from-', 'from-')}`} style={{ background: `linear-gradient(to bottom right, ${workshop.mentorColor.split(' ')[0].replace('from-', '#')} 0%, ${workshop.mentorColor.split(' ')[1].replace('to-', '#')} 100%)` }} >
                  <div className="h-48 flex items-center justify-center relative">
                    <span className="text-6xl text-white">{workshop.icon}</span>
                    {workshop.badges.map((badge, index) => (
                      <div
                        key={index}
                        className={`absolute top-4 ${index === 0 ? 'left-4' : 'right-4'} ${badge.color} text-white px-3 py-1 rounded-full text-sm font-bold`}
                      >
                        {badge.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {/* Mentor Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${workshop.mentorColor} rounded-full flex items-center justify-center text-white font-bold`}>
                      {workshop.mentorInitial}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{workshop.mentor}</div>
                      <div className="text-sm text-gray-500">🎓 Certified Mentor</div>
                    </div>
                  </div>

                  {/* Workshop Title */}
                  <h3 className="text-xl font-bold text-primary-dark mb-3">{workshop.title}</h3>

                  {/* Workshop Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">📅</span>
                      <span>{workshop.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">⏱️</span>
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">
                        {workshop.location.includes('Online') ? '💻' : workshop.location.includes('Hybrid') ? '🎭' : '📍'}
                      </span>
                      <span>{workshop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {workshop.skills.map((skill, index) => (
                        <span key={index} className={`px-2 py-1 ${skill.color} text-xs rounded-full`}>
                          {skill.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{workshop.description}</p>

                  {/* Capacity */}
                  <div className="flex items-center justify-between mb-4">
                    {workshop.price !== 'free' && (
                      <div className="text-2xl font-bold text-primary-dark">
                        £{workshop.price.includes('-') ? workshop.price.split('-')[0] : workshop.price}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👥</span>
                      <span>{workshop.capacity} spots left</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${workshop.capacity <= 2 ? 'bg-red-400 animate-pulse' : workshop.capacity <= 5 ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full text-white py-3 rounded-lg font-semibold transition-colors ${
                      workshop.capacity > 0
                        ? 'bg-primary hover:bg-blue-500'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => registerWorkshop(workshop.id)}
                    disabled={workshop.capacity <= 0}
                  >
                    {workshop.price === 'free' ? 'Register Free' : `Book Now - £${workshop.price.includes('-') ? workshop.price.split('-')[0] : workshop.price}`}
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer CTA Section Component */}
        <section className="bg-gradient-to-r from-primary-light to-accent-light py-16">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">Have a topic in mind?</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Can't find the perfect workshop? Our mentors love creating custom workshops based on learner demand.
              Share your idea and we'll help make it happen!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
                💡 Propose a Workshop
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
                📝 Request Custom Session
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Popular requests: Advanced Bharatanatyam, Teen Cooking Classes, Family Art Sessions
            </p>
          </div>
        </section>

      </div>
    </>
  );
}
