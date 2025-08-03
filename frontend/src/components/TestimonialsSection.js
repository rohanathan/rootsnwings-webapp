"use client";

import React from 'react';

const TestimonialsSection = ({ initial, quote, author, role, rating }) => {
  return (
    <div className="bg-primary-light p-8 rounded-3xl text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold mx-auto mb-6">
        {initial}
      </div>
      {/* <p className="italic text-gray-700 mb-6 leading-relaxed">"{quote}"</p> */}
      <h4 className="font-semibold text-primary-dark">{author}</h4>
      <p className="text-sm text-gray-600">{role}</p>
      <div className="text-yellow-400 mt-2">{'★'.repeat(rating)}</div>
    </div>
  );
};

export default TestimonialsSection;
