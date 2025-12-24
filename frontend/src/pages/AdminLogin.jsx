import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Store the passkey in localStorage
            localStorage.setItem('adminPasskey', passkey);

            // Navigate to dashboard - the dashboard will verify the passkey by making an API call
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid passkey. Please try again.');
            localStorage.removeItem('adminPasskey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
                <Card className="max-w-md w-full animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4">
                            <Shield className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
                        <p className="text-gray-600">Enter your passkey to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Passkey Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="label-modern flex items-center space-x-2">
                                <Lock className="w-5 h-5 text-gray-600" />
                                <span>Admin Passkey</span>
                            </label>
                            <input
                                type="password"
                                value={passkey}
                                onChange={(e) => setPasskey(e.target.value)}
                                className="input-modern"
                                placeholder="Enter admin passkey"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !passkey}
                            className="w-full"
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                        </Button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-600 text-center">
                            This area is restricted to authorized personnel only.
                            Please contact your administrator if you need access.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
