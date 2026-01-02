import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { getMessages, sendMessage } from '../../services/telemedicine.service';
import socket from '../../services/socket';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ currentUser, receiver, isMobile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (receiver?._id) {
            loadMessages();
            scrollToBottom();
        }
    }, [receiver?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Listen for incoming messages
        socket.on('receive_message', (message) => {
            if (
                (message.sender === receiver._id && message.receiver === currentUser._id) ||
                (message.sender === currentUser._id && message.receiver === receiver._id)
            ) {
                // Avoid duplicates if we already added it optimally
                setMessages((prev) => {
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [receiver?._id, currentUser._id]);

    const loadMessages = async () => {
        try {
            if (!receiver?._id) return;
            const data = await getMessages(receiver._id);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages', error);
            toast.error('Could not load chat history');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !file) || !receiver?._id) return;

        const formData = new FormData();
        formData.append('receiverId', receiver._id);
        if (newMessage.trim()) formData.append('content', newMessage);
        if (file) formData.append('file', file);
        // Type is auto-handled by backend if file exists

        try {
            // Optimistic UI update could be risky with files, so we wait or show loading
            // For text, we could be optimistic, but let's stick to reliable ack
            const savedMessage = await sendMessage(formData);

            // Add to local list immediately (socket will also emit, but we handle duplicates)
            setMessages((prev) => [...prev, savedMessage]);

            setNewMessage('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (!receiver) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Select a contact to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-4 bg-primary/5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {receiver.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{receiver.name}</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser._id;
                    return (
                        <div key={msg._id || index} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-header text-xs opacity-50 mb-1">
                                {isMe ? 'You' : receiver.name}
                                <time className="text-xs opacity-50 ml-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                            </div>
                            <div className={`chat-bubble ${isMe ? 'chat-bubble-primary' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.fileUrl && (
                                    <div className="mb-2">
                                        {msg.type === 'image' || msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <img src={`http://localhost:4000${msg.fileUrl}`} alt="attachment" className="max-w-[200px] rounded-lg border border-white/20" />
                                        ) : (
                                            <a href={`http://localhost:4000${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                                                <Paperclip size={16} /> Attachment
                                            </a>
                                        )}
                                    </div>
                                )}
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                {file && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 w-fit">
                        <Paperclip size={14} />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button onClick={() => { setFile(null); fileInputRef.current.value = ''; }} className="hover:text-red-500">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf"
                    />
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-circle btn-sm md:btn-md"
                        disabled={!newMessage.trim() && !file}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
