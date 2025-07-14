import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onSignIn, onSignUp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <header 
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-full max-w-6xl mx-auto glass-navbar-floating`}
      style={{ left: 'max(1rem, calc(50% - 48rem))', right: 'max(1rem, calc(50% - 48rem))' }}
    >
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full glass-bg-accent transition-all duration-300">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-xl font-bold text-text-glass-primary transition-colors duration-300">
              ReportMS
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium transition-colors duration-300 text-text-glass-secondary hover:text-text-glass-primary"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="glass-button glass-button-primary transition-all duration-300 rounded-full"
              onClick={onSignUp}
            >
              Sign Up Free
            </button>
            <button
              className="glass-button glass-button-secondary transition-all duration-300 rounded-full"
              onClick={onSignIn}
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-text-glass-primary" />
            ) : (
              <Menu className="h-6 w-6 text-text-glass-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-card border-t border-glass-border rounded-2xl mx-4 mt-2"
          >
            <div className="px-6 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-text-glass-secondary hover:text-text-glass-primary font-medium py-2 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-glass-border flex flex-row space-x-4">
                  <button 
                    className="glass-button glass-button-primary justify-center w-1/2 rounded-full"
                    onClick={() => {
                      onSignUp();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up Free
                  </button>
                  <button 
                    className="glass-button glass-button-secondary justify-center w-1/2 rounded-full"
                    onClick={() => {
                      onSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;