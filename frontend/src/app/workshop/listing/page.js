"use client"; // This is needed to enable client-side interactivity in Next.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/NavBar';

const workshopsData = [
  {
    id: 'vedic-chanting',
    title: 'Introduction to Vedic Chanting',
    mentor: 'Dr. Rajesh Patel',
    mentorInitial: 'R',
    mentorColor: 'from-orange-500 to-red-500',
    description: 'Discover the ancient art of Vedic chanting. Learn basic Sanskrit pronunciations and experience the meditative power of sacred sounds.',
    date: 'Saturday, July 27 • 2:00 PM - 4:00 PM',
    duration: '2 hours',
    location: 'Online via Zoom',
    subject: 'music',
    age: 'adult',
    mode: 'online',
    price: 'free',
    dateFilter: 'this-week',
    badges: [{ text: 'Free', color: 'bg-green-500' }, { text: 'New', color: 'bg-blue-500' }],
    skills: [{ text: 'Adults', color: 'bg-indigo-100 text-indigo-700' }, { text: 'Beginner', color: 'bg-green-100 text-green-700' }],
    icon: '🕉️',
    capacity: 5,
    initialCapacity: 5,
  },
  {
    id: 'kathak-performance',
    title: 'Kathak Performance Workshop',
    mentor: 'Priya Sharma',
    mentorInitial: 'P',
    mentorColor: 'from-purple-500 to-pink-500',
    description: 'Master performance techniques and learn to tell stories through Kathak dance. Includes costume guidance and stage presence tips.',
    date: 'Sunday, August 3 • 4:00 PM - 7:00 PM',
    duration: '3 hours',
    location: 'Birmingham Dance Studio',
    subject: 'dance',
    age: 'teen',
    mode: 'in-person',
    price: 'under-20',
    dateFilter: 'next-week',
    badges: [{ text: 'Only 2 Left!', color: 'bg-red-500 animate-pulse' }],
    skills: [{ text: 'Teens', color: 'bg-purple-100 text-purple-700' }, { text: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' }],
    icon: '💃',
    capacity: 2,
    initialCapacity: 2,
  },
  {
    id: 'kids-watercolor',
    title: 'Watercolor Magic for Kids',
    mentor: 'Sarah Williams',
    mentorInitial: 'S',
    mentorColor: 'from-yellow-500 to-orange-500',
    description: 'Fun watercolor techniques for young artists. All materials included. Perfect for developing creativity and fine motor skills.',
    date: 'Saturday, July 28 • 10:00 AM - 12:00 PM',
    duration: '2 hours',
    location: 'Bristol Community Centre',
    subject: 'art',
    age: 'child',
    mode: 'in-person',
    price: 'under-20',
    dateFilter: 'this-week',
    badges: [{ text: 'Family', color: 'bg-green-500' }],
    skills: [{ text: 'Children', color: 'bg-green-100 text-green-700' }, { text: 'Beginner', color: 'bg-blue-100 text-blue-700' }],
    icon: '🎨',
    capacity: 8,
    initialCapacity: 8,
  },
  {
    id: 'mobile-app',
    title: 'Build Your First Mobile App',
    mentor: 'David Chen',
    mentorInitial: 'D',
    mentorColor: 'from-blue-500 to-indigo-600',
    description: 'Learn the basics of mobile app development using no-code tools. Create a working app by the end of the session!',
    date: 'Saturday, August 4 • 1:00 PM - 5:00 PM',
    duration: '4 hours',
    location: 'Online via Zoom',
    subject: 'tech',
    age: 'teen',
    mode: 'online',
    price: '20-50',
    dateFilter: 'next-week',
    badges: [],
    skills: [{ text: 'Teens', color: 'bg-purple-100 text-purple-700' }, { text: 'Beginner', color: 'bg-green-100 text-green-700' }],
    icon: '💻',
    capacity: 12,
    initialCapacity: 12,
  },
  {
    id: 'curry-masterclass',
    title: 'Authentic Indian Curry Masterclass',
    mentor: 'Anita Kumar',
    mentorInitial: 'A',
    mentorColor: 'from-green-500 to-teal-600',
    description: 'Learn traditional curry-making techniques, spice combinations, and family recipes. Lunch included!',
    date: 'Sunday, August 5 • 11:00 AM - 3:00 PM',
    duration: '4 hours',
    location: 'London Cooking Studio',
    subject: 'cooking',
    age: 'family',
    mode: 'in-person',
    price: '20-50',
    dateFilter: 'this-month',
    badges: [{ text: 'Popular', color: 'bg-orange-500' }],
    skills: [{ text: 'Family', color: 'bg-pink-100 text-pink-700' }, { text: 'All Levels', color: 'bg-yellow-100 text-yellow-700' }],
    icon: '🍛',
    capacity: 4,
    initialCapacity: 4,
  },
  {
    id: 'stress-yoga',
    title: 'Stress Relief Yoga Session',
    mentor: 'Maya Patel',
    mentorInitial: 'M',
    mentorColor: 'from-teal-400 to-blue-500',
    description: 'Gentle yoga flow designed to release tension and promote relaxation. Perfect after a busy week.',
    date: 'Tomorrow, July 26 • 7:00 PM - 8:30 PM',
    duration: '1.5 hours',
    location: 'Hybrid (Online + In-person Manchester)',
    subject: 'yoga',
    age: 'adult',
    mode: 'hybrid',
    price: 'under-20',
    dateFilter: 'tomorrow',
    badges: [{ text: 'Tomorrow!', color: 'bg-red-500 animate-pulse' }],
    skills: [{ text: 'Adults', color: 'bg-indigo-100 text-indigo-700' }, { text: 'All Levels', color: 'bg-green-100 text-green-700' }],
    icon: '🧘‍♀️',
    capacity: 15,
    initialCapacity: 15,
  },
];

export default function Home() {
  const [workshops, setWorkshops] = useState(workshopsData);
  const [filters, setFilters] = useState({
    subject: '',
    age: '',
    mode: '',
    date: '',
    price: '',
  });
  const [notification, setNotification] = useState(null);

  // Function to apply filters
  const applyFilters = () => {
    const filteredWorkshops = workshopsData.filter(workshop => {
      const subjectMatch = !filters.subject || workshop.subject === filters.subject;
      const ageMatch = !filters.age || workshop.age === filters.age || workshop.age === 'family';
      const modeMatch = !filters.mode || workshop.mode === filters.mode || workshop.mode === 'hybrid';
      const dateMatch = !filters.date || workshop.dateFilter === filters.date;
      const priceMatch = !filters.price || workshop.price === filters.price;

      return subjectMatch && ageMatch && modeMatch && dateMatch && priceMatch;
    });
    setWorkshops(filteredWorkshops);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setFilters({ subject: '', age: '', mode: '', date: '', price: '' });
  };

  // Run applyFilters when filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    const filterKey = id.replace('-filter', '');
    setFilters(prevFilters => ({ ...prevFilters, [filterKey]: value }));
  };

  const registerWorkshop = (workshopId) => {
    const workshopToUpdate = workshops.find(w => w.id === workshopId);
    if (!workshopToUpdate || workshopToUpdate.capacity <= 0) return;

    // Show a custom alert message instead of the built-in `alert`
    const bookingPrice = workshopToUpdate.price === 'free' ? 'free' : '£' + workshopToUpdate.price.split('-')[0];
    const message = workshopToUpdate.price === 'free' ?
      `🎉 Success! You're registered for this free workshop.\n\nConfirmation email sent with Zoom link and preparation materials.` :
      `🎉 Booking confirmed! Payment of ${bookingPrice} processed.\n\nConfirmation email sent with location details and what to bring.`;

    alert(message); // Using alert for simplicity, but in a real app, a custom modal would be better.

    // Update the workshop capacity
    setWorkshops(prevWorkshops =>
      prevWorkshops.map(workshop =>
        workshop.id === workshopId
          ? { ...workshop, capacity: Math.max(0, workshop.capacity - 1) }
          : workshop
      )
    );
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
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#00A2E8',
                            'primary-dark': '#00468C',
                            'primary-light': '#f8fbff',
                            'accent-light': '#e8f4ff'
                        },
                        fontFamily: {
                            sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
                        }
                    }
                }
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Subject Filter */}
              <div>
                <label htmlFor="subject-filter" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white"
                  id="subject-filter"
                  value={filters.subject}
                  onChange={handleFilterChange}
                >
                  <option value="">All Subjects</option>
                  <option value="music">Music</option>
                  <option value="dance">Dance</option>
                  <option value="yoga">Yoga & Wellness</option>
                  <option value="art">Art & Craft</option>
                  <option value="language">Languages</option>
                  <option value="cooking">Cooking</option>
                  <option value="tech">Technology</option>
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
              <span id="results-count">Showing {workshops.length} workshop{workshops.length !== 1 ? 's' : ''}</span> •
              <button className="text-primary hover:text-primary-dark font-semibold" onClick={clearAllFilters}>
                Clear all filters
              </button>
            </div>
          </div>
        </section>

        {/* Workshops Grid Component */}
        <main className="max-w-7xl mx-auto px-5 py-12">
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
