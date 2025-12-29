import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Clock, Calendar, Coffee, AlertCircle } from 'lucide-react';
import doctorService from '../../services/doctorService';
import toast from 'react-hot-toast';

const AvailabilityModal = ({ isOpen, onClose, doctorName, currentAvailability }) => {
    const [status, setStatus] = useState(currentAvailability?.status || 'active');
    const [schedule, setSchedule] = useState(currentAvailability?.schedule || []);
    const [breakTimes, setBreakTimes] = useState(currentAvailability?.breakTimes || []);
    const [saving, setSaving] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const toggleDay = (day) => {
        const existing = schedule.find(s => s.day === day);
        if (existing) {
            setSchedule(schedule.filter(s => s.day !== day));
        } else {
            setSchedule([...schedule, { day, startTime: '09:00', endTime: '17:00', isAvailable: true }]);
        }
    };

    const updateDayTime = (day, field, value) => {
        setSchedule(schedule.map(s =>
            s.day === day ? { ...s, [field]: value } : s
        ));
    };

    const addBreak = () => {
        setBreakTimes([...breakTimes, { startTime: '12:00', endTime: '13:00', description: 'Lunch' }]);
    };

    const removeBreak = (index) => {
        setBreakTimes(breakTimes.filter((_, i) => i !== index));
    };

    const updateBreak = (index, field, value) => {
        setBreakTimes(breakTimes.map((b, i) =>
            i === index ? { ...b, [field]: value } : b
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const availabilityData = {
                status,
                schedule,
                breakTimes,
                outOfOfficeDates: currentAvailability?.outOfOfficeDates || []
            };

            await doctorService.updateAvailability(doctorName, availabilityData);
            toast.success('Availability updated successfully');
            onClose();
        } catch (error) {
            console.error('Error updating availability:', error);
            toast.error('Failed to update availability');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Availability" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Status */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-3">Current Status</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { value: 'active', label: 'Active', color: 'bg-[#E3FCEF] border-[#ABF5D1] text-[#006644]' },
                            { value: 'break', label: 'On Break', color: 'bg-[#FFF0B3] border-[#FF991F] text-[#974F0C]' },
                            { value: 'away', label: 'Away', color: 'bg-[#FFEBE6] border-[#FF8F73] text-[#BF2600]' },
                            { value: 'offline', label: 'Offline', color: 'bg-[#F4F5F7] border-[#DFE1E6] text-[#42526E]' }
                        ].map(({ value, label, color }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatus(value)}
                                className={`px-4 py-3 border-2 rounded-lg font-semibold text-sm transition-all ${status === value ? color : 'bg-white border-[#DFE1E6] text-[#7A869A]'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div>
                    <label className="block text-sm font-semibold text-[#253858] mb-3 flex items-center gap-2">
                        <Calendar size={16} className="text-[#0052CC]" />
                        Weekly Schedule
                    </label>
                    <div className="space-y-2">
                        {daysOfWeek.map(day => {
                            const daySchedule = schedule.find(s => s.day === day);
                            const isActive = !!daySchedule;

                            return (
                                <div key={day} className="flex items-center gap-3 bg-[#F4F5F7] rounded-lg p-3">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleDay(day)}
                                        className="w-4 h-4 text-[#0052CC] rounded focus:ring-[#0052CC]"
                                    />
                                    <span className={`w-24 text-sm font-semibold ${isActive ? 'text-[#253858]' : 'text-[#7A869A]'}`}>
                                        {day}
                                    </span>
                                    {isActive && (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="time"
                                                value={daySchedule.startTime}
                                                onChange={(e) => updateDayTime(day, 'startTime', e.target.value)}
                                                className="px-3 py-1.5 border border-[#DFE1E6] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                            />
                                            <span className="text-[#7A869A]">to</span>
                                            <input
                                                type="time"
                                                value={daySchedule.endTime}
                                                onChange={(e) => updateDayTime(day, 'endTime', e.target.value)}
                                                className="px-3 py-1.5 border border-[#DFE1E6] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Break Times */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-[#253858] flex items-center gap-2">
                            <Coffee size={16} className="text-[#0052CC]" />
                            Break Times
                        </label>
                        <button
                            type="button"
                            onClick={addBreak}
                            className="px-3 py-1 text-xs bg-[#0052CC] text-white rounded-md hover:bg-[#003D99] transition-colors"
                        >
                            Add Break
                        </button>
                    </div>

                    {breakTimes.length > 0 ? (
                        <div className="space-y-2">
                            {breakTimes.map((breakTime, index) => (
                                <div key={index} className="flex items-center gap-3 bg-[#FFF0B3]/20 border border-[#FFF0B3] rounded-lg p-3">
                                    <input
                                        type="time"
                                        value={breakTime.startTime}
                                        onChange={(e) => updateBreak(index, 'startTime', e.target.value)}
                                        className="px-3 py-1.5 border border-[#DFE1E6] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                    />
                                    <span className="text-[#7A869A]">to</span>
                                    <input
                                        type="time"
                                        value={breakTime.endTime}
                                        onChange={(e) => updateBreak(index, 'endTime', e.target.value)}
                                        className="px-3 py-1.5 border border-[#DFE1E6] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={breakTime.description}
                                        onChange={(e) => updateBreak(index, 'description', e.target.value)}
                                        placeholder="Description"
                                        className="flex-1 px-3 py-1.5 border border-[#DFE1E6] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBreak(index)}
                                        className="text-[#DE350B] hover:bg-[#FFEBE6] p-2 rounded transition-colors"
                                    >
                                        <AlertCircle size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[#7A869A] italic bg-[#F4F5F7] rounded-lg p-3">No breaks scheduled</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#DFE1E6]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-[#DFE1E6] text-[#42526E] rounded-lg hover:bg-[#F4F5F7] transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AvailabilityModal;
