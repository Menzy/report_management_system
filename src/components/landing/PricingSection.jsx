import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
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
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that works best for your school's needs. No hidden fees or surprises.
          </p>

          <div className="flex justify-center mb-8">
            <Tabs defaultValue="yearly" value={billingCycle} onValueChange={setBillingCycle} className="w-full max-w-xs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (Save 35%)</TabsTrigger>
              </TabsList>
            </Tabs>
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
              <Card className={`w-full flex flex-col ${plan.popular ? 'border-blue-500 shadow-lg relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price[billingCycle]}</span>
                    <span className="text-gray-500 ml-2">
                      {plan.price[billingCycle] > 0 ? `/ ${billingCycle === 'yearly' ? 'year' : 'quarter'}` : ''}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.popular ? "primary" : "outline"} 
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold mb-2">Need a custom plan for your district?</h3>
          <p className="text-gray-600 mb-4">
            Contact us for custom pricing options for larger educational institutions.
          </p>
          <Button variant="outline">Contact Sales</Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;