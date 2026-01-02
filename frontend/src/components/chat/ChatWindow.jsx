import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, Image as ImageIcon, X, Video } from 'lucide-react';
import chatService from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import VideoCall from './VideoCall';

const ChatWindow = ({ receiverId, receiverName, onClose, embedded = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Safety check for socket context
    const socketContext = useSocket();
    const socket = socketContext?.socket;

    useEffect(() => {
        if (!socketContext) {
            console.error("SocketContext is null in ChatWindow! Is SocketProvider wrapping App?");
        }
    }, [socketContext]);

    const user = JSON.parse(localStorage.getItem('user'));

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Fetch
    useEffect(() => {
        fetchMessages();
    }, [receiverId]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            // Only add if it belongs to this conversation
            if (message.sender === receiverId || message.receiver === receiverId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, receiverId]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await chatService.getMessages(receiverId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // toast.error('Failed to load chat history'); // Optional to reduce noise
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !file) return;

        try {
            // Optimistic update (optional, but skipping for simplicity with files)
            const sentMessage = await chatService.sendMessage(receiverId, newMessage, file);
            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setFile(selected);
        }
    };

    return (
        <>
            {inCall && (
                <VideoCall
                    receiverId={receiverId}
                    isCaller={true}
                    callData={{ name: receiverName }} // Pass name for display
                    onClose={() => setInCall(false)}
                />
            )}
            <div className={embedded
                ? "flex flex-col w-full h-full bg-white rounded-xl shadow-sm border border-slate-200"
                : "fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300"
            }>
                {/* Header */}
                <div className="p-4 bg-slate-900 text-white rounded-t-xl flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {receiverName?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{receiverName}</h3>
                            <span className="text-xs text-slate-300 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setInCall(true)}
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                            title="Start Video Call"
                        >
                            <Video size={18} />
                        </button>
                        {/* Only show Close button if NOT embedded, or if specific onClose passed */}
                        {onClose && (
                            <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-4"><span className="loading loading-spinner text-slate-400"></span></div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender === user._id;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                        }`}>
                                        {/* File Attachment */}
                                        {msg.fileUrl && (
                                            <div className="mb-2">
                                                {(() => {
                                                    const serverUrl = 'http://localhost:4000';
                                                    const fullUrl = `${serverUrl}${msg.fileUrl}`;
                                                    return msg.type === 'image' || (msg.fileUrl && msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                                                        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={fullUrl}
                                                                alt="attachment"
                                                                className="rounded-lg max-h-40 object-cover border border-white/20"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={fullUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-blue-700' : 'bg-slate-100'} hover:opacity-90 transition-opacity`}
                                                        >
                                                            <FileText size={20} />
                                                            <span className="text-xs truncate max-w-[150px] underline">{msg.fileName || 'Document'}</span>
                                                        </a>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Text Content */}
                                        {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}

                                        {/* Timestamp */}
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-200">
                    {file && (
                        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg mb-2 text-xs">
                            <span className="truncate max-w-[200px] flex items-center gap-2">
                                <Paperclip size={12} /> {file.name}
                            </span>
                            <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-500 hover:text-red-700">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSend} className="flex gap-2 items-end">
                        <div className="flex gap-1 mb-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,.pdf"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Attach file"
                            >
                                <Paperclip size={20} />
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                placeholder="Type a message..."
                                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm max-h-20"
                                rows={1}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() && !file}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 mb-1 shadow-lg shadow-blue-200"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatWindow;
