import React from 'react';
import { formatDateTime, getStatusColor, getStatusIcon } from '../../utils/helpers';

const StatsCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
    const colorClasses = {
        blue: 'from-brand-500 to-brand-600 shadow-brand-500/30',
        green: 'from-accent-500 to-accent-600 shadow-accent-500/30',
        yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-500/30',
        red: 'from-red-500 to-red-600 shadow-red-500/30',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    };

    return (
        <div className="glass-effect rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                    <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
                    {trend && (
                        <p className="text-sm text-gray-500">{trend}</p>
                    )}
                </div>
                <div className={`p-4 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
