import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative pb-0">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 -left-40 w-96 h-96 glass-bg-blue rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 glass-bg-purple rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <div className="glass-container-footer relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="glass-bg-accent p-2 rounded-lg mr-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-text-glass-primary">ReportMS</span>
            </div>
            <p className="mb-4 text-text-glass-secondary">
              Streamlining the school reporting process with powerful, easy-to-use tools for educators worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-glass-muted hover:text-text-glass-primary transition-colors glass-bg-subtle p-2 rounded-lg">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-glass-muted hover:text-text-glass-primary transition-colors glass-bg-subtle p-2 rounded-lg">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-glass-muted hover:text-text-glass-primary transition-colors glass-bg-subtle p-2 rounded-lg">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-glass-muted hover:text-text-glass-primary transition-colors glass-bg-subtle p-2 rounded-lg">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-glass-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Home</a></li>
              <li><a href="#features" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-glass-primary mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-text-glass-secondary hover:text-text-glass-primary transition-colors">Webinars</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-glass-primary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-text-glass-secondary">123 Education Street, Suite 400<br />San Francisco, CA 94107</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-text-glass-secondary">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-text-glass-secondary">support@schoolreports.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-glass-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text-glass-muted">
            &copy; {new Date().getFullYear()} ReportMS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-text-glass-muted hover:text-text-glass-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-text-glass-muted hover:text-text-glass-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-text-glass-muted hover:text-text-glass-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;