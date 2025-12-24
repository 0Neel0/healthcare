import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital, User, Calendar, Shield, LogOut, LogIn, LayoutDashboard } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('patientToken');
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('patientToken');
            localStorage.removeItem('patientUser');
            navigate('/login');
        }
    };

    return (
        <header className="glass-effect sticky top-0 z-50 animate-slide-down">
            <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="p-2 bg-gradient-medical rounded-xl shadow-lg shadow-brand-500/20 group-hover:shadow-glow transition-all duration-300">
                            <Hospital className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gradient">HealthCare+</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        {isLoggedIn ? (
                            <>
                                <span className="text-slate-500 text-sm font-medium">
                                    Hello, <span className="text-brand-600 font-bold">{user.name}</span>
                                </span>
                                <Link
                                    to="/patient/dashboard"
                                    className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors font-medium"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/book-appointment"
                                    className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors font-medium"
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span>Book Appointment</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors font-medium"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors font-medium"
                                >
                                    <User className="w-5 h-5" />
                                    <span>Register</span>
                                </Link>
                                <Link
                                    to="/admin"
                                    className="flex items-center space-x-2 px-4 py-2 btn-gradient rounded-lg font-medium"
                                >
                                    <Shield className="w-5 h-5" />
                                    <span>Admin</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl glass-effect rounded-box w-52">
                                {isLoggedIn ? (
                                    <>
                                        <li><span className="font-bold text-brand-600">{user.name}</span></li>
                                        <li><Link to="/book-appointment">Book Appointment</Link></li>
                                        <li><button onClick={handleLogout} className="text-red-500">Logout</button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/login">Login</Link></li>
                                        <li><Link to="/register">Register</Link></li>
                                        <li><Link to="/admin">Admin Portal</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
