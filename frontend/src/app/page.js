"use client";

// Import all your modularized components
import Navbar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedMentorsSection from '../components/FeaturedMentorsSection';
import FeaturedWorkshopsSection from '../components/FeaturedWorkshopsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
// import FinalCTASection from '../components/FinalCTASection';
import Footer from '../components/Footer';
import Homepage from '@/pages/Homepage';

// Mark this component as a Client Component if it uses hooks or browser APIs
// This is necessary because some of your components (like HeroSection, FeaturedWorkshopsSection)
// use useState and useEffect, which are client-side features.

export default function Main() {
  return (
    // The main container for your page content
    <div>
      <Navbar />
      <main>
        <Homepage />
        {/* <HeroSection />
        <CategoriesSection />
        <FeaturedMentorsSection />
        <FeaturedWorkshopsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection /> */}
      </main>
      <Footer />
    </div>
  );
}
