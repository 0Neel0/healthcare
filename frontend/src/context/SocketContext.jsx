import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
            transports: ['websocket'],
            reconnection: true,
        });

        setSocket(newSocket);

        // Join user-specific rooms on connection/login
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && newSocket) {
            if (user.role === 'admin') {
                newSocket.emit('join_room', 'admin_room');
            } else if (user.role === 'doctor') {
                newSocket.emit('join_room', `doctor_Dr. ${user.name}`); // Matching backend expectation
            } else if (user.role === 'patient') {
                newSocket.emit('join_room', `patient_${user._id}`);
            }
        }

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
