import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { labService } from '../../services/labService';
import { patientService } from '../../services/patientService';

const Lab = () => {
    const [requests, setRequests] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Form states
    const [newRequest, setNewRequest] = useState({ patientId: '', testId: '' });
    const [resultData, setResultData] = useState({ resultValue: '', resultNotes: '' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [reqRes, testsRes] = await Promise.all([
                    labService.getRequests(),
                    labService.getTests()
                ]);
                setRequests(reqRes.data);
                setTests(testsRes.data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        loadData();
    }, [refreshTrigger]);

    // Handle Status Update (Flowchart: Sample Collected -> Processing)
    const updateStatus = async (id, status) => {
        try {
            await labService.updateRequestStatus(id, { status });
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            alert('Failed to update status');
        }
    };

    // Handle New Request
    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        try {
            await labService.createRequest({
                ...newRequest,
                doctorId: "60d0fe4f5311236168a109ca" // Mock Doctor ID
            });
            setShowRequestModal(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            alert('Failed to create request');
        }
    };

    // Handle Result Entry (Flowchart: Report Generated)
    const handleSubmitResult = async (e) => {
        e.preventDefault();
        try {
            await labService.updateRequestStatus(selectedRequest._id, {
                status: 'Completed',
                ...resultData
            });
            setShowResultModal(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            alert('Failed to save results');
        }
    };

    const openResultModal = (req) => {
        setSelectedRequest(req);
        setResultData({ resultValue: req.resultValue || '', resultNotes: req.resultNotes || '' });
        setShowResultModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Laboratory & Diagnostic</h1>
                    <p className="text-slate-500">Manage Sample Collections & Test Results</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                        <RefreshCw size={18} />
                    </Button>
                    <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                        <Activity size={18} className="mr-2" /> New Test Request
                    </Button>
                </div>
            </div>

            {/* Request List */}
            <div className="glass-effect rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Test Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading requests...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-500">No active lab requests</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{req.patientId?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-slate-600">{req.testId?.name} <span className="text-xs text-slate-400">({req.testId?.code})</span></td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                req.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    req.status === 'Sample Collected' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        {req.status === 'Requested' && (
                                            <button onClick={() => updateStatus(req._id, 'Sample Collected')} className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-lg border border-brand-200 hover:bg-brand-100">
                                                Collect
                                            </button>
                                        )}
                                        {req.status === 'Sample Collected' && (
                                            <button onClick={() => updateStatus(req._id, 'Processing')} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-100">
                                                Process
                                            </button>
                                        )}
                                        {req.status === 'Processing' && (
                                            <button onClick={() => openResultModal(req)} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200 hover:bg-green-100">
                                                Add Result
                                            </button>
                                        )}
                                        {req.status === 'Completed' && (
                                            <button onClick={() => openResultModal(req)} className="text-xs text-slate-500 hover:text-slate-800">
                                                View Result
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Request Modal */}
            <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="New Lab Request">
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                        <label className="label-modern">Patient ID</label>
                        <input className="input-modern" value={newRequest.patientId} onChange={(e) => setNewRequest({ ...newRequest, patientId: e.target.value })} placeholder="Patient Object ID" required />
                        <p className="text-xs text-slate-400 mt-1">For demo, copy ID from Patient list</p>
                    </div>
                    <div>
                        <label className="label-modern">Test</label>
                        <select className="input-modern" value={newRequest.testId} onChange={(e) => setNewRequest({ ...newRequest, testId: e.target.value })} required>
                            <option value="">Select Lab Test</option>
                            {tests.map(t => (
                                <option key={t._id} value={t._id}>{t.name} (${t.cost})</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-4">Create Request</Button>
                </form>
            </Modal>

            {/* Result Modal */}
            <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="Lab Results">
                <form onSubmit={handleSubmitResult} className="space-y-4">
                    <div>
                        <label className="label-modern">Result Value / Parameter</label>
                        <input className="input-modern" value={resultData.resultValue} onChange={(e) => setResultData({ ...resultData, resultValue: e.target.value })} placeholder="e.g. 140 mg/dL" required />
                    </div>
                    <div>
                        <label className="label-modern">Clinical Notes / Diagnosis</label>
                        <textarea className="input-modern" value={resultData.resultNotes} onChange={(e) => setResultData({ ...resultData, resultNotes: e.target.value })} placeholder="Observations..." rows="3"></textarea>
                    </div>

                    {selectedRequest?.status !== 'Completed' && (
                        <Button type="submit" variant="success" className="w-full mt-4">Complete & Generate Report</Button>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default Lab;
