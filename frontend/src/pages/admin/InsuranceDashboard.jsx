import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, XCircle, AlertCircle, DollarSign, Filter, Search, ChevronRight, Clock, Activity, CreditCard } from 'lucide-react';
import insuranceService from '../../services/insuranceService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const InsuranceDashboard = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [processModal, setProcessModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Process Form
    const [processData, setProcessData] = useState({
        status: 'Approved',
        approvedAmount: 0,
        adminNotes: ''
    });

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const data = await insuranceService.getAllClaims(statusFilter);
            setClaims(data);
        } catch (error) {
            toast.error("Failed to fetch claims");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (e) => {
        e.preventDefault();
        try {
            await insuranceService.updateClaimStatus(selectedClaim._id, processData);
            toast.success(`Claim ${processData.status} Successfully`);
            setProcessModal(false);
            fetchClaims();
        } catch (error) {
            toast.error("Process failed");
        }
    };

    const openProcessModal = (claim) => {
        setSelectedClaim(claim);
        setProcessData({
            status: 'Approved',
            approvedAmount: claim.claimAmount,
            adminNotes: ''
        });
        setProcessModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Partially Approved': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    // Stats
    const totalClaims = claims.length;
    const pendingAmount = claims.filter(c => c.status === 'Pending').reduce((acc, c) => acc + c.claimAmount, 0);
    const approvedAmount = claims.filter(c => c.status === 'Approved' || c.status === 'Partially Approved').reduce((acc, c) => acc + (c.approvedAmount || 0), 0);

    // Filter Logic
    const filteredClaims = claims.filter(c =>
        c.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.providerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-100/30 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Shield className="text-indigo-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Insurance & TPA</h1>
                        <p className="text-slate-500 font-medium">Claims Processing Center</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText size={24} />
                        </div>
                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">ALL TIME</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-slate-900">{totalClaims}</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Total Claims Filed</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">ACTION NEEDED</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-slate-900">₹{pendingAmount.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Pending Approval</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">SETTLED</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-emerald-600">₹{approvedAmount.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Total Approved</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                    {['', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex-1 md:flex-none ${statusFilter === tab
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab || 'All Claims'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96 px-2">
                    <Search className="absolute left-5 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Patient, ID, or Provider..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 rounded-xl outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-slide-up">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="p-5 pl-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Details</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Provider & Policy</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="p-5 pr-8 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-12 text-center text-slate-400">Loading claims data...</td></tr>
                        ) : filteredClaims.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-60">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Shield size={32} />
                                        </div>
                                        <p className="text-slate-500 font-medium">No claims match your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredClaims.map(claim => (
                                <tr key={claim._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                {claim.patient?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{claim.patient?.name || 'Unknown Patient'}</div>
                                                <div className="text-xs font-mono text-slate-400 mt-0.5">#{claim._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <Shield size={12} className="text-slate-400" /> {claim.providerName}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono mt-1 opacity-80">{claim.policyNumber}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-black text-slate-900">₹{claim.claimAmount.toLocaleString()}</div>
                                        {claim.approvedAmount > 0 && (
                                            <div className="text-xs text-emerald-600 font-medium mt-0.5">Approved: ₹{claim.approvedAmount.toLocaleString()}</div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(claim.status)}`}>
                                            {claim.status === 'Approved' && <CheckCircle size={12} />}
                                            {claim.status === 'Rejected' && <XCircle size={12} />}
                                            {claim.status === 'Pending' && <Clock size={12} />}
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        {claim.status === 'Pending' ? (
                                            <Button size="sm" onClick={() => openProcessModal(claim)} className="shadow-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                                Process Claim
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" disabled className="opacity-50 cursor-not-allowed">
                                                View Details
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Process Modal */}
            <Modal isOpen={processModal} onClose={() => setProcessModal(false)} title="Process Insurance Claim">
                <form onSubmit={handleProcess} className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claim ID</span>
                            <span className="font-mono font-bold text-slate-600">#{selectedClaim?._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500">Claimed Amount</span>
                            <span className="font-black text-xl text-slate-900">₹{selectedClaim?.claimAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500">Provider</span>
                            <span className="font-bold text-indigo-600 flex items-center gap-2">
                                <Shield size={14} /> {selectedClaim?.providerName}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Decision</label>
                            <select
                                className="input-modern"
                                value={processData.status}
                                onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                            >
                                <option>Approved</option>
                                <option>Rejected</option>
                                <option>Partially Approved</option>
                                <option>Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-modern">Approved Amount (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    className={`input-modern pl-7 font-bold ${processData.status === 'Rejected' ? 'opacity-50' : ''}`}
                                    value={processData.approvedAmount}
                                    onChange={(e) => setProcessData({ ...processData, approvedAmount: props => parseFloat(e.target.value) || 0 })}
                                    disabled={processData.status === 'Rejected'}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label-modern">Admin Notes / Rejection Reason</label>
                        <textarea
                            className="input-modern h-24 resize-none"
                            placeholder="Enter remarks for the audit trail..."
                            value={processData.adminNotes}
                            onChange={(e) => setProcessData({ ...processData, adminNotes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setProcessModal(false)} className="flex-1 py-3">Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1 py-3 shadow-lg shadow-indigo-200">
                            Submit Decision
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InsuranceDashboard;
