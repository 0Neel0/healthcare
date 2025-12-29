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
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Patient Details</p>
                        <p className="text-xl font-bold text-slate-900">{activePatient.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {activePatient.email} • {activePatient.phone}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <User size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Diagnosis <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Primary Diagnosis"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {/* Symptoms */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Symptoms <span className="text-slate-400 text-xs font-normal">(comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="e.g., Fever, Headache"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Medications */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Pill size={18} className="text-blue-600" />
                            <label className="text-sm font-bold text-slate-900">
                                Medications <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={addMedication}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                        >
                            <Plus size={14} />
                            Add Medicine
                        </button>
                    </div>

                    <div className="space-y-4">
                        {medications.map((med, index) => (
                            <div key={index} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 relative group">
                                {medications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMedication(index)}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <X size={14} />
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={med.medicineName}
                                            onChange={(e) => updateMedication(index, 'medicineName', e.target.value)}
                                            placeholder="Medicine Name *"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        placeholder="Dosage *"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        placeholder="Frequency *"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.duration}
                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                        placeholder="Duration *"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={med.instructions}
                                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                            placeholder="Special Instructions (optional)"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Clinical Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional recommendations..."
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-all"
                        />
                    </div>

                    {/* Follow-up Date */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Follow-up Date
                        </label>
                        <DatePicker
                            selected={followUpDate}
                            onChange={(date) => setFollowUpDate(date)}
                            placeholder="Select Date"
                            minDate={new Date()}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <Activity size={16} className="animate-spin" /> Saving...
                            </span>
                        ) : 'Issue Prescription'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PrescriptionModal;
