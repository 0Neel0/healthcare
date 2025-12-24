import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { billingService } from '../../services/billingService';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const MyBilling = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');

    const loadInvoices = async () => {
        if (!user._id) return;
        setLoading(true);
        try {
            const res = await billingService.getAllInvoices({ patientId: user._id });
            setInvoices(res.data);
        } catch (err) {
            console.error("Failed to load invoices", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [user._id]);

    const handlePay = async (e) => {
        e.preventDefault();
        // Simulate Payment
        try {
            await billingService.updatePayment(selectedInvoice._id, {
                paymentStatus: 'Paid',
                paymentMethod: 'Online',
                transactionId: 'TXN-' + Date.now()
            });
            setShowPayModal(false);
            loadInvoices(); // Refresh
            alert('Payment Successful!');
        } catch (err) {
            alert('Payment failed');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">My Billing & Payments</h1>

            {loading ? (
                <p className="text-center text-slate-500">Loading billing info...</p>
            ) : invoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No invoices found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {invoices.map((inv) => (
                        <Card key={inv._id} className="border border-slate-200 relative overflow-hidden">
                            {/* Status Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${inv.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />

                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm text-slate-400">#{inv._id.slice(-6).toUpperCase()}</span>
                                        <span className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <h3 className="text-2xl font-bold text-slate-900">${inv.totalAmount}</h3>
                                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full mb-1 ${inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                        {inv.services.map((s, i) => (
                                            <span key={i} className="mr-2">• {s.name} (x{s.quantity})</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    {inv.paymentStatus === 'Pending' ? (
                                        <Button
                                            variant="primary"
                                            onClick={() => { setSelectedInvoice(inv); setShowPayModal(true); }}
                                            className="flex items-center gap-2"
                                        >
                                            <CreditCard size={18} /> Pay Now
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="flex items-center gap-2 text-slate-500">
                                            <Download size={18} /> Receipt
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pay Modal */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Secure Payment">
                <form onSubmit={handlePay} className="space-y-6">
                    <div className="text-center p-6 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 mb-1">Total Amount</p>
                        <p className="text-4xl font-bold text-slate-900">${selectedInvoice?.totalAmount}</p>
                    </div>

                    <div>
                        <label className="label-modern">Card Details (Mock)</label>
                        <div className="p-3 border rounded-xl bg-white flex items-center gap-3">
                            <CreditCard className="text-slate-400" />
                            <input className="outline-none w-full" placeholder="0000 0000 0000 0000" disabled />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            * This is a demo environment. No real money will be deducted.
                        </p>
                    </div>

                    <Button type="submit" variant="success" className="w-full">
                        Confirm Payment
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default MyBilling;
