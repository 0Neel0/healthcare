import React from 'react';

/**
 * Professional Status Badge Component
 * Medical-grade status indicators with clinical color coding
 */
const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = (status) => {
        const configs = {
            // Appointment statuses
            pending: {
                label: 'Pending Review',
                bg: 'bg-[#EAE6FF]',
                text: 'text-[#403294]',
                border: 'border-[#DFD8FD]',
                dot: 'bg-[#6554C0]'
            },
            pending_admin: {
                label: 'Pending Admin',
                bg: 'bg-[#EAE6FF]',
                text: 'text-[#403294]',
                border: 'border-[#DFD8FD]',
                dot: 'bg-[#6554C0]'
            },
            pending_doctor: {
                label: 'Action Required',
                bg: 'bg-[#FFFAE6]',
                text: 'text-[#974F0C]',
                border: 'border-[#FFC400]',
                dot: 'bg-[#FF991F]'
            },
            pending_payment: {
                label: 'Awaiting Payment',
                bg: 'bg-[#DEEBFF]',
                text: 'text-[#0747A6]',
                border: 'border-[#B3D4FF]',
                dot: 'bg-[#0065FF]'
            },
            scheduled: {
                label: 'Scheduled',
                bg: 'bg-[#E3FCEF]',
                text: 'text-[#006644]',
                border: 'border-[#ABF5D1]',
                dot: 'bg-[#00875A]'
            },
            completed: {
                label: 'Completed',
                bg: 'bg-[#DEEBFF]',
                text: 'text-[#0747A6]',
                border: 'border-[#B3D4FF]',
                dot: 'bg-[#0065FF]'
            },
            cancelled: {
                label: 'Cancelled',
                bg: 'bg-[#FFEBE6]',
                text: 'text-[#BF2600]',
                border: 'border-[#FFBDAD]',
                dot: 'bg-[#DE350B]'
            },
            // Medical priority statuses
            critical: {
                label: 'Critical',
                bg: 'bg-[#FFEBE6]',
                text: 'text-[#BF2600]',
                border: 'border-[#FF5630]',
                dot: 'bg-[#DE350B]'
            },
            urgent: {
                label: 'Urgent',
                bg: 'bg-[#FFFAE6]',
                text: 'text-[#974F0C]',
                border: 'border-[#FFC400]',
                dot: 'bg-[#FF991F]'
            },
            stable: {
                label: 'Stable',
                bg: 'bg-[#E3FCEF]',
                text: 'text-[#006644]',
                border: 'border-[#00875A]',
                dot: 'bg-[#00875A]'
            },
            // Generic statuses
            active: {
                label: 'Active',
                bg: 'bg-[#E3FCEF]',
                text: 'text-[#006644]',
                border: 'border-[#ABF5D1]',
                dot: 'bg-[#00875A]'
            },
            inactive: {
                label: 'Inactive',
                bg: 'bg-[#F4F5F7]',
                text: 'text-[#42526E]',
                border: 'border-[#DFE1E6]',
                dot: 'bg-[#7A869A]'
            }
        };

        return configs[status?.toLowerCase()] || configs.pending;
    };

    const config = getStatusConfig(status);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 rounded-full border font-semibold
            ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
        `}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
};

export default StatusBadge;
