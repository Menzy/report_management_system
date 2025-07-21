import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X, Sparkles, Star } from 'lucide-react';
import { Container } from '../ui/Container';
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
    <section id="pricing" className="py-20 bg-muted/30">
      <Container>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose the Perfect Plan for Your School
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start with our free plan and upgrade as your school grows. All plans include our core features.
          </p>

          <div className="flex justify-center mb-8">
            <div className="bg-muted/50 p-1 rounded-lg border border-border">
              <div className="flex">
                <button
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'quarterly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly (Save 35%)
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
              <div className={`w-full flex flex-col bg-card rounded-2xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg relative ${
                plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-card-foreground">${plan.price[billingCycle]}</span>
                    <span className="text-muted-foreground ml-2">
                      {plan.price[billingCycle] > 0 ? `/ ${billingCycle === 'yearly' ? 'year' : 'quarter'}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex-grow mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-card-foreground' : 'text-muted-foreground/70'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className={`w-full ${
                    plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
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
          <h3 className="text-xl font-semibold mb-2 text-foreground">Need a custom plan for your district?</h3>
          <p className="text-muted-foreground mb-4">
            Contact us for custom pricing options for larger educational institutions.
          </p>
          <Button variant="outline">Contact Sales</Button>
        </motion.div>
      </Container>
    </section>
  );
};

export default PricingSection;