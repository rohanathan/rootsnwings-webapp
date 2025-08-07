
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
    { icon: 'fas fa-users', active: 4, text: 'Workshops' , href: '/mentor/dashboard' },
    { icon: 'fas fa-calendar-alt', active: 5, text: 'Schedule' , href: '/mentor/dashboard' },
    { icon: 'fas fa-students', active: 6, text: 'Students' , href: '/mentor/dashboard' },
    { icon: 'fas fa-pound-sign', active: 7, text: 'Earnings' , href: '/mentor/dashboard' },
    { icon: 'fas fa-comments', active: 8, text: 'Messages', badge: 3 , href: '/mentor/dashboard' },
  ];