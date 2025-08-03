
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