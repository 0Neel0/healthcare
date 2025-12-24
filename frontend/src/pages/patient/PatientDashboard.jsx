import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Activity, Clock, Plus, ChevronRight, User, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    // Get Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const quickActions = [
        { label: 'Book Appointment', icon: Plus, path: '/book-appointment', color: 'bg-indigo-600', text: 'text-white' },
        { label: 'Lab Reports', icon: Activity, path: '/patient/lab', color: 'bg-white', text: 'text-slate-600', border: 'border-slate-200' },
        { label: 'Pay Bills', icon: CreditCard, path: '/patient/billing', color: 'bg-white', text: 'text-slate-600', border: 'border-slate-200' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 text-white shadow-xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-indigo-100 font-medium mb-1">{greeting}</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {user.name}
                        </h1>
                        <p className="mt-2 text-indigo-100 max-w-lg opacity-90">
                            Your health journey continues here. You have no pending actions today.
                        </p>
                    </div>
                    <div className="glass-effect bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 min-w-[200px] border border-white/20">
                        <div className="bg-white/20 p-3 rounded-full">
                            <User className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-100 font-medium">Patient ID</p>
                            <p className="font-mono font-bold tracking-wide">{user._id?.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Quick Actions (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className={`p-4 rounded-xl flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${action.color} ${action.text} ${action.border ? `border ${action.border}` : ''} shadow-sm`}
                            >
                                <div className={`p-2 rounded-lg ${action.text === 'text-white' ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <action.icon size={22} />
                                </div>
                                <span className="font-semibold text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Recent Activity Section (Mockup) */}
                    <div className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                            <button onClick={() => navigate('/patient/appointments')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-1">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="p-4 hover:bg-slate-50 rounded-xl flex items-center gap-4 transition-colors cursor-pointer border-b last:border-0 border-slate-50">
                                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-800">General Checkup</h4>
                                        <p className="text-xs text-slate-500">Dr. Sarah Johnson • 24 Dec 2024</p>
                                    </div>
                                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Completed</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Vitals (Mockup) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">My Vitals</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Activity size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-500">Heart Rate</p>
                                    <p className="text-lg font-bold text-slate-800">72 <span className="text-xs font-normal text-slate-400">bpm</span></p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Normal</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Activity size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-500">Blood Pressure</p>
                                    <p className="text-lg font-bold text-slate-800">120/80</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Ideal</span>
                        </div>

                        <div className="pt-2">
                            <div className="p-4 bg-indigo-50 rounded-xl text-center">
                                <p className="text-sm text-indigo-800 font-medium mb-2">Next Scheduled Visit</p>
                                <p className="text-xs text-indigo-600">No upcoming visits scheduled.</p>
                                <button onClick={() => navigate('/book-appointment')} className="mt-3 text-xs font-bold text-indigo-600 uppercase tracking-wider hover:underline">Schedule Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
