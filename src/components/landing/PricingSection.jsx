import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X } from 'lucide-react';

import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const pricingPlans = [
    {
      name: 'Free',
      description: 'For small schools just getting started',
      price: {
        quarterly: 0,
        yearly: 0,
      },
      features: [
        { name: 'Up to 100 students', included: true },
        { name: 'Basic report card templates', included: true },
        { name: 'Class and subject management', included: true },
        { name: 'Manual data entry', included: true },
        { name: 'Export to PDF', included: true },
        { name: 'Email support', included: false },
        { name: 'Bulk report generation', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom report templates', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Quarterly',
      description: 'Perfect for growing schools',
      price: {
        quarterly: 29,
        yearly: 19,
      },
      features: [
        { name: 'Up to 500 students', included: true },
        { name: 'All report card templates', included: true },
        { name: 'Class and subject management', included: true },
        { name: 'Spreadsheet data import', included: true },
        { name: 'Export to PDF and Excel', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Bulk report generation', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Custom report templates', included: false },
      ],
      cta: 'Subscribe Now',
      popular: true,
    },
    {
      name: 'Yearly',
      description: 'For established educational institutions',
      price: {
        quarterly: 79,
        yearly: 49,
      },
      features: [
        { name: 'Unlimited students', included: true },
        { name: 'All report card templates', included: true },
        { name: 'Advanced school management', included: true },
        { name: 'Automated data import', included: true },
        { name: 'Export to all formats', included: true },
        { name: 'Priority phone & email support', included: true },
        { name: 'Bulk report generation', included: true },
        { name: 'Advanced analytics & insights', included: true },
        { name: 'Custom report templates', included: true },
      ],
      cta: 'Subscribe Now',
      popular: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <section id="pricing" className="py-20 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/3 -left-40 w-96 h-96 glass-bg-success rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-40 w-80 h-80 glass-bg-amber rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="glass-bg-success px-4 py-2 rounded-full text-white font-medium text-sm mb-4 inline-block">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-glass-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-text-glass-secondary max-w-3xl mx-auto mb-8">
            Choose the plan that works best for your school's needs. No hidden fees or surprises.
          </p>

          <div className="flex justify-center mb-8">
            <div className="glass-card glass-card-sm rounded-full p-1 w-full max-w-xs">
              <div className="grid w-full grid-cols-2 gap-1">
                <button
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    billingCycle === 'quarterly'
                      ? 'glass-button glass-button-primary'
                      : 'text-text-glass-secondary hover:text-text-glass-primary hover:bg-white/10 rounded-full'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    billingCycle === 'yearly'
                      ? 'glass-button glass-button-primary'
                      : 'text-text-glass-secondary hover:text-text-glass-primary hover:bg-white/10 rounded-full'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div key={plan.name} variants={itemVariants} className="flex">
              <div className={`glass-card glass-card-no-padding w-full flex flex-col ${plan.popular ? 'glass-bg-strong border-2 border-blue-400 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="glass-bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-6 border-b border-glass-border">
                  <h3 className="text-xl font-bold text-text-glass-primary">{plan.name}</h3>
                  <p className="text-text-glass-secondary mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-text-glass-primary">${plan.price[billingCycle]}</span>
                    <span className="text-text-glass-muted ml-2">
                      {plan.price[billingCycle] > 0 ? `/ ${billingCycle === 'yearly' ? 'year' : 'quarter'}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex-grow p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-text-glass-muted mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-text-glass-primary' : 'text-text-glass-muted'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border-t border-glass-border">
                  <button 
                    className={`glass-button w-full ${plan.popular ? 'glass-button-primary' : 'glass-button-secondary'}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold mb-2 text-text-glass-primary">Need a custom plan for your district?</h3>
          <p className="text-text-glass-secondary mb-4">
            Contact us for custom pricing options for larger educational institutions.
          </p>
          <button className="glass-button glass-button-secondary">Contact Sales</button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;