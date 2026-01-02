import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { User, Calendar, FileText, AlertCircle, Heart, Pill, Activity } from 'lucide-react';
import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import prescriptionService from '../../services/prescriptionService';
import { patientDocumentService } from '../../services/patientDocumentService';
import toast from 'react-hot-toast';

const PatientRecordModal = ({ isOpen, onClose, patientId }) => {
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && patientId) {
            fetchPatientData();
        }
    }, [isOpen, patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const [patientData, appointmentsData, prescriptionsData, documentsData] = await Promise.all([
                patientService.getPatient(patientId),
                appointmentService.getPatientAppointments(patientId),
                prescriptionService.getPatientPrescriptions(patientId),
                patientDocumentService.getDocumentsByPatientId(patientId)
            ]);

            setPatient(patientData);
            setAppointments(appointmentsData);
            setPrescriptions(prescriptionsData.data || []);
            setDocuments(documentsData || []);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            toast.error('Failed to load patient records');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Patient Medical Record" size="lg">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Loading patient history...</p>
                </div>
            ) : patient ? (
                <div className="space-y-8 p-1">
                    {/* Patient Info Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-blue-50 shrink-0">
                                <User size={40} />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{patient.name}</h3>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Calendar size={14} className="text-blue-500" />
                                        <span className="font-medium">{patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 'N/A'} yrs</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600 border-l border-slate-200 pl-4">
                                        <Activity size={14} className="text-indigo-500" />
                                        <span className="font-medium text-capitalize">{patient.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600 border-l border-slate-200 pl-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase">ID:</span>
                                        <span className="font-mono font-bold text-blue-600">{patientId.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="bg-white/60 px-3 py-2 rounded-lg border border-white/80 text-slate-600 shadow-sm truncate">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Contact Number</span>
                                        {patient.phone}
                                    </div>
                                    <div className="bg-white/60 px-3 py-2 rounded-lg border border-white/80 text-slate-600 shadow-sm truncate">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Email Address</span>
                                        {patient.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Abstract background element */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-100/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Medical Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-amber-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Heart size={16} /></div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Allergies</h4>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.allergies || 'No known allergies'}</p>
                        </div>

                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-indigo-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Pill size={16} /></div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Medications</h4>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.currentMedication || 'None'}</p>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-blue-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Activity size={16} /></div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Medical History</h4>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.pastMedicalHistory || 'Healthy profile'}</p>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-emerald-100/50">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><FileText size={16} /></div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Family History</h4>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.familyMedicalHistory || 'None reported'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Past Visits */}
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-600" /> Past Visits
                                </h4>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{appointments.length} Total</span>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {appointments.length > 0 ? (
                                    appointments.map((apt) => (
                                        <div key={apt._id} className="bg-white border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{apt.primaryPhysician}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium truncate">{apt.reason}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-bold text-slate-700 mb-1">
                                                        {new Date(apt.schedule).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                        apt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-400 font-medium">No previous encounters found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Prescriptions */}
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Pill size={18} className="text-purple-600" /> Prescriptions
                                </h4>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{prescriptions.length} Total</span>
                            </div>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {prescriptions.length > 0 ? (
                                    prescriptions.map((rx) => (
                                        <div key={rx._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-3 border-b border-white pb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(rx.prescriptionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 italic">Dr. {rx.doctorName.split('.').pop()}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {rx.medications?.map((med, idx) => (
                                                    <div key={idx} className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-xs">{med.medicineName}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{med.dosage} • {med.frequency} • {med.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <Pill size={24} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-400 font-medium">No medication history</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <FileText size={18} className="text-emerald-600" /> Clinical Documents
                            </h4>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{documents.length} Total</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <div key={doc._id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:shadow-md hover:shadow-slate-100 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-emerald-500">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{doc.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:4000${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Activity size={16} />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs text-slate-400 font-medium">No clinical reports available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl m-4 border border-slate-100">
                    <User size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-lg font-bold text-slate-900">Patient not found</p>
                    <p className="text-sm text-slate-500 mt-1">Please verify the identity or try again</p>
                </div>
            )}
        </Modal>
    );
};

export default PatientRecordModal;
