
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
    { icon: 'fas fa-users', active: 4, text: 'Workshops' , href: '/mentor/workshops' },
    { icon: 'fas fa-calendar-alt', active: 5, text: 'Schedule' , href: '/mentor/schedule' },
    { icon: 'fas fa-students', active: 6, text: 'Students' , href: '/mentor/students' },
    { icon: 'fas fa-pound-sign', active: 7, text: 'Earnings' , href: '/mentor/earnings' },
    { icon: 'fas fa-comments', active: 8, text: 'Messages', badge: 3 , href: '/mentor/messages' },
  ];


export  const classifySessions = (classes) => {
  const classifiedResults = [];

  // Define the current reference time as per your prompt:
  // Saturday, August 9, 2025 at 3:51 PM IST (updated from previous 3:43 PM IST in prompt)
  // IST is UTC+5:30.
  const currentReferenceTime = new Date('2025-08-09T15:51:00+05:30');

  // Helper to get day of week name from JS Date.getDay() (0=Sunday, 6=Saturday)
  const jsDayToDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let completedSessionCount = 0;
  let upcomingSessionCount = 0;

  // Iterate over each class object to calculate its session counts
  classes.forEach(classObj => {
   

      // Handle 'one-on-one' class type
      if (classObj.type === 'one-on-one') {
          // For one-on-one, the schedule.startDate and the first item in weeklySchedule
          // define a single, specific session occurrence.
          const sessionDatePart = classObj.schedule.startDate;
          const sessionTimePart = classObj.schedule.weeklySchedule[0]?.startTime; // Use optional chaining for safety

          if (sessionDatePart && sessionTimePart) {
              // Create a Date object for this specific session occurrence
              const sessionStartDateTime = new Date(`${sessionDatePart}T${sessionTimePart}:00`);

              // Compare the session's start time with the current reference time
              if (sessionStartDateTime < currentReferenceTime) {
                  completedSessionCount++;
              } else {
                  upcomingSessionCount++;
              }
          }
      }
      // Handle 'group' class type
      else if (classObj.type === 'group') {
          const classProgramStartDate = new Date(classObj.schedule.startDate);
          // Set end date to the end of the day for inclusive comparison
          const classProgramEndDate = new Date(classObj.schedule.endDate);
          classProgramEndDate.setHours(23, 59, 59, 999); // Set to end of day to include sessions on endDate

          // Loop through each day from the class's start date to its end date
          // Create a new Date object for 'd' in each iteration to avoid modifying the loop variable directly
          for (let d = new Date(classProgramStartDate); d <= classProgramEndDate; d.setDate(d.getDate() + 1)) {
              const currentDayOfWeekName = jsDayToDayName[d.getDay()];

              // Check all weekly schedule rules for the current day of the week
              classObj.schedule.weeklySchedule.forEach(sessionRule => {
                  if (sessionRule.day === currentDayOfWeekName) {
                      const [hour, minute] = sessionRule.startTime.split(':').map(Number);
                      
                      // Create a specific DateTime object for this particular session occurrence
                      let sessionOccurrenceDateTime = new Date(d); // Copy the date
                      sessionOccurrenceDateTime.setHours(hour, minute, 0, 0); // Set time to session start time

                      // Compare this session occurrence with the current reference time
                      if (sessionOccurrenceDateTime < currentReferenceTime) {
                          completedSessionCount++;
                      } else {
                          upcomingSessionCount++;
                      }
                  }
              });
          }
      }

      // Add the calculated counts to the class object and push to results
      classifiedResults.push({
          ...classObj,
          completedSessionCount,
          upcomingSessionCount
      });
  });

  return {completedSessionCount , upcomingSessionCount};
};


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