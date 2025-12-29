import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Users, TrendingUp, Calendar, Activity, Award, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import HexagonCard from '../components/ui/HexagonCard';
import AlternatingSection from '../components/ui/AlternatingSection';
import StatsCounter from '../components/ui/StatsCounter';
import TestimonialSlider from '../components/ui/TestimonialSlider';
import StickyHeader from '../components/layout/StickyHeader';
import Footer from '../components/layout/Footer';

const Home = () => {
    // Value Propositions for Hero Section
    const valueProps = [
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'HIPAA compliant cloud-hosted platform with 99.99% uptime for more than a decade',
            color: 'medical-blue',
        },
        {
            icon: Heart,
            title: 'Patient-Centric Design',
            description: '24/7 appointment booking, instant notifications, and telemedicine platforms',
            color: 'health-green',
        },
        {
            icon: Users,
            title: 'Comprehensive Management',
            description: 'Fully integrated modular software with seamless data flow between departments',
            color: 'demo-orange',
        },
    ];

    // Hospital Management Features
    const hospitalFeatures = [
        'Manage OPD appointments and billing seamlessly',
        'IP Management with automated lab reports',
        'Pharmacy, stores and lab management integration',
        'Advanced EMR to improve clinical care',
    ];

    // Clinic Management Features
    const clinicFeatures = [
        'Set up timings without any hurdle',
        'Manage patient appointments with IVR or online',
        'Systematize recording of payments & bills',
        'Keep track of patient visits & history digitally',
    ];

    // Medical Practice Features
    const practiceFeatures = [
        'Manage OPD with complete digital workflow',
        'Lab Management Software (LIMS)',
        'Pharmacy Management System',
        'E-Prescription and HD Video/Audio consultations',
    ];

    // Platform Statistics
    const stats = [
        { icon: Users, count: '3000+', label: 'Trusted Doctors' },
        { icon: Calendar, count: '5M+', label: 'Appointments Completed' },
        { icon: Activity, count: '99.99%', label: 'Platform Uptime' },
        { icon: Award, count: '98%', label: 'Patient Satisfaction' },
    ];

    // Testimonials
    const testimonials = [
        {
            text: 'DocPulse has transformed how we manage our hospital. The integrated system saves us hours every day and our patients love the online booking system.',
            name: 'Dr. Prasanna Kumar',
            designation: 'Chief Medical Officer',
            hospital: 'City General Hospital',
            rating: 5,
        },
        {
            text: 'As a clinic owner, I was skeptical about going digital. DocPulse made the transition seamless. The support team is exceptional and the system is incredibly user-friendly.',
            name: 'Dr. Naveen Kini',
            designation: 'Clinic Director',
            hospital: 'HealthCare Plus Clinic',
            rating: 5,
        },
        {
            text: 'The pharmacy management module has streamlined our inventory management completely. We have reduced wastage by 40% and improved our stock availability.',
            name: 'Pramendra Rajak',
            designation: 'Pharmacy Manager',
            hospital: 'MediCare Hospital',
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen">
            <StickyHeader />

            {/* Hero Section with padding for sticky header */}
            <section className="container mx-auto px-4 pt-32 pb-16">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        <span className="text-[#0052CC]">Comprehensive Cloud-Based</span>
                        <br />
                        <span className="text-slate-800">Healthcare Software Solutions</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                        Experience state-of-the-art digital solutions tailored for hospitals, clinics, and doctors.
                        Complete hospital management from appointments to billing, all in one place.
                    </p>
                </div>

                {/* Value Proposition Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {valueProps.map((prop, index) => (
                        <HexagonCard
                            key={index}
                            icon={prop.icon}
                            title={prop.title}
                            description={prop.description}
                            color={prop.color}
                        />
                    ))}
                </div>
            </section>

            {/* Our Solutions Section */}
            <section className="bg-gradient-subtle py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Our Solutions
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Tailored software solutions for every healthcare need
                        </p>
                    </div>

                    {/* Hospital Management System */}
                    <AlternatingSection
                        title="Hospital Management Software"
                        description="No More Paperwork. No More Rushing. Manage your entire hospital operations with our comprehensive HIMS - from OPD to IP management, pharmacy to lab integration."
                        features={hospitalFeatures}
                        imageSrc="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop"
                        imageAlt="Modern hospital building"
                        imagePosition="left"
                        ctaText="Learn More About HIMS"
                        ctaLink="#hospital"
                    />

                    {/* Clinic Management System */}
                    <AlternatingSection
                        title="Clinic Management Software"
                        description="Take the clinical experience to another level with practice management software. Streamline appointments, billing, patient records, and ensure data safety & security."
                        features={clinicFeatures}
                        imageSrc="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=600&fit=crop"
                        imageAlt="Modern clinic interior"
                        imagePosition="right"
                        ctaText="Explore Clinic Solutions"
                        ctaLink="#clinic"
                    />

                    {/* Medical Practice Management */}
                    <AlternatingSection
                        title="Medical Practice Management"
                        description="Medical Software for Labs & Pharmacies. Comprehensive solutions for OPD management, lab integration, and pharmacy systems - all connected seamlessly."
                        features={practiceFeatures}
                        imageSrc="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
                        imageAlt="Doctor using digital tablet"
                        imagePosition="left"
                        ctaText="Discover Medical Solutions"
                        ctaLink="#practice"
                    />
                </div>
            </section>

            {/* Platform Statistics */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Trusted by Healthcare Professionals
                    </h2>
                    <p className="text-lg text-slate-600">
                        Join thousands who rely on our platform every day
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatsCounter
                            key={index}
                            icon={stat.icon}
                            count={stat.count}
                            label={stat.label}
                        />
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-lg text-slate-600">
                            Hear from healthcare professionals who trust our platform
                        </p>
                    </div>

                    <TestimonialSlider testimonials={testimonials} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="glass-effect rounded-2xl p-12 md:p-16 text-center border border-slate-200 relative overflow-hidden">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Ready to Transform Your Healthcare Practice?
                    </h2>
                    <p className="text-slate-600 text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of healthcare providers who are already using our platform.
                        Get started today with a free demo and see the difference.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/register">
                            <Button variant="demo" size="lg" className="shadow-lg">
                                <Calendar size={20} />
                                Schedule a Demo
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary-blue" size="lg">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
