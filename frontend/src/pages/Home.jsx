import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, UserPlus, Shield, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';

const Home = () => {
    const features = [
        {
            icon: UserPlus,
            title: 'Patient Registration',
            description: 'Register as a new patient with comprehensive medical information',
            link: '/register',
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-100',
        },
        {
            icon: Calendar,
            title: 'Book Appointment',
            description: 'Schedule your appointment with our expert physicians',
            link: '/book-appointment',
            color: 'text-accent-600',
            bg: 'bg-accent-50',
            border: 'border-accent-100',
        },
        {
            icon: Shield,
            title: 'Admin Portal',
            description: 'Manage appointments and patient records securely',
            link: '/admin',
            color: 'text-slate-600',
            bg: 'bg-slate-100',
            border: 'border-slate-200',
        },
    ];

    const stats = [
        { icon: CheckCircle, label: 'Appointments Completed', value: '10K+' },
        { icon: Clock, label: 'Average Wait Time', value: '15 min' },
        { icon: TrendingUp, label: 'Patient Satisfaction', value: '98%' },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
                    <div className="inline-block p-4 bg-gradient-medical rounded-2xl mb-6 shadow-lg shadow-brand-500/20">
                        <Activity className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        <span className="text-gradient">Healthcare Management</span>
                        <br />
                        <span className="text-slate-800">Made Simple</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                        Experience seamless healthcare services with our modern Hospital Management System.
                        Book appointments, manage records, and access care - all in one place.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/register">
                            <Button variant="primary" size="lg" className="flex items-center gap-2">
                                Get Started <TrendingUp size={20} />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="flex items-center gap-2">
                                Patient Login <UserPlus size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center border border-slate-100 shadow-soft" gradient>
                            <stat.icon className="w-10 h-10 text-brand-500 mx-auto mb-3" />
                            <p className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</p>
                            <p className="text-slate-500 font-medium">{stat.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
                    {features.map((feature, index) => (
                        <Link key={index} to={feature.link}>
                            <Card hover className={`h-full group border ${feature.border} hover:border-brand-200`}>
                                <div className={`inline-block p-4 ${feature.bg} rounded-xl mb-4 transition-all duration-300 group-hover:scale-110`}>
                                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center glass-effect rounded-3xl p-12 animate-scale-in border border-white/60 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-medical"></div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Ready to experience modern healthcare?
                    </h2>
                    <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of patients who trust our platform for their healthcare needs.
                        Register today and take control of your health journey.
                    </p>
                    <Link to="/register">
                        <Button variant="primary" size="lg" className="shadow-brand-500/25">
                            Register Now
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
