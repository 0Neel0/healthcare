import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, TrendingUp, IndianRupee, Users } from 'lucide-react';

const Reports = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await api.get('/reports/revenue');
                setRevenueData(response.data);
            } catch (error) {
                console.error('Error fetching revenue:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Report Data...</div>;

    const { summary, doctorStats } = revenueData || {};

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
                    <p className="text-slate-500 font-medium">Hospital Revenue and Doctor Payouts</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
                    <p className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
                        <CreditCard size={20} /> Total Gross Revenue
                    </p>
                    <h3 className="text-4xl font-bold">₹{summary?.totalRevenue?.toLocaleString()}</h3>
                    <p className="text-sm text-indigo-100 mt-2 opacity-80">Total processed via appointments</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <p className="flex items-center gap-2 text-emerald-600 font-bold mb-2 uppercase text-xs tracking-wider">
                        <TrendingUp size={18} /> Admin Revenue (50%)
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{summary?.totalAdminShare?.toLocaleString()}</h3>
                    <p className="text-sm text-slate-500 mt-2">Platform earnings</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <p className="flex items-center gap-2 text-blue-600 font-bold mb-2 uppercase text-xs tracking-wider">
                        <Users size={18} /> Doctor Payouts (50%)
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900">₹{summary?.totalDoctorShare?.toLocaleString()}</h3>
                    <p className="text-sm text-slate-500 mt-2">Dispersed to doctors</p>
                </div>
            </div>

            {/* Doctor Breakdown Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Doctor Earnings Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-8 py-4">Doctor Name</th>
                                <th className="px-8 py-4">Appointments</th>
                                <th className="px-8 py-4">Total Collected</th>
                                <th className="px-8 py-4 text-emerald-600">Admin Share</th>
                                <th className="px-8 py-4 text-blue-600">Doctor Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {doctorStats?.map((doc, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4 font-bold text-slate-900">{doc.doctorName}</td>
                                    <td className="px-8 py-4 text-slate-600">{doc.appointmentCount}</td>
                                    <td className="px-8 py-4 text-slate-900 font-medium">₹{doc.totalCollected.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-emerald-700 font-bold bg-emerald-50/30">₹{doc.adminShare.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-blue-700 font-bold bg-blue-50/30">₹{doc.doctorShare.toLocaleString()}</td>
                                </tr>
                            ))}
                            {doctorStats?.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 italic">No revenue data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
