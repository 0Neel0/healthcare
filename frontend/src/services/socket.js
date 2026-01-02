import { io } from 'socket.io-client';

// Auto-connect to the same host/port 4000
const socket = io('http://localhost:4000', {
    autoConnect: false,
});

export default socket;
