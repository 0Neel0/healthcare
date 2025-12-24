import React from 'react';

const Doctors = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
                    <p className="text-slate-500">Manage doctor profiles and schedules</p>
                </div>
                <button className="btn-gradient px-4 py-2 rounded-lg">Add Doctor</button>
            </div>

            <div className="glass-effect rounded-2xl p-6">
                <p className="text-slate-500 text-center py-12">Doctor List will appear here...</p>
            </div>
        </div>
    );
};

export default Doctors;
