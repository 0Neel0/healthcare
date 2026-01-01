import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Briefcase, Clock, UserCheck, Phone, Mail, Edit2, UserX, Trash2 } from 'lucide-react';
import staffService from '../../services/staffService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import DatePicker from '../../components/ui/DatePicker';
import toast from 'react-hot-toast';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Nurse',
        department: '',
        employmentType: 'Full-time',
        joinDate: '',
        salary: '',
        shift: 'Morning',
        address: '',
        emergencyContact: ''
    });

    const roles = ['Nurse', 'Technician', 'Pharmacist', 'Receptionist', 'Admin', 'HR', 'Cleaner', 'Security'];
    const shifts = ['Morning', 'Evening', 'Night', 'Rotating'];
    const employmentTypes = ['Full-time', 'Part-time', 'Contract'];

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        filterStaff();
    }, [searchTerm, roleFilter, staff]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffService.getAllStaff();
            setStaff(data);
            setFilteredStaff(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const filterStaff = () => {
        let filtered = staff;

        if (searchTerm) {
            filtered = filtered.filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone.includes(searchTerm)
            );
        }

        if (roleFilter) {
            filtered = filtered.filter(s => s.role === roleFilter);
        }

        setFilteredStaff(filtered);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await staffService.addStaff(formData);
            toast.success('Staff member added successfully');
            setAddModal(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error('Failed to add staff member');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await staffService.updateStaff(selectedStaff._id, formData);
            toast.success('Staff member updated successfully');
            setEditModal(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error('Failed to update staff member');
        }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Are you sure you want to deactivate this staff member?')) return;
        try {
            await staffService.deleteStaff(id);
            toast.success('Staff member deactivated');
            fetchStaff();
        } catch (error) {
            toast.error('Failed to deactivate staff member');
        }
    };

    const openEditModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setFormData({
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            email: staffMember.email,
            phone: staffMember.phone,
            role: staffMember.role,
            department: staffMember.department,
            employmentType: staffMember.employmentType,
            joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : '',
            salary: staffMember.salary || '',
            shift: staffMember.shift,
            address: staffMember.address || '',
            emergencyContact: staffMember.emergencyContact || ''
        });
        setEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: 'Nurse',
            department: '',
            employmentType: 'Full-time',
            joinDate: '',
            salary: '',
            shift: 'Morning',
            address: '',
            emergencyContact: ''
        });
        setSelectedStaff(null);
    };

    // Stats
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.isActive).length;
    const inactiveStaff = totalStaff - activeStaff;

    const roleColors = {
        'Nurse': 'bg-blue-100/50 text-blue-700 ring-1 ring-blue-600/20',
        'Technician': 'bg-purple-100/50 text-purple-700 ring-1 ring-purple-600/20',
        'Pharmacist': 'bg-green-100/50 text-green-700 ring-1 ring-green-600/20',
        'Receptionist': 'bg-pink-100/50 text-pink-700 ring-1 ring-pink-600/20',
        'Admin': 'bg-red-100/50 text-red-700 ring-1 ring-red-600/20',
        'HR': 'bg-yellow-100/50 text-yellow-700 ring-1 ring-yellow-600/20',
        'Cleaner': 'bg-slate-100/50 text-slate-700 ring-1 ring-slate-600/20',
        'Security': 'bg-orange-100/50 text-orange-700 ring-1 ring-orange-600/20'
    };

    const shiftColors = {
        'Morning': 'bg-amber-50 text-amber-700 border-amber-200',
        'Evening': 'bg-orange-50 text-orange-700 border-orange-200',
        'Night': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Rotating': 'bg-slate-50 text-slate-700 border-slate-200'
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Users className="text-indigo-600" size={28} />
                        </div>
                        Staff Management
                    </h1>
                    <p className="text-slate-500 mt-1 ml-14">Overview of hospital workforce and departments</p>
                </div>
                <Button onClick={() => setAddModal(true)} variant="primary" className="shadow-lg hover:shadow-indigo-500/30">
                    <Plus size={20} className="mr-2" /> Add Staff Member
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center gap-4 hover:border-indigo-300 transition-colors cursor-pointer group">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{totalStaff}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Staff</div>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 hover:border-green-300 transition-colors cursor-pointer group">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{activeStaff}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Now</div>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 hover:border-red-300 transition-colors cursor-pointer group">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all">
                        <UserX size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{inactiveStaff}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Inactive</div>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{new Set(staff.map(s => s.department)).size}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Departments</div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-48 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Staff Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24 bg-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Staff Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find any staff members matching your criteria. Try adjusting your filters or search term.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setRoleFilter(''); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Dept</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Shift</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                                    <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStaff.map((staffMember) => (
                                    <tr key={staffMember._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {staffMember.firstName.charAt(0)}{staffMember.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">
                                                        {staffMember.firstName} {staffMember.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">{staffMember.employmentType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleColors[staffMember.role] || 'bg-slate-100 text-slate-600'}`}>
                                                    {staffMember.role}
                                                </span>
                                                <span className="text-sm text-slate-600 font-medium">{staffMember.department}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 hidden md:table-cell">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail size={14} className="text-indigo-400" />
                                                    {staffMember.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone size={14} className="text-green-500" />
                                                    {staffMember.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 hidden lg:table-cell">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${shiftColors[staffMember.shift]}`}>
                                                {staffMember.shift}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 hidden lg:table-cell">
                                            <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold ${staffMember.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${staffMember.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                {staffMember.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(staffMember)}
                                                    className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {staffMember.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivate(staffMember._id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Deactivate User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Staff Modal */}
            <Modal isOpen={addModal} onClose={() => { setAddModal(false); resetForm(); }} title="Add New Staff Member" size="lg">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-modern">First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Phone *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Role *</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label-modern">Department *</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Employment Type *</label>
                            <select
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {employmentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label-modern">Join Date *</label>
                            <DatePicker
                                selected={formData.joinDate ? new Date(formData.joinDate) : null}
                                onChange={(date) => setFormData({ ...formData, joinDate: date })}
                                placeholder="Select join date"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Salary (₹)</label>
                            <input
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                className="input-modern"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="label-modern">Shift *</label>
                            <select
                                value={formData.shift}
                                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {shifts.map(shift => (
                                    <option key={shift} value={shift}>{shift}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-modern">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="input-modern"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-modern">Emergency Contact</label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                className="input-modern"
                                placeholder="Name & phone"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => { setAddModal(false); resetForm(); }} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 shadow-lg shadow-indigo-500/20">Add Staff Member</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal isOpen={editModal} onClose={() => { setEditModal(false); resetForm(); }} title="Edit Staff Member" size="lg">
                <form onSubmit={handleEdit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-modern">First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Phone *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Role *</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label-modern">Department *</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Employment Type *</label>
                            <select
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {employmentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label-modern">Join Date *</label>
                            <input
                                type="date"
                                value={formData.joinDate}
                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                className="input-modern"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-modern">Salary (₹)</label>
                            <input
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                className="input-modern"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="label-modern">Shift *</label>
                            <select
                                value={formData.shift}
                                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                className="input-modern cursor-pointer"
                                required
                            >
                                {shifts.map(shift => (
                                    <option key={shift} value={shift}>{shift}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-modern">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="input-modern"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-modern">Emergency Contact</label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                className="input-modern"
                                placeholder="Name & phone"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => { setEditModal(false); resetForm(); }} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 shadow-lg shadow-indigo-500/20">Update Staff Member</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Staff;
