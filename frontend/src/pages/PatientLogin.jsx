import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Activity } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
                <Card className="max-w-md w-full animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-500/20">
                            <Activity className="w-12 h-12 text-white" />
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
        </div>
    );
};

export default PatientLogin;
