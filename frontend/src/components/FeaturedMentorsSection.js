"use client";
import React from 'react';
import MentorCard from './MentorCard';

const FeaturedMentorsSection = () => {
  const mentors = [
    {
      initial: 'P',
      name: 'Priya Sharma',
      skill: 'Kathak & South Asian Dance',
      rating: 4.9,
      reviews: 22,
      location: 'Birmingham – Online',
      offer: '1st Lesson Free',
      buttonText: 'Explore Profile',
    },
    {
      initial: 'J',
      name: 'James Mitchell',
      skill: 'Classical Piano & Music Theory',
      rating: 4.8,
      reviews: 35,
      location: 'London – In-Person',
      offer: '1st Lesson Free',
      buttonText: 'Join a Class',
    },
    {
      initial: 'A',
      name: 'Amara Johnson',
      skill: 'Creative Writing & Poetry',
      rating: 4.7,
      reviews: 18,
      location: 'Manchester – Online',
      offer: '1st Lesson Free',
      buttonText: 'Start Learning',
    },
  ];

  return (
    <section id="mentors" className="py-20 bg-primary-light">
      <div className="max-w-7xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
          Featured Mentors
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor, index) => (
            <MentorCard key={index} {...mentor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMentorsSection;
