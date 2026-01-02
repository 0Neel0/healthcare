import React, { useState, useEffect } from 'react';
import { Shield, FileText, Activity } from 'lucide-react';
import insuranceService from '../../services/insuranceService';
import toast from 'react-hot-toast';

const MyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Patient ID connection - In real app, get from Context/LocalStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const patientId = user?.id || user?._id;

    useEffect(() => {
        if (patientId) {
            fetchMyClaims();
        }
    }, [patientId]);

    const fetchMyClaims = async () => {
        try {
            setLoading(true);
            // We need to modify the service to accept patientId or the API does it automatically based on Token
            // Since we added patientId filter to API, let's use it
            // Note: In a secured API, we would rely on req.user, but we are using query params for MVP
            const data = await insuranceService.getAllClaims(null, patientId);
            setClaims(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch insurance claims");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="text-indigo-600" /> My Insurance Claims
                </h1>
                <p className="text-slate-500">Track the status of your medical insurance claims</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-400">Loading claims...</div>
            ) : claims.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No Claims Found</h3>
                    <p className="text-slate-500">You haven't filed any insurance claims yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {claims.map(claim => (
                        <div key={claim._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-full h-fit ${getStatusColor(claim.status)}`}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900">{claim.providerName}</h3>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">#{claim.policyNumber}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{claim.diagnosis}</p>
                                    <p className="text-xs text-slate-400">Submitted: {new Date(claim.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center min-w-[120px]">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize mb-2 ${getStatusColor(claim.status)}`}>
                                    {claim.status}
                                </span>
                                <span className="text-lg font-black text-slate-900">₹{claim.claimAmount.toLocaleString()}</span>
                                {claim.approvedAmount > 0 && (
                                    <span className="text-xs text-green-600 font-bold">Approved: ₹{claim.approvedAmount.toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClaims;
