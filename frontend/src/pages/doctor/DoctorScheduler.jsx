import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import addMinutes from 'date-fns/addMinutes';
import isSameDay from 'date-fns/isSameDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import PatientRecordModal from '../../components/doctor/PatientRecordModal';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import {
    ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Calendar as CalIcon,
    Clock, User, Settings, Info, Briefcase
} from 'lucide-react';
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

// --- Custom Components ---

const CurrentTimeIndicator = ({ top }) => {
    return (
        <div
            className="absolute z-50 w-full pointer-events-none flex items-center"
            style={{ top: `${top}%` }}
        >
            <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-sm ring-2 ring-white"></div>
            <div className="h-[2px] bg-red-500 w-full opacity-80 shadow-sm"></div>
        </div>
    );
};

const CustomToolbar = ({ date, onNavigate, onView, view, label }) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-5 animate-fade-in-down">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
                <button
                    onClick={() => onNavigate('PREV')}
                    className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-slate-500"
                >
                    <ChevronLeft size={22} />
                </button>
                <div
                    onClick={() => onNavigate('TODAY')}
                    className="cursor-pointer px-4 flex flex-col items-center"
                >
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Current</span>
                    <span className="text-sm font-bold text-slate-800">Today</span>
                </div>
                <button
                    onClick={() => onNavigate('NEXT')}
                    className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-slate-500"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Center: Label */}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {format(date, 'MMMM yyyy')}
            </h2>

            {/* Right: View Switcher */}
            <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-xl shadow-inner">
                {['month', 'week', 'day', 'agenda'].map((v) => (
                    <button
                        key={v}
                        onClick={() => onView(v)}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all capitalize ${view === v
                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        {v === 'agenda' ? 'Timetable' : v}
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
    // Strict name check to prevent querying for generic "Doctor"
    const doctorName = user.name ? `Dr. ${user.name}` : null;

    // --- State ---

    // Persistent Events State
    const [events, setEvents] = useState(() => {
        try {
            const saved = localStorage.getItem('doctorAppointments');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map(ev => ({
                    ...ev,
                    start: new Date(ev.start),
                    end: new Date(ev.end),
                    resource: {
                        ...ev.resource,
                        schedule: new Date(ev.resource.schedule)
                    }
                }));
            }
            return [];
        } catch (e) {
            return [];
        }
    });

    // Persistent Availability State
    const [doctorAvailability, setDoctorAvailability] = useState(() => {
        try {
            const saved = localStorage.getItem('doctorAvailability');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // --- Fetching Logic ---

    const fetchAppointments = useCallback(async (isManual = false) => {
        if (!doctorName) return;

        try {
            setLoading(true);
            console.log(`Fetching appointments for: "${doctorName}"`);
            const data = await appointmentService.getDoctorAppointments(doctorName);
            console.log(`Fetched ${data?.length} appointments from server.`);

            const calendarEvents = data
                .filter(app => app.status !== 'cancelled')
                .map(app => ({
                    id: app._id,
                    title: app.patient?.name || 'Unknown Patient',
                    start: new Date(app.schedule),
                    end: new Date(new Date(app.schedule).getTime() + 30 * 60000), // Default 30 mins
                    resource: app,
                    allDay: false
                }));

            // Safety Latch: Prevent auto-wipe
            // If automatic sync returns 0 items but we have local data, assume sync failure/mismatch and abort.
            if (!isManual && calendarEvents.length === 0 && events.length > 0) {
                console.warn("Auto-sync returned 0 items. Aborting overwrite to preserve cache.");
                toast.error("Sync incomplete. Keeping local data.");
                return;
            }

            setEvents(calendarEvents);
            localStorage.setItem('doctorAppointments', JSON.stringify(calendarEvents));
            if (isManual) toast.success("Calendar synced successfully");

        } catch (error) {
            console.error('Failed to load appointments', error);
            if (!events.length) toast.error('Could not sync appointments');
        } finally {
            setLoading(false);
        }
    }, [doctorName, events.length]); // Added events.length dependency for safety check

    const fetchDoctorDetails = useCallback(async () => {
        try {
            let foundDoctor = null;

            // 1. Try by ID
            if (user.id || user._id) {
                try {
                    const doc = await doctorService.getDoctor(user.id || user._id);
                    if (doc) foundDoctor = doc;
                } catch (err) {
                    console.warn("Fetch by ID failed", err);
                }
            }

            // 2. Fallback to name matching
            if (!foundDoctor) {
                const doctors = await doctorService.getDoctors();
                const normalizedUserName = user.name?.toLowerCase() || '';
                const normalizedUserEmail = user.email?.toLowerCase() || '';

                foundDoctor = doctors.find(d => {
                    const docName = d.name?.toLowerCase() || '';
                    const docEmail = d.email?.toLowerCase() || '';
                    return docName === normalizedUserName ||
                        docName === `dr. ${normalizedUserName}` ||
                        docEmail === normalizedUserEmail;
                });
            }

            if (foundDoctor && foundDoctor.availability) {
                // Merge availability to prevent loss of specialized local settings if server is partial
                // For now, strict server sync is safer for availability.
                setDoctorAvailability(foundDoctor.availability);
                localStorage.setItem('doctorAvailability', JSON.stringify(foundDoctor.availability));
            }
        } catch (error) {
            console.error("Failed to fetch doctor details", error);
        }
    }, [user.name, user.email, user.id, user._id]);

    useEffect(() => {
        fetchAppointments(false); // Auto-sync
        fetchDoctorDetails();
    }, [fetchAppointments, fetchDoctorDetails]);

    // --- Socket Code ---
    useEffect(() => {
        if (!socket) return;
        const handleNewReq = (data) => {
            if (data.primaryPhysician === doctorName) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">📅</div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">New Appointment Request</p>
                                    <p className="mt-1 text-sm text-gray-500">A new patient is waiting for confirmation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ));
                fetchAppointments();
            }
        };
        const handleUpdate = () => fetchAppointments();

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

    // --- Event Handlers ---

    const updateAppointmentSchedule = useCallback(async (event, start, end) => {
        try {
            const updatedEvents = events.map(existing =>
                existing.id === event.id ? { ...existing, start, end } : existing
            );
            setEvents(updatedEvents);
            await appointmentService.rescheduleAppointment(event.id, start.toISOString());
            toast.success('Schedule updated!');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update schedule');
            fetchAppointments();
        }
    }, [events, fetchAppointments]);

    const handleEventDrop = useCallback(async ({ event, start, end }) => {
        await updateAppointmentSchedule(event, start, end);
    }, [updateAppointmentSchedule]);

    const handleEventResize = useCallback(async ({ event, start, end }) => {
        await updateAppointmentSchedule(event, start, end);
    }, [updateAppointmentSchedule]);

    const handleSaveAvailability = async (newAvailability) => {
        try {
            setIsSavingAvailability(true);
            setDoctorAvailability(newAvailability);
            localStorage.setItem('doctorAvailability', JSON.stringify(newAvailability));
            await doctorService.updateAvailability(user.name, newAvailability);
            setIsAvailabilityModalOpen(false);
            toast.success('Availability settings saved');
            fetchDoctorDetails();
        } catch (error) {
            console.error('Failed to update availability', error);
            toast.error('Failed to save availability');
        } finally {
            setIsSavingAvailability(false);
        }
    };

    // --- Render Logic ---

    const finalEvents = useMemo(() => {
        let allEvents = [...events];
        if (doctorAvailability?.outOfOfficeDates) {
            const leaveEvents = doctorAvailability.outOfOfficeDates.map((leave, i) => {
                // Adjust to start/end of day
                const start = new Date(leave.startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(leave.endDate);
                end.setHours(23, 59, 59, 999);

                return {
                    id: `leave-${i}`,
                    title: `🚫 Out of Office: ${leave.reason || 'Leave'}`,
                    start,
                    end,
                    allDay: true,
                    resource: { type: 'leave', reason: leave.reason },
                    isLeave: true
                };
            });
            allEvents = [...allEvents, ...leaveEvents];
        }
        return allEvents;
    }, [events, doctorAvailability]);

    // Custom Event Component (Week/Day View)
    const CustomEvent = ({ event }) => {
        if (event.isLeave) {
            return (
                <div className="h-full w-full relative overflow-hidden rounded-lg bg-slate-100/80 border border-slate-300/50 flex items-center justify-center shadow-inner p-1">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
                    <div className="relative z-10 flex items-center gap-1 text-slate-500">
                        <Briefcase size={12} />
                        <span className="font-bold text-[10px] uppercase tracking-wider truncate">
                            {event.resource.reason || 'Closed'}
                        </span>
                    </div>
                </div>
            );
        }

        const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const patient = event.resource.patient || {};
        const patientName = patient.name || 'Unknown';
        const isPaid = event.resource.paymentStatus === 'paid';
        const status = event.resource.status || 'scheduled';

        const statusColors = {
            scheduled: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-900' },
            ongoing: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-900' },
            completed: { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-900' },
            cancelled: { bg: 'bg-rose-50', border: 'border-l-rose-500', text: 'text-rose-900' }
        };

        const style = statusColors[status] || statusColors.scheduled;

        return (
            <div
                className={`h-full w-full flex flex-row items-center px-2 py-1 gap-2 rounded-r-md border-l-[3px] shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:z-50 ${style.bg} ${style.border} group overflow-hidden`}
                title={`${patientName} - ${event.resource.reason}`}
            >
                {/* Avatar */}
                {patient.profilePicture ? (
                    <img src={patient.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm flex-shrink-0">
                        {patientName.charAt(0)}
                    </div>
                )}

                {/* Details */}
                <div className="flex flex-col min-w-0 justify-center h-full">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${style.text}`}>{patientName}</span>
                        {isPaid && <span className="px-1.5 py-0.5 rounded bg-white/60 text-[9px] font-bold text-emerald-700 shadow-sm">PAID</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] opacity-80 font-medium leading-none mt-0.5">
                        <Clock size={10} />
                        <span>{startTime}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Styling Hook
    const eventPropGetter = useCallback((event) => {
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0 2px',
                outline: 'none'
            }
        };
    }, []);

    // Slot Styling (Working Hours)
    // Helper to check if a date is off
    const isDateOff = useCallback((date) => {
        if (!doctorAvailability?.outOfOfficeDates) return false;
        return doctorAvailability.outOfOfficeDates.some(range => {
            const start = new Date(range.startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(range.endDate);
            end.setUTCHours(23, 59, 59, 999);
            return date >= start && date <= end;
        });
    }, [doctorAvailability]);

    // Slot Styling (Working Hours & Leave)
    const slotPropGetter = useCallback((date) => {
        if (isDateOff(date)) {
            return {
                style: {
                    backgroundColor: '#fee2e2', // red-100 (Light Red for Leave)
                    opacity: 0.6
                }
            };
        }

        // Example: working hours 09:00 - 17:00
        const hours = date.getHours();
        const isWorkingHours = hours >= 9 && hours < 17;

        if (!isWorkingHours) {
            return {
                style: {
                    backgroundColor: '#f8fafc', // slate-50
                }
            };
        }
        return {
            style: {
                backgroundColor: '#ffffff'
            }
        };
    }, [isDateOff]);

    // Day Styling (Month View)
    const dayPropGetter = useCallback((date) => {
        if (isDateOff(date)) {
            return {
                style: {
                    backgroundColor: '#fee2e2', // red-100
                },
                className: 'leave-day-highlight'
            };
        }
        return {};
    }, [isDateOff]);

    // State for View and Date with persistence
    const [view, setView] = useState(() => localStorage.getItem('calendarView') || 'week');
    const [date, setDate] = useState(() => {
        const savedDate = localStorage.getItem('calendarDate');
        return savedDate ? new Date(savedDate) : new Date();
    });

    const handleViewChange = useCallback((newView) => {
        setView(newView);
        localStorage.setItem('calendarView', newView);
    }, []);

    const handleNavigate = useCallback((newDate) => {
        setDate(newDate);
        localStorage.setItem('calendarDate', newDate.toISOString());
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <style>{`
                .rbc-time-slot { min-height: 50px !important; }
                .rbc-event { min-height: 50px !important; }
                .leave-day-highlight .rbc-button-link { color: #991b1b !important; font-weight: bold; }
            `}</style>
            {/* Glassmorphic Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-all">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" className="rounded-full p-2 hover:bg-slate-100" onClick={() => navigate('/doctor/dashboard')}>
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Schedule</h1>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                            {loading ? 'Syncing...' : (events.length ? `${events.length} Appointments` : 'Up to date')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 hidden sm:flex">
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-2"
                            onClick={() => setIsAvailabilityModalOpen(true)}>
                            <Clock size={14} /> Availability
                        </button>
                    </div>
                    <Button
                        onClick={() => {
                            // Manual Sync: We allow overwriting even if empty (user intent)
                            localStorage.removeItem('doctorAvailability');
                            localStorage.removeItem('doctorAppointments');
                            fetchAppointments(true); // isManual = true
                            fetchDoctorDetails();
                        }}
                        className={`h-10 px-4 gap-2 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-80' : ''}`}
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                        <span className="font-semibold text-sm hidden sm:inline">Sync Data</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full animate-fade-in-up">
                <div className="h-[calc(100vh-140px)] bg-white/40 backdrop-blur p-1 rounded-3xl border border-white/60 shadow-xl overflow-hidden relative">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
                            <div className="loading loading-spinner text-indigo-600 loading-lg"></div>
                            <span className="mt-4 font-bold text-indigo-600 tracking-wide text-sm animate-pulse">Syncing Calendar...</span>
                        </div>
                    )}

                    <DnDCalendar
                        localizer={localizer}
                        events={finalEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}

                        // Interaction
                        onSelectEvent={(event) => {
                            if (event.resource?.patient?._id) setSelectedPatientId(event.resource.patient._id);
                        }}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        resizable
                        selectable

                        // Controlled props
                        view={view}
                        onView={handleViewChange}
                        date={date}
                        onNavigate={handleNavigate}

                        // Handlers
                        onSelectSlot={({ start, end }) => {
                            // Slot selection logic if needed
                        }}

                        // Styling
                        eventPropGetter={eventPropGetter}
                        slotPropGetter={slotPropGetter}
                        dayPropGetter={dayPropGetter}

                        // Custom Components
                        components={{
                            toolbar: CustomToolbar,
                            event: CustomEvent,
                            timeSlotWrapper: ({ children, value }) => {
                                // Add logic here if we wanted granular control, but slotPropGetter is cleaner for now
                                return children;
                            },
                            agenda: {
                                event: ({ event }) => (
                                    <div className='flex items-center gap-3 py-2'>
                                        {event.isLeave ? (
                                            <span className="text-slate-500 italic">⛔ Out of Office: {event.resource.reason}</span>
                                        ) : (
                                            <>
                                                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                                <div>
                                                    <span className="font-bold text-slate-700">{event.resource.patient?.name}</span>
                                                    <span className="text-xs text-slate-400 block">{event.resource.reason}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            }
                        }}

                        // Config
                        views={['month', 'week', 'day', 'agenda']}
                        step={30}
                        timeslots={2}
                        popup

                        // Current Time Indicator Logic (approximate)
                        scrollToTime={new Date()}
                    />
                </div>
            </main>

            {/* Modals */}
            <PatientRecordModal
                isOpen={!!selectedPatientId}
                onClose={() => setSelectedPatientId(null)}
                patientId={selectedPatientId}
            />

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                initialAvailability={doctorAvailability}
                onSave={handleSaveAvailability}
                isLoading={isSavingAvailability}
            />
        </div>
    );
};

export default DoctorScheduler;
