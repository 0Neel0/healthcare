import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-block">
                            <Logo className="w-10 h-10" textClassName="text-2xl" />
                        </Link>
                        <p className="text-slate-600 leading-relaxed">
                            Providing world-class healthcare with a focus on patient experience and medical excellence. Your health is our priority.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-300">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-slate-600 hover:text-brand-600 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/book-appointment" className="text-slate-600 hover:text-brand-600 transition-colors">Book Appointment</Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-slate-600 hover:text-brand-600 transition-colors">Patient Portal</Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-slate-600 hover:text-brand-600 transition-colors">New Patient Registration</Link>
                            </li>
                            <li>
                                <Link to="/admin" className="text-slate-600 hover:text-brand-600 transition-colors">Admin Access</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Our Services</h3>
                        <ul className="space-y-3">
                            <li className="text-slate-600">General Consultation</li>
                            <li className="text-slate-600">Specialized Surgery</li>
                            <li className="text-slate-600">Laboratory Services</li>
                            <li className="text-slate-600">Emergency Care</li>
                            <li className="text-slate-600">Pharmacy</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-slate-600">
                                <MapPin className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                                <span>123 Medical Center Drive,<br />Healthcare City, HC 90210</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-600">
                                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3 text-slate-600">
                                <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                                <span>support@healthcareplus.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left text-sm text-slate-500">
                    <p>&copy; {currentYear} HealthCare Plus. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-2 md:mt-0">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> for better healthcare.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
