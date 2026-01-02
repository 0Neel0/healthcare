import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Upload, Trash2, Download, X, Pill } from 'lucide-react';
import { emrService } from '../../services/emrService';
import { patientDocumentService } from '../../services/patientDocumentService';
import prescriptionService from '../../services/prescriptionService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const MyMedicalRecords = () => {
    const [clinicalRecords, setClinicalRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [myUploads, setMyUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' or 'uploads'

    // Upload State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = async () => {
        if (!user._id) return;
        try {
            setLoading(true);
            const [emrRes, uploadsRes, prescriptionsRes] = await Promise.all([
                emrService.getPatientRecords(user._id).catch(err => ({ data: [] })),
                patientDocumentService.getMyDocuments().catch(err => []),
                prescriptionService.getPatientPrescriptions(user._id).catch(err => [])
            ]);

            setClinicalRecords(emrRes.data || []);
            setMyUploads(uploadsRes || []);
            setPrescriptions(prescriptionsRes.data || []);
        } catch (err) {
            console.error("Failed to load records", err);
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user._id]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setUploadFile(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        try {
            setUploading(true);
            await patientDocumentService.uploadDocument(uploadFile, uploadTitle, uploadDescription);
            toast.success("Document uploaded successfully");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle('');
            setUploadDescription('');
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await patientDocumentService.deleteDocument(id);
            toast.success("Document deleted");
            setMyUploads(prev => prev.filter(doc => doc._id !== id));
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.includes('pdf')) return <FileText className="text-red-500" />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="text-blue-500" />;
        if (mimeType.includes('image')) return <FileText className="text-green-500" />;
        return <FileText className="text-slate-400" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">My Medical Records</h1>
                <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
                    <Upload size={18} /> Upload Record
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('clinical')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'clinical'
                        ? 'border-b-2 border-brand-500 text-brand-600'
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Clinical Reports (Doctor)
                </button>
                <button
                    onClick={() => setActiveTab('uploads')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'uploads'
                        ? 'border-b-2 border-brand-500 text-brand-600'
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    My Uploads
                </button>
                <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'prescriptions'
                        ? 'border-b-2 border-brand-500 text-brand-600'
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Prescriptions
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="loading loading-spinner text-brand-500"></div></div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'clinical' ? (
                        clinicalRecords.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No clinical records found from doctors.</p>
                            </div>
                        ) : (
                            clinicalRecords.map((record) => (
                                <Card key={record._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={16} className="text-brand-500" />
                                                <span className="font-semibold text-slate-700">
                                                    {new Date(record.visitDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                                    Visit #{record._id.slice(-4)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                                Diagnosis: <span className="text-brand-600">{record.diagnosis || 'General Checkup'}</span>
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-4">
                                                Dr. {record.doctorId?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        <button className="btn-outline text-sm px-4 py-2">View Details</button>
                                    </div>
                                </Card>
                            ))
                        )
                    ) : activeTab === 'prescriptions' ? (
                        prescriptions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No prescriptions found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prescriptions.map((px) => (
                                    <Card key={px._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                                    <Calendar size={14} />
                                                    {new Date(px.prescriptionDate).toLocaleDateString()}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">Dr. {px.doctorName}</h3>
                                            </div>
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {px.status === 'active' ? 'Active' : 'Completed'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnosis</p>
                                                <p className="text-slate-800 font-medium">{px.diagnosis}</p>
                                                {px.symptoms && px.symptoms.length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1">Symptoms: {px.symptoms.join(', ')}</p>
                                                )}
                                            </div>
                                            {px.followUpDate && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Follow-up</p>
                                                    <p className="text-slate-800 font-medium">{new Date(px.followUpDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Pill size={14} /> Medications ({px.medications?.length || 0})
                                            </p>
                                            <div className="space-y-2">
                                                {px.medications?.map((med, idx) => (
                                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-white p-2 rounded border border-slate-200 text-sm">
                                                        <span className="font-bold text-slate-800">{med.medicineName}</span>
                                                        <div className="flex gap-3 text-slate-600 text-xs md:text-sm">
                                                            <span>{med.dosage}</span>
                                                            <span>•</span>
                                                            <span>{med.frequency}</span>
                                                            <span>•</span>
                                                            <span>{med.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )
                    ) : (
                        myUploads.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">You haven't uploaded any documents yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myUploads.map((doc) => (
                                    <div key={doc._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            {getFileIcon(doc.fileType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate">{doc.title}</h4>
                                            <p className="text-xs text-slate-500 mb-2">
                                                {new Date(doc.uploadDate).toLocaleDateString()}
                                            </p>
                                            {doc.description && <p className="text-xs text-slate-600 mb-2 truncate">{doc.description}</p>}
                                            {doc.status === 'PENDING' && (
                                                <div className="mt-2 bg-yellow-50 p-2 rounded-md border border-yellow-100 flex items-center gap-2">
                                                    <span className="loading loading-spinner loading-xs text-yellow-600"></span>
                                                    <span className="text-xs text-yellow-700">AI is analyzing this document...</span>
                                                </div>
                                            )}
                                            {doc.status === 'FAILED' && (
                                                <div className="mt-2 bg-red-50 p-2 rounded-md border border-red-100">
                                                    <p className="text-xs text-red-600">Analysis Failed: {doc.processingError || 'Unknown error'}</p>
                                                </div>
                                            )}
                                            {doc.summary && (
                                                <div className="mt-2 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                                                    <p className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">✨ AI Summary</p>
                                                    <p className="text-xs text-slate-700 leading-relaxed">{doc.summary}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-2">
                                                <a
                                                    href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:4000${doc.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 flex items-center gap-1"
                                                >
                                                    <Download size={12} /> Download
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(doc._id)}
                                                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md hover:bg-red-100 flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Record">
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                        <input
                            type="text"
                            required
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="e.g., Blood Test Report"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="Brief description..."
                            rows="2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                required
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="application/pdf,.doc,.docx,image/*"
                            />
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-2 text-brand-600">
                                    <FileText size={20} />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{uploadFile.name}</span>
                                </div>
                            ) : (
                                <div className="text-slate-500">
                                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                                    <p className="text-sm">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Analyzing & Uploading...' : 'Upload Document'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MyMedicalRecords;
