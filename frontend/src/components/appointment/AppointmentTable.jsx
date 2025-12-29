import React from 'react';
import { formatDateTime } from '../../utils/helpers';
import { Calendar, User, Stethoscope, Clock, Check, X, Eye, MoreHorizontal, AlertCircle } from 'lucide-react';

const AppointmentTable = ({ appointments, onSchedule, onCancel, onView, onRequestConfirmation }) => {

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'pending_doctor': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'pending_payment': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'scheduled': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Appointments Found</h3>
                <p className="text-slate-500">There are no appointments to display at this time.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm tracking-wide">Patient</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm tracking-wide">Doctor</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm tracking-wide">Date & Time</th>
                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm tracking-wide hidden md:table-cell">Status</th>
                            <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {appointments.map((appointment) => (
                            <tr
                                key={appointment._id}
                                className="group hover:bg-slate-50/80 transition-all duration-200"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                            {appointment.patient?.name ? appointment.patient.name.substring(0, 2).toUpperCase() : 'NA'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{appointment.patient?.name || 'Unknown Patient'}</p>
                                            <p className="text-xs text-slate-500">{appointment.patient?.phone || 'No Phone'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                            <Stethoscope size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{appointment.primaryPhysician}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {new Date(appointment.schedule).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(appointment.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 hidden md:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(appointment.status)} capitalize`}>
                                        {appointment.status}
                                    </span>
                                    {appointment.billingStatus === 'requested' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-100 text-amber-800 border-amber-200 ml-2 animate-pulse">
                                            Bill Requested
                                        </span>
                                    )}
                                    {appointment.billingStatus === 'generated' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200 ml-2">
                                            Billed
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">

                                        {onView && (
                                            <button
                                                onClick={() => onView(appointment)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}

                                        {appointment.status === 'pending_admin' && onRequestConfirmation && (
                                            <button
                                                onClick={() => onRequestConfirmation(appointment)}
                                                className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                                                title="Request Doctor Confirmation"
                                            >
                                                <Stethoscope size={18} />
                                            </button>
                                        )}

                                        {appointment.status === 'pending' && onSchedule && (
                                            <button
                                                onClick={() => onSchedule(appointment)}
                                                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Approve & Schedule"
                                            >
                                                <Check size={18} />
                                            </button>
                                        )}

                                        {appointment.status !== 'cancelled' && onCancel && (
                                            <button
                                                onClick={() => onCancel(appointment)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Appointment"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentTable;
