import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import StickyHeader from '../components/layout/StickyHeader';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import patientService from '../services/patientService';
import authService from '../services/authService';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
        // Email Validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            const msg = "Please enter a valid email address.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        // Password Strength Regex Check (User Request: Enforce on Login too)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            const msg = "Invalid password format. Password must meet complexity requirements.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        try {
            let res;
            if (formData.role === 'patient') {
                // Patient Login
                res = await patientService.login({
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', res.token);
                // Backend now returns standardized 'user' object, fallback to 'patient' for legacy
                const userData = res.user || res.patient;
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('role', 'patient');

                toast.success(`Welcome back, ${userData.name}!`);
                navigate('/patient/dashboard');
            } else {
                // Admin or Doctor Login
                res = await authService.login({
                    email: formData.email,
                    password: formData.password
                });

                // Verify the user actually has the role they tried to login as
                if (res.user.role !== formData.role && res.user.role !== 'admin') {
                    // Allow admin to login even if they selected something else? 
                    // Strict check:
                    if (res.user.role !== formData.role) {
                        throw new Error(`Invalid role. You are registered as a ${res.user.role}.`);
                    }
                }

                toast.success(`Welcome back, ${res.user.name}!`);
                if (res.user.role === 'admin') navigate('/admin');
                else if (res.user.role === 'doctor') navigate('/doctor/dashboard'); // Assuming route
                else navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
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
                <Card className="max-w-md w-full animate-scale-in relative overflow-hidden shadow-lg">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Logo className="w-16 h-16" textClassName="text-4xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Secure access to your portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="label-modern mb-2 block">Login as...</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${formData.role === 'patient'
                                        ? 'bg-[#DEEBFF] border-[#0052CC] text-[#0052CC] ring-2 ring-[#0052CC]/30'
                                        : 'border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E]'
                                        }`}
                                >
                                    <User size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${formData.role === 'doctor'
                                        ? 'bg-[#E3FCEF] border-[#00875A] text-[#00875A] ring-2 ring-[#00875A]/30'
                                        : 'border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E]'
                                        }`}
                                >
                                    <Stethoscope size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Doctor</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${formData.role === 'admin'
                                        ? 'bg-[#FFF0B3] border-[#FF991F] text-[#FF991F] ring-2 ring-[#FF991F]/30'
                                        : 'border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E]'
                                        }`}
                                >
                                    <Shield size={20} className="mb-1" />
                                    <span className="text-xs font-medium">Admin</span>
                                </button>
                            </div>
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
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" variant="medical" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300"></span>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>
                        <GoogleLoginButton text="Sign in with Google" />
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-[#0052CC] font-bold hover:underline">
                            Register now
                        </Link>
                    </div>
                </Card>
                <div className="absolute top-4 right-4 z-50">
                    {/* Optional floating elements */}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
