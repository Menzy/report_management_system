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
    <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your School's Reporting Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of schools already saving time and delivering better reports. Get started today with our free plan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" className="border-white text-white hover:bg-blue-700 border-2">
              Schedule a Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-200 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">No Credit Card Required</h3>
                <p className="text-blue-100 text-sm">Start with our free plan without any payment information.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-200 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Easy Setup Process</h3>
                <p className="text-blue-100 text-sm">Be up and running in minutes with our guided onboarding.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-200 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Cancel Anytime</h3>
                <p className="text-blue-100 text-sm">No long-term contracts or commitments required.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;