import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, User, Stethoscope, Clock, Home } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { appointmentService } from '../services/appointmentService';
import { formatDateTime } from '../utils/helpers';

const AppointmentSuccess = () => {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const data = await appointmentService.getAppointment(id);
                setAppointment(data);
            } catch (err) {
                console.error('Failed to fetch appointment:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAppointment();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-blue-600"></div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-12 text-center">
                    <p className="text-red-600">Appointment not found.</p>
                    <Link to="/">
                        <Button className="mt-4">Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <Card className="text-center animate-scale-in">
                    {/* Success Icon */}
                    <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mb-6 animate-pulse-slow">
                        <CheckCircle className="w-16 h-16 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Booked!</h1>
                    <p className="text-gray-600 mb-8">Your appointment has been successfully scheduled</p>

                    {/* Appointment Details */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h2>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Patient</p>
                                    <p className="font-semibold">{appointment.patient?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Stethoscope className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Doctor</p>
                                    <p className="font-semibold">{appointment.primaryPhysician}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Schedule</p>
                                    <p className="font-semibold">{formatDateTime(appointment.schedule)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Reason</p>
                                    <p className="font-semibold">{appointment.reason}</p>
                                </div>
                            </div>

                            {appointment.note && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Notes</p>
                                        <p className="font-semibold">{appointment.note}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Status:</strong> {appointment.status === 'pending' ? 'Pending Approval' : appointment.status}
                            </p>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-2xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Our staff will review your appointment request</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>You'll receive a confirmation once it's approved</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Please arrive 10 minutes before your scheduled time</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <Link to="/">
                            <Button variant="outline">
                                <Home className="w-5 h-5 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                        <Link to="/book-appointment">
                            <Button>
                                <Calendar className="w-5 h-5 mr-2" />
                                Book Another
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AppointmentSuccess;
