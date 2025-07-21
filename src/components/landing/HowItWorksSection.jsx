import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Container } from '../ui/Container';
import { Button } from '../ui/button';
import { ClipboardList, Upload, BarChart3, FileText, Workflow } from 'lucide-react';

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
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
          {number}
        </div>
        {number < 4 && (
          <div className="absolute left-6 top-12 w-0.5 h-16 bg-border hidden md:block"></div>
        )}
      </div>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex-1 hover:shadow-md transition-shadow">
        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-card-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
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
    <section id="how-it-works" className="py-20 bg-background">
      <Container>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
            <Workflow className="w-4 h-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
          className="mt-16 bg-muted/50 rounded-xl p-8 text-center border border-border"
        >
          <h3 className="text-2xl font-semibold mb-4 text-foreground">Ready to streamline your reporting process?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of schools already saving time and improving their reporting workflow.
          </p>
          <Button size="lg" className="px-8 py-3">
            Get Started Today
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;