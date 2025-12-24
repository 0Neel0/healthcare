import React from 'react';
import { Outlet } from 'react-router-dom';
import PatientSidebar from './PatientSidebar';
import Header from './Header'; // Reusing Header (it handles patient state well)

const PatientLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header /> {/* Top Header (Mobile menu + User Status) */}
            <PatientSidebar /> {/* Side Navigation (Desktop) */}

            <main className="md:ml-64 p-6 pt-24 min-h-screen">
                {/* pt-24 accounts for the fixed header height */}
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default PatientLayout;
