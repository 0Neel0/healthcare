import React, { useState, useEffect } from 'react';
import { BedDouble, User, AlertCircle, CheckCircle, Clock, Activity, Map, Settings, PlayCircle, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

// Enhanced Mock Data
const MOCK_WARDS = [
    {
        id: 'w1',
        name: 'General Ward A',
        type: 'General',
        capacity: 20,
        beds: Array.from({ length: 20 }, (_, i) => ({
            number: `A-${i + 1}`,
            status: i < 12 ? 'Occupied' : i === 15 ? 'Maintenance' : 'Available',
            patientName: i < 12 ? `Patient ${i + 1}` : null,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            condition: i < 12 ? (i % 3 === 0 ? 'Stable' : 'Observing') : null,
            admissionDate: i < 12 ? new Date(2023, 10, 15 - i) : null
        }))
    },
    {
        id: 'w2',
        name: 'ICU',
        type: 'Critical Care',
        capacity: 8,
        beds: Array.from({ length: 8 }, (_, i) => ({
            number: `ICU-${i + 1}`,
            status: i < 6 ? 'Occupied' : 'Available',
            patientName: i < 6 ? `Crit. Patient ${i + 1}` : null,
            gender: 'Male',
            condition: 'Critical',
            admissionDate: i < 6 ? new Date() : null
        }))
    },
    {
        id: 'w3',
        name: 'Pediatric Ward',
        type: 'General',
        capacity: 10,
        beds: Array.from({ length: 10 }, (_, i) => ({
            number: `P-${i + 1}`,
            status: i < 4 ? 'Occupied' : 'Available',
            patientName: i < 4 ? `Baby Doe ${i + 1}` : null,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            condition: 'Stable',
            admissionDate: i < 4 ? new Date() : null
        }))
    }
];

const WardMap = () => {
    const [selectedWard, setSelectedWard] = useState(MOCK_WARDS[0]);
    const [selectedBed, setSelectedBed] = useState(null);
    const [bedActionModal, setBedActionModal] = useState(false);

    // Stats
    const occupiedCount = selectedWard.beds.filter(b => b.status === 'Occupied').length;
    const availableCount = selectedWard.beds.filter(b => b.status === 'Available').length;
    const occupancyRate = Math.round((occupiedCount / selectedWard.capacity) * 100);

    const handleBedClick = (bed) => {
        setSelectedBed(bed);
        setBedActionModal(true);
    };

    const handleAdmit = () => {
        toast.success(`Patient admitted to bed ${selectedBed.number}`);
        setBedActionModal(false);
    };

    const handleDischarge = () => {
        toast.success(`Patient discharged from bed ${selectedBed.number}`);
        setBedActionModal(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-100/30 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Map className="text-blue-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ward Map</h1>
                        <p className="text-slate-500 font-medium">Real-time Bed Allocation & Status</p>
                    </div>
                </div>
                <div className="flex gap-2 relative z-10 flex-wrap">
                    {MOCK_WARDS.map(ward => (
                        <button
                            key={ward.id}
                            onClick={() => setSelectedWard(ward)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedWard.id === ward.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {ward.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Occupancy Rate</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{occupancyRate}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {occupancyRate}%
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Beds</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">{availableCount}</p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Occupied Beds</p>
                        <p className="text-3xl font-black text-blue-600 mt-1">{occupiedCount}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <User size={20} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maintenance</p>
                        <p className="text-3xl font-black text-amber-500 mt-1">
                            {selectedWard.beds.filter(b => b.status === 'Maintenance').length}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                        <Settings size={20} />
                    </div>
                </div>
            </div>

            {/* Visual Bed Grid */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        {selectedWard.name} Map
                    </h2>
                    <div className="flex gap-4 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Occupied</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Maintenance</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                    {selectedWard.beds.map(bed => {
                        const isOccupied = bed.status === 'Occupied';
                        const isAvailable = bed.status === 'Available';
                        const isMaintenance = bed.status === 'Maintenance';

                        return (
                            <div
                                key={bed.number}
                                onClick={() => handleBedClick(bed)}
                                className={`
                                    relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                                    ${isAvailable ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50' : ''}
                                    ${isOccupied ? 'bg-blue-50/50 border-blue-100 hover:border-blue-300 hover:bg-blue-50' : ''}
                                    ${isMaintenance ? 'bg-amber-50/50 border-amber-100 hover:border-amber-300 hover:bg-amber-50' : ''}
                                `}
                            >
                                <div className={`
                                    p-3 rounded-full mb-3 transition-transform group-hover:scale-110 shadow-sm
                                    ${isAvailable ? 'bg-emerald-100 text-emerald-600' : ''}
                                    ${isOccupied ? 'bg-blue-100 text-blue-600' : ''}
                                    ${isMaintenance ? 'bg-amber-100 text-amber-600' : ''}
                                `}>
                                    {isOccupied ? <User size={24} /> : isMaintenance ? <Settings size={24} /> : <BedDouble size={24} />}
                                </div>
                                <span className="font-black text-slate-700 text-lg">{bed.number}</span>
                                {isOccupied && <span className="text-[10px] bg-white px-2 py-0.5 rounded-full shadow-sm mt-1 text-slate-500 font-bold max-w-[90%] truncate">{bed.patientName.split(' ')[0]}</span>}
                                {isAvailable && <span className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">Free</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bed Detail Modal */}
            <Modal
                isOpen={bedActionModal}
                onClose={() => setBedActionModal(false)}
                title={`Bed Details: ${selectedBed?.number}`}
            >
                {selectedBed && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`
                            p-6 rounded-2xl text-center border-2 border-dashed
                            ${selectedBed.status === 'Occupied' ? 'bg-blue-50 border-blue-200' :
                                selectedBed.status === 'Available' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}
                        `}>
                            <h3 className={`text-xl font-bold mb-1
                                ${selectedBed.status === 'Occupied' ? 'text-blue-800' :
                                    selectedBed.status === 'Available' ? 'text-emerald-800' : 'text-amber-800'}
                            `}>
                                {selectedBed.status.toUpperCase()}
                            </h3>
                            <p className="text-sm opacity-70">Current Status</p>
                        </div>

                        {selectedBed.status === 'Occupied' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                                        {selectedBed.gender === 'Male' ? 'M' : 'F'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-slate-900">{selectedBed.patientName}</h4>
                                        <p className="text-sm text-slate-500">Condition: <span className="font-bold text-slate-700">{selectedBed.condition}</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                        <Clock size={16} className="mx-auto mb-1 text-slate-400" />
                                        <p className="text-xs text-slate-500">Admitted</p>
                                        <p className="font-bold text-slate-800">{selectedBed.admissionDate?.toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                        <Activity size={16} className="mx-auto mb-1 text-slate-400" />
                                        <p className="text-xs text-slate-500">In Charge</p>
                                        <p className="font-bold text-slate-800">Dr. Smith</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            {selectedBed.status === 'Available' ? (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 shadow-lg shadow-emerald-200" onClick={handleAdmit}>
                                    <PlayCircle size={18} className="mr-2" /> Admit Patient here
                                </Button>
                            ) : selectedBed.status === 'Occupied' ? (
                                <Button variant="danger" className="w-full py-3 shadow-lg shadow-red-200" onClick={handleDischarge}>
                                    <LogOut size={18} className="mr-2" /> Discharge Patient
                                </Button>
                            ) : (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                                    <CheckCircle size={18} className="mr-2" /> Mark as Cleaned
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WardMap;
