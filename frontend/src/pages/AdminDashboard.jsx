import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { appointmentService } from '../services/appointmentService';
import PasskeyModal from '../components/admin/PasskeyModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const passkey = localStorage.getItem('adminPasskey');
            if (!passkey) {
                // Wait for modal to handle it, don't fetch yet
                setLoading(false);
                return;
            }

            const [statsData, appointmentsData] = await Promise.all([
                appointmentService.getAppointmentStats(),
                appointmentService.getAppointments(1, 50)
            ]);

            setStats(statsData);
            setAppointments(appointmentsData.appointments || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'patient',
            label: 'Patient',
            render: (patient) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#253858]">{patient?.name || 'N/A'}</span>
                    <span className="text-xs text-[#7A869A]">{patient?.email}</span>
                </div>
            )
        },
        {
            key: 'primaryPhysician',
            label: 'Doctor',
            render: (doctor) => (
                <span className="font-medium text-[#42526E]">{doctor}</span>
            )
        },
        {
            key: 'schedule',
            label: 'Appointment Time',
            render: (schedule) => (
                <div className="flex flex-col">
                    <span className="font-medium text-[#253858]">
                        {new Date(schedule).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-[#7A869A]">
                        {new Date(schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} size="sm" />
        },
        {
            key: 'reason',
            label: 'Reason',
            render: (reason) => (
                <span className="text-sm text-[#42526E] truncate max-w-xs block">
                    {reason || 'N/A'}
                </span>
            ),
            sortable: false
        }
    ];

    const statCards = [
        {
            title: 'Total Appointments',
            value: stats?.total || 0,
            icon: Calendar,
            color: 'bg-[#DEEBFF]',
            iconColor: 'text-[#0052CC]',
            trend: '+12%'
        },
        {
            title: 'Scheduled',
            value: stats?.scheduled || 0,
            icon: CheckCircle,
            color: 'bg-[#E3FCEF]',
            iconColor: 'text-[#00875A]',
            trend: '+8%'
        },
        {
            title: 'Pending Review',
            value: stats?.pending || 0,
            icon: Clock,
            color: 'bg-[#EAE6FF]',
            iconColor: 'text-[#6554C0]',
            trend: '-5%'
        },
        {
            title: 'Cancelled',
            value: stats?.cancelled || 0,
            icon: AlertCircle,
            color: 'bg-[#FFEBE6]',
            iconColor: 'text-[#DE350B]',
            trend: '-3%'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F4F5F7]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#DFE1E6] border-t-[#0052CC] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#42526E] font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            <PasskeyModal />
            {/* Header */}
            <div className="bg-white border-b border-[#DFE1E6] px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#253858]">Admin Dashboard</h1>
                        <p className="text-[#7A869A] mt-1">Healthcare Management System Overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-white border border-[#DFE1E6] text-[#42526E] rounded-md hover:bg-[#F4F5F7] transition-colors text-sm font-medium"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => navigate('/admin/appointments')}
                            className="px-4 py-2 bg-[#0052CC] text-white rounded-md hover:bg-[#003D99] transition-colors text-sm font-semibold"
                        >
                            View All Appointments
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white border border-[#DFE1E6] rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[#7A869A] text-sm font-medium mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-[#253858]">{stat.value}</p>
                                    <p className="text-xs text-[#00875A] mt-2 font-semibold">{stat.trend} vs last month</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className={stat.iconColor} size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Appointments Table */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-[#253858]">Recent Appointments</h2>
                        <p className="text-sm text-[#7A869A]">Latest {appointments.length} appointment records</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={appointments}
                        onRowClick={(row) => navigate(`/admin/appointments`)}
                        searchable={true}
                        sortable={true}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button
                        onClick={() => navigate('/admin/patients')}
                        className="bg-white border border-[#DFE1E6] rounded-lg p-6 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#DEEBFF] p-3 rounded-lg group-hover:bg-[#0052CC] transition-colors">
                                <Users className="text-[#0052CC] group-hover:text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#253858]">Manage Patients</h3>
                                <p className="text-sm text-[#7A869A]">View and edit patient records</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/doctors')}
                        className="bg-white border border-[#DFE1E6] rounded-lg p-6 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#E3FCEF] p-3 rounded-lg group-hover:bg-[#00875A] transition-colors">
                                <Activity className="text-[#00875A] group-hover:text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#253858]">Manage Doctors</h3>
                                <p className="text-sm text-[#7A869A]">View and edit doctor profiles</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/reports')}
                        className="bg-white border border-[#DFE1E6] rounded-lg p-6 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#EAE6FF] p-3 rounded-lg group-hover:bg-[#6554C0] transition-colors">
                                <TrendingUp className="text-[#6554C0] group-hover:text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#253858]">Reports & Analytics</h3>
                                <p className="text-sm text-[#7A869A]">View system reports</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/schedule')}
                        className="bg-white border border-[#DFE1E6] rounded-lg p-6 hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#FFF0B3] p-3 rounded-lg group-hover:bg-[#FF991F] transition-colors">
                                <Calendar className="text-[#FF991F] group-hover:text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#253858]">Master Schedule</h3>
                                <p className="text-sm text-[#7A869A]">View all doctor schedules</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
