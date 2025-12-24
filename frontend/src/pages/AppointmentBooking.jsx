import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Search } from 'lucide-react';

import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import FormField from '../components/forms/FormField';
import patientService from '../services/patientService';
import appointmentService from '../services/appointmentService';
import Footer from '../components/layout/Footer';

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patient, setPatient] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');

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

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            const appointmentData = {
                patientId: patient._id,
                userId: patient._id, // Using patient ID as userId for now
                primaryPhysician: data.primaryPhysician,
                schedule: new Date(data.schedule).toISOString(),
                reason: data.reason,
                note: data.note || '',
            };

            const appointment = await appointmentService.createAppointment(appointmentData);

            toast.success('Appointment booked successfully!');
            // Redirect to success page
            navigate(`/appointment/${appointment._id}`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const doctors = [
        'Dr. John Smith - Cardiologist',
        'Dr. Sarah Johnson - Pediatrician',
        'Dr. Michael Brown - Orthopedic',
        'Dr. Emily Davis - Dermatologist',
        'Dr. Robert Wilson - General Physician',
        'Dr. Jennifer Taylor - Neurologist',
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="container mx-auto px-4 py-12 max-w-3xl flex-grow">
                <div className="glass-effect rounded-3xl p-8 animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4">
                            <CalendarIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
                        <p className="text-gray-600">Schedule your visit with our expert physicians</p>
                    </div>

                    {/* Patient Search */}
                    {!patient && (
                        <div className="mb-8 p-6 bg-blue-50 rounded-2xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Profile</h2>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="input-modern flex-1"
                                />
                                <Button onClick={searchPatient} disabled={loading || !searchEmail}>
                                    <Search className="w-5 h-5 mr-2" />
                                    Search
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Don't have an account? <a href="/register" className="text-blue-600 hover:underline font-semibold">Register here</a>
                            </p>
                        </div>
                    )}

                    {/* Patient Info */}
                    {patient && (
                        <div className="mb-8 p-6 bg-green-50 rounded-2xl animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Patient Information</h3>
                                    <p className="text-gray-700"><strong>Name:</strong> {patient.name}</p>
                                    <p className="text-gray-700"><strong>Email:</strong> {patient.email}</p>
                                    <p className="text-gray-700"><strong>Phone:</strong> {patient.phone}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setPatient(null);
                                    setSearchEmail('');
                                }}>
                                    Change
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Booking Form */}
                    {patient && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
                            <FormField
                                label="Select Doctor"
                                name="primaryPhysician"
                                type="select"
                                options={doctors}
                                register={register}
                                error={errors.primaryPhysician}
                                required
                            />

                            <FormField
                                label="Appointment Date & Time"
                                name="schedule"
                                type="datetime-local"
                                register={register}
                                error={errors.schedule}
                                required
                            />

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

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Booking...' : 'Book Appointment'}
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
