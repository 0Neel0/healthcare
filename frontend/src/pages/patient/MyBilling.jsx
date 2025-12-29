import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { billingService } from '../../services/billingService';
import paymentService from '../../services/paymentService'; // Import payment service
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const MyBilling = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [payLoading, setPayLoading] = useState(false); // New loading state for payment
    const user = JSON.parse(localStorage.getItem('patientUser') || localStorage.getItem('user') || '{}');

    // Load Razorpay script on mount
    useEffect(() => {
        paymentService.loadRazorpayScript();
    }, []);

    const loadInvoices = async () => {
        if (!user._id) return;
        setLoading(true);
        try {
            const res = await billingService.getAllInvoices({ patientId: user._id });
            setInvoices(res.data);
        } catch (err) {
            console.error("Failed to load invoices", err);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [user._id]);

    const handlePay = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        setPayLoading(true);
        try {
            // 1. Create Order via Billing Service (which calls Payment Service)
            const order = await billingService.payBill(selectedInvoice._id, selectedInvoice.totalAmount);

            // 2. Open Razorpay Modal
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "HealthCare Plus",
                description: `Payment for Bill #${selectedInvoice._id.slice(-6).toUpperCase()}`,
                image: "https://via.placeholder.com/150",
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verification = await billingService.verifyBillPayment({
                            ...response,
                            billingId: selectedInvoice._id
                        });

                        if (verification.success) {
                            toast.success('Payment successful!');
                            setShowPayModal(false);
                            loadInvoices(); // Refresh list to show Paid
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        toast.error('Payment verification failed');
                        console.error(err);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#0052CC"
                },
                modal: {
                    ondismiss: function () {
                        toast('Payment cancelled');
                        setPayLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

            // Note: We don't setPayLoading(false) here immediately because we wait for user action in modal
            // But we can reset it if we want the "Processing" text to go away while they browse the modal.
            // Usually keeping it is fine or setting it false. Let's set it false to allow re-clicks if needed
            // though the modal is open.
            setPayLoading(false);

        } catch (err) {
            console.error('Payment initialization failed:', err);
            toast.error('Could not initiate payment');
            setPayLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState('unpaid');

    const pendingBills = invoices.filter(inv => inv.paymentStatus === 'Pending');
    const historyBills = invoices.filter(inv => inv.paymentStatus === 'Paid');

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">My Billing & Payments</h1>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'unpaid'
                        ? 'border-b-2 border-brand-500 text-brand-600'
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Unpaid Bills ({pendingBills.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'history'
                        ? 'border-b-2 border-brand-500 text-brand-600'
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Payment History
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-10 h-10 border-4 border-medical-blue-200 border-t-medical-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {activeTab === 'unpaid' ? (
                        pendingBills.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-slate-500">You have no pending bills. Great job!</p>
                            </div>
                        ) : (
                            pendingBills.map((inv) => (
                                <InvoiceCard key={inv._id} inv={inv} onPay={() => { setSelectedInvoice(inv); setShowPayModal(true); }} />
                            ))
                        )
                    ) : (
                        historyBills.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No payment history found.</p>
                            </div>
                        ) : (
                            historyBills.map((inv) => (
                                <InvoiceCard key={inv._id} inv={inv} />
                            ))
                        )
                    )}
                </div>
            )}

            {/* Pay Modal */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Secure Payment">
                <form onSubmit={handlePay} className="space-y-6">
                    <div className="text-center p-6 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 mb-1">Total Amount</p>
                        <p className="text-4xl font-bold text-slate-900">₹{selectedInvoice?.totalAmount}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-200">
                        Proceed to pay securely via Razorpay. Supported methods: UPI, Cards, Netbanking.
                    </div>

                    <Button type="submit" variant="success" className="w-full text-lg py-3" disabled={payLoading}>
                        {payLoading ? 'Processing...' : 'Proceed to Pay'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

const InvoiceCard = ({ inv, onPay }) => (
    <Card className="border border-slate-200 relative overflow-hidden transition-all hover:shadow-md">
        {/* Status Strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${inv.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-slate-400">#{inv._id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">₹{inv.totalAmount}</h3>
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
                        onClick={onPay}
                        className="flex items-center gap-2"
                    >
                        <CreditCard size={18} /> Pay Now
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        {inv.transactionId && (
                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">Ref: {inv.transactionId.slice(-8)}</span>
                        )}
                        <Button variant="ghost" className="flex items-center gap-2 text-green-600 bg-green-50" disabled>
                            <CheckCircle size={18} /> Paid
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </Card>
);

export default MyBilling;
