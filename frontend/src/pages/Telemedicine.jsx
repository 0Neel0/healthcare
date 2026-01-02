import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import ChatWindow from '../components/telemedicine/ChatWindow';
import { Video, Calendar, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Telemedicine = () => {
    const location = useLocation();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user._id) {
            loadContacts();
        }
    }, [user._id]);

    const loadContacts = async () => {
        try {
            let data = [];
            if (user.role === 'patient') {
                data = await appointmentService.getPatientAppointments(user._id);
            } else if (user.role === 'doctor' || user.role === 'admin') {
                // If doctor, get all appointments (using name based API for now)
                if (user.name) {
                    data = await appointmentService.getDoctorAppointments(user.name);
                }
            }
            extractContacts(data);
        } catch (error) {
            console.error("Link fetch failed", error);
            // toast.error("Could not load contacts");
        } finally {
            setLoading(false);
        }
    };

    const extractContacts = (apptList) => {
        if (!Array.isArray(apptList)) return;
        const unique = new Map();

        apptList.forEach(appt => {
            if (user.role === 'patient') {
                // Target is Doctor
                if (appt.doctor && appt.doctor._id) {
                    // Check if doctor object is populated
                    const docId = appt.doctor._id;
                    if (!unique.has(docId)) {
                        unique.set(docId, {
                            _id: docId,
                            name: appt.primaryPhysician || appt.doctor.name, // Fallback
                            avatar: appt.doctor.avatar,
                            role: 'Doctor',
                            lastAppt: appt.schedule
                        });
                    }
                }
            } else {
                // Target is Patient
                if (appt.patient && appt.patient._id) {
                    const patId = appt.patient._id;
                    if (!unique.has(patId)) {
                        unique.set(patId, {
                            _id: patId,
                            name: appt.patient.name,
                            avatar: appt.patient.profilePicture,
                            role: 'Patient',
                            lastAppt: appt.schedule
                        });
                    }
                }
            }
        });

        const contactList = Array.from(unique.values()).sort((a, b) => new Date(b.lastAppt) - new Date(a.lastAppt));
        setContacts(contactList);

        // DEEP LINKING LOGIC
        if (location.state?.patientId) {
            const requestedId = location.state.patientId;
            const found = contactList.find(c => c._id === requestedId);
            if (found) {
                setActiveContact(found);
            } else if (location.state.patientName) {
                // Temp Contact
                const temp = {
                    _id: requestedId,
                    name: location.state.patientName,
                    role: 'Patient',
                    isTemp: true
                };
                setContacts(prev => [temp, ...prev]);
                setActiveContact(temp);
            }
        } else if (contactList.length > 0 && !activeContact) {
            setActiveContact(contactList[0]);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden animate-fade-in">
            {/* Sidebar List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 flex-shrink-0">
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Video size={24} className="text-blue-600" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Telemedicine
                        </span>
                    </h2>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-2">
                            <div className="loading loading-spinner loading-md text-blue-500"></div>
                            <p className="text-xs text-gray-400">Syncing contacts...</p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                            <Calendar size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">No contacts found.</p>
                            <p className="text-xs opacity-60 mt-1">Book an appointment to start chatting.</p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {filteredContacts.map(contact => (
                                <button
                                    key={contact._id}
                                    onClick={() => setActiveContact(contact)}
                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${activeContact?._id === contact._id
                                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm">
                                            {contact.avatar ? (
                                                <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-200">
                                                    {contact.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-semibold truncate text-sm">{contact.name}</p>
                                        <p className="text-xs opacity-70 truncate">{contact.role} • {contact.isTemp ? 'New' : 'Online'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-slate-50 flex flex-col">
                {activeContact ? (
                    <div className="flex-1 h-full p-4 md:p-6 overflow-hidden">
                        <div className="h-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                            <ChatWindow
                                currentUser={user}
                                receiver={activeContact}
                                onClose={() => setActiveContact(null)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                            <Video size={48} className="text-blue-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700">Digital Consultation Room</h2>
                        <p className="max-w-md text-center mt-3 text-gray-500">
                            Select a patient or doctor from the sidebar to verify details, start a secure chat, or initiate a video call.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Telemedicine;
