"use client";
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h4 className="text-primary font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-300 hover:text-primary transition-colors">Home</a></li>
              <li><a href="#workshops" className="text-gray-300 hover:text-primary transition-colors">Workshops</a></li>
              <li><a href="#enroll" className="text-gray-300 hover:text-primary transition-colors">Enroll</a></li>
              <li><a href="#faq" className="text-gray-300 hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-primary font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#privacy" className="text-gray-300 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="text-gray-300 hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-primary font-semibold mb-6">Contact</h4>
            <p className="text-gray-300 mb-4">hello@rootsandwings.co.uk</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="Follow us on Facebook">📘</a>
              <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="Follow us on Instagram">📷</a>
              <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="Connect with us on LinkedIn">💼</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Roots & Wings – A Learning Platform by Students of the UK</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
