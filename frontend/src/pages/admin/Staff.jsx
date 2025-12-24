import React from 'react';

const Staff = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-slate-500">Manage employees, doctors, and nurses</p>
                </div>
                <button className="btn-gradient px-4 py-2 rounded-lg">Add Staff</button>
            </div>

            <div className="glass-effect rounded-2xl p-6">
                <p className="text-slate-500 text-center py-12">Staff List will appear here...</p>
            </div>
        </div>
    );
};

export default Staff;
