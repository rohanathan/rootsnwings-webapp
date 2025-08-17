"use client";

import React from "react";

const Navbar = ({ user }) => {
  // Function for smooth scrolling
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-primary-dark">
            Roots & Wings
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8">
            <li>
              <a
                href={user?.userType === "mentor" ? "/mentor/dashboard" : "/user/dashboard"}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/mentor/directory"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Mentor Profiles
              </a>
            </li>
            <li>
              <a
                href="/user/workshop"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Workshops
              </a>
            </li>
            {/* <li>
              <a
                href="#enroll"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Enroll
              </a>
            </li> */}
            <li>
              <a
                href="/faq"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                FAQ
              </a>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!user?.uid ? (
              <>
                <a
                  href="/getstarted"
                  className="text-primary-dark font-medium hover:text-primary transition-colors"
                >
                  Login
                </a>
                <a
                  href="/getstarted"
                  className="bg-primary hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Sign Up
                </a>
                <a
                  href="mentor/becomeamentor"
                  className="bg-primary-dark hover:bg-blue-900 text-white px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Become a Mentor
                </a>
              </>
            ) : (
              <button
                onClick={() => {
                  localStorage.clear();
                  // localStorage.removeItem('user');
                  window.location.href = "/";
                }}
                className="bg-primary-dark hover:bg-blue-900 text-white px-5 py-2 rounded-full font-medium transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



// review : [
//   {
//     userId: '123',
//     rating: 5,
//     comment: 'Great mentor!',
//     createdAt: '2021-01-01',
//     updatedAt: '2021-01-01'
//   },
//   {
//     userId: '123',
//     rating: 5,
//     comment: 'Great mentor!',
//     createdAt: '2021-01-01',
//     updatedAt: '2021-01-01'
//   }
// ]


// PUT update classes 

