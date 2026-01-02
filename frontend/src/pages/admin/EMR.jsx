import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Pill, Activity, User, Printer, Save, X, Stethoscope, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useForm, useFieldArray } from 'react-hook-form';
import { emrService } from '../../services/emrService';
import { patientService } from '../../services/patientService';
import { pharmacyService } from '../../services/pharmacyService';
import toast from 'react-hot-toast';

const EMR = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [medicines, setMedicines] = useState([]);

    // Get logged in doctor
    const [doctorId, setDoctorId] = useState('');

    const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            visitType: 'OPD',
            prescription: [{ medicineName: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "prescription"
    });

    useEffect(() => {
        // Load User ID from local storage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setDoctorId(user.id || user._id);
        }

        // Load Medicines
        const loadMeds = async () => {
            try {
                const res = await pharmacyService.getInventory();
                setMedicines(res.filter(m => m.stock > 0)); // Only show available meds
            } catch (e) { console.error("Failed to load medicines", e); }
        };

        // Load Patients
        const loadPatients = async () => {
            try {
                const res = await patientService.getAllPatients();
                setPatients(res || []);
            } catch (e) { console.error("Failed to load patients", e); }
        }

        loadMeds();
        loadPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        setValue('patientId', patient._id);
        // Load history
        try {
            const res = await emrService.getPatientRecords(patient._id);
            setRecords(res.data);
            setActiveTab('history');
        } catch (e) {
            console.error(e);
            toast.error("Failed to load patient history");
        }
    };

    const onSubmitRecord = async (data) => {
        if (!doctorId) {
            toast.error("You must be logged in as a doctor to save records.");
            return;
        }

        try {
            const recordData = {
                ...data,
                patientId: selectedPatient._id,
                doctorId: doctorId,
                symptoms: data.symptoms.split(',').map(s => s.trim()),
                visitDate: new Date()
            };

            await emrService.addRecord(recordData);
            toast.success("Consultation Record Saved Successfully");
            reset();
            setActiveTab('history');

            // Refresh records
            const res = await emrService.getPatientRecords(selectedPatient._id);
            setRecords(res.data);
        } catch (e) {
            console.error(e);
            toast.error('Failed to save record. Ensure all fields are valid.');
        }
    };

    const printRecord = (record) => {
        toast.success("Printing Record... (Feature to be implemented)");
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="text-brand-600" /> Clinical Consultation (EMR)
                    </h1>
                    <p className="text-slate-500">Doctor Dashboard for Diagnosis & Prescriptions</p>
                </div>
                {selectedPatient && activeTab === 'history' && (
                    <Button onClick={() => setActiveTab('new')} className="flex items-center gap-2 shadow-lg shadow-brand-200">
                        <Plus size={18} /> New Consultation
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
                {/* Left Sidebar: Patient Search (Sticky/Scrollable) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-4 shrink-0">
                            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search Patient (Name/Email)..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredPatients.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                                    <User size={32} className="mb-2 opacity-50" />
                                    <p>No patients found</p>
                                </div>
                            ) : (
                                filteredPatients.map(p => (
                                    <div
                                        key={p._id}
                                        onClick={() => selectPatient(p)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${selectedPatient?._id === p._id
                                                ? 'bg-brand-600 text-white shadow-md transform scale-[1.02]'
                                                : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${selectedPatient?._id === p._id ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'
                                            }`}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-semibold truncate ${selectedPatient?._id === p._id ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                                            <p className={`text-xs truncate ${selectedPatient?._id === p._id ? 'text-brand-100' : 'text-slate-500'}`}>{p.gender}, {p.age} yrs • {p.bloodGroup || 'N/A'}</p>
                                        </div>
                                        {selectedPatient?._id === p._id && <ChevronRight size={16} className="ml-auto text-white/50" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="col-span-12 lg:col-span-8 h-full overflow-y-auto custom-scrollbar pr-1">
                    {!selectedPatient ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <User size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">No Patient Selected</h3>
                            <p>Select a patient from the list to view records or start a consultation.</p>
                        </div>
                    ) : activeTab === 'new' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-slide-up">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="text-brand-600" /> New Consultation
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Creating record for <span className="font-bold text-slate-800">{selectedPatient.name}</span>
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab('history')}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmitRecord)} className="space-y-6">
                                {/* Vitals */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Vitals</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input {...register('vitals.bloodPressure')} placeholder="BP (e.g. 120/80)" className="input-modern bg-white" />
                                        <input {...register('vitals.pulse')} placeholder="Pulse (e.g. 72 bpm)" className="input-modern bg-white" />
                                        <input {...register('vitals.temperature')} placeholder="Temp (e.g. 98.6 °F)" className="input-modern bg-white" />
                                        <input {...register('vitals.weight')} placeholder="Weight (kg)" className="input-modern bg-white" />
                                    </div>
                                </div>

                                {/* Clinical Notes */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-modern">Symptoms <span className="text-red-500">*</span></label>
                                        <input {...register('symptoms')} className="input-modern" placeholder="e.g. High Fever, Dry Cough" required />
                                    </div>
                                    <div>
                                        <label className="label-modern">Provisional Diagnosis <span className="text-red-500">*</span></label>
                                        <input {...register('diagnosis')} className="input-modern" placeholder="e.g. Viral Pyrexia" required />
                                    </div>
                                </div>

                                {/* Prescriptions */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-t-xl border-b border-blue-100">
                                        <label className="label-modern flex items-center gap-2 text-blue-800 m-0"><Pill size={16} /> Prescription</label>
                                        <button type="button" onClick={() => append({ medicineName: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days' })} className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-md shadow-sm font-bold hover:shadow hover:scale-105 transition-all flex items-center gap-1">
                                            <Plus size={12} /> Add Med
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-b-xl border border-t-0 border-slate-100 space-y-3">
                                        {fields.length === 0 && <p className="text-center text-sm text-slate-400 italic py-2">No medicines prescribed.</p>}
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-2 items-start animate-fade-in">
                                                <div className="col-span-12 md:col-span-4">
                                                    <select {...register(`prescription.${index}.medicineName`)} className="input-modern text-sm" required>
                                                        <option value="">Select Medicine</option>
                                                        {medicines.map(m => (
                                                            <option key={m._id} value={m.name}>{m.name} (Stock: {m.stock})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-4 md:col-span-3">
                                                    <input {...register(`prescription.${index}.dosage`)} placeholder="Dose (1 tab)" className="input-modern text-sm" />
                                                </div>
                                                <div className="col-span-4 md:col-span-2">
                                                    <input {...register(`prescription.${index}.frequency`)} placeholder="Freq (1-0-1)" className="input-modern text-sm" />
                                                </div>
                                                <div className="col-span-3 md:col-span-2">
                                                    <input {...register(`prescription.${index}.duration`)} placeholder="Dur (5 days)" className="input-modern text-sm" />
                                                </div>
                                                <div className="col-span-1 flex justify-center mt-1.5">
                                                    <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Remove">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="label-modern">Advice / Lab Requests</label>
                                    <textarea {...register('notes')} className="input-modern h-24 font-sans" placeholder="e.g. Drink plenty of water. Complete bed rest. CBC Test suggested."></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white p-2">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab('history')}>Cancel</Button>
                                    <Button type="submit" variant="primary" className="flex items-center gap-2 shadow-lg shadow-brand-200">
                                        <Save size={18} /> Save Record
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                                    <p className="text-sm text-slate-500 mt-1">Patient ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{selectedPatient._id?.slice(-6).toUpperCase()}</span></p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Age/Gender</p>
                                            <p className="font-bold text-slate-800">{selectedPatient.age} Y / {selectedPatient.gender}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Blood Group</p>
                                            <p className="font-bold text-red-600">{selectedPatient.bloodGroup || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-wider pl-1">
                                <FileText size={16} /> Medical History
                            </h3>

                            {records.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <FileText size={24} className="opacity-50" />
                                    </div>
                                    <p>No medical records found for this patient.</p>
                                    <Button onClick={() => setActiveTab('new')} variant="outline" className="mt-4">Start First Consultation</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {records.map(rec => (
                                        <div key={rec._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md relative group">
                                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" onClick={() => printRecord(rec)} title="Print Prescription">
                                                    <Printer size={16} />
                                                </Button>
                                            </div>

                                            <div className="flex justify-between items-start mb-4 pr-12">
                                                <div>
                                                    <h4 className="font-bold text-lg text-brand-700">{rec.diagnosis}</h4>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                        <Clock size={14} />
                                                        {new Date(rec.visitDate || rec.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100 uppercase tracking-wide">
                                                    {rec.visitType}
                                                </span>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div><span className="text-slate-400 block text-xs uppercase font-bold mb-1">Symptoms</span> <span className="font-medium text-slate-700">{rec.symptoms.join(', ')}</span></div>
                                                <div><span className="text-slate-400 block text-xs uppercase font-bold mb-1">Vitals</span> <span className="font-medium text-slate-700">BP: {rec.vitals?.bloodPressure || '-'} | Pulse: {rec.vitals?.pulse || '-'}</span></div>
                                                <div><span className="text-slate-400 block text-xs uppercase font-bold mb-1">Seen By</span> <span className="font-medium text-slate-700">Dr. {rec.doctorId?.name || 'Unknown'}</span></div>
                                            </div>

                                            {rec.notes && (
                                                <div className="mb-4 text-sm text-slate-600 italic border-l-2 border-brand-200 pl-4 py-1 bg-brand-50/30 rounded-r-lg">
                                                    "{rec.notes}"
                                                </div>
                                            )}

                                            {rec.prescription.length > 0 && (
                                                <div className="border-t border-slate-100 pt-4">
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
                                                        <Pill size={12} /> Prescribed Medication
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {rec.prescription.map((p, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl text-sm border border-blue-50 hover:bg-blue-50 transition-colors">
                                                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> {p.medicineName}
                                                                </span>
                                                                <span className="text-slate-500 text-xs font-medium bg-white px-2 py-1 rounded shadow-sm border border-slate-100">{p.dosage} • {p.frequency} • {p.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EMR;
