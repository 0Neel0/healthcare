import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import doctorService from '../../services/doctorService';
import PatientRecordModal from '../../components/doctor/PatientRecordModal';
import {
    ArrowLeft, RefreshCw, ChevronLeft, ChevronRight,
    Clock, Briefcase, Filter, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
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

const CustomToolbar = ({ date, onNavigate, onView, view }) => {
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
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
};

const AdminScheduler = () => {
    const navigate = useNavigate();

    // --- State ---
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null); // Whole doctor object

    // Events State (No localStorage for Admin to avoid staleness across different doctors)
    const [events, setEvents] = useState([]);
    const [doctorAvailability, setDoctorAvailability] = useState(null);

    const [loading, setLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    // Persistence for View/Date specific to Admin
    const [view, setView] = useState(() => localStorage.getItem('adminCalendarView') || 'week');
    const [date, setDate] = useState(() => {
        const savedDate = localStorage.getItem('adminCalendarDate');
        return savedDate ? new Date(savedDate) : new Date();
    });

    // --- Effects ---

    // 1. Fetch Doctors List on Mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await doctorService.getDoctors();
                setDoctors(data || []);
                if (data && data.length > 0) {
                    // Default to first doctor or restore selection if we implemented that
                    setSelectedDoctor(data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch doctors", err);
                toast.error("Could not load doctor list");
            }
        };
        fetchDoctors();
    }, []);

    // 2. Fetch Data when Selected Doctor Changes
    useEffect(() => {
        if (selectedDoctor) {
            fetchAppointments(selectedDoctor);
            // Set availability directly from the selected doctor object (it usually comes with it)
            // But lets re-ensure we have latest
            if (selectedDoctor.availability) {
                setDoctorAvailability(selectedDoctor.availability);
            }
        }
    }, [selectedDoctor]);

    const fetchAppointments = useCallback(async (doctor) => {
        if (!doctor || !doctor.name) return;
        const doctorNameQuery = `Dr. ${doctor.name}`; // Backend expects this format usually

        try {
            setLoading(true);
            const data = await appointmentService.getDoctorAppointments(doctorNameQuery);

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

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to load appointments', error);
            toast.error(`Could not fetch schedule for ${doctor.name}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Event Handlers ---

    const handleViewChange = useCallback((newView) => {
        setView(newView);
        localStorage.setItem('adminCalendarView', newView);
    }, []);

    const handleNavigate = useCallback((newDate) => {
        setDate(newDate);
        localStorage.setItem('adminCalendarDate', newDate.toISOString());
    }, []);

    const handleDoctorChange = (e) => {
        const docId = e.target.value;
        const doc = doctors.find(d => d._id === docId);
        if (doc) setSelectedDoctor(doc);
    };

    // --- Render Helpers (Copied from DoctorScheduler for consistency) ---

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

    const eventPropGetter = useCallback((event) => {
        return {
            style: { backgroundColor: 'transparent', border: 'none', padding: '0 2px', outline: 'none' }
        };
    }, []);

    const slotPropGetter = useCallback((date) => {
        if (isDateOff(date)) {
            return { style: { backgroundColor: '#fee2e2', opacity: 0.6 } };
        }
        const hours = date.getHours();
        const isWorkingHours = hours >= 9 && hours < 17;
        if (!isWorkingHours) {
            return { style: { backgroundColor: '#f8fafc' } };
        }
        return { style: { backgroundColor: '#ffffff' } };
    }, [isDateOff]);

    const dayPropGetter = useCallback((date) => {
        if (isDateOff(date)) {
            return { style: { backgroundColor: '#fee2e2' }, className: 'leave-day-highlight' };
        }
        return {};
    }, [isDateOff]);

    const finalEvents = useMemo(() => {
        let allEvents = [...events];
        if (doctorAvailability?.outOfOfficeDates) {
            const leaveEvents = doctorAvailability.outOfOfficeDates.map((leave, i) => {
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

    // Custom Event Component (Same as DoctorScheduler)
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
                {patient.profilePicture ? (
                    <img src={patient.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm flex-shrink-0">
                        {patientName.charAt(0)}
                    </div>
                )}
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

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <style>{`
                .rbc-time-slot { min-height: 50px !important; }
                .rbc-event { min-height: 50px !important; }
                .leave-day-highlight .rbc-button-link { color: #991b1b !important; font-weight: bold; }
            `}</style>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" className="rounded-full p-2 hover:bg-slate-100" onClick={() => navigate('/admin')}>
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Master Schedule</h1>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                            Admin View • {doctors.length} Doctors
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Doctor Selector */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Filter size={16} />
                        </div>
                        <select
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-64 pl-10 p-2.5 shadow-sm appearance-none cursor-pointer hover:border-blue-300 transition-colors font-medium"
                            onChange={handleDoctorChange}
                            value={selectedDoctor?._id || ''}
                        >
                            <option value="" disabled>Select a Doctor</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    Dr. {doc.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <Button
                        onClick={() => fetchAppointments(selectedDoctor)}
                        className={`h-10 px-4 gap-2 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-80' : ''}`}
                        disabled={!selectedDoctor || loading}
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            {/* Main Calendar */}
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full animate-fade-in-up">
                <div className="h-[calc(100vh-140px)] bg-white/40 backdrop-blur p-1 rounded-3xl border border-white/60 shadow-xl overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
                            <div className="loading loading-spinner text-indigo-600 loading-lg"></div>
                            <span className="mt-4 font-bold text-indigo-600 tracking-wide text-sm animate-pulse">Fetching Schedule...</span>
                        </div>
                    )}

                    <DnDCalendar
                        localizer={localizer}
                        events={finalEvents}
                        startAccessor="start"
                        endAccessor="end"
                        resizable={true} // Read-only mostly, but draggable logic inherited
                        selectable={true}

                        // Controlled props
                        view={view}
                        onView={handleViewChange}
                        date={date}
                        onNavigate={handleNavigate}

                        // Styling
                        eventPropGetter={eventPropGetter}
                        slotPropGetter={slotPropGetter}
                        dayPropGetter={dayPropGetter}

                        // Custom Components
                        components={{
                            toolbar: CustomToolbar,
                            event: CustomEvent,
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

                        views={['month', 'week', 'day', 'agenda']}
                        step={30}
                        timeslots={2}
                        popup
                        scrollToTime={new Date()}
                    />
                </div>
            </main>

            {/* Click event to view patient record? Maybe useful for admin too */}
            <PatientRecordModal
                isOpen={!!selectedPatientId}
                onClose={() => setSelectedPatientId(null)}
                patientId={selectedPatientId}
            />
        </div>
    );
};

export default AdminScheduler;
