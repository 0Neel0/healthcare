import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity } from 'lucide-react';
import { emrService } from '../../services/emrService';
import Card from '../../components/ui/Card';

const MyMedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    // Currently emrService might not have a direct "getByPatientId" method that takes an ID as arg
    // Or it might default to the patientId param. Let's check or assume we need to filtering logic if the API is restricted.
    // Actually, I saw `getPatientRecords` in controller, so let's use it.

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user._id) return;
            try {
                // Assuming we added a helper in emrService, or we call the endpoint directly
                // If emrService.getPatientHistory(id) exists, great. If not, I'll need to double check emrService.js
                // For safety, I'll access the endpoint via the service if available.
                const res = await emrService.getPatientRecords(user._id);
                setRecords(res.data || []);
            } catch (err) {
                console.error("Failed to load records", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [user._id]);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">My Medical Records</h1>

            {loading ? (
                <p className="text-center text-slate-500">Loading records...</p>
            ) : records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No medical records found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => (
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

                                    {/* Quick Summary of Vitals/Meds if available */}
                                    <div className="flex flex-wrap gap-2">
                                        {record.symptoms && (
                                            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100">
                                                Symptoms: {record.symptoms}
                                            </span>
                                        )}
                                        {record.prescription && record.prescription.length > 0 && (
                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100">
                                                {record.prescription.length} Medicines Prescribed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button className="btn-outline text-sm px-4 py-2">
                                    View Full Details
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMedicalRecords;
