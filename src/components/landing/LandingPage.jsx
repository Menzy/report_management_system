import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import Footer from './Footer';

const LandingPage = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen">
      <Navbar onSignIn={onSignIn} onSignUp={onSignUp} />
      <HeroSection onSignUp={onSignUp} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;