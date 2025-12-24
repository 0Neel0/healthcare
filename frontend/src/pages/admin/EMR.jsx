import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Pill, Activity, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useForm, useFieldArray } from 'react-hook-form';
import { emrService } from '../../services/emrService';
import { patientService } from '../../services/patientService';
import { inventoryService } from '../../services/inventoryService';

// Simple mocked doctor ID for now - In real app, get from auth context
const MOCK_DOCTOR_ID = "60d0fe4f5311236168a109ca";

const EMR = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const { register, control, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            visitType: 'OPD',
            prescription: [{ medicineName: '', dosage: '', frequency: '', duration: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "prescription"
    });

    useEffect(() => {
        // Fetch medicine list for dropdown
        const loadMeds = async () => {
            try {
                const res = await inventoryService.getAllItems();
                setMedicines(res.data.filter(m => m.type === 'Medicine'));
            } catch (e) { console.error(e); }
        };
        loadMeds();
    }, []);

    // Search Patients
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        try {
            // Need a search endpoint, modifying patientService to search by name/email logic locally if needed or API
            // For now assuming getPatients supports ?search= query or we filter locally
            // Mocking the search behavior with getAll for now if no dedicated search endpoint
            const res = await patientService.getPatients(); // Assuming this exists or we create it
            const filtered = res.data.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.includes(searchTerm)
            );
            setPatients(filtered);
        } catch (e) { console.error(e); }
    };

    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        setValue('patientId', patient._id);
        // Load history
        try {
            const res = await emrService.getPatientRecords(patient._id);
            setRecords(res.data);
            setActiveTab('history');
        } catch (e) { console.error(e); }
    };

    const onSubmitRecord = async (data) => {
        try {
            const recordData = {
                ...data,
                patientId: selectedPatient._id,
                doctorId: MOCK_DOCTOR_ID, // Replace with actual logged in doctor
                symptoms: data.symptoms.split(',').map(s => s.trim())
            };
            await emrService.addRecord(recordData);
            alert('Consultation Record Saved Successfully');
            reset();
            setActiveTab('history');
            // Refresh records
            const res = await emrService.getPatientRecords(selectedPatient._id);
            setRecords(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to save record');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clinical Consultation (EMR)</h1>
                    <p className="text-slate-500">Doctor Dashboard for Diagnosis & Prescriptions</p>
                </div>
                {selectedPatient && (
                    <Button onClick={() => setActiveTab('new')} variant={activeTab === 'new' ? 'primary' : 'outline'}>
                        <Plus size={18} className="mr-2" /> New Consultation
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar: Patient Search */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search Patient (Name/ID)..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                        <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto">
                            {patients.map(p => (
                                <div
                                    key={p._id}
                                    onClick={() => selectPatient(p)}
                                    className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${selectedPatient?._id === p._id ? 'bg-brand-50 border-brand-200 border' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.gender}, {p.age} years</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content: History or Form */}
                <div className="col-span-12 lg:col-span-8">
                    {!selectedPatient ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 glass-effect rounded-2xl border-2 border-dashed border-slate-200">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>Select a patient to view records or start consultation</p>
                        </div>
                    ) : activeTab === 'new' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Activity className="text-brand-600" /> New Consultation
                            </h2>
                            <form onSubmit={handleSubmit(onSubmitRecord)} className="space-y-6">
                                {/* Vitals */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                                    <input {...register('vitals.bloodPressure')} placeholder="BP (120/80)" className="input-modern bg-white" />
                                    <input {...register('vitals.pulse')} placeholder="Pulse (bpm)" className="input-modern bg-white" />
                                    <input {...register('vitals.temperature')} placeholder="Temp (°F)" className="input-modern bg-white" />
                                    <input {...register('vitals.weight')} placeholder="Weight (kg)" className="input-modern bg-white" />
                                </div>

                                {/* Clinical Notes */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-modern">Symptoms</label>
                                        <input {...register('symptoms')} className="input-modern" placeholder="Fever, Cough, Headache (comma separated)" required />
                                    </div>
                                    <div>
                                        <label className="label-modern">Diagnosis</label>
                                        <input {...register('diagnosis')} className="input-modern" placeholder="Viral Fever" required />
                                    </div>
                                </div>

                                {/* Prescriptions */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="label-modern flex items-center gap-2"><Pill size={16} /> Prescription</label>
                                        <button type="button" onClick={() => append({ medicineName: '', dosage: '', frequency: '', duration: '' })} className="text-sm text-brand-600 font-semibold hover:underline">+ Add Medicine</button>
                                    </div>
                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-4">
                                                    <select {...register(`prescription.${index}.medicineName`)} className="input-modern" required>
                                                        <option value="">Select Medicine</option>
                                                        {medicines.map(m => (
                                                            <option key={m._id} value={m.name}>{m.name} ({m.stock} stock)</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <input {...register(`prescription.${index}.dosage`)} placeholder="Dosage" className="input-modern" />
                                                </div>
                                                <div className="col-span-3">
                                                    <input {...register(`prescription.${index}.frequency`)} placeholder="Freq (1-0-1)" className="input-modern" />
                                                </div>
                                                <div className="col-span-2">
                                                    <input {...register(`prescription.${index}.duration`)} placeholder="Duration" className="input-modern" />
                                                </div>
                                                <div className="col-span-1 text-center">
                                                    <button type="button" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">X</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="label-modern">Additional Notes / Test Requests</label>
                                    <textarea {...register('notes')} className="input-modern h-24" placeholder="Recommend Lab Tests or Admission here..."></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab('history')}>Cancel</Button>
                                    <Button type="submit" variant="primary">Save Record</Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Medical History</h2>
                            {records.length === 0 ? (
                                <p className="text-slate-500">No medical records found for this patient.</p>
                            ) : (
                                records.map(rec => (
                                    <div key={rec._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-bold text-lg text-slate-800">{rec.diagnosis}</p>
                                                <p className="text-sm text-slate-500">{new Date(rec.visitDate).toLocaleDateString()} • {rec.visitType}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-50 text-brand-600 text-xs font-bold rounded-full">
                                                {rec.doctorId?.name || 'Doctor'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div><span className="text-slate-500">Symptoms:</span> {rec.symptoms.join(', ')}</div>
                                            <div><span className="text-slate-500">BP:</span> {rec.vitals?.bloodPressure || '-'}</div>
                                        </div>
                                        {rec.prescription.length > 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl">
                                                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Prescription</h4>
                                                <ul className="space-y-1">
                                                    {rec.prescription.map((p, i) => (
                                                        <li key={i} className="text-sm text-slate-700">
                                                            • <strong>{p.medicineName}</strong> - {p.dosage} ({p.frequency}) for {p.duration}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EMR;
