import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import patientService from '../services/patientService';
import authService from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient' // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            if (formData.role === 'patient') {
                // Register Patient (Minimal)
                await patientService.createPatient({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: '' // Optional at this stage
                });
                toast.success('Registration successful! Please login to complete your profile.');
            } else {
                // Register Admin or Doctor
                await authService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                toast.success(`Registration successful! Please login as ${formData.role}.`);
            }
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-12 flex items-center justify-center flex-grow">
                <Card className="max-w-md w-full animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Logo className="w-16 h-16" textClassName="text-4xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join our healthcare platform</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="label-modern mb-2 block">I am a...</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${formData.role === 'patient'
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <User size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${formData.role === 'doctor'
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <Stethoscope size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Doctor</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${formData.role === 'admin'
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <Shield size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Admin</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <User size={18} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="input-modern"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <Mail size={18} /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input-modern"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <Lock size={18} /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="input-modern"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <Lock size={18} /> Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="input-modern"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account? {' '}
                        <Link to="/login" className="text-brand-600 font-bold hover:underline">
                            Login here
                        </Link>
                    </div>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default Register;
