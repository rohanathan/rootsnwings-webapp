"use client";
import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    { icon: '🔍', title: 'Search', description: 'Filter by skill, mentor, or location to find your perfect match' },
    { icon: '👤', title: 'View Profile', description: 'See ratings, skills, and class types from verified mentors' },
    { icon: '📝', title: 'Enrol', description: 'Choose a recurring class or a one-off workshop' },
    { icon: '🤝', title: 'Connect', description: 'Begin your mentorship journey with 1-on-1 support' },
  ];

  return (
    <section className="py-20 bg-primary-light">
      <div className="max-w-7xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-primary-dark mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6" aria-label={`${step.title} step`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-primary-dark mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
