import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RefreshCw } from 'lucide-react';
import PasskeyModal from '../../components/admin/PasskeyModal';
import { appointmentService } from '../../services/appointmentService';
import AppointmentTable from '../../components/appointment/AppointmentTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/forms/FormField';
import { useSocket } from '../../context/SocketContext';

const Appointments = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const onCreateSubmit = async (data) => {
        try {
            setActionLoading(true);
            await appointmentService.createAppointment({
                ...data,
                userId: data.patientId // Backend expects userId too, usually same as patientId for patient-centric actions
            });
            setShowCreateModal(false);
            reset();
            fetchAppointments();
        } catch (error) {
            console.error(error);
            alert('Failed to create appointment. Verify Patient ID.');
        } finally {
            setActionLoading(false);
        }
    };

    // Socket Listener
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;
        socket.on('doctor_confirmed', (appt) => {
            // Ideally fetch or update local state
            fetchAppointments();
        });
        return () => socket.off('doctor_confirmed');
    }, [socket]);

    useEffect(() => {
        fetchAppointments();
    }, [currentPage]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const passkey = localStorage.getItem('adminPasskey');
            if (!passkey) {
                // PasskeyModal will show up
                setLoading(false);
                return;
            }
            const data = await appointmentService.getAppointments(currentPage, 10);
            setAppointments(data.appointments);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Error fetching appointments:', error);
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
            await appointmentService.scheduleAppointment(selectedAppointment._id, {
                schedule: data.schedule,
                note: data.note
            });
            setShowScheduleModal(false);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            // alert('Failed to schedule appointment'); 
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestConfirmation = async (appointment) => {
        try {
            if (window.confirm(`Request confirmation from Dr. ${appointment.primaryPhysician}?`)) {
                await appointmentService.adminRequestConfirmation(appointment._id);
                fetchAppointments(); // Refresh
                // Use a toast here if available, e.g., toast.success('Request sent to doctor');
            }
        } catch (error) {
            console.error('Error requesting confirmation:', error);
            alert('Failed to send request');
        }
    };

    const onCancelSubmit = async (data) => {
        try {
            setActionLoading(true);
            await appointmentService.cancelAppointment(selectedAppointment._id, data.cancellationReason);
            setShowCancelModal(false);
            fetchAppointments();
        } catch (error) {
            console.error(error);
            // alert('Failed to cancel appointment');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PasskeyModal />
            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
                    <p className="text-slate-500">View and manage all appointments</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchAppointments} variant="outline" className="flex items-center gap-2">
                        <RefreshCw size={18} /> Refresh
                    </Button>
                    <button onClick={() => { reset(); setShowCreateModal(true); }} className="btn-gradient px-4 py-2 rounded-lg">New Appointment</button>
                </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading appointments...</div>
                ) : (
                    <>
                        <AppointmentTable
                            appointments={appointments}
                            onSchedule={handleSchedule}
                            onCancel={handleCancel}
                            onView={handleView}
                            onRequestConfirmation={handleRequestConfirmation}
                        />
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="px-4 py-2 text-slate-600 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Appointment Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Appointment">
                <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField label="Patient ID" name="patientId" type="text" placeholder="User Object ID" register={register} error={errors.patientId} required />
                    {/* For a real app, we would use a patient search/select here */}

                    <FormField label="Primary Physician" name="primaryPhysician" type="text" placeholder="Dr. Name" register={register} error={errors.primaryPhysician} required />

                    <FormField label="Schedule Date & Time" name="schedule" type="datetime-local" register={register} error={errors.schedule} required />

                    <FormField label="Reason" name="reason" type="text" placeholder="Reason for visit" register={register} error={errors.reason} required />

                    <FormField label="Notes" name="note" type="textarea" register={register} error={errors.note} />

                    <div className="flex gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="primary" disabled={actionLoading} className="flex-1">Create Appointment</Button>
                    </div>
                </form>
            </Modal>

            {/* Schedule Modal (Reused) */}
            <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Appointment">
                <form onSubmit={handleSubmit(onScheduleSubmit)} className="space-y-4">
                    <FormField label="Schedule Date & Time" name="schedule" type="datetime-local" register={register} error={errors.schedule} required />
                    <FormField label="Additional Notes" name="note" type="textarea" register={register} error={errors.note} />
                    <div className="flex gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="success" disabled={actionLoading} className="flex-1">Confirm</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Appointment">
                <form onSubmit={handleSubmit(onCancelSubmit)} className="space-y-4">
                    <FormField label="Reason" name="cancellationReason" type="textarea" register={register} error={errors.cancellationReason} required />
                    <div className="flex gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">Close</Button>
                        <Button type="submit" variant="danger" disabled={actionLoading} className="flex-1">Confirm Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Appointment Details">
                {selectedAppointment && (
                    <div className="space-y-4">
                        <p><strong>Patient:</strong> {selectedAppointment.patient?.name}</p>
                        <p><strong>Doctor:</strong> {selectedAppointment.primaryPhysician}</p>
                        <p><strong>Status:</strong> {selectedAppointment.status}</p>
                        <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
                        <Button onClick={() => setShowViewModal(false)} className="w-full mt-4">Close</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Appointments;
