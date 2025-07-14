import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

const CTASection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 glass-bg-blue rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 glass-bg-purple rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 glass-bg-accent rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center glass-card"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-glass-primary">
            Ready to Transform Your School's Reporting Process?
          </h2>
          <p className="text-xl text-text-glass-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of schools already saving time and delivering better reports. Get started today with our free plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="glass-button glass-button-primary glass-button-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="glass-button glass-button-secondary glass-button-lg">
              Schedule a Demo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1 text-text-glass-primary">No Credit Card Required</h3>
                <p className="text-text-glass-secondary text-sm">Start with our free plan without any payment information.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1 text-text-glass-primary">Easy Setup Process</h3>
                <p className="text-text-glass-secondary text-sm">Be up and running in minutes with our guided onboarding.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1 text-text-glass-primary">Cancel Anytime</h3>
                <p className="text-text-glass-secondary text-sm">No long-term contracts or commitments required.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;