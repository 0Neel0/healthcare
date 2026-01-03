import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Search, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

import StickyHeader from '../components/layout/StickyHeader';
import Button from '../components/ui/Button';
import FormField from '../components/forms/FormField';
import patientService from '../services/patientService';
import appointmentService from '../services/appointmentService';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import doctorService from '../services/doctorService';

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patient, setPatient] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [doctorObjects, setDoctorObjects] = useState([]); // Store full doctor objects
    const [fetchingDoctors, setFetchingDoctors] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState(null);

    // Auto-detect logged-in user
    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        if (loggedInUser && role === 'patient') {
            const userData = JSON.parse(loggedInUser);
            setPatient(userData);
            setValue('patientId', userData._id);
        }

        fetchDoctors();
    }, [setValue]);

    const fetchDoctors = async () => {
        try {
            setFetchingDoctors(true);
            const data = await doctorService.getDoctors();
            setDoctorObjects(data || []);
            const formattedDoctors = (data || []).map(doctor => `Dr. ${doctor.name}`);
            setDoctors(formattedDoctors);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            toast.error('Failed to load doctors list');
            setDoctors([]);
        } finally {
            setFetchingDoctors(false);
        }
    };

    const searchPatient = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await patientService.getPatientByEmail(searchEmail);
            setPatient(data);
            setValue('patientId', data._id);
            toast.success('Patient profile found!');
        } catch {
            setError('Patient not found. Please register first.');
            toast.error('Patient not found');
            setPatient(null);
        } finally {
            setLoading(false);
        }
    };

    // Validation helper: Check if appointment is in the past
    const isValidAppointmentTime = (datetime) => {
        const appointmentDate = new Date(datetime);
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        if (appointmentDate < oneHourFromNow) {
            return { valid: false, message: 'Appointment must be at least 1 hour from now' };
        }

        // Check business hours (9 AM - 5 PM)
        const hours = appointmentDate.getHours();
        if (hours < 9 || hours >= 17) {
            return { valid: false, message: 'Please select a time between 9:00 AM and 5:00 PM' };
        }

        // Check if it's a weekend
        const day = appointmentDate.getDay();
        if (day === 0 || day === 6) {
            return { valid: false, message: 'Appointments are only available on weekdays' };
        }

        return { valid: true };
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            // Validate appointment time
            const validation = isValidAppointmentTime(data.schedule);
            if (!validation.valid) {
                setError(validation.message);
                toast.error(validation.message);
                setLoading(false);
                return;
            }

            // Find the selected doctor's ID
            const selectedDoctor = doctorObjects.find(doc => `Dr. ${doc.name}` === data.primaryPhysician);

            const appointmentData = {
                patientId: patient._id,
                userId: patient._id,
                primaryPhysician: data.primaryPhysician,
                doctorId: selectedDoctor?._id, // Send explicit ID
                schedule: new Date(data.schedule).toISOString(),
                reason: data.reason,
                note: data.note || '',
            };

            const appointment = await appointmentService.createAppointment(appointmentData);

            setBookedAppointment(appointment);
            setShowConfirmation(true);
            toast.success('Appointment booked successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        navigate('/patient/appointments');
    };

    // Get minimum datetime (1 hour from now)
    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now.toISOString().slice(0, 16);
    };

    if (showConfirmation && bookedAppointment) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
                <StickyHeader />
                <div className="container mx-auto px-4 py-12 max-w-2xl flex-grow flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl w-full animate-scale-in">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
                            <p className="text-gray-600">Your appointment has been successfully booked</p>

                            {/* NOTE: Payment flow removed as requested. Billing is now minimal/post-consultation. */}
                            <p className="text-sm text-gray-500 mt-2">
                                Please check your "Billing" section after the visit for any charges.
                            </p>
                        </div>

                        <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Doctor</p>
                                    <p className="font-bold text-gray-900">{bookedAppointment.primaryPhysician}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Date & Time</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(bookedAppointment.schedule).toLocaleString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Reason</p>
                                    <p className="font-semibold text-gray-900">{bookedAppointment.reason}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex gap-3">
                                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">📅 Save this appointment</p>
                                    <p>Please arrive 10 minutes early. Bring your ID and insurance card.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleConfirmationClose}
                                variant="medical"
                                className="flex-1"
                            >
                                View My Appointments
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setBookedAppointment(null);
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                Book Another
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <StickyHeader />

            <div className="container mx-auto px-4 py-12 max-w-3xl flex-grow">
                <div className="glass-effect rounded-3xl p-8 animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-gradient-medical rounded-2xl mb-4">
                            <CalendarIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
                        <p className="text-gray-600">Schedule your visit with our expert physicians</p>
                    </div>

                    {/* Patient Search (only if not logged in) */}
                    {!patient && (
                        <div className="mb-8 p-6 bg-medical-blue-50 rounded-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Profile</h2>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="input-modern flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
                                />
                                <Button onClick={searchPatient} disabled={loading || !searchEmail}>
                                    <Search className="w-5 h-5 mr-2" />
                                    Search
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Don't have an account? <a href="/register" className="text-medical-blue-600 hover:underline font-semibold">Register here</a>
                            </p>
                        </div>
                    )}

                    {/* Patient Info */}
                    {patient && (
                        <div className="mb-8 p-6 bg-health-green-50 rounded-2xl animate-fade-in border-2 border-health-green-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                        <User className="w-5 h-5 text-health-green-600" />
                                        Patient Information
                                    </h3>
                                    <p className="text-gray-700"><strong>Name:</strong> {patient.name}</p>
                                    <p className="text-gray-700"><strong>Email:</strong> {patient.email}</p>
                                    <p className="text-gray-700"><strong>Phone:</strong> {patient.phone}</p>
                                </div>
                                {!localStorage.getItem('user') && (
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setPatient(null);
                                        setSearchEmail('');
                                    }}>
                                        Change
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fade-in flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Booking Form */}
                    {patient && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
                            <FormField
                                label="Select Doctor"
                                name="primaryPhysician"
                                type="select"
                                options={fetchingDoctors ? ['Loading doctors...'] : doctors.length > 0 ? doctors : ['No doctors available']}
                                register={register}
                                error={errors.primaryPhysician}
                                required
                                disabled={fetchingDoctors || doctors.length === 0}
                            />

                            {doctors.length === 0 && !fetchingDoctors && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>No doctors are currently registered. Please contact the administrator.</div>
                                </div>
                            )}

                            <div>
                                {(() => {
                                    // Logic to find selected doctor and their leave dates
                                    const selectedDocName = watch('primaryPhysician');
                                    const selectedDoc = doctorObjects.find(d => `Dr. ${d.name}` === selectedDocName);
                                    let excludeDates = [];

                                    if (selectedDoc && selectedDoc.availability?.outOfOfficeDates) {
                                        selectedDoc.availability.outOfOfficeDates.forEach(range => {
                                            let current = new Date(range.startDate);
                                            const end = new Date(range.endDate);

                                            while (current <= end) {
                                                excludeDates.push(new Date(current));
                                                current.setDate(current.getDate() + 1);
                                            }
                                        });
                                    }

                                    return (
                                        <FormField
                                            label="Appointment Date & Time"
                                            type="datepicker"
                                            name="schedule"
                                            control={control}
                                            error={errors.schedule}
                                            required
                                            minDate={new Date()}
                                            excludeDates={excludeDates}
                                            showTimeSelect
                                            dateFormat="MM/dd/yyyy h:mm aa"
                                            placeholder={selectedDoc ? `Select Date (Dr. ${selectedDoc.name})` : "Select Date"}
                                        />
                                    );
                                })()}
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Clock size={14} />
                                    Available: Monday-Friday, 9:00 AM - 5:00 PM (at least 1 hour from now)
                                </p>
                            </div>

                            <FormField
                                label="Reason for Visit"
                                name="reason"
                                type="textarea"
                                placeholder="Describe your symptoms or reason for visit..."
                                register={register}
                                error={errors.reason}
                                required
                            />

                            <FormField
                                label="Additional Notes (Optional)"
                                name="note"
                                type="textarea"
                                placeholder="Any additional information..."
                                register={register}
                                error={errors.note}
                            />

                            {/* Hidden field for datepicker excluded dates logic validation if needed, 
                                but DatePicker component handles visual blocking. */}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading || doctors.length === 0}
                                    variant="medical"
                                    className="w-full text-lg"
                                >
                                    {loading ? 'Booking...' : '📅 Book Appointment'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AppointmentBooking;
