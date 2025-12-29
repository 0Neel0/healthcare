import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';
import Logo from '../ui/Logo';

const StickyHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-md'
                : 'bg-gradient-subtle'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Logo className="w-8 h-8" textClassName="text-2xl" />
                    </Link>

                    {/* Contact Info - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <a
                            href="tel:+919858555855"
                            className="flex items-center gap-2 text-slate-600 hover:text-[#0052CC] transition-colors"
                        >
                            <Phone size={16} />
                            <span>+91 985 8555 855</span>
                        </a>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">
                            email@hospital.com
                        </span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3">
                        <Link to="/book-appointment">
                            <button className="btn-demo px-4 py-2 text-sm md:px-6 md:py-2.5 flex items-center gap-2">
                                <Calendar size={18} />
                                <span className="hidden sm:inline">Book Appointment</span>
                                <span className="sm:hidden">Book</span>
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="btn-outline px-4 py-2 text-sm md:px-6 md:py-2.5">
                                Login
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickyHeader;
