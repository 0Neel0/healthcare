import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Activity,
    CreditCard,
    User,
    LogOut
} from 'lucide-react';

const PatientSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('patientToken');
            localStorage.removeItem('patientUser');
            navigate('/login');
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
        { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/patient/emr' },
        { icon: Activity, label: 'Lab Reports', path: '/patient/lab' },
        { icon: CreditCard, label: 'Billing', path: '/patient/billing' },
        { icon: User, label: 'Profile', path: '/patient/profile' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto z-[100] hidden md:block">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-gradient">HealthCare+</h2>
                <p className="text-xs text-slate-500 mt-1">Patient Portal</p>
            </div>

            <nav className="p-4 space-y-1">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <item.icon size={20} className="stroke-[2px]" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default PatientSidebar;
