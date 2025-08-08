/**
 * Pricing Calculator Utility
 * Handles total payable calculations with first session free discounts
 */

/**
 * Calculate the total payable amount for a class/workshop
 * @param {Object} classData - The class data object
 * @param {Object} mentorData - The mentor data object (optional, for first session free check)
 * @param {boolean} isFirstSession - Whether this is the student's first session with this mentor
 * @returns {Object} - Pricing breakdown
 */
export const calculateTotalPayable = (classData, mentorData = null, isFirstSession = false) => {
  if (!classData || !classData.pricing) {
    return {
      subtotal: 0,
      discountAmount: 0,
      finalPrice: 0,
      currency: 'GBP',
      discountType: null
    };
  }

  const { pricing } = classData;
  const perSessionRate = Number(pricing.perSessionRate) || 0;
  const totalSessions = Number(pricing.totalSessions) || 1;
  const currency = pricing.currency || 'GBP';
  
  // Calculate base subtotal
  const subtotal = perSessionRate * totalSessions;
  
  let discountAmount = 0;
  let discountType = null;
  
  // Check for first session free discount
  if (isFirstSession && mentorData?.pricing?.firstSessionFree) {
    // For first session free, discount the first session
    discountAmount = perSessionRate;
    discountType = 'first_session_free';
  }
  
  // Check for existing discount percentage (from class data)
  if (pricing.discountPercentage && Number(pricing.discountPercentage) > 0) {
    const percentageDiscount = (subtotal * Number(pricing.discountPercentage)) / 100;
    discountAmount = Math.max(discountAmount, percentageDiscount);
    discountType = discountType || 'percentage_discount';
  }
  
  // Check for fixed discount amount
  if (pricing.discountAmount && Number(pricing.discountAmount) > 0) {
    discountAmount = Math.max(discountAmount, Number(pricing.discountAmount));
    discountType = discountType || 'fixed_discount';
  }
  
  // Calculate final price
  const finalPrice = Math.max(0, subtotal - discountAmount);
  
  return {
    subtotal,
    discountAmount,
    finalPrice,
    currency,
    discountType,
    perSessionRate,
    totalSessions
  };
};

/**
 * Format price for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} - Formatted price string
 */
export const formatPrice = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }
  return `${currency}${Number(amount).toFixed(2)}`;
};

/**
 * Get discount description for display
 * @param {string} discountType - The type of discount
 * @param {number} discountAmount - The discount amount
 * @param {string} currency - The currency code
 * @returns {string} - Human readable discount description
 */
export const getDiscountDescription = (discountType, discountAmount, currency = 'GBP') => {
  switch (discountType) {
    case 'first_session_free':
      return `First Session Free (-${formatPrice(discountAmount, currency)})`;
    case 'percentage_discount':
      return `Package Discount (-${formatPrice(discountAmount, currency)})`;
    case 'fixed_discount':
      return `Special Discount (-${formatPrice(discountAmount, currency)})`;
    default:
      return '';
  }
};

/**
 * Calculate price per session for display
 * @param {number} finalPrice - The final price
 * @param {number} totalSessions - Total number of sessions
 * @returns {string} - Formatted price per session
 */
export const getPricePerSession = (finalPrice, totalSessions) => {
  if (totalSessions <= 0 || finalPrice === null || finalPrice === undefined || isNaN(finalPrice)) {
    return '0.00';
  }
  return Number(finalPrice / totalSessions).toFixed(2);
};
