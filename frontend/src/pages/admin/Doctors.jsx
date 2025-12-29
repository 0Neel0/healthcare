import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Stethoscope, Edit, Trash2, Plus, X, Lock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
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
            password: '' // Don't pre-fill password
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

        // Email Validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Password Strength Validation (only if password is provided)
        if (formData.password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                toast.error("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.");
                return;
            }
        }

        try {
            if (editingDoctor) {
                // Update existing doctor
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password; // Don't send empty password

                await api.put(`/user/${editingDoctor._id}`, updateData);
                toast.success('Doctor updated successfully!');
            } else {
                // Create new doctor
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-medical-blue-200 border-t-medical-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-slate-600 font-medium">Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="text-medical-blue-600" size={32} />
                        Doctor Management
                    </h1>
                    <p className="text-slate-600 mt-1">Manage doctor profiles and schedules</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={20} />
                    Add Doctor
                </button>
            </div>

            {doctors.length === 0 ? (
                <Card className="p-12 text-center">
                    <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold text-lg">No doctors found</p>
                    <p className="text-slate-500 text-sm mt-2">Click "Add Doctor" to register a new doctor</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <Card key={doctor._id} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-medical-blue-100 hover:border-medical-blue-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gradient-to-br from-medical-blue-500 to-health-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {doctor.name?.charAt(0).toUpperCase() || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Dr. {doctor.name}</h3>
                                        <span className="text-xs bg-medical-blue-100 text-medical-blue-700 px-2 py-1 rounded-full font-semibold">
                                            Doctor
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={16} className="text-medical-blue-500" />
                                    <span className="truncate">{doctor.email}</span>
                                </div>
                                {doctor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={16} className="text-health-green-500" />
                                        <span>{doctor.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Users size={16} />
                                    <span>ID: {doctor._id.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => handleOpenEditModal(doctor)}
                                    className="flex-1 px-4 py-2 bg-medical-blue-50 hover:bg-medical-blue-100 text-medical-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(doctor)}
                                    className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="glass-effect rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="text-medical-blue-600" size={20} />
                    Doctor Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-medical-blue-50 to-medical-blue-100 rounded-xl p-4">
                        <p className="text-sm text-medical-blue-600 font-semibold mb-1">Total Doctors</p>
                        <p className="text-3xl font-bold text-medical-blue-700">{doctors.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-health-green-50 to-health-green-100 rounded-xl p-4">
                        <p className="text-sm text-health-green-600 font-semibold mb-1">Active Today</p>
                        <p className="text-3xl font-bold text-health-green-700">{doctors.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-demo-orange-50 to-demo-orange-100 rounded-xl p-4">
                        <p className="text-sm text-demo-orange-600 font-semibold mb-1">Registered</p>
                        <p className="text-3xl font-bold text-demo-orange-700">{doctors.length}</p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Doctor Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full shadow-2xl">
                        <div className="bg-gradient-to-r from-medical-blue-600 to-health-green-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Stethoscope size={24} />
                                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Users size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-modern"
                                    placeholder="Dr. John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-modern"
                                    placeholder="doctor@hospital.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-modern"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Lock size={16} /> Password {editingDoctor && <span className="text-xs text-slate-500 font-normal">(leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-modern"
                                    placeholder="••••••••"
                                    required={!editingDoctor}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                                >
                                    {editingDoctor ? <Edit size={18} /> : <Plus size={18} />} {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Doctors;

