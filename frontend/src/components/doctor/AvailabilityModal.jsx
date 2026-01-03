import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityModal = ({ isOpen, onClose, initialAvailability, onSave, isLoading }) => {
    const [schedule, setSchedule] = useState([]);
    const [outOfOfficeDates, setOutOfOfficeDates] = useState([]);
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'leaves'

    useEffect(() => {
        if (isOpen && initialAvailability) {
            // Initialize schedule from props or default
            const initializedSchedule = DAYS.map(day => {
                const existing = initialAvailability.schedule?.find(s => s.day === day);
                return existing || {
                    day,
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: ['Saturday', 'Sunday'].includes(day) ? false : true
                };
            });
            setSchedule(initializedSchedule);

            // Initialize leaves
            setOutOfOfficeDates(initialAvailability.outOfOfficeDates?.map(d => ({
                ...d,
                startDate: d.startDate.split('T')[0],
                endDate: d.endDate.split('T')[0]
            })) || []);
        }
    }, [isOpen, initialAvailability]);

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const handleAddLeave = () => {
        setOutOfOfficeDates([...outOfOfficeDates, { startDate: '', endDate: '', reason: '' }]);
    };

    const handleLeaveChange = (index, field, value) => {
        const newLeaves = [...outOfOfficeDates];
        newLeaves[index] = { ...newLeaves[index], [field]: value };
        setOutOfOfficeDates(newLeaves);
    };

    const handleRemoveLeave = (index) => {
        const newLeaves = outOfOfficeDates.filter((_, i) => i !== index);
        setOutOfOfficeDates(newLeaves);
    };

    const handleSave = () => {
        // Validation
        const validSchedule = schedule.map(s => ({
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            isAvailable: s.isAvailable
        }));

        const validLeaves = outOfOfficeDates.filter(l => l.startDate && l.endDate);

        onSave({
            schedule: validSchedule,
            outOfOfficeDates: validLeaves
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Manage Availability</h2>
                        <p className="text-sm text-slate-500">Set your weekly working hours and leave dates</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'weekly' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Weekly Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('leaves')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'leaves' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Out of Office / Leaves
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-grow">
                    {activeTab === 'weekly' ? (
                        <div className="space-y-4">
                            {schedule.map((slot, index) => (
                                <div key={slot.day} className={`flex items-center gap-4 p-3 rounded-lg border ${slot.isAvailable ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'} transition-colors`}>
                                    <div className="w-32 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`day-${index}`}
                                            checked={slot.isAvailable}
                                            onChange={(e) => handleScheduleChange(index, 'isAvailable', e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`day-${index}`} className={`font-medium ${slot.isAvailable ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {slot.day}
                                        </label>
                                    </div>

                                    {slot.isAvailable ? (
                                        <div className="flex items-center gap-3 flex-grow animate-fade-in">
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-32"
                                                />
                                            </div>
                                            <span className="text-slate-400 text-sm">to</span>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-32"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">Unavailable</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                                Add dates when you will be unavailable. Appointments cannot be booked on these days.
                            </div>

                            <div className="space-y-3">
                                {outOfOfficeDates.map((leave, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">From</label>
                                            <input
                                                type="date"
                                                value={leave.startDate}
                                                onChange={(e) => handleLeaveChange(index, 'startDate', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">To</label>
                                            <input
                                                type="date"
                                                value={leave.endDate}
                                                onChange={(e) => handleLeaveChange(index, 'endDate', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="flex-[2] space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Reason (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Vacation, Conference"
                                                value={leave.reason}
                                                onChange={(e) => handleLeaveChange(index, 'reason', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveLeave(index)}
                                            className="self-end md:self-center p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddLeave}
                                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus size={18} /> Add Leave Period
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 glass">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityModal;
