import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, Activity, Users, Bell, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import PatientRecordModal from '../../components/doctor/PatientRecordModal';
import PrescriptionModal from '../../components/doctor/PrescriptionModal';
import ChatWindow from '../../components/chat/ChatWindow';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = user.name ? `Dr. ${user.name}` : 'Doctor';
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Modal & Action States
    const [chatUser, setChatUser] = useState(null);
    const [availabilityModal, setAvailabilityModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, appointment: null });
    const [consultationFee, setConsultationFee] = useState(500);
    const [patientRecordModal, setPatientRecordModal] = useState({ isOpen: false, patientId: null });
    const [prescriptionModal, setPrescriptionModal] = useState({ isOpen: false, appointment: null, patient: null });
    const [patientSearch, setPatientSearch] = useState('');
    const [activities, setActivities] = useState([
        { id: 1, type: 'info', message: 'Welcome to your dashboard', time: new Date() }
    ]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const addActivity = (message, type = 'info') => {
        setActivities(prev => [{ id: Date.now(), type, message, time: new Date() }, ...prev].slice(0, 10));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('doctor_confirmation_request', () => {
            toast('New appointment request received!', { icon: '🔔' });
            addActivity('New appointment request received', 'alert');
            fetchData();
        });
        socket.on('appointment_paid', () => {
            addActivity('Appointment payment confirmed', 'success');
            fetchData();
        });
        return () => {
            socket.off('doctor_confirmation_request');
            socket.off('appointment_paid');
        };
    }, [socket]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getDoctorAppointments(doctorName);
            setAppointments(data || []);

            // Calculate pseudo-stats if API doesn't provide them all
            const today = new Date().toDateString();
            const todayAppts = (data || []).filter(a => {
                try {
                    return new Date(a.schedule).toDateString() === today && a.status !== 'cancelled';
                } catch (e) { return false; }
            });

            setStats({
                todayCount: todayAppts.length,
                pendingRequests: (data || []).filter(a => a.status === 'pending_doctor').length,
                completedToday: todayAppts.filter(a => a.status === 'completed').length,
                pendingPayments: (data || []).filter(a => a.status === 'pending_payment').length,
                totalEarnings: (data || []).filter(a => a.paymentStatus === 'paid').reduce((acc, curr) => acc + (curr.consultationFee || 0), 0) * 0.5
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
            setAppointments([]); // Ensure appointments is an array even on error
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleConfirmRequest = async (e) => {
        e.preventDefault();
        try {
            await appointmentService.doctorConfirmAppointment(confirmModal.appointment._id, consultationFee);
            toast.success('Appointment confirmed. Waiting for payment.');
            setConfirmModal({ isOpen: false, appointment: null });
            fetchData();
        } catch (error) {
            console.error('Error confirming:', error);
            toast.error('Failed to confirm appointment');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await appointmentService.updateStatus(id, status);
            toast.success(`Appointment marked as ${status}`);
            addActivity(`Appointment marked as ${status}`, 'success');
            fetchData();
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const formatTimeSafe = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Invalid Time';
        }
    };

    const formatDateSafe = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const pendingRequests = appointments.filter(a => a.status === 'pending_doctor');
    const todayAppointments = appointments.filter(a => {
        try {
            const d = new Date(a.schedule);
            return d.toDateString() === new Date().toDateString() && a.status !== 'cancelled' && a.status !== 'pending_doctor';
        } catch (e) { return false; }
    }).sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    const columns = [
        {
            key: 'time',
            label: 'Time',
            render: (_, row) => <span className="font-mono font-medium text-slate-700">{formatTimeSafe(row.schedule)}</span>
        },
        {
            key: 'patient',
            label: 'Patient Details',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm">
                        {row.patient?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{row.patient?.name || 'Unknown'}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter">{row.patient?.phone || 'No phone'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Visit Status',
            render: (status) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        status === 'cancelled' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                            status === 'ongoing' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                'bg-slate-300'
                        }`}></div>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${status === 'completed' ? 'text-emerald-700' :
                        status === 'cancelled' ? 'text-rose-700' :
                            status === 'ongoing' ? 'text-blue-700' : 'text-slate-500'
                        }`}>{status}</span>
                </div>
            )
        },
        {
            key: 'payment',
            label: 'Payment',
            render: (_, row) => (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {row.paymentStatus === 'paid' ? 'Paid' : row.paymentStatus}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => setPatientRecordModal({ isOpen: true, patientId: row.patient?._id })} className="btn-xs btn-outline">Record</button>
                    {row.status === 'scheduled' && (
                        <button onClick={() => handleStatusUpdate(row._id, 'ongoing')} className="btn-xs btn-primary-blue">Start</button>
                    )}
                    {row.status === 'ongoing' && (
                        <>
                            <button
                                onClick={() => setPrescriptionModal({ isOpen: true, appointment: row })}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                Prescribe
                            </button>
                            <button onClick={() => handleStatusUpdate(row._id, 'completed')} className="btn-xs btn-success">Complete</button>
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="space-y-8 animate-fade-in p-2">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {doctorName}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setAvailabilityModal(true)}>Manage Availability</Button>
                    <Button variant="primary" onClick={() => navigate('/doctor/medical-imaging')} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Activity size={16} /> AI Imaging
                    </Button>
                    <Button onClick={fetchData}>Refresh Data</Button>
                    <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
            </div>

            {/* Quick Insights / Next Patient */}
            {
                (() => {
                    const nextAppt = todayAppointments.find(a => a.status === 'scheduled');
                    if (!nextAppt) return null;

                    const timeDiff = new Date(nextAppt.schedule) - currentTime;
                    const minsLeft = Math.floor(timeDiff / (1000 * 60));

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <p className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-xs">Up Next</p>
                                        <h2 className="text-3xl font-bold mb-2">{nextAppt.patient?.name}</h2>
                                        <div className="flex gap-4 text-sm text-blue-50">
                                            <span className="flex items-center gap-1"><Clock size={16} /> {formatTimeSafe(nextAppt.schedule)}</span>
                                            <span className="flex items-center gap-1"><Activity size={16} /> {nextAppt.reason}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[160px] border border-white/20">
                                        <p className="text-xs text-blue-100 uppercase font-bold mb-1">Starts In</p>
                                        <p className="text-4xl font-mono font-black">
                                            {minsLeft > 0 ? `${minsLeft}m` : 'Now'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleStatusUpdate(nextAppt._id, 'ongoing')}
                                        className="px-8 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                                    >
                                        Start Consultation
                                    </button>
                                </div>
                                {/* Decorative background circle */}
                                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            </div>

                            {/* Live Activity Feed */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden h-[180px] lg:h-auto">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                                    Activity <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                </h3>
                                <div className="space-y-3 overflow-y-auto h-[calc(100%-40px)] custom-scrollbar pr-1">
                                    {activities.map(activity => (
                                        <div key={activity.id} className="flex gap-3 text-xs">
                                            <div className={`w-1 h-8 rounded-full shrink-0 ${activity.type === 'alert' ? 'bg-amber-400' :
                                                activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-400'
                                                }`}></div>
                                            <div className="min-w-0">
                                                <p className="text-slate-800 font-medium truncate">{activity.message}</p>
                                                <p className="text-slate-400">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()
            }

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Bell size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.pendingRequests || 0}</div>
                        <div className="text-sm text-slate-500">Pending Requests</div>
                        {stats?.pendingRequests > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full animate-pulse">Action Required</span>}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.todayCount || 0}</div>
                        <div className="text-sm text-slate-500">Appointments Today</div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Slot Full</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.completedToday || 0}</div>
                        <div className="text-sm text-slate-500">Completed Today</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">₹{stats?.totalEarnings?.toLocaleString() || 0}</div>
                        <div className="text-sm text-slate-500">Total Earnings</div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+12% from last week</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><DollarSign size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.pendingPayments || 0}</div>
                        <div className="text-sm text-slate-500">Pending Payments</div>
                    </div>
                </div>
            </div>

            {/* Action Required: Incoming Requests */}
            {
                pendingRequests.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} /> Action Required ({pendingRequests.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingRequests.map(req => (
                                <div key={req._id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-slate-900">{req.patient?.name}</div>
                                            <div className="text-xs text-slate-500">ID: {req.patient?._id?.slice(-6)}</div>
                                        </div>
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">New Request</span>
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <p className="flex items-center gap-2"><Calendar size={14} /> {formatDateSafe(req.schedule)}</p>
                                        <p className="flex items-center gap-2"><Clock size={14} /> {formatTimeSafe(req.schedule)}</p>
                                        <p className="mt-2 text-slate-800 italic">"{req.reason}"</p>
                                    </div>
                                    <Button
                                        className="w-full mt-auto"
                                        onClick={() => {
                                            setConfirmModal({ isOpen: true, appointment: req });
                                            setConsultationFee(500); // Default
                                        }}
                                    >
                                        Review & Confirm
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Main Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
                        </div>
                        <DataTable
                            columns={columns}
                            data={todayAppointments}
                            emptyMessage="No appointments scheduled for today."
                        />
                    </div>
                </div>

                {/* Right Sidebar: My Patients */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Users size={20} className="text-blue-600" /> My Patients
                            </h2>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Activity size={16} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {/* Unique Patients Logic */}
                            {(() => {
                                const seenIds = new Set();
                                const uniquePatients = (appointments || [])
                                    .filter(app => {
                                        if (app.patient && !seenIds.has(app.patient._id)) {
                                            seenIds.add(app.patient._id);
                                            return true;
                                        }
                                        return false;
                                    })
                                    .map(app => ({ ...app.patient, lastVisit: app.schedule }))
                                    .filter(patient =>
                                        patient.name.toLowerCase().includes(patientSearch.toLowerCase())
                                    );

                                if (uniquePatients.length === 0) {
                                    return (
                                        <div className="p-10 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                                <Users size={24} />
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium">No results for "{patientSearch}"</p>
                                        </div>
                                    );
                                }

                                return uniquePatients.slice(0, 15).map(patient => (
                                    <div key={patient._id} className="p-4 hover:bg-slate-50 group transition-all duration-200 border-l-4 border-transparent hover:border-blue-500">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-200">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{patient.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient #{patient._id.slice(-6)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-medium font-sans uppercase">Last Visit</span>
                                                <span className="text-xs text-slate-600 font-semibold">{formatDateSafe(patient.lastVisit)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPrescriptionModal({ isOpen: true, patient: patient })}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                    title="Prescribe"
                                                >
                                                    <Activity size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setChatUser({ id: patient._id, name: patient.name })}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                    title="Chat"
                                                >
                                                    <MessageSquare size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setPatientRecordModal({ isOpen: true, patientId: patient._id })}
                                                    className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-200"
                                                    title="View Records"
                                                >
                                                    <AlertCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            {
                chatUser && (
                    <ChatWindow
                        receiverId={chatUser.id}
                        receiverName={chatUser.name}
                        onClose={() => setChatUser(null)}
                    />
                )
            }

            {/* Modals */}
            <AvailabilityModal
                isOpen={availabilityModal}
                onClose={() => setAvailabilityModal(false)}
                doctorName={doctorName}
                currentAvailability={{}}
            />

            <PatientRecordModal
                isOpen={patientRecordModal.isOpen}
                onClose={() => setPatientRecordModal({ isOpen: false, patientId: null })}
                patientId={patientRecordModal.patientId}
            />

            <PrescriptionModal
                isOpen={prescriptionModal.isOpen}
                onClose={() => setPrescriptionModal({ isOpen: false, appointment: null, patient: null })}
                appointment={prescriptionModal.appointment}
                patient={prescriptionModal.patient}
                doctorName={doctorName}
            />

            <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, appointment: null })} title="Confirm Appointment">
                <form onSubmit={handleConfirmRequest} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p><strong>Patient:</strong> {confirmModal.appointment?.patient?.name}</p>
                        <p><strong>Time:</strong> {confirmModal.appointment && formatTimeSafe(confirmModal.appointment.schedule)}</p>
                        <p><strong>Reason:</strong> {confirmModal.appointment?.reason}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Consultation Fee (₹)</label>
                        <input
                            type="number"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            min="0"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setConfirmModal({ isOpen: false, appointment: null })} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">Confirm & Notify Patient</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default DoctorDashboard;
