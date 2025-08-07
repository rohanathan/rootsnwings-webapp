"use client";

export default function AccountDropDown({ isProfileDropdownOpen }) {
  return (
    <div
      id="profile-dropdown"
      className={`${
        isProfileDropdownOpen ? "" : "hidden"
      } absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2`}
    >
      <a
        href="#"
        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        <i className="fas fa-user text-gray-400"></i>
        <span>Manage Profiles</span>
      </a>
      <a
        href="#"
        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        <i className="fas fa-plus text-gray-400"></i>
        <span>Add Young Learner</span>
      </a>
      <a
        href="#"
        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        <i className="fas fa-cog text-gray-400"></i>
        <span>Settings</span>
      </a>
      <hr className="my-2" />
      <a
        href="/getstarted"
        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
      >
        <i className="fas fa-sign-out-alt text-red-400"></i>
        <span>Log Out</span>
      </a>
    </div>
  );
}
