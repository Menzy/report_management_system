import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FileText, BarChart, Users, Clock, Download, Shield } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: FileText,
      title: "Automated Report Cards",
      description: "Generate professional report cards in minutes with customizable templates and automatic grade calculations.",
      delay: 0.1,
    },
    {
      icon: BarChart,
      title: "Performance Analytics",
      description: "Track student progress with detailed analytics and visualizations to identify areas for improvement.",
      delay: 0.2,
    },
    {
      icon: Users,
      title: "Class Management",
      description: "Easily organize students by class, manage subjects, and track attendance all in one place.",
      delay: 0.3,
    },
    {
      icon: Clock,
      title: "Time-Saving Workflows",
      description: "Reduce administrative workload with batch processing and automated calculations.",
      delay: 0.4,
    },
    {
      icon: Download,
      title: "Bulk Export Options",
      description: "Export individual or batch reports in multiple formats for easy sharing with parents and administrators.",
      delay: 0.5,
    },
    {
      icon: Shield,
      title: "Secure Data Storage",
      description: "Keep all your school data secure with enterprise-grade encryption and role-based access controls.",
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for School Reporting
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools makes managing academic records and generating reports effortless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;