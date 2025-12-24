import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Reusing existing Header but checking if it fits context

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="lg:ml-64 min-h-screen transition-all duration-300">
                {/* Mobile Header could go here */}
                <main className="p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
