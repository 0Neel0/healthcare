import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Plus, X, Pill, FileText, Calendar } from 'lucide-react';
import prescriptionService from '../../services/prescriptionService';
import toast from 'react-hot-toast';
import DatePicker from '../ui/DatePicker';

const PrescriptionModal = ({ isOpen, onClose, appointment, patient, doctorName }) => {
    const [medications, setMedications] = useState([
        { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState(null);
    const [saving, setSaving] = useState(false);

    const activePatient = appointment?.patient || patient;

    const addMedication = () => {
        setMedications([...medications, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedication = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const updateMedication = (index, field, value) => {
        const updated = medications.map((med, i) =>
            i === index ? { ...med, [field]: value } : med
        );
        setMedications(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const validMedications = medications.filter(m => m.medicineName && m.dosage && m.frequency && m.duration);

        if (validMedications.length === 0) {
            toast.error('Please add at least one medication');
            return;
        }

        if (!diagnosis) {
            toast.error('Diagnosis is required');
            return;
        }

        try {
            setSaving(true);

            const prescriptionData = {
                patientId: activePatient._id,
                doctorName,
                appointmentId: appointment?._id || null, // Optional
                medications: validMedications,
                diagnosis,
                symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
                notes,
                followUpDate: followUpDate || null
            };

            await prescriptionService.createPrescription(prescriptionData);
            toast.success('Prescription created successfully');

            // Reset form
            setMedications([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setDiagnosis('');
            setSymptoms('');
            setNotes('');
            setFollowUpDate(null);


            onClose();
        } catch (error) {
            console.error('Error creating prescription:', error);
            toast.error('Failed to create prescription');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !activePatient) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Write Prescription" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Info */}
                <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-lg p-4">
                    <p className="text-sm text-[#7A869A]">Patient</p>
                    <p className="text-lg font-bold text-[#253858]">{activePatient.name}</p>
                    <p className="text-xs text-[#7A869A] mt-1">
                        {activePatient.email} • {activePatient.phone}
                    </p>
                </div>

                {/* Diagnosis */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-2">
                        Diagnosis <span className="text-[#DE350B]">*</span>
                    </label>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis"
                        className="w-full px-4 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                        required
                    />
                </div>

                {/* Symptoms */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-2">
                        Symptoms <span className="text-[#7A869A] text-xs font-normal">(comma separated)</span>
                    </label>
                    <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g., Fever, Headache, Cough"
                        className="w-full px-4 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                </div>

                {/* Medications */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-[#253858]">
                            Medications <span className="text-[#DE350B]">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={addMedication}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-[#0052CC] text-white rounded-md hover:bg-[#003D99] transition-colors"
                        >
                            <Plus size={14} />
                            Add Medicine
                        </button>
                    </div>

                    <div className="space-y-3">
                        {medications.map((med, index) => (
                            <div key={index} className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <Pill size={16} className="text-[#6554C0] mt-1" />
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="text-[#DE350B] hover:bg-[#FFEBE6] p-1 rounded transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            value={med.medicineName}
                                            onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                                            placeholder="Medicine Name *"
                                            className="w-full px-3 py-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        placeholder="Dosage (e.g., 500mg) *"
                                        className="w-full px-3 py-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        placeholder="Frequency (e.g., Twice daily) *"
                                        className="w-full px-3 py-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.duration}
                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                        placeholder="Duration (e.g., 7 days) *"
                                        className="w-full px-3 py-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.instructions}
                                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                        placeholder="Special Instructions (optional)"
                                        className="w-full px-3 py-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-2">
                        <FileText size={14} className="inline mr-1" />
                        Clinical Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes or recommendations..."
                        rows={3}
                        className="w-full px-4 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent resize-none"
                    />
                </div>

                {/* Follow-up Date */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-2">
                        <Calendar size={14} className="inline mr-1" />
                        Follow-up Date (Optional)
                    </label>
                    <DatePicker
                        selected={followUpDate}
                        onChange={(date) => setFollowUpDate(date)}
                        placeholder="Select follow-up date"
                        minDate={new Date()}
                        className="w-full"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#DFE1E6]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-[#DFE1E6] text-[#42526E] rounded-lg hover:bg-[#F4F5F7] transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Prescription'}
                    </button>
                </div>
            </form>
        </Modal >
    );
};

export default PrescriptionModal;
