import React from 'react';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

const RevenueChart = ({ stats, period }) => {
    if (!stats || !stats.data) {
        return (
            <div className="text-center py-8 text-[#7A869A]">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available</p>
            </div>
        );
    }

    const { totalEarnings, consultationCount, averageEarning, earnings } = stats.data;

    // Simple bar chart visualization
    const maxEarning = Math.max(...earnings.map(e => e.amount || 0), 1);

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#E3FCEF] border border-[#ABF5D1] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={16} className="text-[#00875A]" />
                        <span className="text-xs font-semibold text-[#7A869A] uppercase">Total Earnings</span>
                    </div>
                    <p className="text-xl font-bold text-[#006644]">₹{totalEarnings.toLocaleString()}</p>
                </div>

                <div className="bg-[#DEEBFF] border border-[#B3D4FF] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={16} className="text-[#0052CC]" />
                        <span className="text-xs font-semibold text-[#7A869A] uppercase">Consultations</span>
                    </div>
                    <p className="text-xl font-bold text-[#0052CC]">{consultationCount}</p>
                </div>

                <div className="bg-[#EAE6FF] border border-[#C0B6F2] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={16} className="text-[#6554C0]" />
                        <span className="text-xs font-semibold text-[#7A869A] uppercase">Avg/Consult</span>
                    </div>
                    <p className="text-xl font-bold text-[#6554C0]">₹{Math.round(averageEarning)}</p>
                </div>
            </div>

            {/* Simple Bar Chart */}
            {earnings.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-[#7A869A] uppercase tracking-wider mb-3">
                        Earnings Over Time ({period})
                    </h4>
                    <div className="bg-white border border-[#DFE1E6] rounded-lg p-4">
                        <div className="space-y-2">
                            {earnings.slice(-10).reverse().map((earning, index) => {
                                const percentage = (earning.amount / maxEarning) * 100;

                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="text-xs text-[#7A869A] w-20 flex-shrink-0">
                                            {new Date(earning.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <div className="flex-1 bg-[#F4F5F7] rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[#0052CC] to-[#0065FF] h-full flex items-center justify-end px-2 transition-all duration-500"
                                                style={{ width: `${Math.max(percentage, 5)}%` }}
                                            >
                                                {percentage > 20 && (
                                                    <span className="text-xs font-semibold text-white">
                                                        ₹{earning.amount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {percentage <= 20 && (
                                            <span className="text-xs font-semibold text-[#253858] w-16 text-right">
                                                ₹{earning.amount}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Period Selector Info */}
            <div className="bg-[#F4F5F7] rounded-lg p-3 text-center">
                <p className="text-xs text-[#7A869A]">
                    Showing data for the past <strong className="text-[#253858]">{period}</strong>
                </p>
            </div>
        </div>
    );
};

export default RevenueChart;
