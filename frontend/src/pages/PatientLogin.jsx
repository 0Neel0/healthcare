import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Footer from '../components/layout/Footer';
import { patientService } from '../services/patientService';
import toast from 'react-hot-toast';

const PatientLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Email Validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(credentials.email)) {
            const msg = "Please enter a valid email address.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        // Password Strength Regex Check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(credentials.password)) {
            const msg = "Invalid password format. Password must meet complexity requirements.";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        try {
            const res = await patientService.login(credentials);
            // Store token/user - For now simple storage
            localStorage.setItem('token', res.token);
            const patientData = res.patient;
            localStorage.setItem('user', JSON.stringify(patientData));

            toast.success(`Welcome back, ${patientData.name}!`);
            navigate('/patient/dashboard'); // Redirect to Portal
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            toast.error(errorMessage);
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Login</h1>
                        <p className="text-gray-600">Access your medical records and appointments</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <User size={18} /> Email
                            </label>
                            <input
                                type="email"
                                className="input-modern"
                                placeholder="name@example.com"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label-modern flex items-center gap-2">
                                <Lock size={18} /> Password
                            </label>
                            <input
                                type="password"
                                className="input-modern"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-brand-600 font-bold hover:underline">
                            Register now
                        </Link>
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-500">
                        Are you an administrator? {' '}
                        <Link to="/admin/login" className="text-slate-600 font-bold hover:underline">
                            Admin Login
                        </Link>
                    </div>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default PatientLogin;
