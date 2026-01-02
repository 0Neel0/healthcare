import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Plus, Clock, AlertCircle } from 'lucide-react';
import { criticalCareService } from '../../services/criticalCareService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const OTDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);

    // Booking Form
    const [booking, setBooking] = useState({
        roomId: '',
        patientId: '',
        doctorId: '',
        procedureName: '',
        startTime: '',
        endTime: '',
        status: 'Scheduled'
    });

    // New Room Form
    const [newRoom, setNewRoom] = useState({
        name: '',
        roomNumber: '',
        type: 'General',
        resources: ''
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            const [roomsData, scheduleData] = await Promise.all([
                criticalCareService.getOTRooms(),
                criticalCareService.getOTSchedule(selectedDate)
            ]);
            setRooms(roomsData || []);
            setSchedule(scheduleData || []);

            // Set default room if available
            if (roomsData && roomsData.length > 0 && !booking.roomId) {
                setBooking(prev => ({ ...prev, roomId: roomsData[0]._id }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newRoom,
                resources: newRoom.resources.split(',').map(r => r.trim())
            };
            await criticalCareService.addOTRoom(payload);
            toast.success("OT Room added successfully");
            setShowAddRoomModal(false);
            fetchData();
            setNewRoom({ name: '', roomNumber: '', type: 'General', resources: '' });
        } catch (error) {
            toast.error("Failed to add room");
        }
    };

    const handleBookSurgery = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...booking,
                startTime: new Date(`${selectedDate}T${booking.startTime}`),
                endTime: new Date(`${selectedDate}T${booking.endTime}`)
            };

            await criticalCareService.bookOT(payload);
            toast.success("Surgery booked successfully");
            setShowBookModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Booking failed. Ensure Patient/Doctor IDs are valid.");
        }
    };

    const toggleRoomStatus = async (room) => {
        const newStatus = room.status === 'Available' ? 'Occupied' :
            room.status === 'Occupied' ? 'Cleaning' : 'Available';

        try {
            await criticalCareService.updateOTRoomStatus(room._id, newStatus);
            toast.success(`Room marked as ${newStatus}`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-blue-600" /> Operation Theaters
                    </h1>
                    <p className="text-slate-500">Surgery scheduling and room management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setShowAddRoomModal(true)} variant="outline" className="flex items-center gap-2">
                        <Plus size={18} /> Add Room
                    </Button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-modern py-2"
                    />
                    <Button onClick={() => setShowBookModal(true)} className="flex items-center gap-2">
                        <Plus size={18} /> Book Surgery
                    </Button>
                </div>
            </div>

            {/* Room Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div key={room._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${room.status === 'Available' ? 'bg-green-500' :
                            room.status === 'Occupied' ? 'bg-red-500' : 'bg-orange-500'
                            }`}></div>

                        <div className="flex justify-between items-start mb-4 pl-2">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{room.name || `OT Room ${room.roomNumber}`}</h3>
                                <p className="text-xs text-slate-500 uppercase font-semibold">{room.type}</p>
                            </div>
                            <button
                                onClick={() => toggleRoomStatus(room)}
                                className={`px-2 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${room.status === 'Available' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                    room.status === 'Occupied' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    }`}
                                title="Click to cycle status"
                            >
                                {room.status}
                            </button>
                        </div>
                        <div className="space-y-2 pl-2">
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Activity size={14} className="text-slate-400" />
                                {room.resources.length > 0 ? room.resources.join(', ') : 'Standard Equipment'}
                            </div>
                        </div>
                    </div>
                ))}
                {rooms.length === 0 && !loading && (
                    <div className="col-span-3 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        No OT Rooms Configured. Click "Add Room" to get started.
                    </div>
                )}
            </div>

            {/* Schedule Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <Calendar size={18} className="text-slate-500" />
                    <h3 className="font-bold text-slate-800">Schedule for {new Date(selectedDate).toLocaleDateString()}</h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {schedule.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No surgeries scheduled for this date.</div>
                    ) : (
                        schedule.map(item => (
                            <div key={item._id} className="p-4 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center md:w-48 text-slate-800 font-mono text-sm gap-2">
                                    <Clock size={16} className="text-blue-500" />
                                    {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{item.procedureName}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                                        <span>Patient: <span className="font-medium text-slate-800">{item.patientId?.name || 'Unknown'}</span></span>
                                        <span>Surgeon: <span className="font-medium text-slate-800">{item.doctorId?.name || 'Unknown'}</span></span>
                                        <span>Room: <span className="font-medium text-slate-800">{item.roomId?.name || item.roomId?.roomNumber || 'Unknown'}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' :
                                        item.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Book Surgery Modal */}
            <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Book New Surgery">
                <form onSubmit={handleBookSurgery} className="space-y-4">
                    <div>
                        <label className="label-modern">Procedure Name</label>
                        <input
                            type="text" required className="input-modern" placeholder="e.g. Appendectomy"
                            value={booking.procedureName} onChange={e => setBooking({ ...booking, procedureName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Start Time</label>
                            <input
                                type="time" required className="input-modern"
                                value={booking.startTime} onChange={e => setBooking({ ...booking, startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label-modern">End Time</label>
                            <input
                                type="time" required className="input-modern"
                                value={booking.endTime} onChange={e => setBooking({ ...booking, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label-modern">OT Room</label>
                        <select
                            className="input-modern" required
                            value={booking.roomId} onChange={e => setBooking({ ...booking, roomId: e.target.value })}
                        >
                            <option value="">Select Room</option>
                            {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Patient ID</label>
                            <input
                                type="text" required className="input-modern font-mono text-xs"
                                value={booking.patientId} onChange={e => setBooking({ ...booking, patientId: e.target.value })}
                                placeholder="Mongo ID"
                            />
                        </div>
                        <div>
                            <label className="label-modern">Doctor ID</label>
                            <input
                                type="text" required className="input-modern font-mono text-xs"
                                value={booking.doctorId} onChange={e => setBooking({ ...booking, doctorId: e.target.value })}
                                placeholder="Mongo ID"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                        <AlertCircle size={14} className="inline mr-1" />
                        Note: Please ensure Patient & Doctor IDs exist in the database.
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Confirm Booking</Button>
                </form>
            </Modal>

            {/* Add Room Modal */}
            <Modal isOpen={showAddRoomModal} onClose={() => setShowAddRoomModal(false)} title="Configure New OT Room">
                <form onSubmit={handleAddRoom} className="space-y-4">
                    <div>
                        <label className="label-modern">Room Name</label>
                        <input
                            type="text" required className="input-modern" placeholder="e.g. Cardiac OT - 1"
                            value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-modern">Room Number</label>
                            <input
                                type="text" required className="input-modern"
                                value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label-modern">Type (Specialty)</label>
                            <select
                                className="input-modern"
                                value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value })}
                            >
                                <option>General</option>
                                <option>Cardiac</option>
                                <option>Neuro</option>
                                <option>Orthopedic</option>
                                <option>Emergency</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label-modern">Resources (comma separated)</label>
                        <input
                            type="text" className="input-modern" placeholder="e.g. Ventilator, X-Ray, Anesthesia Station"
                            value={newRoom.resources} onChange={e => setNewRoom({ ...newRoom, resources: e.target.value })}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4">Save Configuration</Button>
                </form>
            </Modal>
        </div>
    );
};

export default OTDashboard;
