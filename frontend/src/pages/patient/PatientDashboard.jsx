import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Activity, Clock, Plus, ChevronRight, User, CreditCard, Bell } from 'lucide-react';
import Card from '../../components/ui/Card';
import appointmentService from '../../services/appointmentService';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        past: 0,
        cancelled: 0
    });

    // Redirect to profile completion if needed
    useEffect(() => {
        if (user && (user.address === 'TBD' || !user.address)) {
            navigate('/patient/complete-profile');
        }
    }, [user, navigate]);

    // Fetch patient appointments
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const data = await appointmentService.getPatientAppointments(user._id);
                setAppointments(data);

                // Calculate stats
                const now = new Date();
                const upcoming = data.filter(apt =>
                    new Date(apt.schedule) > now && apt.status !== 'cancelled'
                ).length;
                const past = data.filter(apt =>
                    new Date(apt.schedule) < now && apt.status !== 'cancelled'
                ).length;
                const cancelled = data.filter(apt => apt.status === 'cancelled').length;

                setStats({ upcoming, past, cancelled });
            } catch (error) {
                console.error('Error fetching appointments:', error);
                toast.error('Failed to load appointments');
            } finally {
                setLoading(false);
            }
        };

        if (user._id) {
            fetchAppointments();
        }
    }, [user._id]);

    // Get Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    // Get upcoming appointments (next 3)
    const upcomingAppointments = appointments
        .filter(apt => new Date(apt.schedule) > new Date() && apt.status !== 'cancelled')
        .sort((a, b) => new Date(a.schedule) - new Date(b.schedule))
        .slice(0, 3);

    // Get recent activity (last 2 completed/cancelled)
    const recentActivity = appointments
        .filter(apt => new Date(apt.schedule) < new Date() || apt.status === 'cancelled')
        .sort((a, b) => new Date(b.schedule) - new Date(a.schedule))
        .slice(0, 2);

    // Check for appointments within 24 hours
    const notificationAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.schedule);
        const diff = aptDate - new Date();
        const hours = diff / (1000 * 60 * 60);
        return hours > 0 && hours <= 24 && apt.status === 'scheduled';
    });

    const quickActions = [
        { label: 'Book Appointment', icon: Plus, path: '/book-appointment', color: 'bg-medical-blue-500', text: 'text-white' },
        { label: 'Lab Reports', icon: Activity, path: '/patient/lab', color: 'bg-white', text: 'text-slate-600', border: 'border-medical-blue-200' },
        { label: 'Pay Bills', icon: CreditCard, path: '/patient/billing', color: 'bg-white', text: 'text-slate-600', border: 'border-medical-blue-200' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-medical-blue-200 border-t-medical-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Notifications for upcoming appointments */}
            {notificationAppointments.length > 0 && (
                <div className="bg-demo-orange-50 border border-demo-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <Bell className="text-demo-orange-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="font-semibold text-demo-orange-900">Upcoming Appointment Reminder</p>
                        <p className="text-sm text-demo-orange-700 mt-1">
                            You have {notificationAppointments.length} appointment{notificationAppointments.length > 1 ? 's' : ''} in the next 24 hours.
                        </p>
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0052CC] p-8 md:p-12 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-[#DEEBFF] font-medium mb-1">{greeting}</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {user.name}
                        </h1>
                        <p className="mt-2 text-white opacity-90 max-w-lg">
                            {stats.upcoming > 0
                                ? `You have ${stats.upcoming} upcoming appointment${stats.upcoming > 1 ? 's' : ''}.`
                                : 'You have no upcoming appointments. Book one today!'}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 min-w-[200px] border border-white/20">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <User className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-white/80 font-medium">Patient ID</p>
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
                                <div className={`p-2 rounded-lg ${action.text === 'text-white' ? 'bg-white/20' : 'bg-medical-blue-50'}`}>
                                    <action.icon size={22} />
                                </div>
                                <span className="font-semibold text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Upcoming Appointments Section */}
                    <div className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                            <button onClick={() => navigate('/patient/appointments')} className="text-sm font-semibold text-medical-blue-600 hover:text-medical-blue-700 flex items-center gap-1">
                                View All <ChevronRight size={16} />
                            </button>
                        </div>

                        {upcomingAppointments.length > 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-1">
                                {upcomingAppointments.map((apt, i) => (
                                    <div key={apt._id} className="p-4 hover:bg-slate-50 rounded-lg flex items-center gap-4 transition-colors cursor-pointer border-b last:border-0 border-slate-50">
                                        <div className="bg-[#DEEBFF] p-3 rounded-lg text-[#0052CC]">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800">{apt.primaryPhysician}</h4>
                                            <p className="text-xs text-slate-500">
                                                {new Date(apt.schedule).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${apt.status === 'scheduled'
                                            ? 'bg-[#E3FCEF] text-[#00875A]'
                                            : 'bg-[#FFF0B3] text-[#FF991F]'
                                            }`}>
                                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-8 text-center">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No upcoming appointments</p>
                                <button
                                    onClick={() => navigate('/book-appointment')}
                                    className="mt-3 text-sm font-semibold text-[#0052CC] hover:underline">
                                    Book your first appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Stats & Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">My Stats</h2>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#DEEBFF] text-[#0052CC] rounded-lg"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-500">Upcoming</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.upcoming}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#E3FCEF] text-[#00875A] rounded-lg"><Activity size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-500">Completed</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.past}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#FFEBE6] text-[#DE350B] rounded-lg"><Clock size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-500">Cancelled</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.cancelled}</p>
                                </div>
                            </div>
                        </div>

                        {recentActivity.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Recent Activity</p>
                                {recentActivity.map(apt => (
                                    <div key={apt._id} className="text-xs text-slate-600 py-1">
                                        • {apt.primaryPhysician} - {apt.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
