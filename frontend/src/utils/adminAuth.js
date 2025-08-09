/**
 * Admin authentication utilities
 */
import { useState, useEffect } from 'react';

/**
 * Check if current user has admin access
 * Supports both userRoles array and userType field
 */
export const checkAdminAccess = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData?.user?.uid) {
      return { hasAccess: false, error: "User not found. Please log in again." };
    }

    // Method 1: Check userRoles array (new onboarding flow)
    const userRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    if (userRoles.includes("admin")) {
      return { hasAccess: true, user: userData.user };
    }

    // Method 2: Check userType field (legacy/manual admin creation)
    if (userData.user.userType === "admin") {
      return { hasAccess: true, user: userData.user };
    }

    // Method 3: Check roles array in user object (if exists)
    if (userData.user.roles && Array.isArray(userData.user.roles) && userData.user.roles.includes("admin")) {
      return { hasAccess: true, user: userData.user };
    }

    return { hasAccess: false, error: "Admin access required. Insufficient permissions." };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { hasAccess: false, error: "Error verifying admin access." };
  }
};

/**
 * React hook for admin access checking
 */
export const useAdminAuth = () => {
  const [authState, setAuthState] = useState({
    loading: true,
    hasAccess: false,
    user: null,
    error: null
  });

  useEffect(() => {
    const checkAccess = () => {
      const result = checkAdminAccess();
      setAuthState({
        loading: false,
        hasAccess: result.hasAccess,
        user: result.user || null,
        error: result.error || null
      });
    };

    checkAccess();
  }, []);

  return authState;
};
