import React, { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Calendar, FileText, ChevronRight } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { patientDocumentService } from '../../services/patientDocumentService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState([]);

    useEffect(() => {
        fetchPatients();
    }, []);

    // Fetch documents when modal opens for a patient
    useEffect(() => {
        const fetchDocs = async () => {
            if (selectedPatient && showModal) {
                try {
                    const docs = await patientDocumentService.getDocumentsByPatientId(selectedPatient._id);
                    setUploadedDocs(docs);
                } catch (err) {
                    console.error("Failed to fetch documents", err);
                    setUploadedDocs([]);
                }
            }
        };
        fetchDocs();
    }, [selectedPatient, showModal]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAllPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (err) {
            console.error("Failed to fetch patients", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = patients.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            (p.phone && p.phone.includes(term))
        );
        setFilteredPatients(filtered);
    };

    const handleView = (patient) => {
        setSelectedPatient(patient);
        setUploadedDocs([]); // Clear previous
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Management</h1>
                    <p className="text-slate-500">View and manage {patients.length} registered patients</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500">Loading patient registry...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Patients Found</h3>
                    <p className="text-slate-500">
                        {searchTerm ? `No results for "${searchTerm}"` : "The patient registry is empty."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                                    <th className="py-4 px-6 font-semibold text-slate-700 text-sm">Patient Name</th>
                                    <th className="py-4 px-6 font-semibold text-slate-700 text-sm">Contact Info</th>
                                    <th className="py-4 px-6 font-semibold text-slate-700 text-sm hidden md:table-cell">Gender & Age</th>
                                    <th className="py-4 px-6 font-semibold text-slate-700 text-sm hidden lg:table-cell">Last Visit</th>
                                    <th className="py-4 px-6 font-semibold text-slate-700 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient._id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {patient.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{patient.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono" title={patient._id}>ID: #{patient._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FileText size={14} className="text-slate-400" /> {patient.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone size={14} className="text-slate-400" /> {patient.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-800">{patient.gender || 'Unknown'}</span>
                                                <span className="text-xs text-slate-500">
                                                    {patient.birthDate ? `${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} yrs` : 'Age N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 hidden lg:table-cell">
                                            <span className="text-sm text-slate-500">
                                                {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleView(patient)}
                                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                View Details <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Patient Details Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Patient Details"
                size="md"
            >
                {selectedPatient && (
                    <div className="space-y-8">
                        {/* Header ID Display */}
                        <div className="flex items-center -mt-2 mb-4">
                            <p className="text-sm text-slate-500 font-mono">
                                ID: #{selectedPatient._id.slice(-6).toUpperCase()}
                                <span className="text-xs text-slate-400 ml-2 font-sans">(Full: {selectedPatient._id})</span>
                            </p>
                        </div>

                        {/* Personal Info */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm">
                                {selectedPatient.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600 uppercase tracking-wider">{selectedPatient.gender || 'Gender N/A'}</span>
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600 flex items-center gap-1">
                                        <Calendar size={12} className="text-slate-400" />
                                        {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString() : 'DOB N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={14} /> Contact
                                </h4>
                                <div className="space-y-3 pl-1">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Email</p>
                                        <p className="font-medium text-slate-800 break-all">{selectedPatient.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Phone</p>
                                        <p className="font-medium text-slate-800">{selectedPatient.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Address</p>
                                        <p className="font-medium text-slate-800">{selectedPatient.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> Medical
                                </h4>
                                <div className="space-y-3 pl-1">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Primary Physician</p>
                                        <p className="font-medium text-slate-800">{selectedPatient.primaryPhysician || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Insurance</p>
                                        <p className="font-medium text-slate-800">{selectedPatient.insuranceProvider || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5">Policy No.</p>
                                        <p className="font-medium text-slate-800 font-mono text-xs">{selectedPatient.insurancePolicyNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Documents Section */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <FileText size={14} /> Uploaded Documents
                            </h4>
                            {uploadedDocs.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No documents uploaded by patient.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {uploadedDocs.map((doc) => (
                                        <div key={doc._id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <FileText size={16} className="text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.title}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`http://localhost:4000${doc.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Download"
                                            >
                                                <ChevronRight size={16} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                            <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                Emergency Contact
                            </h4>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <p className="text-red-900/60 text-[10px] uppercase font-bold mb-0.5">Name</p>
                                    <p className="font-bold text-red-900">{selectedPatient.emergencyContactName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-red-900/60 text-[10px] uppercase font-bold mb-0.5">Phone</p>
                                    <p className="font-bold text-red-900">{selectedPatient.emergencyContactNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setShowModal(false)} variant="outline">Close Details</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Patients;
