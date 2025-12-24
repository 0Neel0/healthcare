import React, { useState, useEffect } from 'react';
import { Activity, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { labService } from '../../services/labService';
import Card from '../../components/ui/Card';

const MyLabReports = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user._id) return;
            try {
                // Fetch lab requests for this patient
                const res = await labService.getRequests({ patientId: user._id });
                setRequests(res.data);
            } catch (err) {
                console.error("Failed to load lab reports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user._id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Sample Collected': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">My Lab Reports</h1>

            {loading ? (
                <p className="text-center text-slate-500">Loading reports...</p>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No lab requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <Card key={req._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        {req.testId?.name || 'Unknown Test'}
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        Referring Doctor: {req.doctorId?.name || 'N/A'}
                                    </p>

                                    {/* Result Display */}
                                    {req.status === 'Completed' && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <h4 className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-500" /> Test Results
                                            </h4>
                                            {req.resultValue && (
                                                <p className="text-slate-800 font-mono mb-1">
                                                    Value: <span className="font-bold">{req.resultValue}</span>
                                                </p>
                                            )}
                                            {req.resultNotes && (
                                                <p className="text-slate-600 text-sm italic">
                                                    Note: {req.resultNotes}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 justify-center">
                                    {req.status === 'Completed' ? (
                                        <button className="btn-primary text-sm px-4 py-2 flex items-center justify-center gap-2">
                                            <FileText size={16} /> Download Report
                                        </button>
                                    ) : (
                                        <div className="text-center md:text-right px-4">
                                            <p className="text-xs text-slate-500 flex items-center gap-1 justify-center md:justify-end">
                                                <Clock size={12} /> Expected in 24h
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLabReports;
