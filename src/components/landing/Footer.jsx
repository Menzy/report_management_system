import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <GraduationCap className="h-8 w-8 text-blue-500 mr-2" />
              <span className="text-xl font-bold text-white">SchoolReports</span>
            </div>
            <p className="mb-4 text-gray-400">
              Streamlining the school reporting process with powerful, easy-to-use tools for educators worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Home</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-blue-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-blue-500 transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-blue-500 transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-blue-500 transition-colors">Testimonials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Webinars</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>123 Education Street, Suite 400<br />San Francisco, CA 94107</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <span>support@schoolreports.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SchoolReports. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;