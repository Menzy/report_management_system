import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useInView } from 'react-intersection-observer';

const HeroSection = ({ onSignUp }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.6,
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative overflow-hidden page-bg-primary py-20 md:py-32">
      {/* Background decoration with glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 glass-bg-accent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 glass-bg-secondary rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 glass-bg-tertiary rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          {/* Left content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <span className="inline-block px-4 py-2 rounded-full glass-bg-accent text-white font-medium text-sm mb-6 backdrop-blur-sm">
                Streamline School Reporting
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-glass-primary mb-6 leading-tight"
            >
              Transform Your School's Report Card System
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-text-glass-secondary mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Simplify academic reporting, save time, and deliver professional report cards that showcase student achievement.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="glass-button glass-button-primary text-lg px-8 py-4" onClick={onSignUp}>
                Get Started Free
              </button>
              <button className="glass-button glass-button-secondary text-lg px-8 py-4">
                See How It Works
              </button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-text-glass-secondary"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>Free for basic use</span>
              </div>
            </motion.div>
          </div>
          
          {/* Right content - Hero image */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative glass-card glass-card-no-padding overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="School Report Management Dashboard" 
                className="w-full h-auto rounded-t-lg"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-text-glass-primary">Student Performance Dashboard</h3>
                <p className="text-text-glass-secondary text-sm">Generate comprehensive reports with just a few clicks</p>
              </div>
            </div>
            
            {/* Floating stats cards */}
            <motion.div 
              variants={statsVariants}
              className="absolute -top-6 -right-6 glass-card glass-card-sm"
            >
              <div className="flex items-center gap-3">
                <div className="glass-bg-accent p-3 rounded-full">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-glass-secondary">Schools using our system</p>
                  <p className="text-xl font-bold text-text-glass-primary">2,500+</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={statsVariants}
              className="absolute -bottom-6 -left-6 glass-card glass-card-sm"
            >
              <div className="flex items-center gap-3">
                <div className="glass-bg-success p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-glass-secondary">Reports generated</p>
                  <p className="text-xl font-bold text-text-glass-primary">1M+</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;