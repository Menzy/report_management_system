import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ClipboardList, Upload, BarChart3, FileText } from 'lucide-react';

const StepCard = ({ number, icon: Icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
      className="relative flex flex-col md:flex-row items-start gap-6"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full glass-bg-accent text-white flex items-center justify-center text-xl font-bold">
          {number}
        </div>
        {number < 4 && (
          <div className="absolute left-6 top-12 w-0.5 h-16 bg-white/30 hidden md:block"></div>
        )}
      </div>
      <div className="glass-card flex-1">
        <div className="glass-bg-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-text-glass-primary">{title}</h3>
        <p className="text-text-glass-secondary">{description}</p>
      </div>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const steps = [
    {
      number: 1,
      icon: ClipboardList,
      title: "Set Up Your School Profile",
      description: "Create your school profile with basic information, add classes and subjects to organize your academic structure.",
      delay: 0.1,
    },
    {
      number: 2,
      icon: Upload,
      title: "Upload Student Data",
      description: "Import student information and academic scores using our simple spreadsheet templates or manual entry forms.",
      delay: 0.3,
    },
    {
      number: 3,
      icon: BarChart3,
      title: "Process and Analyze",
      description: "Our system automatically calculates grades, positions, and generates performance analytics for each student.",
      delay: 0.5,
    },
    {
      number: 4,
      icon: FileText,
      title: "Generate and Share Reports",
      description: "Create beautiful, professional report cards for individual students or entire classes with a single click.",
      delay: 0.7,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-72 h-72 glass-bg-purple rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 glass-bg-blue rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="glass-bg-purple px-4 py-2 rounded-full text-white font-medium text-sm mb-4 inline-block">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-glass-primary mb-4">
            How It Works
          </h2>
          <p className="text-xl text-text-glass-secondary max-w-3xl mx-auto">
            Our streamlined workflow makes report card generation quick and easy, saving you hours of administrative work.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              delay={step.delay}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-16 glass-card text-center"
        >
          <h3 className="text-2xl font-semibold mb-4 text-text-glass-primary">Ready to streamline your reporting process?</h3>
          <p className="text-text-glass-secondary mb-6 max-w-2xl mx-auto">
            Join thousands of schools already saving time and improving their reporting workflow.
          </p>
          <button className="glass-button glass-button-primary">
            Get Started Today
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;