import React, { useState, useEffect } from 'react';
import { Droplet, UserPlus, Plus, Activity, CheckCircle, AlertCircle, Heart, Search, Calendar, Phone, Filter } from 'lucide-react';
import { criticalCareService } from '../../services/criticalCareService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const BloodBank = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'donors'
    const [inventory, setInventory] = useState({ stock: [], stats: [] });
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showDonorModal, setShowDonorModal] = useState(false);
    const [showAddBagModal, setShowAddBagModal] = useState(false);

    // Forms
    const [newDonor, setNewDonor] = useState({ name: '', bloodGroup: 'O+', age: '', contact: '', gender: 'Male' });
    const [newBag, setNewBag] = useState({ bloodGroup: 'O+', component: 'Whole Blood', quantity: 1 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [inventoryData, donorsList] = await Promise.all([
                criticalCareService.getBloodInventory(),
                criticalCareService.getDonors()
            ]);
            setInventory(inventoryData || { stock: [], stats: [] });
            setDonors(donorsList || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Blood Bank data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDonor = async (e) => {
        e.preventDefault();
        try {
            await criticalCareService.addDonor(newDonor);
            toast.success("Donor added successfully");
            setShowDonorModal(false);
            fetchData();
            setNewDonor({ name: '', bloodGroup: 'O+', age: '', contact: '', gender: 'Male' });
        } catch (error) {
            toast.error("Failed to add donor");
        }
    };

    const handleAddBag = async (e) => {
        e.preventDefault();
        try {
            await criticalCareService.addBloodBag(newBag);
            toast.success("Blood bag added to stock");
            setShowAddBagModal(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to add blood bag");
        }
    };

    const handleIssueBag = async (bagId) => {
        if (!confirm("Are you sure you want to issue this unit? It will be removed from available stock.")) return;
        try {
            await criticalCareService.updateBagStatus(bagId, 'Used');
            toast.success("Blood bag issued successfully");
            fetchData();
        } catch (error) {
            toast.error("Issue failed");
        }
    };

    const getStockForGroup = (group) => {
        if (!inventory.stats) return 0;
        const stat = inventory.stats.find(s => s._id === group);
        return stat ? stat.count : 0;
    };

    // Filter logic
    const filteredStock = inventory.stock.filter(bag =>
        bag.bagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bag.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDonors = donors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-50 to-white p-6 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-100/30 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Droplet className="text-red-600 animate-pulse-slow" size={32} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blood Bank Center</h1>
                        <p className="text-slate-500 font-medium">Critical Care & Inventory Management</p>
                    </div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('donors')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'donors' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Donors Registry
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Switch */}
            {activeTab === 'inventory' ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => {
                            const count = getStockForGroup(group);
                            const isLow = count < 5;
                            const isCritical = count === 0;

                            return (
                                <div key={group} className={`
                                    relative p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg
                                    ${isCritical ? 'bg-red-50 border-red-200' : isLow ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}
                                `}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-2xl font-black ${isCritical ? 'text-red-700' : 'text-slate-700'}`}>{group}</span>
                                        {isLow && (
                                            <div className="animate-pulse bg-red-200 text-red-800 p-1.5 rounded-full">
                                                <AlertCircle size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-4xl font-bold ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{count}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase mb-1.5">Units</span>
                                    </div>
                                    <div className={`mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden`}>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(count * 10, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action & Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID or Blood Group..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setShowAddBagModal(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
                            <div className="bg-white/20 p-1 rounded-md"><Plus size={14} /></div> Add Unit
                        </Button>
                    </div>

                    {/* Available Bags Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                                    <tr>
                                        <th className="p-4 pl-6">Bag ID</th>
                                        <th className="p-4">Blood Group</th>
                                        <th className="p-4">Component</th>
                                        <th className="p-4">Expiry Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-12 text-center text-slate-400">Loading inventory...</td></tr>
                                    ) : filteredStock.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                        <Droplet size={24} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">No matching blood units found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStock.map(bag => (
                                            <tr key={bag._id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                                        #{bag.bagNumber}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1.5 font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-sm">
                                                        <Droplet size={12} fill="currentColor" /> {bag.bloodGroup}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-slate-700">{bag.component}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Calendar size={14} />
                                                        {bag.expiryDate ? new Date(bag.expiryDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                                        <CheckCircle size={12} /> Available
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="sm" variant="danger" onClick={() => handleIssueBag(bag._id)} className="shadow-sm">
                                                        Issue Unit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Donors..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => setShowDonorModal(true)} className="flex items-center gap-2 bg-brand-600 text-white shadow-lg shadow-brand-200">
                            <UserPlus size={18} /> Register New Donor
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDonors.map(donor => (
                            <div key={donor._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            {donor.gender === 'Male' ? 'M' : 'F'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 line-clamp-1">{donor.name}</h3>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Activity size={12} /> Age: {donor.age}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-black text-white bg-red-500 px-3 py-1 rounded-lg text-sm shadow-red-200 shadow-md">
                                        {donor.bloodGroup}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Phone size={14} />
                                        </div>
                                        {donor.contact}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Calendar size={14} />
                                        </div>
                                        <span className={!donor.lastDonationDate ? "text-slate-400 italic" : ""}>
                                            Last: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never Donated'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Donor Modal */}
            <Modal isOpen={showDonorModal} onClose={() => setShowDonorModal(false)} title="Register New Donor">
                <form onSubmit={handleAddDonor} className="space-y-5">
                    <div>
                        <label className="label-modern">Full Name <span className="text-red-500">*</span></label>
                        <input
                            type="text" required className="input-modern" placeholder="e.g. John Doe"
                            value={newDonor.name} onChange={e => setNewDonor({ ...newDonor, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Blood Group <span className="text-red-500">*</span></label>
                            <select
                                className="input-modern"
                                value={newDonor.bloodGroup} onChange={e => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-modern">Age <span className="text-red-500">*</span></label>
                            <input
                                type="number" required className="input-modern" placeholder="Years"
                                value={newDonor.age} onChange={e => setNewDonor({ ...newDonor, age: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Gender</label>
                            <select
                                className="input-modern"
                                value={newDonor.gender} onChange={e => setNewDonor({ ...newDonor, gender: e.target.value })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-modern">Contact <span className="text-red-500">*</span></label>
                            <input
                                type="text" required className="input-modern" placeholder="+91..."
                                value={newDonor.contact} onChange={e => setNewDonor({ ...newDonor, contact: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-2">
                        <UserPlus size={18} className="mr-2" /> Register Donor
                    </Button>
                </form>
            </Modal>

            {/* Add Bag Modal */}
            <Modal isOpen={showAddBagModal} onClose={() => setShowAddBagModal(false)} title="Add Blood Inventory">
                <form onSubmit={handleAddBag} className="space-y-5">
                    <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                        <Activity className="text-blue-600 mt-1 shrink-0" size={18} />
                        <p className="text-sm text-blue-800">Ensure the blood bag is properly labeled and tested before adding to inventory.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Blood Group</label>
                            <select
                                className="input-modern font-bold text-slate-700"
                                value={newBag.bloodGroup} onChange={e => setNewBag({ ...newBag, bloodGroup: e.target.value })}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-modern">Component</label>
                            <select
                                className="input-modern"
                                value={newBag.component}
                                onChange={e => setNewBag({ ...newBag, component: e.target.value })}
                            >
                                <option>Whole Blood</option>
                                <option>Plasma</option>
                                <option>Platelets</option>
                                <option>RBC</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label-modern">Received From</label>
                        <div className="flex gap-2">
                            <span className="shrink-0 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm flex items-center">External Camp</span>
                            <span className="shrink-0 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm flex items-center border border-slate-900 shadow-sm">In-House</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 pl-1">Currently defaulting to In-House collection.</p>
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle size={18} className="mr-2" /> Confirm Addition
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default BloodBank;
