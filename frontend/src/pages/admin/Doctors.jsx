import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Stethoscope, Edit, Trash2, Plus, Search, Activity, UserCheck, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/doctors');
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingDoctor(null);
        setFormData({ name: '', email: '', phone: '', password: '' });
        setShowModal(true);
    };

    const handleOpenEditModal = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone || '',
            password: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDoctor(null);
        setFormData({ name: '', email: '', phone: '', password: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (formData.password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                toast.error("Password must be at least 8 characters.");
                return;
            }
        }

        try {
            if (editingDoctor) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;

                await api.put(`/user/${editingDoctor._id}`, updateData);
                toast.success('Doctor updated successfully!');
            } else {
                if (!formData.password) {
                    toast.error('Password is required for new doctors');
                    return;
                }

                await api.post('/user/register', {
                    ...formData,
                    role: 'doctor'
                });
                toast.success('Doctor added successfully!');
            }

            handleCloseModal();
            fetchDoctors();
        } catch (error) {
            console.error('Error saving doctor:', error);
            toast.error(error.response?.data?.message || 'Failed to save doctor');
        }
    };

    const handleDelete = async (doctor) => {
        if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/user/${doctor._id}`);
            toast.success('Doctor deleted successfully!');
            fetchDoctors();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            toast.error(error.response?.data?.message || 'Failed to delete doctor');
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Stethoscope className="text-indigo-600" size={28} />
                        </div>
                        Doctor Management
                    </h1>
                    <p className="text-slate-500 mt-1 ml-14">View and manage medical staff profiles</p>
                </div>
                <Button onClick={handleOpenAddModal} variant="primary" className="shadow-lg hover:shadow-indigo-500/30">
                    <Plus size={20} className="mr-2" /> Add Doctor
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition-colors">
                    <div className="bg-blue-50 p-3 rounded-full">
                        <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold uppercase">Total Doctors</p>
                        <p className="text-3xl font-bold text-slate-900">{doctors.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-300 transition-colors">
                    <div className="bg-green-50 p-3 rounded-full">
                        <UserCheck className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold uppercase">Active Today</p>
                        <p className="text-3xl font-bold text-slate-900">{doctors.length}</p> {/* Placeholder logic */}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-300 transition-colors">
                    <div className="bg-orange-50 p-3 rounded-full">
                        <Clock className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold uppercase">On Leave</p>
                        <p className="text-3xl font-bold text-slate-900">0</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search doctors by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 text-sm text-slate-500">
                    <span>Showing <span className="font-bold text-slate-900">{filteredDoctors.length}</span> results</span>
                </div>
            </div>

            {/* Content Grid */}
            {filteredDoctors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-900 font-bold text-lg">No doctors found</p>
                    <p className="text-slate-500">Try adjusting your search terms</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                <div className="absolute -bottom-10 left-6 border-4 border-white rounded-full bg-white">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 uppercase">
                                        {doctor.name?.charAt(0) || 'D'}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                                    Active
                                </div>
                            </div>
                            <div className="pt-12 p-6">
                                <h3 className="font-bold text-lg text-slate-900 truncate">Dr. {doctor.name}</h3>
                                <p className="text-indigo-600 text-sm font-medium mb-4">General Physician</p> {/* Placeholder Specialization */}

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Mail size={16} />
                                        </div>
                                        <span className="truncate">{doctor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                            <Phone size={16} />
                                        </div>
                                        <span className="truncate">{doctor.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleOpenEditModal(doctor)}
                                        className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doctor)}
                                        className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reusable Modal for Add/Edit */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Dr. Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="doctor@hospital.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password {editingDoctor && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required={!editingDoctor}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingDoctor ? 'Update Profile' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Doctors;

