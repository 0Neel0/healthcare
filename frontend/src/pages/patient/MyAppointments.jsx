import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { Calendar, Clock, MapPin, User, XCircle, AlertCircle } from 'lucide-react';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    // We can filter on client side for now, or use a backend "my-appointments" endpoint
    // Since we don't have a backend filter *yet*, I'll fetch all and filter client-side.
    // In production, this should be server-side filtering.

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fix: Use getAppointments (correct method name) and fetch enough items logic
            const res = await appointmentService.getAppointments(1, 1000);

            // Backend returns { appointments: [...], pagination: {...} }
            const allAppointments = res.appointments || [];

            const myAppts = allAppointments.filter(a => {
                // Backend returns 'patient' (populated object or ID)
                const pId = a.patient?._id || a.patient;
                if (String(pId) === String(user._id)) return true;
                if (a.patientName === user.name) return true;
                return false;
            });
            setAppointments(myAppts);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleCancel = async (id) => {
        if (window.confirm('Cancel this appointment?')) {
            await appointmentService.cancelAppointment(id);
            loadData();
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-500 border-red-100 opacity-70';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-500">
                    {appointments.filter(a => a.status !== 'cancelled').length} Active
                </span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading your schedule...</p>
                </div>
            ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {appointments.map((appt) => (
                        <div key={appt._id} className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{appt.primaryPhysician}</h3>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Physician</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(appt.status)} capitalize`}>
                                    {appt.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="font-medium">{new Date(appt.schedule).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Clock size={16} className="text-slate-400" />
                                    <span className="font-medium">{new Date(appt.schedule).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {appt.note && (
                                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 italic border border-slate-100">
                                        "{appt.note}"
                                    </div>
                                )}
                            </div>

                            {appt.status !== 'cancelled' && (
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => handleCancel(appt._id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                                    >
                                        <XCircle size={16} /> Cancel Appointment
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        You don't have any upcoming visits scheduled. Book an appointment to get started with your health journey.
                    </p>
                    <a href="/book-appointment" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                        Book Now
                    </a>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
