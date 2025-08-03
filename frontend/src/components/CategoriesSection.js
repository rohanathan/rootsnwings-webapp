"use client";
import React, { useState } from 'react';

const CategoriesSection = () => {
  const categories = [
    { icon: '🎻', name: 'Classical Music' },
    { icon: '🎨', name: 'Art & Craft' },
    { icon: '🧘', name: 'Mindfulness' },
    { icon: '🗣️', name: 'Spoken Word' },
    { icon: '📜', name: 'Philosophy' },
    { icon: '💻', name: 'Coding' },
    { icon: '📚', name: 'Languages' },
    { icon: '🎭', name: 'Drama' },
  ];

  const [activeCategory, setActiveCategory] = useState(null);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    console.log(`Selected category: ${categoryName}`);
    // In a real app, this would filter mentors or navigate to a category page
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <h2 className="text-4xl font-bold text-center text-primary-dark mb-12">
          Explore Learning Categories
        </h2>

        {/* Categories Scroller */}
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`flex-shrink-0 text-center p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl min-w-[140px] ${
                activeCategory === category.name
                  ? 'bg-primary text-white'
                  : 'bg-primary-light hover:bg-primary hover:text-white'
              }`}
              role="button"
              tabIndex="0"
              aria-label={`Browse ${category.name} mentors`}
              onClick={() => handleCategoryClick(category.name)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCategoryClick(category.name);
                }
              }}
            >
              <div className="text-4xl mb-3" aria-hidden="true">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
