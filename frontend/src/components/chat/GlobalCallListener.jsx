import React from 'react';
import { useSocket } from '../../context/SocketContext';
import VideoCall from './VideoCall';

const GlobalCallListener = () => {
    const { callData, setCallData } = useSocket();

    if (callData && callData.isReceivingCall) {
        return (
            <VideoCall
                receiverId={null} // ReceiverId not needed for callee (we answer by signaling sender)
                isCaller={false}
                callData={callData}
                onClose={() => setCallData(null)}
            />
        );
    }
    return null;
};

export default GlobalCallListener;
