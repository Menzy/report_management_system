import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import CTASection from './CTASection';
import Footer from './Footer';

const LandingPage = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen page-bg-primary pb-0">
      <Navbar onSignIn={onSignIn} onSignUp={onSignUp} />
      <HeroSection onSignUp={onSignUp} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;