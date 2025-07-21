import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote, Users } from 'lucide-react';
import { Container } from '../ui/Container';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const TestimonialCard = ({ quote, author, role, school, image, delay }) => {
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
      className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="text-yellow-500 flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      </div>
      <div className="relative mb-6">
        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
        <p className="text-card-foreground relative z-10">{quote}</p>
      </div>
      <div className="flex items-center">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={image} alt={author} />
          <AvatarFallback>{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-card-foreground">{author}</h4>
          <p className="text-sm text-muted-foreground">{role}, {school}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      quote: "This system has completely transformed how we manage our academic reporting. What used to take weeks now takes just hours, and the reports look more professional than ever.",
      author: "Sarah Johnson",
      role: "Principal",
      school: "Westfield Academy",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      delay: 0.1,
    },
    {
      quote: "The analytics features have given us incredible insights into student performance trends. We can now identify areas for improvement much earlier in the academic year.",
      author: "Michael Chen",
      role: "Academic Director",
      school: "Greenwood High School",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      delay: 0.2,
    },
    {
      quote: "Parents have been extremely impressed with the quality of our report cards since we started using this system. The clear layout and detailed feedback have improved our communication.",
      author: "Emily Rodriguez",
      role: "Grade Coordinator",
      school: "Riverside Elementary",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      delay: 0.3,
    },
  ];

  const partnerLogos = [
    { name: "Oakridge Schools", logo: "https://via.placeholder.com/150x50?text=Oakridge" },
    { name: "Brightstar Academy", logo: "https://via.placeholder.com/150x50?text=Brightstar" },
    { name: "Global Education Partners", logo: "https://via.placeholder.com/150x50?text=GEP" },
    { name: "Sunshine School District", logo: "https://via.placeholder.com/150x50?text=Sunshine" },
    { name: "Excellence Education Group", logo: "https://via.placeholder.com/150x50?text=Excellence" },
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <Container>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
            <Users className="w-4 h-4 mr-2" />
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what school administrators and teachers are saying about our report card management system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              school={testimonial.school}
              image={testimonial.image}
              delay={testimonial.delay}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-center mb-8 text-foreground">
            Trusted by leading educational institutions
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partnerLogos.map((partner, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 grayscale hover:grayscale-0 transition-all duration-300 dark:invert"
                />
              </div>
            ))}
          </div>
        </motion.div>
       </Container>
     </section>
   );
};

export default TestimonialsSection;