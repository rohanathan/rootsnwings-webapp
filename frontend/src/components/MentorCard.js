"use client";
import React from 'react';

const MentorCard = ({ 
  initial, 
  name, 
  skill, 
  rating, 
  reviews, 
  location, 
  offer, 
  buttonText, 
  photoURL, 
  qualifications, 
  culturalRegion, 
  culturalAuthenticity 
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
      {photoURL ? (
        <img
          src={photoURL}
          alt={`${name}'s profile`}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-6"
        />
      ) : (
        <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6" aria-label={`${name}'s profile picture`}>
          {initial}
        </div>
      )}
      <h3 className="text-xl font-semibold text-primary-dark mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{skill}</p>
      <div className="flex justify-center items-center mb-3">
        <span className="text-yellow-400 mr-2" aria-label={`${rating} star rating`}>{'★'.repeat(Math.floor(rating))}</span>
        <span className="text-sm text-gray-600">{rating} from {reviews} reviews</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">{location}</p>
      
      {/* Cultural and Offer Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {/* Cultural Heritage Badge */}
        {culturalRegion && culturalRegion !== 'worldwide' && (
          <div className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
            🌍 {culturalRegion}
          </div>
        )}
        
        {/* Traditional Training Badge */}
        {qualifications && qualifications.some(q => 
          ['traditional_lineage', 'cultural_apprenticeship', 'cultural_immersion'].includes(q.type)
        ) && (
          <div className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
            🙏 Traditional Training
          </div>
        )}
        
        {/* Cultural Authenticity Badge */}
        {culturalAuthenticity >= 0.7 && (
          <div className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            ⭐ Authentic
          </div>
        )}
        
        {/* First Session Free Badge */}
        {offer && (
          <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            {offer}
          </div>
        )}
      </div>
      
      <button className="w-full bg-primary hover:bg-blue-500 text-white py-3 rounded-full font-semibold transition-colors group-hover:bg-blue-500" aria-label={`View ${name}'s profile`}>
        {buttonText}
      </button>
    </div>
  );
};

export default MentorCard;
