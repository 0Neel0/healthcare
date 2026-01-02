import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Package,
    CreditCard,
    FileText,
    Activity,
    BedDouble,
    UserCog,
    BarChart3,
    LogOut,
    Droplet,
    Pill,
    TrendingUp,
    Shield
} from 'lucide-react';
import Logo from '../ui/Logo';
import toast from 'react-hot-toast';

const Sidebar = () => {
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
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
        { icon: Activity, label: 'Operation Theater', path: '/admin/ot' },
        { icon: Droplet, label: 'Blood Bank', path: '/admin/blood-bank' },
        { icon: Pill, label: 'Pharmacy', path: '/admin/pharmacy' },
        { icon: Users, label: 'Patients', path: '/admin/patients' },
        { icon: UserCog, label: 'Doctors', path: '/admin/doctors' },
        { icon: Package, label: 'Inventory', path: '/admin/inventory' },
        { icon: CreditCard, label: 'Billing', path: '/admin/billing' },
        { icon: FileText, label: 'EMR / Clinical', path: '/admin/emr' },
        { icon: Activity, label: 'Laboratory', path: '/admin/lab' },
        { icon: BedDouble, label: 'Wards', path: '/admin/wards' },
        { icon: BedDouble, label: 'Ward Map', path: '/admin/wards-map' },
        { icon: Users, label: 'Staff', path: '/admin/staff' },
        { icon: Calendar, label: 'Staff Roster', path: '/admin/staff-roster' },
        { icon: TrendingUp, label: 'AI Analytics', path: '/admin/ai-analytics' },
        { icon: Shield, label: 'Insurance', path: '/admin/insurance' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto z-50 hidden lg:block">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center">
                <Logo className="w-10 h-10" textClassName="text-2xl" />
                <p className="text-xs text-slate-500 mt-2 font-medium tracking-wider uppercase">Admin Portal</p>
            </div>

            <nav className="p-4 space-y-1">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        end={item.path === '/admin'}
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

export default Sidebar;
