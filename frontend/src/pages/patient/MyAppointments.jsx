import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService'; // Import paymentService
import { Calendar, Clock, User, XCircle, Filter, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const loadData = async () => {
        setLoading(true);
        try {
            if (!user._id) {
                toast.error('Please log in to view appointments');
                setLoading(false);
                return;
            }

            const myAppts = await appointmentService.getPatientAppointments(user._id);
            setAppointments(myAppts);
        } catch (e) {
            console.error('Error loading appointments:', e);
            toast.error('Failed to load appointments');
            setAppointments([]);
        }
        setLoading(false);
    };

    const socket = useSocket();

    useEffect(() => {
        loadData();
    }, []);

    // Listen for payment requests in real-time
    useEffect(() => {
        if (!socket) return;

        socket.on('payment_request', (data) => {
            toast('Payment requested for an appointment', { icon: '💳' });
            loadData();
        });

        socket.on('appointment_paid', () => {
            loadData();
        });

        return () => {
            socket.off('payment_request');
            socket.off('appointment_paid');
        };
    }, [socket]);

    const handleCancel = async (id) => {
        if (window.confirm('Cancel this appointment?')) {
            try {
                await appointmentService.cancelAppointment(id);
                toast.success('Appointment cancelled successfully');
                loadData();
            } catch (error) {
                toast.error('Failed to cancel appointment');
            }
        }
    };

    const handlePayment = async (appt) => {
        try {
            // 1. Create Order via Service (handles URL and Auth automatically)
            const order = await paymentService.createSplitOrder(appt._id, appt.consultationFee);

            // 2. Open Razorpay
            const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!key) {
                toast.error('Payment configuration missing (Key ID)');
                console.error('Missing VITE_RAZORPAY_KEY_ID');
                return;
            }

            if (!window.Razorpay) {
                toast.error('Payment SDK not loaded. Check internet connection.');
                return;
            }

            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "HMS Portal",
                description: `Consultation with ${appt.primaryPhysician}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId: appt._id
                        });
                        console.log('Payment success:', verifyResponse);
                        toast.success('Payment Successful!');
                        loadData();
                    } catch (err) {
                        console.error('Verification failed:', err);
                        toast.error(err.response?.data?.message || 'Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: function () {
                        toast('Payment processing cancelled');
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);

            rzp1.on('payment.failed', function (response) {
                console.error('Payment Failed:', response.error);
                toast.error(`Payment Failed: ${response.error.description}`);
            });

            rzp1.open();

        } catch (error) {
            console.error('Payment initialization error', error);
            const msg = error.response?.data?.message || error.message || 'Failed to initiate payment';
            toast.error(msg);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-500 border-red-100 opacity-70';
            case 'pending_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'pending_doctor': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'pending_payment': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    // Filter appointments
    const getFilteredAppointments = () => {
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return appointments.filter(a =>
                    new Date(a.schedule) > now && a.status !== 'cancelled' && a.status !== 'completed'
                );
            case 'past':
                return appointments.filter(a =>
                    new Date(a.schedule) < now || a.status === 'completed'
                );
            case 'cancelled':
                return appointments.filter(a => a.status === 'cancelled');
            default:
                return appointments;
        }
    };

    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-500">
                    {appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length} Active
                </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All', count: appointments.length },
                    { key: 'upcoming', label: 'Upcoming', count: appointments.filter(a => new Date(a.schedule) > new Date() && a.status !== 'cancelled').length },
                    { key: 'past', label: 'Past', count: appointments.filter(a => new Date(a.schedule) < new Date() || a.status === 'completed').length },
                    { key: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${filter === tab.key
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading your schedule...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredAppointments.map((appt) => (
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
                                {appt.reason && (
                                    <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                                        <span className="font-semibold text-slate-900">Reason:</span> {appt.reason}
                                    </div>
                                )}
                                {appt.note && (
                                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 italic border border-slate-100">
                                        "{appt.note}"
                                    </div>
                                )}
                            </div>

                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    {(appt.status === 'pending_payment' && appt.consultationFee) && (
                                        <button
                                            onClick={() => handlePayment(appt)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <CreditCard size={16} />
                                            Pay ₹{appt.consultationFee}
                                        </button>
                                    )}

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
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {filter === 'all' ? 'No Appointments Found' : `No ${filter} appointments`}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        {filter === 'all'
                            ? "You don't have any appointments scheduled yet."
                            : `You don't have any ${filter} appointments.`}
                    </p>
                    {filter === 'all' && (
                        <a href="/book-appointment" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                            Book Now
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
