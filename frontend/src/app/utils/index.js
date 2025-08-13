
export const formatDate = (dateString) => {
    // Check for an invalid or non-string input.
    if (!dateString || typeof dateString !== "string") {
      return "Invalid Date";
    }

    // Create a Date object from the input string.
    const date = new Date(dateString);

    // A helper function to determine the correct ordinal suffix.
    const getOrdinalSuffix = (day) => {
      // Special handling for 11, 12, and 13.
      if (day > 3 && day < 21) {
        return "th";
      }
      // Check the last digit for all other numbers.
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const day = date.getDate();
    // Get the full month name.
    const month = date.toLocaleString("default", { month: "long" });
    const suffix = getOrdinalSuffix(day);

    return `${day}${suffix} ${month}`;
  };



  export const navItems = [
    { icon: 'fas fa-home', text: 'Dashboard', active: 1 , href: '/mentor/dashboard' },
    { icon: 'fas fa-chalkboard-teacher',  active: 2,  text: 'My Classes' , href: '/mentor/myclass' },
    { icon: 'fas fa-plus-circle', active: 3, text: 'Host a Class' , href: '/mentor/hostaclass' },
    // { icon: 'fas fa-users', active: 4, text: 'Workshops' , href: '/mentor/workshops' },
    { icon: 'fas fa-calendar-alt', active: 5, text: 'Schedule' , href: '/mentor/schedule' },
    { icon: 'fas fa-students', active: 6, text: 'Students' , href: '/mentor/students' },
    { icon: 'fas fa-pound-sign', active: 7, text: 'Earnings' , href: '/mentor/earnings' },
    { icon: 'fas fa-comments', active: 8, text: 'Messages', badge: 3 , href: '/mentor/messages' },
  ];


export  function getSessionsSummary(classObject) {
  let completedSessionCount = 0;
  let upcomingSessionCount = 0;
  // Get the current date and normalize it to the start of the day (midnight).
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Handle both single object and array cases
  const classArray = Array.isArray(classObject) ? classObject : [classObject];

  // Iterate through each class object
  classArray.forEach(classObj => {
    // Skip invalid class objects
    if (!classObj?.schedule?.weeklySchedule) {
      console.warn("Invalid class object: schedule or weeklySchedule is missing.");
      return;
    }

    // Iterate through each session in this class's schedule
    classObj.schedule.weeklySchedule.forEach(session => {
      // Parse the session date string into a Date object
      const sessionDate = new Date(session.date);
      // Normalize the session date to the start of its day for accurate comparison
      const normalizedSessionDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      // Check if the session's date has passed or is today (completed) or in the future (upcoming)
      if (normalizedSessionDate <= currentDate) {
        completedSessionCount++;
      } else {
        upcomingSessionCount++;
      }
    });
  });

  return { completedSessionCount, upcomingSessionCount };
}


export function calculateTotalHoursTaught(schedule) {
  let totalHours = 0;

  // Get the current date and normalize it to the start of the day (midnight).
  // This ensures that comparisons are purely based on the date, ignoring time zones or exact moments.
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Iterate through each session defined in the weeklySchedule.
  schedule.weeklySchedule.forEach(session => {
      // Parse the session date string into a Date object.
      const sessionDate = new Date(session.date);
      // Normalize the session date to the start of its day for accurate comparison.
      const normalizedSessionDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      // Check if the session's date has passed or is today (relative to currentDate).
      // Only sessions that have already occurred are counted towards the total.
      if (normalizedSessionDate <= currentDate) {
          // Parse the start and end time strings (e.g., "10:00") into hour and minute components.
          const [startHour, startMinute] = session.startTime.split(':').map(Number);
          const [endHour, endMinute] = session.endTime.split(':').map(Number);

          // Create full Date-time objects for the session's start and end times.
          // These objects combine the session's specific date with its start/end time.
          const startDateTime = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate(), startHour, startMinute);
          const endDateTime = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate(), endHour, endMinute);

          // Calculate the duration of the session in milliseconds.
          const durationMs = endDateTime.getTime() - startDateTime.getTime();

          // Convert the duration from milliseconds to hours.
          const durationHours = durationMs / (1000 * 60 * 60);

          // Add the calculated session duration to the running total.
          totalHours += durationHours;
      }
  });

  return totalHours;
}



export function getUpcomingSessionsCount(schedule) {
  let upcomingSessionsCount = 0;

  // Get the current date and normalize it to the start of the day (midnight).
  // This ensures that comparisons are purely based on the date, ignoring time zones or exact moments.
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Iterate through each session defined in the weeklySchedule.
  schedule.weeklySchedule.forEach(session => {
      // Parse the session date string into a Date object.
      const sessionDate = new Date(session.date);
      // Normalize the session date to the start of its day for accurate comparison.
      const normalizedSessionDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      // Check if the session's date is in the future (greater than currentDate).
      if (normalizedSessionDate > currentDate) {
          upcomingSessionsCount++;
      }
  });

  return upcomingSessionsCount;
}