import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Activity,
    Settings,
    CreditCard,
    LogOut,
    Sparkles,
    MessageSquare
} from 'lucide-react';
import Logo from '../ui/Logo';
import toast from 'react-hot-toast';

const PatientSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all data
        localStorage.clear();

        toast.success('Logged out successfully!');

        setTimeout(() => {
            navigate('/login', { replace: true });
        }, 100);
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
        { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
        { icon: FileText, label: 'Medical Records', path: '/patient/emr' },
        { icon: Activity, label: 'Lab Reports', path: '/patient/lab' },
        { icon: Sparkles, label: 'Summarizer', path: '/patient/summarize' },
        { icon: MessageSquare, label: 'Ask ChatBot', path: '/patient/qa' },
        { icon: CreditCard, label: 'Billing', path: '/patient/billing' },
        { icon: Settings, label: 'Settings', path: '/patient/profile' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto z-50 hidden lg:block">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center">
                <Logo className="w-10 h-10" textClassName="text-2xl" />
                <p className="text-xs text-slate-500 mt-2 font-medium tracking-wider uppercase">Patient Portal</p>
            </div>

            <nav className="p-4 space-y-1">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        end={item.path === '/patient/dashboard'}
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
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default PatientSidebar;
