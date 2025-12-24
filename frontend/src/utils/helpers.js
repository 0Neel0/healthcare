export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return `${formatDate(date)} at ${formatTime(date)}`;
};

export const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'scheduled':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'cancelled':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
};

export const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
        case 'scheduled':
            return '✓';
        case 'pending':
            return '⏱';
        case 'cancelled':
            return '✕';
        default:
            return '•';
    }
};
