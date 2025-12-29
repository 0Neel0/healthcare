import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, Activity, Users, Bell, LogOut } from 'lucide-react';
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

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = `Dr. ${user.name}`;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Modal & Action States
    const [availabilityModal, setAvailabilityModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, appointment: null });
    const [consultationFee, setConsultationFee] = useState(500);
    const [patientRecordModal, setPatientRecordModal] = useState({ isOpen: false, patientId: null });
    const [prescriptionModal, setPrescriptionModal] = useState({ isOpen: false, appointment: null });

    const socket = useSocket();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('doctor_confirmation_request', () => {
            toast('New appointment request received!', { icon: '🔔' });
            fetchData();
        });
        socket.on('appointment_paid', () => fetchData());
        return () => {
            socket.off('doctor_confirmation_request');
            socket.off('appointment_paid');
        };
    }, [socket]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getDoctorAppointments(doctorName);
            setAppointments(data);

            // Calculate pseudo-stats if API doesn't provide them all
            const today = new Date().toDateString();
            const todayAppts = data.filter(a => new Date(a.schedule).toDateString() === today && a.status !== 'cancelled');

            setStats({
                todayCount: todayAppts.length,
                pendingRequests: data.filter(a => a.status === 'pending_doctor').length,
                completedToday: todayAppts.filter(a => a.status === 'completed').length,
                pendingPayments: data.filter(a => a.status === 'pending_payment').length,
                totalEarnings: data.filter(a => a.paymentStatus === 'paid').reduce((acc, curr) => acc + (curr.consultationFee || 0), 0) * 0.5
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
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
            fetchData();
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const pendingRequests = appointments.filter(a => a.status === 'pending_doctor');
    const todayAppointments = appointments.filter(a => {
        const d = new Date(a.schedule);
        return d.toDateString() === new Date().toDateString() && a.status !== 'cancelled' && a.status !== 'pending_doctor';
    }).sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    const columns = [
        {
            key: 'time',
            label: 'Time',
            render: (_, row) => <span className="font-mono font-medium text-slate-700">{new Date(row.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        },
        {
            key: 'patient',
            label: 'Patient',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-slate-900">{row.patient?.name}</div>
                    <div className="text-xs text-slate-500">{row.reason}</div>
                </div>
            )
        },
        { key: 'status', label: 'Status', render: (s) => <StatusBadge status={s} /> },
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
                        <button onClick={() => handleStatusUpdate(row._id, 'ongoing')} className="btn-xs btn-outline-primary">Start</button>
                    )}
                    {row.status === 'ongoing' && (
                        <>
                            <button onClick={() => setPrescriptionModal({ isOpen: true, appointment: row })} className="btn-xs btn-outline-secondary">Rx</button>
                            <button onClick={() => handleStatusUpdate(row._id, 'completed')} className="btn-xs btn-primary">Complete</button>
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
                    <Button onClick={fetchData}>Refresh Data</Button>
                    <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Bell size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.pendingRequests || 0}</div>
                        <div className="text-sm text-slate-500">Pending Requests</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{stats?.todayCount || 0}</div>
                        <div className="text-sm text-slate-500">Appointments Today</div>
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
            {pendingRequests.length > 0 && (
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
                                    <p className="flex items-center gap-2"><Calendar size={14} /> {new Date(req.schedule).toLocaleDateString()}</p>
                                    <p className="flex items-center gap-2"><Clock size={14} /> {new Date(req.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
            )}

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
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users size={20} className="text-blue-600" /> My Patients
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                            {/* Unique Patients Logic */}
                            {(() => {
                                const uniquePatients = [];
                                const seenIds = new Set();
                                appointments.forEach(app => {
                                    if (app.patient && !seenIds.has(app.patient._id)) {
                                        seenIds.add(app.patient._id);
                                        uniquePatients.push({ ...app.patient, lastVisit: app.schedule });
                                    }
                                });

                                if (uniquePatients.length === 0) return <div className="p-6 text-center text-slate-500 text-sm">No patients found.</div>;

                                return uniquePatients.slice(0, 10).map(patient => (
                                    <div key={patient._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{patient.name}</p>
                                            <p className="text-xs text-slate-500">Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setPatientRecordModal({ isOpen: true, patientId: patient._id })}
                                            className="btn-xs btn-ghost text-slate-400 hover:text-blue-600"
                                        >
                                            View
                                        </button>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

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
                onClose={() => setPrescriptionModal({ isOpen: false, appointment: null })}
                appointment={prescriptionModal.appointment}
                doctorName={doctorName}
            />

            <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, appointment: null })} title="Confirm Appointment">
                <form onSubmit={handleConfirmRequest} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p><strong>Patient:</strong> {confirmModal.appointment?.patient?.name}</p>
                        <p><strong>Time:</strong> {confirmModal.appointment && new Date(confirmModal.appointment.schedule).toLocaleString()}</p>
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
        </div>
    );
};

export default DoctorDashboard;
