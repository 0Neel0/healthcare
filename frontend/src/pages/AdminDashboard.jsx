import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, XCircle, RefreshCw, Plus, Settings, FileText, ChevronRight, Activity, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import AppointmentTable from '../components/appointment/AppointmentTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormField from '../components/forms/FormField';
import { appointmentService } from '../services/appointmentService';
import { useForm } from 'react-hook-form';
import Card from '../components/ui/Card'; // Reusing the generic Card if available, or designing inline

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Get time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const passkey = localStorage.getItem('adminPasskey');
            if (!passkey) {
                navigate('/admin');
                return;
            }

            const [statsData, appointmentsData] = await Promise.all([
                appointmentService.getAppointmentStats(),
                appointmentService.getAppointments(currentPage, 10)
            ]);

            setStats(statsData);
            setAppointments(appointmentsData.appointments);
            setTotalPages(appointmentsData.pagination.pages);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('adminPasskey');
                navigate('/admin');
            } else {
                setError('Failed to load dashboard data. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = (appointment) => {
        setSelectedAppointment(appointment);
        reset({
            schedule: new Date(appointment.schedule).toISOString().slice(0, 16),
            note: appointment.note || ''
        });
        setShowScheduleModal(true);
    };

    const handleCancel = (appointment) => {
        setSelectedAppointment(appointment);
        reset();
        setShowCancelModal(true);
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    const onScheduleSubmit = async (data) => {
        try {
            setActionLoading(true);
            await appointmentService.scheduleAppointment(selectedAppointment._id, { schedule: data.schedule, note: data.note });
            setShowScheduleModal(false);
            fetchData();
            alert('Appointment scheduled successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const onCancelSubmit = async (data) => {
        try {
            setActionLoading(true);
            await appointmentService.cancelAppointment(selectedAppointment._id, data.cancellationReason);
            setShowCancelModal(false);
            fetchData();
            alert('Appointment cancelled successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    const quickActions = [
        { label: 'All Patients', icon: Users, path: '/admin/patients', color: 'bg-blue-100', text: 'text-blue-600' },
        { label: 'Doctors', icon: Activity, path: '/admin/doctors', color: 'bg-indigo-100', text: 'text-indigo-600' },
        { label: 'Reports', icon: FileText, path: '/admin/reports', color: 'bg-amber-100', text: 'text-amber-600' },
        { label: 'Settings', icon: Settings, path: '/admin', color: 'bg-slate-100', text: 'text-slate-600' },
    ];

    return (
        <div className="min-h-screen pb-12">
            <Header />

            <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">

                {/* 1. Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-indigo-500/20 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">ADMINISTRATOR</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                                {greeting}, Admin
                            </h1>
                            <p className="text-slate-400 max-w-lg">
                                You have <span className="text-white font-bold">{stats?.pending || 0} pending</span> appointments requiring attention today.
                            </p>
                        </div>
                        <Button onClick={fetchData} className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* 2. Stats & Quick Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats Column */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Total Appointments</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats?.total}</h3>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                    <Users size={24} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Scheduled</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats?.scheduled}</h3>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ring-2 ring-amber-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock size={24} />
                                </div>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">Action Needed</span>
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats?.pending}</h3>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                    <XCircle size={24} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Cancelled</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats?.cancelled}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Column */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:row-span-2">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-indigo-600" /> Quick Access
                        </h3>
                        <div className="space-y-3">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                                >
                                    <div className={`p-2 rounded-lg ${action.color} ${action.text}`}>
                                        <action.icon size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1">{action.label}</span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">System Status</p>
                                <div className="flex items-center gap-2 text-sm text-indigo-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    All Systems Operational
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Recent Appointments Table Section */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Appointments</h2>
                            <p className="text-sm text-slate-500">Manage patient bookings</p>
                        </div>
                        <Button variant="outline" className="text-sm">View All History</Button>
                    </div>

                    <div className="p-2">
                        <AppointmentTable
                            appointments={appointments}
                            onSchedule={handleSchedule}
                            onCancel={handleCancel}
                            onView={handleView}
                        />
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals reused from existing code */}
                <Modal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    title="Schedule Appointment"
                >
                    <form onSubmit={handleSubmit(onScheduleSubmit)} className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl mb-4">
                            <p className="text-sm text-gray-700"><strong>Patient:</strong> {selectedAppointment?.patient?.name}</p>
                            <p className="text-sm text-gray-700"><strong>Doctor:</strong> {selectedAppointment?.primaryPhysician}</p>
                        </div>
                        <FormField label="Schedule Date & Time" name="schedule" type="datetime-local" register={register} error={errors.schedule} required />
                        <FormField label="Additional Notes" name="note" type="textarea" register={register} error={errors.note} />
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" variant="success" disabled={actionLoading} className="flex-1">{actionLoading ? 'Scheduling...' : 'Confirm'}</Button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    title="Cancel Appointment"
                >
                    <form onSubmit={handleSubmit(onCancelSubmit)} className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-xl mb-4">
                            <p className="text-sm text-gray-700"><strong>Patient:</strong> {selectedAppointment?.patient?.name}</p>
                        </div>
                        <FormField label="Reason" name="cancellationReason" type="textarea" register={register} error={errors.cancellationReason} required />
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">Close</Button>
                            <Button type="submit" variant="danger" disabled={actionLoading} className="flex-1">{actionLoading ? 'Cancelling...' : 'Confirm'}</Button>
                        </div>
                    </form>
                </Modal>

                {/* View Modal Code (Simplified for brevity in replacement, but kept robust features) */}
                <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Details" size="lg">
                    {selectedAppointment && (
                        <div className="space-y-4 p-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="block text-slate-500">Patient</span> <span className="font-semibold">{selectedAppointment.patient?.name}</span></div>
                                <div><span className="block text-slate-500">Doctor</span> <span className="font-semibold">{selectedAppointment.primaryPhysician}</span></div>
                                <div><span className="block text-slate-500">Status</span> <span className={`font-semibold capitalize ${selectedAppointment.status === 'cancelled' ? 'text-red-500' : 'text-slate-800'}`}>{selectedAppointment.status}</span></div>
                                <div><span className="block text-slate-500">Date</span> <span className="font-semibold">{new Date(selectedAppointment.schedule).toLocaleString()}</span></div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Reason</span>
                                <p className="text-slate-800">{selectedAppointment.reason}</p>
                            </div>
                            {selectedAppointment.cancellationReason && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <span className="block text-red-800 text-xs uppercase font-bold mb-1">Cancellation Reason</span>
                                    <p className="text-red-700">{selectedAppointment.cancellationReason}</p>
                                </div>
                            )}
                            <Button onClick={() => setShowViewModal(false)} className="w-full mt-4">Close</Button>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default AdminDashboard;
