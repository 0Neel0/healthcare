import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [callData, setCallData] = useState(null); // { isReceivingCall: true, from, name, signal }

    useEffect(() => {
        // Force Port 4000 to match backend, ignoring potential .env set to 3000
        const newSocket = io('http://localhost:4000', {
            transports: ['websocket'],
            reconnection: true,
        });

        setSocket(newSocket);

        // Join user-specific rooms
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            newSocket.on('connect', () => {
                if (user.role === 'admin') newSocket.emit('join_room', 'admin_room');
                else if (user.role === 'doctor') newSocket.emit('join_room', `doctor_Dr. ${user.name}`);
                else if (user.role === 'patient') newSocket.emit('join_room', `patient_${user._id}`);
                newSocket.emit('join_room', `user_${user._id}`);
            });

            // Listen for incoming calls globally
            newSocket.on('incomingCall', (data) => {
                setCallData({
                    isReceivingCall: true,
                    from: data.from,
                    name: data.name,
                    signal: data.signal
                });
            });
        }

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{ socket, callData, setCallData }}>
            {children}
        </SocketContext.Provider>
    );
};
