import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, FileText, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { billingService } from '../../services/billingService';

const Billing = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Form data
    const [newInvoice, setNewInvoice] = useState({
        patientId: '',
        totalAmount: 0,
        services: [{ name: 'Consultation Fee', cost: 500, quantity: 1 }]
    });

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const res = await billingService.getAllInvoices();
            setInvoices(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadInvoices();
    }, []);

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            await billingService.createInvoice({
                ...newInvoice,
                // Ensure total amount is calculated if not manual
                totalAmount: newInvoice.services.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0)
            });
            setShowCreateModal(false);
            loadInvoices();
        } catch (e) {
            alert('Failed to create invoice');
        }
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        try {
            await billingService.updatePayment(selectedInvoice._id, {
                paymentStatus: 'Paid',
                paymentMethod: e.target.method.value,
                transactionId: 'TXN-' + Math.floor(Math.random() * 10000)
            });
            setShowPaymentModal(false);
            loadInvoices();
        } catch (e) {
            alert('Payment failed');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1>
                    <p className="text-slate-500">Invoicing and Financial Records</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> Generate Bill
                </Button>
            </div>

            <div className="glass-effect rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Invoice ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Patient</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8 text-slate-500">Loading invoices...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-slate-500">No invoices found</td></tr>
                        ) : (
                            invoices.map(inv => (
                                <tr key={inv._id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">#{inv._id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{inv.patientId?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">${inv.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {inv.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {inv.paymentStatus === 'Pending' ? (
                                            <Button size="sm" variant="success" onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}>
                                                <CreditCard size={14} className="mr-1" /> Pay
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="text-slate-500">
                                                <Download size={14} className="mr-1" /> Receipt
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Invoice Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Generate New Invoice">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div>
                        <label className="label-modern">Patient ID</label>
                        <input className="input-modern" value={newInvoice.patientId} onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })} placeholder="Patient Object ID" required />
                    </div>
                    <div>
                        <label className="label-modern">Service Name</label>
                        <input className="input-modern" value={newInvoice.services[0].name} onChange={(e) => {
                            const newServices = [...newInvoice.services];
                            newServices[0].name = e.target.value;
                            setNewInvoice({ ...newInvoice, services: newServices });
                        }} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Cost</label>
                            <input type="number" className="input-modern" value={newInvoice.services[0].cost} onChange={(e) => {
                                const newServices = [...newInvoice.services];
                                newServices[0].cost = parseInt(e.target.value);
                                setNewInvoice({ ...newInvoice, services: newServices });
                            }} required />
                        </div>
                        <div>
                            <label className="label-modern">Quantity</label>
                            <input type="number" className="input-modern" value={newInvoice.services[0].quantity} onChange={(e) => {
                                const newServices = [...newInvoice.services];
                                newServices[0].quantity = parseInt(e.target.value);
                                setNewInvoice({ ...newInvoice, services: newServices });
                            }} required />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-4">Generate Invoice</Button>
                </form>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Process Payment">
                <form onSubmit={handleProcessPayment} className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl text-center mb-4">
                        <p className="text-sm text-slate-500">Total Payable Amount</p>
                        <p className="text-3xl font-bold text-slate-900">${selectedInvoice?.totalAmount}</p>
                    </div>
                    <div>
                        <label className="label-modern">Payment Method</label>
                        <select name="method" className="input-modern">
                            <option value="Cash">Cash</option>
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Online">Online Transfer</option>
                        </select>
                    </div>
                    <Button type="submit" variant="success" className="w-full mt-4">Confirm Payment</Button>
                </form>
            </Modal>
        </div>
    );
};

export default Billing;
