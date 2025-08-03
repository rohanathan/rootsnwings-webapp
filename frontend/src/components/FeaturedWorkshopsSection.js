"use client";
import React, { useEffect, useState } from 'react';
import WorkshopCard from './WorkshopCard';

const FeaturedWorkshopsSection = () => {
  const [workshopDates, setWorkshopDates] = useState([]);

  useEffect(() => {
    // Dynamic workshop dates logic
    const updateWorkshopDates = () => {
      const today = new Date();
      const dates = [
        new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000)  // 8 days from now
      ];

      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      setWorkshopDates(dates.map(date => date.toLocaleDateString('en-GB', options)));
    };

    updateWorkshopDates();
  }, []); // Run once on component mount

  const workshops = [
    {
      icon: '🕉️',
      title: 'Introduction to Vedic Chanting',
      mentor: 'Dr. Rajesh Patel',
      location: 'Online',
      price: 'Free',
      buttonText: 'Book Workshop',
    },
    {
      icon: '🎨',
      title: 'Watercolour Landscapes',
      mentor: 'Sarah Williams',
      location: 'London',
      price: '£25',
      buttonText: 'Join Workshop',
    },
    {
      icon: '🎭',
      title: 'Shakespearean Monologues',
      mentor: 'Emma Thompson',
      location: 'Online',
      price: '£15',
      buttonText: 'Reserve Spot',
    },
  ];

  return (
    <section id="workshops" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
          Workshops You Can Join This Month
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <WorkshopCard
              key={index}
              icon={workshop.icon}
              title={workshop.title}
              date={workshopDates[index] || 'Loading date...'} // Use dynamic date
              mentor={workshop.mentor}
              location={workshop.location}
              price={workshop.price}
              buttonText={workshop.buttonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkshopsSection;
