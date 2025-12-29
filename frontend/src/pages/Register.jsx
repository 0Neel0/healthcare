import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Stethoscope, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import StickyHeader from '../components/layout/StickyHeader';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import patientService from '../services/patientService';
import authService from '../services/authService';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
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
            const msg = "Passwords don't match";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        // Email Validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            const msg = "Please enter a valid email address.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        // Standard Strong Password Regex: Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            const msg = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        try {
            if (formData.role === 'patient') {
                // Register Patient with required fields
                await patientService.createPatient({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
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
            <StickyHeader />
            <div className="container mx-auto px-4 py-16 md:py-24 flex items-center justify-center flex-grow">
                <Card className="max-w-md w-full animate-scale-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-medical"></div>
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
                                        ? 'bg-medical-blue-50 border-medical-blue-500 text-medical-blue-700 ring-2 ring-medical-blue-500'
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
                                        ? 'bg-health-green-50 border-health-green-500 text-health-green-700 ring-2 ring-health-green-500'
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
                                        ? 'bg-demo-orange-50 border-demo-orange-500 text-demo-orange-700 ring-2 ring-demo-orange-500'
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
                                <Phone size={18} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="input-modern"
                                placeholder="1234567890"
                                value={formData.phone}
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
                            {formData.password && (
                                <div className="mt-2 space-y-2 animate-fade-in">
                                    <div className="flex gap-1 h-1.5">
                                        {[1, 2, 3, 4, 5].map((level) => {
                                            const strength = [
                                                formData.password.length >= 8,
                                                /[A-Z]/.test(formData.password),
                                                /[a-z]/.test(formData.password),
                                                /\d/.test(formData.password),
                                                /[@$!%*?&]/.test(formData.password)
                                            ].filter(Boolean).length;

                                            let color = 'bg-gray-200';
                                            if (strength >= level) {
                                                if (strength <= 2) color = 'bg-red-500';
                                                else if (strength <= 4) color = 'bg-yellow-500';
                                                else color = 'bg-green-500';
                                            }

                                            return (
                                                <div key={level} className={`flex-1 rounded-full ${color} transition-all duration-300`} />
                                            );
                                        })}
                                    </div>
                                    <ul className="text-xs space-y-1 text-gray-500">
                                        <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</li>
                                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>• One uppercase letter</li>
                                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>• One lowercase letter</li>
                                        <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>• One number</li>
                                        <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : ''}>• One special char (@$!%*?&)</li>
                                    </ul>
                                </div>
                            )}
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

                        <Button type="submit" variant="medical" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300"></span>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                            </div>
                        </div>
                        <GoogleLoginButton text="Sign up with Google" />
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account? {' '}
                        <Link to="/login" className="text-medical-blue-600 font-bold hover:underline">
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
