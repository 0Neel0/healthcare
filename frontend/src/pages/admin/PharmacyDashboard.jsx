import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle, Clock, FileText, AlertCircle, Plus, Package } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacyService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const PharmacyDashboard = () => {
    const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'stock'
    const [prescriptions, setPrescriptions] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Medicine Form
    const [newMed, setNewMed] = useState({
        name: '',
        stock: 0,
        unit: 'Tablets',
        expiryDate: '',
        batchNumber: '',
        sellingPrice: 0
    });

    useEffect(() => {
        if (activeTab === 'queue') {
            fetchPending();
        } else {
            fetchStock();
        }
    }, [activeTab]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const data = await pharmacyService.getPendingPrescriptions();
            setPrescriptions(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStock = async () => {
        setLoading(true);
        try {
            const data = await pharmacyService.getInventory();
            setStock(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async (prescription) => {
        if (!prescription) return;
        setProcessingId(prescription._id);

        try {
            const itemsToDispense = prescription.medications.map(med => {
                const qtyStr = med.quantity || "1";
                const qty = parseInt(qtyStr) || 1;
                return {
                    name: med.medicineName,
                    quantity: qty
                };
            });

            await pharmacyService.dispenseMedicines({
                prescriptionId: prescription._id,
                items: itemsToDispense
            });

            toast.success("Medicines dispensed & Billed!");
            setPrescriptions(prev => prev.filter(p => p._id !== prescription._id));

        } catch (error) {
            console.error("Dispense failed", error);
            toast.error(error.response?.data?.message || "Dispense Failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await pharmacyService.addMedicine(newMed);
            toast.success("Medicine added to inventory");
            setShowAddModal(false);
            fetchStock();
            setNewMed({ name: '', stock: 0, unit: 'Tablets', expiryDate: '', batchNumber: '', sellingPrice: 0 });
        } catch (error) {
            toast.error("Failed to add medicine");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Pill className="text-blue-600" /> Pharmacy Dashboard
                    </h1>
                    <p className="text-slate-500">Dispense medicines and manage prescriptions</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'queue' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('queue')}
                    >
                        Dispense Queue
                    </Button>
                    <Button
                        variant={activeTab === 'stock' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('stock')}
                    >
                        Medicine Stock
                    </Button>
                </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'queue' ? (
                <div className="grid gap-4">
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium w-fit mb-2">
                        <Clock size={16} /> Live Queue: {prescriptions.length} Pending
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading pending prescriptions...</div>
                    ) : prescriptions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
                            <p className="text-slate-500">No pending prescriptions to dispense.</p>
                        </div>
                    ) : (
                        prescriptions.map(p => (
                            <div key={p._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <FileText size={18} className="text-blue-500" />
                                                Prescription for {p.patientId?.name || "Unknown Patient"}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Prescribed by {p.doctorName} • {new Date(p.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="badge badge-warning gap-1">
                                            <Clock size={12} /> Pending
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medications</h4>
                                        {p.medications.map((med, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-800 flex items-center gap-2">
                                                    <Pill size={14} className="text-slate-400" /> {med.medicineName}
                                                </span>
                                                <span className="text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                                                    {med.dosage} x {med.frequency} ({med.duration})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-end min-w-[200px] border-l border-slate-100 pl-6 gap-2">
                                    <Button
                                        onClick={() => handleDispense(p)}
                                        disabled={processingId === p._id}
                                        className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {processingId === p._id ? "Processing..." : (
                                            <><CheckCircle size={18} className="mr-2" /> Dispense & Bill</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                            <Plus size={18} /> Add Medicine
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Unit</th>
                                    <th className="p-4">Batch</th>
                                    <th className="p-4">Expiry</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="p-6 text-center text-slate-400">Loading inventory...</td></tr>
                                ) : stock.length === 0 ? (
                                    <tr><td colSpan="7" className="p-6 text-center text-slate-400">No medicines found. Add some!</td></tr>
                                ) : (
                                    stock.map(item => (
                                        <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                                            <td className="p-4 font-mono">{item.stock}</td>
                                            <td className="p-4 text-sm text-slate-500">{item.unit}</td>
                                            <td className="p-4 text-sm font-mono text-slate-500">{item.batchNumber || '-'}</td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-4 font-bold text-slate-900">₹{item.sellingPrice}</td>
                                            <td className="p-4">
                                                {item.stock < 10 ? (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1">
                                                        <AlertCircle size={12} /> Low
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">In Stock</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Add Medicine Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Medicine">
                <form onSubmit={handleAddMedicine} className="space-y-4">
                    <div>
                        <label className="label-modern">Medicine Name</label>
                        <input
                            type="text" required className="input-modern"
                            value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Initial Stock</label>
                            <input
                                type="number" required className="input-modern"
                                value={newMed.stock} onChange={e => setNewMed({ ...newMed, stock: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="label-modern">Unit</label>
                            <select
                                className="input-modern"
                                value={newMed.unit} onChange={e => setNewMed({ ...newMed, unit: e.target.value })}
                            >
                                <option>Tablets</option>
                                <option>Bottles</option>
                                <option>Strips</option>
                                <option>Injections</option>
                                <option>Cream</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label-modern">Selling Price (₹)</label>
                        <input
                            type="number" required className="input-modern"
                            value={newMed.sellingPrice} onChange={e => setNewMed({ ...newMed, sellingPrice: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Batch Number</label>
                            <input
                                type="text" className="input-modern"
                                value={newMed.batchNumber} onChange={e => setNewMed({ ...newMed, batchNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label-modern">Expiry Date</label>
                            <input
                                type="date" required className="input-modern"
                                value={newMed.expiryDate} onChange={e => setNewMed({ ...newMed, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-4">Add to Inventory</Button>
                </form>
            </Modal>
        </div>
    );
};

export default PharmacyDashboard;
