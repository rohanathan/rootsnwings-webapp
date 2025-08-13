import axios from 'axios';
import React, { useState, useEffect } from 'react';

const MentorAvailability = ({  showTitle = true, compact = false }) => {
  const [availability, setAvailability] = useState(null);

  const [mentorId, setMentorId] = useState(null);

  // Days of the week for consistent ordering
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const mentorId = user.user.uid;
    setMentorId(mentorId);

    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`https://rootsnwings-api-944856745086.europe-west2.run.app/availability/mentors/${mentorId}`);
      setAvailability(response.data.availability);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {

    }
  };

  const formatTime = (timeString) => {
    // Convert 24-hour format to 12-hour format
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };

  const formatTimeRange = (timeRange) => {
    return `${formatTime(timeRange.startTime)} - ${formatTime(timeRange.endTime)}`;
  };

  const sortedAvailability = availability?.availability?.sort((a, b) => {
    return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
  }) || [];

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center p-4">
  //       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  //       <span className="ml-2 text-gray-600">Loading availability...</span>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
  //       <p className="text-red-800 text-sm">Error loading availability: {error}</p>
  //       <button 
  //         onClick={fetchAvailability}
  //         className="text-red-600 hover:text-red-800 text-sm underline mt-1"
  //       >
  //         Try again
  //       </button>
  //     </div>
  //   );
  // }

  if (!availability || !sortedAvailability.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        {showTitle && <h3 className="text-lg font-medium text-gray-900 mb-2">Availability</h3>}
        <p className="text-gray-600 text-sm">No availability schedule set</p>
      </div>
    );
  }

  if (compact) {
    // Compact view - show just a summary
    const totalSlots = sortedAvailability.reduce((sum, day) => sum + day.timeRanges.length, 0);
    const availableDays = sortedAvailability.map(day => day.day.slice(0, 3)).join(', ');
    
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium text-green-600">{totalSlots} slots</span> available
        <span className="text-gray-500"> ({availableDays})</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {showTitle && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Availability</h3>
          {availability.timezone && (
            <span className="text-sm text-gray-500">{availability.timezone}</span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {sortedAvailability.map((daySchedule) => (
          <div key={daySchedule.day} className="flex items-start space-x-3">
            <div className="w-20 flex-shrink-0">
              <span className="text-sm font-medium text-gray-900">
                {daySchedule.day}
              </span>
            </div>
            
            <div className="flex-1">
              {daySchedule.timeRanges && daySchedule.timeRanges.length > 0 ? (
                <div className="space-y-1">
                  {daySchedule.timeRanges.map((timeRange, index) => (
                    <div 
                      key={index}
                      className="inline-block bg-green-50 border border-green-200 rounded-md px-2 py-1 mr-2 mb-1"
                    >
                      <span className="text-sm text-green-800">
                        {formatTimeRange(timeRange)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">Not available</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {availability.dateRange?.startDate && availability.dateRange?.endDate && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Valid from {availability.dateRange.startDate} to {availability.dateRange.endDate}
          </p>
        </div>
      )}
    </div>
  );
};


export default MentorAvailability;