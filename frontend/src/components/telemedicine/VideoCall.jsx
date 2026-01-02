import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Phone, MonitorUp } from 'lucide-react';
import socket from '../../services/socket';
import { toast } from 'react-hot-toast';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

const VideoCall = ({ currentUser, receiver, onEndCall }) => {
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, connected
    const [incomingCallDetails, setIncomingCallDetails] = useState(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef();

    // Initialize Socket Listeners
    useEffect(() => {
        socket.on('incomingCall', ({ from, name, signal }) => {
            console.log("Incoming call from", name);
            if (callStatus === 'idle') {
                setIncomingCallDetails({ from, name, signal });
                setCallStatus('incoming');
            } else {
                // Busy? Maybe emit busy signal
            }
        });

        socket.on('callAccepted', (signal) => {
            console.log("Call accepted");
            setCallStatus('connected');
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        });

        socket.on('ice-candidate', (candidate) => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('callEnded', () => {
            endCallCleanup();
            toast('Call ended by remote user');
        });

        return () => {
            socket.off('incomingCall');
            socket.off('callAccepted');
            socket.off('ice-candidate');
            socket.off('callEnded');
        };
    }, [callStatus]);

    // Handle Stream Setup
    useEffect(() => {
        if (callStatus === 'connected' && remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callStatus]);

    const startLocalStream = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(currentStream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            toast.error("Could not access camera/microphone");
            return null;
        }
    };

    const createPeerConnection = (currentStream) => {
        const peer = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks
        currentStream.getTracks().forEach(track => {
            peer.addTrack(track, currentStream);
        });

        // Handle remote tracks
        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: receiver._id || incomingCallDetails?.from
                });
            }
        };

        peerConnectionRef.current = peer;
        return peer;
    };

    const callUser = async () => {
        const currentStream = await startLocalStream();
        if (!currentStream) return;

        setCallStatus('calling');
        const peer = createPeerConnection(currentStream);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('callUser', {
            userToCall: receiver._id,
            signalData: offer,
            from: currentUser._id,
            name: currentUser.name
        });
    };

    const answerCall = async () => {
        const currentStream = await startLocalStream();
        if (!currentStream) return;

        setCallStatus('connected');
        const peer = createPeerConnection(currentStream);

        await peer.setRemoteDescription(new RTCSessionDescription(incomingCallDetails.signal));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answerCall', {
            signal: answer,
            to: incomingCallDetails.from
        });
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !isVideoOn;
            setIsVideoOn(!isVideoOn);
        }
    };

    const leaveCall = () => {
        const targetId = receiver?._id || incomingCallDetails?.from;
        if (targetId) commandEndCall(targetId);
        endCallCleanup();
    };

    const commandEndCall = (id) => {
        socket.emit('endCall', { to: id });
    };

    const endCallCleanup = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.destroy ? peerConnectionRef.current.destroy() : peerConnectionRef.current.close();
        }
        setStream(null);
        setRemoteStream(null);
        setCallStatus('idle');
        setIncomingCallDetails(null);
        peerConnectionRef.current = null;
        if (onEndCall) onEndCall();
    };

    // --- RENDER HELPERS ---

    if (callStatus === 'incoming') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-primary/20 animate-pulse">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary animate-bounce">
                    <Phone size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{incomingCallDetails?.name}</h3>
                <p className="text-gray-500 mb-6">Incoming Video Call...</p>
                <div className="flex gap-4">
                    <button onClick={endCallCleanup} className="btn btn-error btn-circle text-white">
                        <PhoneOff size={24} />
                    </button>
                    <button onClick={answerCall} className="btn btn-success btn-circle text-white">
                        <Video size={24} />
                    </button>
                </div>
            </div>
        );
    }

    if (callStatus === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-blue-500">
                    <Video size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Ready for Consultation</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">Start a secure video call with {receiver?.name || 'the patient'}.</p>
                <button
                    onClick={callUser}
                    disabled={!receiver}
                    className="btn btn-primary gap-2"
                >
                    <Video size={20} />
                    Start Video Call
                </button>
            </div>
        );
    }

    // Active Call UI
    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl group">
            {/* Remote Video (Main) */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    <div className="text-center">
                        <div className="loading loading-spinner loading-lg mb-2"></div>
                        <p>{callStatus === 'calling' ? 'Calling...' : 'Connecting...'}</p>
                    </div>
                </div>
            )}

            {/* Local Video (PiP) */}
            <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-white/20">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror" // mirror class for self-view
                />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-4 transition-transform translate-y-full group-hover:translate-y-0">
                <button onClick={toggleMic} className={`btn btn-circle ${isMicOn ? 'btn-ghost text-white bg-white/10 hover:bg-white/20' : 'btn-error'}`}>
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button onClick={leaveCall} className="btn btn-error btn-circle scale-110">
                    <PhoneOff size={24} />
                </button>

                <button onClick={toggleVideo} className={`btn btn-circle ${isVideoOn ? 'btn-ghost text-white bg-white/10 hover:bg-white/20' : 'btn-error'}`}>
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
