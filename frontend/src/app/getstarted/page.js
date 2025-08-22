'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '@/components/NavBar';
// Firebase imports
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const AuthPages = () => {



  // State to manage which tab is active: 'signin' or 'signup'
  const [activeTab, setActiveTab] = useState('signin'); // Default to signin
  
  // Loading states for form submissions
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isSigninLoading, setIsSigninLoading] = useState(false);
  
  // API URL - use localhost for local testing
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://rootsnwings-api-944856745086.europe-west2.run.app'
    : 'http://localhost:8000';
  
  // States for password visibility
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States for form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [terms, setTerms] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // State to track form validation errors
  const [signupFormErrors, setSignupFormErrors] = useState({});
  const [signinFormErrors, setSigninFormErrors] = useState({});
  
  // Check URL parameters and set the active tab on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      
      // Set tab based on URL parameter
      if (tab === 'signup') {
        setActiveTab('signup');
      } else if (tab === 'signin') {
        setActiveTab('signin');
      }
      // If no tab parameter, default is 'signin' as set in useState
    }
  }, []);

  // Updates the document title based on the active tab
  useEffect(() => {
    document.title = activeTab === 'signup' ? 'Sign Up - Roots & Wings' : 'Sign In - Roots & Wings';

    // Guard against server-side rendering
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if(user?.user?.userType === 'student'){
        window.location.href = '/user/dashboard';
      }else if(user?.user?.userType === 'mentor'){
        window.location.href = '/mentor/dashboard';
      }
    }

  }, [activeTab]);

  // A helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Helper function to make authenticated API calls to backend
  const makeAuthenticatedAPICall = async (endpoint, method = 'GET', data = null) => {
    try {
      const user = auth.currentUser;
      console.log('API Call - Current user:', user?.uid);
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Force token refresh to ensure it's valid
      const token = await user.getIdToken(true);
      console.log('API Call - Token retrieved, length:', token?.length);
      console.log('API Call - Token preview:', token?.substring(0, 50) + '...');
      
      // For debugging - log the full token (remove this in production)
      console.log('🔑 FULL TOKEN (for debugging):');
      console.log(token);
      
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`API Call - ${method} ${API_BASE_URL}/firebase-auth${endpoint}`);
      console.log('API Call - Headers:', options.headers);
      
      const response = await fetch(`${API_BASE_URL}/firebase-auth${endpoint}`, options);
      console.log('API Call - Response status:', response.status);
      
      const responseData = await response.json();
      console.log('API Call - Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}: ${responseData.detail || 'Unknown error'}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };
  
  // Handles form submission for Sign Up with Firebase
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const errors = {};
    if (!firstName) errors.firstName = 'First name is required.';
    if (!lastName) errors.lastName = 'Last name is required.';
    if (!isValidEmail(signupEmail)) errors.signupEmail = 'Please enter a valid email address.';
    if (!signupPassword || signupPassword.length < 8) errors.signupPassword = 'Password must be at least 8 characters.';
    if (signupPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!terms) errors.terms = 'You must agree to the terms.';

    if (Object.keys(errors).length > 0) {
      setSignupFormErrors(errors);
      console.error('Validation Errors:', errors);
      return;
    }

    setIsSignupLoading(true);
    setSignupFormErrors({});

    try {
      console.log('Starting Firebase signup process...');
      
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const firebaseUser = userCredential.user;
      
      console.log('Firebase user created:', firebaseUser.uid);
      
      // Step 2: Update Firebase profile with display name
      const displayName = `${firstName} ${lastName[0].toUpperCase()}`;
      await updateProfile(firebaseUser, { displayName });
      
      // Step 3: Register user profile in backend
      const backendResponse = await makeAuthenticatedAPICall('/register', 'POST', {
        firstName,
        lastName,
        email: signupEmail,
        userType: 'student', // Default to student for signup
      });
      
      console.log('Backend registration successful:', backendResponse);
      
      // Step 4: Store user data and redirect based on needsOnboarding
      const userData = {
        user: backendResponse,
        authProvider: 'firebase'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      alert('Account created successfully!');
      
      // Redirect based on needsOnboarding field
      if (backendResponse.needsOnboarding) {
        window.location.href = '/user/onboarding';
      } else {
        // If onboarding is complete, go to dashboard
        window.location.href = '/user/dashboard';
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
      
      // Handle Firebase-specific errors
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setSignupFormErrors({ signupEmail: 'Email already in use' });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        setSignupFormErrors({ signupPassword: 'Password is too weak' });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        setSignupFormErrors({ signupEmail: 'Invalid email address' });
      } else if (error.message === 'No authenticated user found') {
        errorMessage = 'Authentication failed. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSignupLoading(false);
    }
  };

  // Handles form submission for Sign In with Firebase
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const errors = {};
    if (!isValidEmail(signinEmail)) errors.signinEmail = 'Please enter a valid email address.';
    if (!signinPassword) errors.signinPassword = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setSigninFormErrors(errors);
      console.error('Validation Errors:', errors);
      return;
    }

    setIsSigninLoading(true);
    setSigninFormErrors({});

    try {
      console.log('Starting Firebase signin process...');
      
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, signinEmail, signinPassword);
      const firebaseUser = userCredential.user;
      
      console.log('Firebase signin successful:', firebaseUser.uid);
      
      // Small delay to ensure Firebase auth state is fully set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 2: Get user profile from backend
      const backendResponse = await makeAuthenticatedAPICall('/me', 'GET');
      
      console.log('Backend profile retrieved:', backendResponse);
      
      // Step 3: Store user data
      const userData = {
        user: backendResponse,
        authProvider: 'firebase'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      alert('Successfully logged in!');
      
      // Step 4: Redirect based on user type and onboarding status
      if (backendResponse.roles?.includes('admin')) {
        window.location.href = '/admin/dashboard';
      } else if (backendResponse.needsOnboarding) {
        // User needs to complete onboarding first
        if (backendResponse.userType === 'mentor') {
          window.location.href = '/mentor/onboarding';
        } else {
          window.location.href = '/user/onboarding';
        }
      } else {
        // User is fully set up, go to dashboard
        if (backendResponse.userType === 'mentor') {
          window.location.href = '/mentor/dashboard';
        } else {
          window.location.href = '/user/dashboard';
        }
      }
      
    } catch (error) {
      console.error('Signin failed:', error);
      
      // Handle Firebase-specific errors
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
        setSigninFormErrors({ signinEmail: 'Email not found' });
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
        setSigninFormErrors({ signinPassword: 'Incorrect password' });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
        setSigninFormErrors({ signinEmail: 'Invalid email address' });
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message === 'No authenticated user found') {
        errorMessage = 'Authentication failed. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSigninLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{activeTab === 'signup' ? 'Sign Up - Roots & Wings' : 'Sign In - Roots & Wings'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="font-sans text-gray-800 bg-primary-light min-h-screen flex flex-col">
        {/* Header Component */}

        <Navbar />

        {/* <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              {/* <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-primary-dark">Roots & Wings</div>
                <span className="hidden md:block text-sm text-gray-500">Educational Mentorship Platform</span>
              </div>  */}
              
              {/* Navigation Links */}

           
              {/* <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  <i className="fas fa-home mr-2"></i>Home
                </a>
                <a href="/mentor/dashboard" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  <i className="fas fa-users mr-2"></i>Find Mentors
                </a>
                <a href="/workshop/listing" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  <i className="fas fa-calendar mr-2"></i>Workshops
                </a>
              </nav> */}


            {/* </div>
          </div>
        </header> */}

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Auth Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Tab Header */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`auth-tab flex-1 py-4 text-center font-semibold transition-all duration-300 border-b-2 hover:bg-gray-50 ${
                    activeTab === 'signin'
                      ? 'border-primary text-primary bg-accent-light'
                      : 'border-transparent text-gray-600'
                  }`}
                  onClick={() => setActiveTab('signin')}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                </button>
                <button
                  className={`auth-tab flex-1 py-4 text-center font-semibold transition-all duration-300 border-b-2 hover:bg-gray-50 ${
                    activeTab === 'signup'
                      ? 'border-primary text-primary bg-accent-light'
                      : 'border-transparent text-gray-600'
                  }`}
                  onClick={() => setActiveTab('signup')}
                >
                  <i className="fas fa-user-plus mr-2"></i>Sign Up
                </button>
              </div>

              {/* Form Container */}
              <div className="p-8">
                {/* Sign In Form */}
                <form id="signin-form" onSubmit={handleSignInSubmit} className={`${activeTab === 'signin' ? '' : 'hidden'} space-y-6`}>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                    <p className="text-gray-600">Continue your learning journey with us</p>
                  </div>
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                      <i className="fas fa-envelope mr-2 text-primary"></i>Email Address
                    </label>
                    <input 
                      type="email" 
                      id="signin-email" 
                      name="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        signinFormErrors.signinEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {signinFormErrors.signinEmail && <p className="text-red-500 text-sm mt-1">{signinFormErrors.signinEmail}</p>}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">
                      <i className="fas fa-lock mr-2 text-primary"></i>Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showSignInPassword ? 'text' : 'password'}
                        id="signin-password" 
                        name="password"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                          signinFormErrors.signinPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
                        required
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                      >
                        <i className={`fas ${showSignInPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {signinFormErrors.signinPassword && <p className="text-red-500 text-sm mt-1">{signinFormErrors.signinPassword}</p>}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="text-primary hover:text-primary-dark font-medium transition-colors">
                      Forgot Password?
                    </a>
                  </div>

                  {/* Sign In Button */}
                  <button 
                    type="submit" 
                    disabled={isSigninLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSigninLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Sign Up Form */}
                <form id="signup-form" onSubmit={handleSignUpSubmit} className={`${activeTab === 'signup' ? '' : 'hidden'} space-y-6`}>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Roots & Wings</h2>
                    <p className="text-gray-600">Start your personalized learning journey today</p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                        <i className="fas fa-user mr-2 text-primary"></i>First Name
                      </label>
                      <input 
                        type="text" 
                        id="first-name" 
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                          signupFormErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="First name"
                        required
                      />
                      {signupFormErrors.firstName && <p className="text-red-500 text-sm mt-1">{signupFormErrors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                        <i className="fas fa-user mr-2 text-primary"></i>Last Name
                      </label>
                      <input 
                        type="text" 
                        id="last-name" 
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                          signupFormErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Last name"
                        required
                      />
                      {signupFormErrors.lastName && <p className="text-red-500 text-sm mt-1">{signupFormErrors.lastName}</p>}
                    </div>
                  </div>
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                      <i className="fas fa-envelope mr-2 text-primary"></i>Email Address
                    </label>
                    <input 
                      type="email" 
                      id="signup-email" 
                      name="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      onBlur={() => {
                        if (signupEmail && !isValidEmail(signupEmail)) {
                          setSignupFormErrors({ ...signupFormErrors, signupEmail: 'Please enter a valid email address.' });
                        } else {
                          setSignupFormErrors({ ...signupFormErrors, signupEmail: '' });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        signupFormErrors.signupEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {signupFormErrors.signupEmail && <p className="text-red-500 text-sm mt-1">{signupFormErrors.signupEmail}</p>}
                  </div>

                  {/* Password Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                        <i className="fas fa-lock mr-2 text-primary"></i>Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showSignUpPassword ? 'text' : 'password'}
                          id="signup-password" 
                          name="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          onBlur={() => {
                            if (signupPassword && signupPassword.length < 8) {
                              setSignupFormErrors({ ...signupFormErrors, signupPassword: 'Password must be at least 8 characters.' });
                            } else {
                              setSignupFormErrors({ ...signupFormErrors, signupPassword: '' });
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                            signupFormErrors.signupPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Create a password"
                          required
                          minLength="8"
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        >
                          <i className={`fas ${showSignUpPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <i className="fas fa-info-circle mr-1"></i>Minimum 8 characters
                      </div>
                      {signupFormErrors.signupPassword && <p className="text-red-500 text-sm mt-1">{signupFormErrors.signupPassword}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                        <i className="fas fa-lock mr-2 text-primary"></i>Confirm Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm-password" 
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => {
                            if (confirmPassword && signupPassword !== confirmPassword) {
                              setSignupFormErrors({ ...signupFormErrors, confirmPassword: 'Passwords do not match.' });
                            } else {
                              setSignupFormErrors({ ...signupFormErrors, confirmPassword: '' });
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                            signupFormErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm your password"
                          required
                          minLength="8"
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {signupFormErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{signupFormErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      <i className="fas fa-building mr-2 text-primary"></i>Company/Organization <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      id="company" 
                      name="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Your company or organization"
                    />
                  </div>

                  {/* Email Preferences */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="email-updates" 
                        name="emailPreferences" 
                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={emailUpdates}
                        onChange={(e) => setEmailUpdates(e.target.checked)}
                      />
                      <div className="text-sm">
                        <span className="text-gray-700 font-medium">Email preferences</span>
                        <p className="text-gray-500 mt-1">Send me helpful resources, feature updates, and best practices via email</p>
                      </div>
                    </label>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        name="terms" 
                        className={`mt-1 rounded border-gray-300 text-primary focus:ring-primary ${
                          signupFormErrors.terms ? 'border-red-500' : ''
                        }`}
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        required
                      />
                      <div className="text-sm text-gray-600">
                        I agree to the <a href="/terms" className="text-primary hover:text-primary-dark font-medium transition-colors">Terms of Service</a> and <a href="/privacy" className="text-primary hover:text-primary-dark font-medium transition-colors">Privacy Policy</a>
                      </div>
                    </label>
                    {signupFormErrors.terms && <p className="text-red-500 text-sm mt-1">{signupFormErrors.terms}</p>}
                  </div>

                  {/* Sign Up Button */}
                  <button 
                    type="submit" 
                    disabled={isSignupLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSignupLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus mr-2"></i>Create Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Need help getting started?</p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="/help" className="text-primary hover:text-primary-dark font-medium transition-colors flex items-center">
                  <i className="fas fa-question-circle mr-2"></i>Help Center
                </a>
                <a href="/contact" className="text-primary hover:text-primary-dark font-medium transition-colors flex items-center">
                  <i className="fas fa-envelope mr-2"></i>Contact Support
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Component */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2025 Roots & Wings. Empowering learners across the UK.</p>
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <a href="/about" className="hover:text-primary transition-colors">About Us</a>
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AuthPages;
