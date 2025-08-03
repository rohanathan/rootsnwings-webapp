"use client";

import React from 'react';

const WorkshopCard = ({ icon, title, date, mentor, location, price, buttonText }) => {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="h-48 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-5xl">
        {icon}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-primary-dark mb-4">{title}</h3>
        <div className="space-y-2 mb-5 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">👤</span>
            <span>{mentor}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">{location === 'Online' ? '💻' : '📍'}</span>
            <span>{location}</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-dark mb-5">{price}</div>
        <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors" aria-label={`View details for ${title} workshop`}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default WorkshopCard;
