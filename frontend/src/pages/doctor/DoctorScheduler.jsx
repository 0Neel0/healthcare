import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import appointmentService from '../../services/appointmentService';
import PatientRecordModal from '../../components/doctor/PatientRecordModal';
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

// Custom Toolbar Component
const CustomToolbar = ({ date, onNavigate, onView, view, label }) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => onNavigate('TODAY')}
                        className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{label}</h2>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1">
                {['month', 'week', 'day', 'agenda'].map((v) => (
                    <button
                        key={v}
                        onClick={() => onView(v)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize ${view === v
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DoctorScheduler = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = user.name ? `Dr. ${user.name}` : 'Doctor';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getDoctorAppointments(doctorName);

            const calendarEvents = data.map(app => ({
                id: app._id,
                title: app.patient?.name || 'Unknown Patient',
                start: new Date(app.schedule),
                end: new Date(new Date(app.schedule).getTime() + 30 * 60000), // Default 30 mins if no end time
                resource: app,
                allDay: false
            }));

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to load appointments', error);
            toast.error('Could not sync appointments');
        } finally {
            setLoading(false);
        }
    }, [doctorName]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Real-time Updates
    useEffect(() => {
        if (!socket) return;

        const handleNewReq = (data) => {
            if (data.primaryPhysician === doctorName) {
                toast("New Appointment Received!", { icon: "📅" });
                fetchAppointments();
            }
        };

        const handleUpdate = () => {
            fetchAppointments();
        };

        socket.on('doctor_confirmation_request', handleNewReq);
        socket.on('new_appointment_request', handleNewReq);
        socket.on('doctor_confirmed', handleUpdate);
        socket.on('payment_request', handleUpdate);
        socket.on('appointment_paid', handleUpdate);

        return () => {
            socket.off('doctor_confirmation_request', handleNewReq);
            socket.off('new_appointment_request', handleNewReq);
            socket.off('doctor_confirmed', handleUpdate);
            socket.off('payment_request', handleUpdate);
            socket.off('appointment_paid', handleUpdate);
        };
    }, [socket, doctorName, fetchAppointments]);


    const handleSelectEvent = useCallback((event) => {
        if (event.resource?.patient?._id) {
            setSelectedPatientId(event.resource.patient._id);
        }
    }, []);

    const updateAppointmentSchedule = useCallback(async (event, start, end) => {
        try {
            // Optimistic update
            const updatedEvents = events.map(existing =>
                existing.id === event.id ? { ...existing, start, end } : existing
            );
            setEvents(updatedEvents);

            // API Call
            await appointmentService.rescheduleAppointment(event.id, start.toISOString());
            toast.success('Schedule updated!');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update schedule');
            fetchAppointments(); // Revert
        }
    }, [events, fetchAppointments]);

    const handleEventDrop = useCallback(async ({ event, start, end }) => {
        await updateAppointmentSchedule(event, start, end);
    }, [updateAppointmentSchedule]);

    const handleEventResize = useCallback(async ({ event, start, end }) => {
        await updateAppointmentSchedule(event, start, end);
    }, [updateAppointmentSchedule]);


    // Custom Event Component
    const CustomEvent = ({ event }) => {
        const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const patient = event.resource.patient || {};
        const patientName = patient.name || 'Unknown';
        const isPaid = event.resource.paymentStatus === 'paid';
        const status = event.resource.status;

        // Calculate duration in minutes
        const duration = (new Date(event.end) - new Date(event.start)) / 60000;
        const isCompact = duration <= 30;

        let age = '';
        if (patient.birthDate) {
            const birth = new Date(patient.birthDate);
            const now = new Date();
            let years = now.getFullYear() - birth.getFullYear();
            if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
                years--;
            }
            age = `${years}y`;
        }

        const genderInitial = patient.gender ? patient.gender.charAt(0) : '';

        // Status Styles (Backgrounds & Borders)
        const statusStyles = {
            scheduled: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', dot: 'bg-amber-500' },
            ongoing: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', dot: 'bg-blue-500' },
            completed: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-900', dot: 'bg-emerald-500' },
            cancelled: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-900', dot: 'bg-rose-500' }
        };

        const style = statusStyles[status] || statusStyles.scheduled;

        return (
            <div
                className={`h-full w-full flex flex-col p-1.5 gap-0.5 rounded-md border-l-4 shadow-sm transition-all hover:shadow-md ${style.bg} ${style.border} relative overflow-hidden group/event`}
                title={`${patientName} - ${event.resource.reason || 'No reason specified'}`}
            >
                {/* Header: Time & Paid Status */}
                <div className="flex justify-between items-center w-full z-10">
                    <span className={`text-[10px] font-mono font-bold opacity-80 leading-none whitespace-nowrap ${style.text}`}>{startTime}</span>
                    {isPaid && (
                        <div className="bg-white/80 backdrop-blur-sm text-emerald-700 rounded-full w-4 h-4 flex items-center justify-center shadow-sm ml-1 flex-shrink-0 border border-emerald-100" title="Paid">
                            <span className="text-[9px] font-extrabold leading-none">$</span>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex items-center gap-2 mt-1 w-full overflow-hidden z-10">
                    {!isCompact && (
                        patient.profilePicture ? (
                            <img src={patient.profilePicture} alt="p" className={`w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0`} />
                        ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white flex-shrink-0 ${style.dot}`}>
                                {patientName.charAt(0)}
                            </div>
                        )
                    )}

                    <div className="flex flex-col min-w-0 flex-grow">
                        <span className={`font-bold text-xs truncate leading-tight ${style.text}`}>
                            {patientName}
                        </span>
                        {(age || genderInitial) && !isCompact && (
                            <span className={`text-[9px] opacity-70 leading-none mt-0.5 font-medium truncate ${style.text}`}>
                                {age} {genderInitial} • {event.resource.reason}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const eventStyleGetter = (event) => {
        // Transparent background because custom event handles styling
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                display: 'block'
            }
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <ArrowLeft size={24} className="text-slate-500 group-hover:text-slate-800" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <CalIcon className="text-indigo-600" /> My Schedule
                        </h1>
                        <p className="text-sm text-slate-500">Manage your appointments and availability</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchAppointments} variant="outline" className={`gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} /> Sync
                    </Button>
                </div>
            </div>

            <div className="flex-grow p-8 max-w-[1600px] mx-auto w-full animate-fade-in relative">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 h-[calc(100vh-180px)] overflow-hidden relative">

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                <span className="text-sm font-semibold text-slate-600">Syncing Schedule...</span>
                            </div>
                        </div>
                    )}

                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            toolbar: CustomToolbar,
                            event: CustomEvent
                        }}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView='week'
                        popup
                        step={30}
                        timeslots={2}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        resizable
                        draggableAccessor={(event) => true}
                    />
                </div>
            </div>

            <PatientRecordModal
                isOpen={!!selectedPatientId}
                onClose={() => setSelectedPatientId(null)}
                patientId={selectedPatientId}
            />
        </div>
    );
};

export default DoctorScheduler;
