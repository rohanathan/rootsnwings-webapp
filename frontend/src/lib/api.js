/**
 * Consolidated API Layer for Roots & Wings
 * Handles authentication, base URLs, error handling, and retry logic
 */

import { getFirebaseAuth } from './firebase';

// Environment-based API URL detection
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rootsnwings-api-944856745086.europe-west2.run.app'
  : 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

/**
 * Get Firebase ID token for authentication
 */
const getFirebaseToken = async () => {
  try {
    // Guard against server-side rendering and missing auth
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not available (SSR or missing config)');
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Force token refresh to ensure it's valid
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Failed to get Firebase token:', error);
    throw error;
  }
};

/**
 * Get authentication headers for API calls
 */
const getAuthHeaders = async () => {
  try {
    const token = await getFirebaseToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

/**
 * Generic API call handler with authentication and error handling
 */
const apiCall = async (endpoint, method = 'GET', data = null, requiresAuth = true) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${method} ${url}`);
    
    const options = {
      method,
      headers: requiresAuth 
        ? await getAuthHeaders() 
        : { 'Content-Type': 'application/json' }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    console.log(`API Response: ${response.status}`);
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to signin');
        // You could trigger a global auth state reset here
        throw new Error(`Authentication failed: ${responseData.detail || 'Unauthorized'}`);
      }
      
      if (response.status === 403) {
        throw new Error(`Access denied: ${responseData.detail || 'Forbidden'}`);
      }
      
      throw new Error(`API call failed: ${responseData.detail || response.statusText}`);
    }
    
    return responseData;
  } catch (error) {
    console.error(`API call failed:`, error);
    throw error;
  }
};

// ===== USER API CALLS =====
export const userAPI = {
  // Get current user profile
  getProfile: () => apiCall('/firebase-auth/me', 'GET'),
  
  // Update user profile
  updateProfile: (userData) => apiCall('/users/me', 'PUT', userData),
  
  // Get specific user by ID
  getUser: (userId) => apiCall(`/users/${userId}`, 'GET'),
  
  // Student profile operations
  getStudentProfile: () => apiCall('/users/me?profile_type=student', 'GET'),
  updateStudentProfile: (profileData) => apiCall('/users/me?profile_type=student', 'PUT', profileData),
  
  // Parent profile operations  
  getParentProfile: () => apiCall('/users/me?profile_type=parent', 'GET'),
  updateParentProfile: (profileData) => apiCall('/users/me?profile_type=parent', 'PUT', profileData),
};

// ===== MENTOR API CALLS =====
export const mentorAPI = {
  // Get all mentors
  getAll: () => apiCall('/mentors/', 'GET', null, false),
  
  // Get specific mentor
  getById: (mentorId) => apiCall(`/mentors/${mentorId}`, 'GET', null, false),
  
  // Update mentor profile (requires mentor auth)
  updateProfile: (mentorData) => apiCall('/mentors/me', 'PUT', mentorData),
  
  // Get mentor's classes
  getClasses: (mentorId) => apiCall(`/classes?mentorId=${mentorId}`, 'GET'),
  
  // Get mentor availability
  getAvailability: (mentorId) => apiCall(`/availability/mentors/${mentorId}`, 'GET', null, false),
  
  // Set mentor availability (requires mentor auth)
  setAvailability: (availabilityData) => apiCall('/availability/mentors/me', 'PUT', availabilityData),
};

// ===== CLASS API CALLS =====
export const classAPI = {
  // Get all classes (public)
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/classes${queryParams ? '?' + queryParams : ''}`, 'GET', null, false);
  },
  
  // Get specific class
  getById: (classId) => apiCall(`/classes${classId}`, 'GET', null, false),
  
  // Create class (requires mentor auth)
  create: (classData) => apiCall('/classes', 'POST', classData),
  
  // Update class (requires mentor auth)
  update: (classId, classData) => apiCall(`/classes${classId}`, 'PUT', classData),
  
  // Search classes
  search: (searchParams) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    return apiCall(`/search/classes?${queryParams}`, 'GET', null, false);
  },
};

// ===== BOOKING API CALLS =====
export const bookingAPI = {
  // Get user's bookings
  getMyBookings: () => apiCall('/bookings?studentId=me', 'GET'),
  
  // Get specific booking
  getById: (bookingId) => apiCall(`/bookings?bookingId=${bookingId}`, 'GET'),
  
  // Create booking (requires student auth)
  create: (bookingData) => apiCall('/bookings', 'POST', bookingData),
  
  // Update booking
  update: (bookingId, updateData) => apiCall(`/bookings${bookingId}`, 'PUT', updateData),
  
  // Confirm booking after payment
  confirm: (bookingId, paymentData) => apiCall(`/bookings${bookingId}?action=confirm`, 'PUT', paymentData),
  
  // Cancel booking
  cancel: (bookingId, cancelData) => apiCall(`/bookings${bookingId}?action=cancel`, 'PUT', cancelData),
};

// ===== PAYMENT API CALLS =====
export const paymentAPI = {
  // Create Stripe checkout session
  createCheckoutSession: (checkoutData) => apiCall('/payments/create-checkout-session', 'POST', checkoutData),
  
  // Get payment details
  getPayment: (paymentId) => apiCall(`/payments/${paymentId}`, 'GET'),
  
  // Get Stripe test cards
  getTestCards: () => apiCall('/payments/test-cards', 'GET', null, false),
};

// ===== SEARCH API CALLS =====
export const searchAPI = {
  // Unified search
  search: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/search/?${queryParams}`, 'GET', null, false);
  },
  
  // Search mentors
  searchMentors: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/search/mentors?${queryParams}`, 'GET', null, false);
  },
  
  // Search classes
  searchClasses: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/search/classes?${queryParams}`, 'GET', null, false);
  },
};

// ===== ADMIN API CALLS =====
export const adminAPI = {
  // Get pending classes for approval
  getPendingClasses: () => apiCall('/classes?status=pending', 'GET'),
  
  // Approve class
  approveClass: (classId, approvalData) => apiCall(`/classes${classId}`, 'PUT', { status: 'approved', ...approvalData }),
  
  // Reject class
  rejectClass: (classId, rejectionData) => apiCall(`/classes${classId}`, 'PUT', { status: 'rejected', ...rejectionData }),
  
  // Get all users
  getAllUsers: () => apiCall('/admin/users', 'GET'),
  
  // Update user
  updateUser: (userId, userData) => apiCall(`/admin/users/${userId}`, 'PUT', userData),
};

// ===== MESSAGING API CALLS =====
export const messageAPI = {
  // Send message
  send: (messageData) => apiCall('/messages', 'POST', messageData),
  
  // Get conversation
  getConversation: (studentId, mentorId) => apiCall(`/messagesconversation?studentId=${studentId}&mentorId=${mentorId}`, 'GET'),
  
  // Get user's messages
  getMyMessages: () => apiCall('/messagesuser/me', 'GET'),
};

// ===== UTILITY FUNCTIONS =====
export const apiUtils = {
  // Get current Firebase user
  getCurrentFirebaseUser: () => auth?.currentUser || null,
  
  // Check if user is authenticated
  isAuthenticated: () => !!(auth?.currentUser),
  
  // Get user's auth token
  getToken: getFirebaseToken,
  
  // Get auth headers
  getHeaders: getAuthHeaders,
  
  // Sign out user
  signOut: () => auth?.signOut() || Promise.resolve(),
};

// Default export with all APIs
export default {
  user: userAPI,
  mentor: mentorAPI,
  class: classAPI,
  booking: bookingAPI,
  payment: paymentAPI,
  search: searchAPI,
  admin: adminAPI,
  message: messageAPI,
  utils: apiUtils,
};