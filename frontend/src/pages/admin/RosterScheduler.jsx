import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, MapPin, Plus } from 'lucide-react';
import { operationsService } from '../../services/operationsService';
import staffService from '../../services/staffService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const RosterScheduler = () => {
    const [roster, setRoster] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Filter / Form states
    const [selectedDept, setSelectedDept] = useState('');
    const [newShift, setNewShift] = useState({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Morning',
        location: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [selectedDept]); // React to filter change

    const fetchData = async () => {
        try {
            const [rosterData, allStaff] = await Promise.all([
                operationsService.getRoster(null, null, selectedDept), // Fetch all or filtered
                staffService.getAllStaff()
            ]);
            setRoster(rosterData);
            setStaffList(allStaff);
        } catch (error) {
            console.error("Roster fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await operationsService.assignShift(newShift);
            toast.success("Shift Assigned!");
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to assign shift");
        }
    };

    // Helper to group shifts by date for visualization
    const groupByDate = () => {
        const grouped = {};
        // Get next 7 days dates
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            grouped[dateStr] = [];
        }

        roster.forEach(shift => {
            const dateStr = new Date(shift.date).toISOString().split('T')[0];
            if (grouped[dateStr]) {
                grouped[dateStr].push(shift);
            }
        });
        return grouped;
    };

    const groupedRoster = groupByDate();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="text-purple-600" /> Staff Roster
                    </h1>
                    <p className="text-slate-500">Manage weekly shifts and assignments</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="input-modern py-2"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        <option value="Nursing">Nursing</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Emergency">Emergency</option>
                    </select>
                    <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center gap-2">
                        <Plus size={18} /> Assign Shift
                    </Button>
                </div>
            </div>

            {/* Weekly Calendar View */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Object.keys(groupedRoster).map(dateStr => (
                    <div key={dateStr} className="flex flex-col gap-2">
                        <div className={`p-3 rounded-xl text-center border ${dateStr === new Date().toISOString().split('T')[0] ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                            }`}>
                            <p className="text-xs text-slate-500 font-bold uppercase">{new Date(dateStr).toLocaleDateString([], { weekday: 'short' })}</p>
                            <p className="text-lg font-bold text-slate-800">{new Date(dateStr).getDate()}</p>
                        </div>

                        <div className="space-y-2 min-h-[300px] bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                            {groupedRoster[dateStr].length === 0 ? (
                                <p className="text-xs text-center text-slate-400 py-4 italic">No shifts</p>
                            ) : (
                                groupedRoster[dateStr].map(shift => (
                                    <div key={shift._id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-xs">
                                        <p className="font-bold text-slate-800 truncate">{shift.staffId?.firstName} {shift.staffId?.lastName}</p>
                                        <p className="text-slate-500">{shift.staffId?.role}</p>
                                        <div className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${shift.type === 'Morning' ? 'bg-amber-100 text-amber-700' :
                                            shift.type === 'Evening' ? 'bg-orange-100 text-orange-700' :
                                                'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {shift.type}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Assign Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Assign Shift</h2>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                                <select
                                    className="input-modern"
                                    value={newShift.staffId}
                                    onChange={(e) => setNewShift({ ...newShift, staffId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Staff</option>
                                    {staffList.map(s => (
                                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="input-modern"
                                        value={newShift.date}
                                        onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift Type</label>
                                    <select
                                        className="input-modern"
                                        value={newShift.type}
                                        onChange={(e) => setNewShift({ ...newShift, type: e.target.value })}
                                        required
                                    >
                                        <option>Morning</option>
                                        <option>Evening</option>
                                        <option>Night</option>
                                        <option>Off</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Ward</label>
                                <input
                                    type="text"
                                    className="input-modern"
                                    placeholder="e.g. ICU, Ward A"
                                    value={newShift.location}
                                    onChange={(e) => setNewShift({ ...newShift, location: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1">Assign</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RosterScheduler;
