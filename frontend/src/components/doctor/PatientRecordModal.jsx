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
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#DFE1E6] border-t-[#0052CC] rounded-full animate-spin"></div>
                </div>
            ) : patient ? (
                <div className="space-y-6">
                    {/* Patient Info */}
                    <div className="bg-[#F4F5F7] rounded-lg p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-[#DEEBFF] rounded-full flex items-center justify-center">
                                <User className="text-[#0052CC]" size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#253858]">{patient.name}</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                                    <div><span className="text-[#7A869A]">Age:</span> <span className="text-[#42526E] font-medium">{patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 'N/A'}</span></div>
                                    <div><span className="text-[#7A869A]">Gender:</span> <span className="text-[#42526E] font-medium">{patient.gender || 'N/A'}</span></div>
                                    <div><span className="text-[#7A869A]">Phone:</span> <span className="text-[#42526E] font-medium">{patient.phone}</span></div>
                                    <div><span className="text-[#7A869A]">Email:</span> <span className="text-[#42526E] font-medium">{patient.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div>
                        <h4 className="text-sm font-bold text-[#253858] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-[#0052CC]" />
                            Medical History
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#FFF0B3]/20 border border-[#FFF0B3] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart size={16} className="text-[#FF991F]" />
                                    <span className="text-xs font-semibold text-[#7A869A] uppercase">Allergies</span>
                                </div>
                                <p className="text-sm text-[#253858]">{patient.allergies || 'None reported'}</p>
                            </div>
                            <div className="bg-[#EAE6FF]/30 border border-[#C0B6F2] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Pill size={16} className="text-[#6554C0]" />
                                    <span className="text-xs font-semibold text-[#7A869A] uppercase">Current Medications</span>
                                </div>
                                <p className="text-sm text-[#253858]">{patient.currentMedication || 'None'}</p>
                            </div>
                            <div className="bg-[#DEEBFF]/40 border border-[#B3D4FF] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={16} className="text-[#0052CC]" />
                                    <span className="text-xs font-semibold text-[#7A869A] uppercase">Past Medical History</span>
                                </div>
                                <p className="text-sm text-[#253858]">{patient.pastMedicalHistory || 'None reported'}</p>
                            </div>
                            <div className="bg-[#E3FCEF]/40 border border-[#ABF5D1] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={16} className="text-[#00875A]" />
                                    <span className="text-xs font-semibold text-[#7A869A] uppercase">Family History</span>
                                </div>
                                <p className="text-sm text-[#253858]">{patient.familyMedicalHistory || 'None reported'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Past Appointments */}
                    <div>
                        <h4 className="text-sm font-bold text-[#253858] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-[#0052CC]" />
                            Past Appointments ({appointments.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {appointments.length > 0 ? (
                                <div className="space-y-2">
                                    {appointments.slice(0, 5).map((apt) => (
                                        <div key={apt._id} className="bg-white border border-[#DFE1E6] rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-[#253858] text-sm">{apt.primaryPhysician}</p>
                                                    <p className="text-xs text-[#7A869A]">{apt.reason}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-medium text-[#42526E]">
                                                        {new Date(apt.schedule).toLocaleDateString()}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${apt.status === 'completed' ? 'bg-[#E3FCEF] text-[#00875A]' :
                                                        apt.status === 'cancelled' ? 'bg-[#FFEBE6] text-[#DE350B]' :
                                                            'bg-[#DEEBFF] text-[#0052CC]'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#7A869A] italic">No past appointments</p>
                            )}
                        </div>
                    </div>

                    {/* Prescriptions */}
                    <div>
                        <h4 className="text-sm font-bold text-[#253858] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Pill size={16} className="text-[#0052CC]" />
                            Recent Prescriptions ({prescriptions.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {prescriptions.length > 0 ? (
                                <div className="space-y-2">
                                    {prescriptions.slice(0, 3).map((rx) => (
                                        <div key={rx._id} className="bg-[#EAE6FF]/20 border border-[#C0B6F2] rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold text-[#7A869A]">
                                                    {new Date(rx.prescriptionDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-[#42526E]">by {rx.doctorName}</p>
                                            </div>
                                            <div className="space-y-1">
                                                {rx.medications?.map((med, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="font-semibold text-[#253858]">{med.medicineName}</span>
                                                        <span className="text-[#7A869A]"> - {med.dosage}, {med.frequency}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#7A869A] italic">No prescriptions found</p>
                            )}
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div>
                        <h4 className="text-sm font-bold text-[#253858] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText size={16} className="text-[#0052CC]" />
                            Uploaded Documents ({documents.length})
                        </h4>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {documents.length > 0 ? (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc._id} className="bg-white border border-[#DFE1E6] rounded-lg p-3 flex items-center justify-between hover:bg-[#F4F5F7] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#DEEBFF] text-[#0052CC] rounded-lg">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#253858] text-sm">{doc.title}</p>
                                                    <p className="text-xs text-[#7A869A]">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`http://localhost:4000${doc.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-semibold text-[#0052CC] hover:underline"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#7A869A] italic">No uploaded documents found</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-[#7A869A]">Patient record not found</p>
                </div>
            )}
        </Modal>
    );
};

export default PatientRecordModal;
