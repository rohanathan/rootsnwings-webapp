import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-pink-100 to-white min-h-screen">
      <HeroSection />
      <section className="py-12 px-4 md:px-8">
        <h2 className="text-2xl font-bold mb-6">Explore Categories</h2>
        {/* Later: map categories */}
      </section>
      <section className="py-12 px-4 md:px-8 bg-[#f9f9f9]">
        <h2 className="text-2xl font-bold mb-6">Popular Mentors</h2>
        {/* Later: map mentor cards */}
      </section>
    </div>
  );
}
