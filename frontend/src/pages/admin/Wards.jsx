import React, { useState, useEffect } from 'react';
import { Building2, Bed, Plus, Users, TrendingUp, AlertCircle, Check } from 'lucide-react';
import wardService from '../../services/wardService';
import { patientService } from '../../services/patientService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const Wards = () => {
    const [wards, setWards] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addWardModal, setAddWardModal] = useState(false);
    const [viewWardModal, setViewWardModal] = useState(false);
    const [addBedModal, setAddBedModal] = useState(false);
    const [admitModal, setAdmitModal] = useState(false);

    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedBed, setSelectedBed] = useState(null);

    const [newWard, setNewWard] = useState({
        name: '',
        type: 'General',
        floor: '',
        capacity: 10
    });

    const [newBed, setNewBed] = useState({
        number: '',
        type: 'General',
        costPerDay: 500
    });

    const [selectedPatientId, setSelectedPatientId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wardsData, patientsData] = await Promise.all([
                wardService.getWards(),
                patientService.getAllPatients()
            ]);
            setWards(Array.isArray(wardsData) ? wardsData : []);
            setPatients(Array.isArray(patientsData) ? patientsData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setWards([]); // Fallback
            toast.error('Failed to load wards');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWard = async (e) => {
        e.preventDefault();
        try {
            await wardService.createWard({ ...newWard, beds: [], occupiedBeds: 0 });
            toast.success('Ward created successfully');
            setAddWardModal(false);
            setNewWard({ name: '', type: 'General', floor: '', capacity: 10 });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ward');
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await wardService.addBedToWard(selectedWard._id, newBed);
            toast.success('Bed added successfully');
            setAddBedModal(false);
            setNewBed({ number: '', type: 'General', costPerDay: 500 });
            fetchData();
            // Refresh selected ward
            const updatedWards = await wardService.getWards();
            const updated = updatedWards.find(w => w._id === selectedWard._id);
            setSelectedWard(updated);
        } catch (error) {
            toast.error('Failed to add bed');
        }
    };

    const handleAdmitPatient = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) {
            toast.error('Please select a patient');
            return;
        }
        try {
            await wardService.admitPatientToBed(selectedWard._id, selectedBed._id, selectedPatientId);
            toast.success('Patient admitted successfully');
            setAdmitModal(false);
            setSelectedPatientId('');
            fetchData();
            // Refresh selected ward
            const updatedWards = await wardService.getWards();
            const updated = updatedWards.find(w => w._id === selectedWard._id);
            setSelectedWard(updated);
        } catch (error) {
            toast.error('Failed to admit patient');
        }
    };

    const handleDischargePatient = async (bed) => {
        if (!confirm('Are you sure you want to discharge this patient?')) return;
        try {
            await wardService.dischargePatientFromBed(selectedWard._id, bed._id);
            toast.success('Patient discharged successfully');
            fetchData();
            // Refresh selected ward
            const updatedWards = await wardService.getWards();
            const updated = updatedWards.find(w => w._id === selectedWard._id);
            setSelectedWard(updated);
        } catch (error) {
            toast.error('Failed to discharge patient');
        }
    };

    // Calculate stats dynamicallly from bed status to ensure accuracy
    const totalWards = wards.length;
    const totalCapacity = wards.reduce((sum, ward) => sum + ward.capacity, 0);

    // Calculate occupied beds based on actual bed status
    const totalOccupied = wards.reduce((sum, ward) => {
        const occupiedCount = ward.beds?.filter(b => b.status === 'Occupied').length || 0;
        return sum + occupiedCount;
    }, 0);

    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    const wardTypeColors = {
        'General': 'bg-blue-50 text-blue-700 border-blue-200',
        'ICU': 'bg-red-50 text-red-700 border-red-200',
        'Maternity': 'bg-pink-50 text-pink-700 border-pink-200',
        'Pediatric': 'bg-green-50 text-green-700 border-green-200',
        'Emergency': 'bg-orange-50 text-orange-700 border-orange-200',
        'Critical Care': 'bg-purple-50 text-purple-700 border-purple-200'
    };

    const bedStatusColors = {
        'Available': 'bg-green-100 text-green-700',
        'Occupied': 'bg-blue-100 text-blue-700',
        'Maintenance': 'bg-orange-100 text-orange-700',
        'Cleaning': 'bg-yellow-100 text-yellow-700'
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ward & Bed Management</h1>
                    <p className="text-slate-500">Track facility capacity and patient admissions</p>
                </div>
                <Button onClick={() => setAddWardModal(true)} className="flex items-center gap-2">
                    <Plus size={18} /> Add Ward
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalWards}</div>
                            <div className="text-sm text-slate-500">Total Wards</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Bed size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCapacity}</div>
                            <div className="text-sm text-slate-500">Total Capacity</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalOccupied}</div>
                            <div className="text-sm text-slate-500">Occupied Beds</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${occupancyRate > 80 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{occupancyRate}%</div>
                            <div className="text-sm text-slate-500">Occupancy Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : wards.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Wards Created</h3>
                    <p className="text-slate-500">Create your first ward to start managing beds</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wards.map((ward) => {
                        const occupiedCount = ward.beds?.filter(b => b.status === 'Occupied').length || 0;
                        const occupancyPercent = ward.capacity > 0 ? Math.round((occupiedCount / ward.capacity) * 100) : 0;
                        return (
                            <div
                                key={ward._id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => {
                                    setSelectedWard(ward);
                                    setViewWardModal(true);
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {ward.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">Floor {ward.floor || 'N/A'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${wardTypeColors[ward.type] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                        {ward.type}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Occupancy</span>
                                        <span className="font-bold text-slate-900">{occupiedCount}/{ward.capacity}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${occupancyPercent > 80 ? 'bg-red-500' : occupancyPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${occupancyPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Bed size={16} />
                                        <span>{ward.capacity} Beds</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${occupancyPercent > 80 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <TrendingUp size={16} />
                                        <span>{occupancyPercent}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Ward Modal */}
            <Modal isOpen={addWardModal} onClose={() => setAddWardModal(false)} title="Add New Ward">
                <form onSubmit={handleAddWard} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ward Name *</label>
                        <input
                            type="text"
                            value={newWard.name}
                            onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., North Wing 1A"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ward Type *</label>
                        <select
                            value={newWard.type}
                            onChange={(e) => setNewWard({ ...newWard, type: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="General">General</option>
                            <option value="ICU">ICU</option>
                            <option value="Maternity">Maternity</option>
                            <option value="Pediatric">Pediatric</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Critical Care">Critical Care</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Floor</label>
                        <input
                            type="text"
                            value={newWard.floor}
                            onChange={(e) => setNewWard({ ...newWard, floor: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Total Capacity *</label>
                        <input
                            type="number"
                            value={newWard.capacity}
                            onChange={(e) => setNewWard({ ...newWard, capacity: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setAddWardModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">Create Ward</Button>
                    </div>
                </form>
            </Modal>

            {/* View Ward Details Modal */}
            <Modal
                isOpen={viewWardModal}
                onClose={() => setViewWardModal(false)}
                title={selectedWard?.name || 'Ward Details'}
                size="lg"
            >
                {selectedWard && (
                    <div className="space-y-6">
                        {/* Ward Info */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Type</p>
                                    <p className="font-bold text-slate-900">{selectedWard.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Floor</p>
                                    <p className="font-bold text-slate-900">{selectedWard.floor || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Capacity</p>
                                    <p className="font-bold text-slate-900">{selectedWard.capacity} beds</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Occupied</p>
                                    <p className="font-bold text-slate-900">
                                        {selectedWard.beds?.filter(b => b.status === 'Occupied').length || 0} beds
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Beds List */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Beds</h3>
                                <Button
                                    size="sm"
                                    onClick={() => setAddBedModal(true)}
                                    className="flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Bed
                                </Button>
                            </div>

                            {(!selectedWard.beds || selectedWard.beds.length === 0) ? (
                                <p className="text-center text-slate-500 py-8">No beds added yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedWard.beds.map((bed) => (
                                        <div
                                            key={bed._id}
                                            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                                                    {bed.number}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{bed.type} Bed</p>
                                                    <p className="text-xs text-slate-500">₹{bed.costPerDay}/day</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${bedStatusColors[bed.status]}`}>
                                                    {bed.status}
                                                </span>
                                                {bed.status === 'Available' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBed(bed);
                                                            setAdmitModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                                                    >
                                                        Admit Patient
                                                    </button>
                                                )}
                                                {bed.status === 'Occupied' && (
                                                    <button
                                                        onClick={() => handleDischargePatient(bed)}
                                                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                                                    >
                                                        Discharge
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Bed Modal */}
            <Modal isOpen={addBedModal} onClose={() => setAddBedModal(false)} title="Add New Bed">
                <form onSubmit={handleAddBed} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Bed Number *</label>
                        <input
                            type="text"
                            value={newBed.number}
                            onChange={(e) => setNewBed({ ...newBed, number: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., B101"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Bed Type *</label>
                        <select
                            value={newBed.type}
                            onChange={(e) => setNewBed({ ...newBed, type: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="General">General</option>
                            <option value="Semi-Private">Semi-Private</option>
                            <option value="Private">Private</option>
                            <option value="ICU">ICU</option>
                            <option value="Ventilator">Ventilator</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cost per Day (₹) *</label>
                        <input
                            type="number"
                            value={newBed.costPerDay}
                            onChange={(e) => setNewBed({ ...newBed, costPerDay: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="0"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setAddBedModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">Add Bed</Button>
                    </div>
                </form>
            </Modal>

            {/* Admit Patient Modal */}
            <Modal isOpen={admitModal} onClose={() => setAdmitModal(false)} title="Admit Patient">
                <form onSubmit={handleAdmitPatient} className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-4">
                        <p className="text-sm text-indigo-900">
                            <strong>Bed:</strong> {selectedBed?.number} ({selectedBed?.type})
                        </p>
                        <p className="text-sm text-indigo-900">
                            <strong>Cost:</strong> ₹{selectedBed?.costPerDay}/day
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Patient *</label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map((patient) => (
                                <option key={patient._id} value={patient._id}>
                                    {patient.name} - {patient.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setAdmitModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">Admit Patient</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Wards;
