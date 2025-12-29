import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VideoCall = ({ receiverId, isCaller, callData, onClose }) => {
    const socketContext = useSocket();
    const socket = socketContext?.socket;
    const user = JSON.parse(localStorage.getItem('user'));

    // Streams
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    // States
    const [callAccepted, setCallAccepted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [status, setStatus] = useState(isCaller ? 'Calling...' : 'Incoming Call...');

    // Refs
    const localVideo = useRef();
    const remoteVideo = useRef();
    const peerConnection = useRef();

    // STUN Servers (Google's public ones)
    const servers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        startCall();
        return () => {
            endCallCleanup();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('callAccepted', handleCallAccepted);
            socket.on('ice-candidate', handleNewICECandidate);
            socket.on('callEnded', handleRemoteHangup);
        }
        return () => {
            if (socket) {
                socket.off('callAccepted', handleCallAccepted);
                socket.off('ice-candidate', handleNewICECandidate);
                socket.off('callEnded', handleRemoteHangup);
            }
        };
    }, [socket, callAccepted]); // Re-bind if state changes (though refs usually better)

    const startCall = async () => {
        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (err) {
                if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    // Fallback: Audio only
                    toast('Camera not found, trying audio only...', { icon: '🎤' });
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                } else {
                    throw err;
                }
            }

            setLocalStream(stream);
            if (localVideo.current) localVideo.current.srcObject = stream;

            peerConnection.current = new RTCPeerConnection(servers);

            // Add local tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            // Handle incoming remote stream
            peerConnection.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
            };

            // Handle ICE candidates
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        candidate: event.candidate,
                        to: receiverId || (callData ? callData.from : null)
                    });
                }
            };

            if (isCaller) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);

                socket.emit('callUser', {
                    userToCall: receiverId,
                    signalData: offer,
                    from: user._id,
                    name: user.name
                });
            } else {
                // If receiving a call, we wait for user to click "Answer"
                // But we already set up the PC/Stream just in case.
            }

        } catch (err) {
            console.error('Error starting video:', err);

            let message = 'Failed to access camera/microphone';
            if (err.name === 'NotAllowedError') {
                message = 'Permission denied. Please allow camera/microphone access.';
            } else if (err.name === 'NotFoundError') {
                message = 'No camera or microphone found.';
            }

            toast.error(message);
            onClose();
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);
        setStatus('Connecting...');
        try {
            // Set Remote Description (Offer)
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(callData.signal));

            // Create Answer
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit('answerCall', {
                signal: answer,
                to: callData.from
            });
            setStatus('Connected');
        } catch (error) {
            console.error('Error answering call:', error);
            toast.error('Connection failed');
        }
    };

    const handleCallAccepted = async (signal) => {
        setCallAccepted(true);
        setStatus('Connected');
        try {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        } catch (error) {
            console.error('Error setting remote description:', error);
        }
    };

    const handleNewICECandidate = async (candidate) => {
        try {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    const handleRemoteHangup = () => {
        toast('Call ended by user');
        onClose();
    };

    const endCallCleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        // Notify other user if we are ending it actively (not just unmounting)
        // Note: usage dependent
    };

    const hangUp = () => {
        const targetId = receiverId || (callData ? callData.from : null);
        socket.emit('endCall', { to: targetId });
        onClose();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
            setIsMuted(!localStream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
            setIsVideoOff(!localStream.getVideoTracks()[0].enabled);
        }
    };

    return (
        <div className={`fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center ${isFullScreen ? 'p-0' : 'p-4'}`}>

            {/* Status Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full text-white backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    {status}
                </div>
            </div>

            {/* Video Container */}
            <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">

                {/* Remote Video (Main) */}
                {callAccepted && (
                    <video
                        playsInline
                        ref={remoteVideo}
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                )}
                {!callAccepted && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 animate-pulse">
                            <Video size={40} />
                        </div>
                        <p className="text-xl font-light">{isCaller ? `Calling...` : `Incoming Call`}</p>
                    </div>
                )}

                {/* Local Video (PiP) */}
                {localStream && (
                    <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-white/10 z-20">
                        <video
                            playsInline
                            ref={localVideo}
                            autoPlay
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/50 px-2 rounded-md">You</div>
                    </div>
                )}

                {/* Incoming Call Overlay */}
                {!isCaller && !callAccepted && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-4 animate-bounce">
                            <Phone size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl text-white font-bold mb-2">{callData?.name} is calling...</h2>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={hangUp}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-full text-white font-semibold transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <PhoneOff size={20} /> Decline
                            </button>
                            <button
                                onClick={answerCall}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-full text-white font-semibold transition-transform hover:scale-105 shadow-lg shadow-green-500/30 flex items-center gap-2"
                            >
                                <Phone size={20} /> Answer
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Controls Bar */}
            <div className="mt-6 flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>

                <button onClick={hangUp} className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white px-8 mx-4 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20">
                    <PhoneOff size={24} />
                </button>

                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full text-white">
                    {isFullScreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                </button>
            </div>

        </div>
    );
};

export default VideoCall;
