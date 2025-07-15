'use client';

export default function HeroSection() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Find the <span className="text-primary">perfect mentor</span>
      </h1>
      <p className="text-gray-600 mb-6">Learn. Grow. Soar with Roots & Wings.</p>
      <div className="flex justify-center">
        <input
          type="text"
          placeholder='Try "Guitar", "Maths", "Python"...'
          className="w-[80%] max-w-xl px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none"
        />
        <button className="bg-primary text-white px-6 py-3 rounded-r-md font-semibold">
          Search
        </button>
      </div>
    </div>
  );
}
