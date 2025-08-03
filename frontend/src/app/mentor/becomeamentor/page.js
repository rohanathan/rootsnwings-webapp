"use client";

import { useEffect, useRef } from 'react';
import Head from 'next/head';

const BecomeMentorPage = () => {
    const cardsRef = useRef([]);

    useEffect(() => {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add hover animations
        const cards = cardsRef.current;
        cards.forEach(card => {
            if (card) {
                const handleMouseEnter = () => {
                    card.style.transform = 'translateY(-4px)';
                    card.style.transition = 'transform 0.3s ease';
                };
                const handleMouseLeave = () => {
                    card.style.transform = 'translateY(0)';
                };

                card.addEventListener('mouseenter', handleMouseEnter);
                card.addEventListener('mouseleave', handleMouseLeave);

                return () => {
                    card.removeEventListener('mouseenter', handleMouseEnter);
                    card.removeEventListener('mouseleave', handleMouseLeave);
                };
            }
        });
    }, []);

    // Placeholder function for form submission and button clicks
    const handleButtonClick = (action) => {
        console.log(`Action: ${action}`);
        // Implement your form submission or navigation logic here
    };

    return (
        <>
            <Head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Become a Mentor - Roots & Wings</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        'primary': '#00A2E8',
                                        'primary-dark': '#00468C',
                                        'primary-light': '#E6F7FF',
                                    }
                                }
                            }
                        }
                    `
                }} />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            </Head>
            <body className="bg-white font-sans">
                {/* Navigation */}
                <nav className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">Home</a>
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">Mentor Profiles</a>
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">Workshops</a>
                                <a href="#" className="text-gray-600 hover:text-primary transition-colors">FAQ</a>
                                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => handleButtonClick('Login')}>Login</button>
                                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors" onClick={() => handleButtonClick('Sign Up')}>Sign Up</button>
                            </div>
                            <button className="md:hidden">
                                <i className="fas fa-bars text-gray-600"></i>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-light to-white py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="lg:pr-8">
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                    Become a Mentor.<br />
                                    <span className="text-primary">Share Your Passion.</span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Join Roots & Wings to teach learners across the UK. Share your skills, set your schedule, and earn flexibly.
                                </p>

                                {/* Benefits List */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <i className="fas fa-check text-white text-sm"></i>
                                        </div>
                                        <span className="text-gray-700">Teach online or in-person</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <i className="fas fa-check text-white text-sm"></i>
                                        </div>
                                        <span className="text-gray-700">Choose your availability</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <i className="fas fa-check text-white text-sm"></i>
                                        </div>
                                        <span className="text-gray-700">Set your own rates</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <i className="fas fa-check text-white text-sm"></i>
                                        </div>
                                        <span className="text-gray-700">Serve all age groups</span>
                                    </div>
                                </div>

                                {/* CTA for Mobile */}
                                <div className="lg:hidden">
                                    <button className="w-full bg-primary text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-primary-dark transition-colors" onClick={() => handleButtonClick('Start Teaching Today (Mobile)')}>
                                        Start Teaching Today
                                    </button>
                                </div>
                            </div>

                            {/* Right Signup Card */}
                            <div className="hidden lg:block">
                                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Your Profile</h3>
                                    
                                    {/* Email Signup */}
                                    <form className="space-y-4 mb-6" onSubmit={(e) => { e.preventDefault(); handleButtonClick('Sign up by email'); }}>
                                        <div>
                                            <input type="email" placeholder="Enter your email address"
                                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                                        </div>
                                        <button type="submit" className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                                            Sign up by email
                                        </button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">or</span>
                                        </div>
                                    </div>

                                    {/* Social Signup */}
                                    <div className="space-y-3 mb-6">
                                        <button className="w-full border border-gray-300 py-3 px-6 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2" onClick={() => handleButtonClick('Sign up with Google')}>
                                            <i className="fab fa-google text-red-500"></i>
                                            <span>Sign up with Google</span>
                                        </button>
                                        <button className="w-full border border-gray-300 py-3 px-6 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2" onClick={() => handleButtonClick('Sign up with Apple')}>
                                            <i className="fab fa-apple text-black"></i>
                                            <span>Sign up with Apple</span>
                                        </button>
                                    </div>

                                    {/* Login Link */}
                                    <p className="text-center text-sm text-gray-600">
                                        Already have an account?
                                        <a href="#" className="text-primary font-medium hover:underline">Log in</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Join the Roots & Wings Community
                            </h2>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Testimonial */}
                            <div className="bg-primary-light rounded-2xl p-8">
                                <div className="flex items-start space-x-4 mb-6">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                                         alt="Mentor testimonial" className="w-16 h-16 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">James Richardson</h4>
                                        <p className="text-gray-600 text-sm">Guitar & Music Theory Mentor</p>
                                        <div className="flex items-center mt-1">
                                            <div className="flex text-yellow-400 text-sm">
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                            </div>
                                            <span className="text-gray-600 text-sm ml-2">5.0 rating</span>
                                        </div>
                                    </div>
                                </div>
                                <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                                    "I found amazing students across the UK and turned my weekend guitar lessons into a thriving side hustle. The platform makes it so easy to connect with passionate learners."
                                </blockquote>
                            </div>

                            {/* Mission Text */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Growing Together with Purpose</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    At Roots & Wings, we believe in the power of meaningful connections between mentors and learners.
                                    Our mission-driven platform connects you with students who are genuinely excited to learn from your expertise.
                                </p>
                                <p className="text-gray-600 leading-relaxed mb-8">
                                    Whether you're sharing traditional arts, modern skills, or cultural knowledge, you'll be part of a
                                    community that values authentic learning experiences and personal growth.
                                </p>
                                <div className="flex items-center space-x-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">500+</div>
                                        <div className="text-gray-600">Active Mentors</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">2,000+</div>
                                        <div className="text-gray-600">Students Taught</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">4.8★</div>
                                        <div className="text-gray-600">Average Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Teach With Us */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Why Teach with Us?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                We handle the business side so you can focus on what you love most - teaching and inspiring others.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Benefit 1 */}
                            <div className="text-center group" ref={el => cardsRef.current[0] = el}>
                                <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                                <i className="fas fa-bullseye text-white text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Students Easily</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We match learners to you based on their interests and your expertise, so you can focus on teaching rather than marketing.
                                </p>
                            </div>

                            {/* Benefit 2 */}
                            <div className="text-center group" ref={el => cardsRef.current[1] = el}>
                                <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                                    <i className="fas fa-pound-sign text-white text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Stress-Free Payments</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    No follow-up needed; we handle everything. Automatic invoicing, secure payments, and weekly payouts directly to your bank.
                                </p>
                            </div>

                            {/* Benefit 3 */}
                            <div className="text-center group" ref={el => cardsRef.current[2] = el}>
                                <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:bg-primary-dark transition-colors">
                                    <i className="fas fa-clock text-white text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Flexible Schedule</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    You decide what and when to teach. Set your availability, choose session types, and maintain perfect work-life balance.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                How It Works
                            </h2>
                            <p className="text-xl text-gray-600">
                                Get started in three simple steps
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connection Lines */}
                            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-primary opacity-30"></div>
                            
                            {/* Step 1 */}
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Profile</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Share your expertise, experience, and availability. Upload credentials and set your teaching preferences.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Offer Sessions</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Choose what you want to teach: one-on-one sessions, group classes, or special workshops.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center relative">
                                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Booked & Paid</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Students book your sessions, you teach, and receive automatic payments. It's that simple.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Start Your Teaching Journey Today
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join hundreds of mentors who are already inspiring learners and earning flexibly across the UK.
                        </p>
                        <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg" onClick={() => handleButtonClick('Become a Mentor (CTA)')}>
                            Become a Mentor
                        </button>
                        <p className="text-blue-100 mt-4 text-sm">
                            No setup fees • Free to get started • Support included
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Roots & Wings</h3>
                                <p className="text-gray-400 mb-4">Connecting passionate mentors with eager learners across the UK.</p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <i className="fab fa-facebook"></i>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">For Students</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Find Mentors</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Workshops</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">For Mentors</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Become a Mentor</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Mentor Resources</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Help Centre</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2025 Roots & Wings. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
        </>
    );
};

export default BecomeMentorPage;
