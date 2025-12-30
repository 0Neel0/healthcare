import React, { useState, useEffect, useRef } from 'react';
import { Upload, MessageSquare, Send, FileText, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { patientDocumentService } from '../../services/patientDocumentService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const DocumentQA = () => {
    // State for Documents
    const [documents, setDocuments] = useState([]);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // State for Chat
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [asking, setAsking] = useState(false);

    // State for Upload (Inline simple upload)
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchDocuments = async () => {
        try {
            setLoadingDocs(true);
            const docs = await patientDocumentService.getMyDocuments();
            setDocuments(docs);
            if (docs.length > 0 && !selectedDocId) {
                // Auto-select the first valid processed document if available
                const validDoc = docs.find(d => d.status === 'COMPLETED');
                if (validDoc) {
                    setSelectedDocId(validDoc._id);
                    setMessages(validDoc.chatHistory || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
            toast.error("Could not load documents");
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const title = file.name;
            const description = "Uploaded for Q&A";
            const newDoc = await patientDocumentService.uploadDocument(file, title, description);

            toast.success("Document uploaded! Analysis started.");

            // Refresh list and select new doc
            await fetchDocuments();
            setSelectedDocId(newDoc._id);

            // Add initial system message
            setMessages([]);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedDocId || asking) return;

        const question = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setAsking(true);

        try {
            const result = await patientDocumentService.askQuestion(selectedDocId, question);
            setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
        } catch (error) {
            console.error("Q&A Error", error);
            const errorMessage = error.response?.data?.message || "Sorry, I couldn't get an answer. Ensure the document is fully analyzed.";
            toast.error(errorMessage);
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${errorMessage}` }]);
        } finally {
            setAsking(false);
        }
    };

    const selectedDocument = documents.find(d => d._id === selectedDocId);

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 max-w-7xl mx-auto p-4 animate-fade-in font-inter">

            {/* Sidebar: Document List */}
            <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" /> My Documents
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loadingDocs ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : documents.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 p-4">No documents found.</p>
                    ) : (
                        documents.map(doc => (
                            <button
                                key={doc._id}
                                onClick={() => {
                                    setSelectedDocId(doc._id);
                                    // Load existing history if available
                                    setMessages(doc.chatHistory || []);
                                }}
                                className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${selectedDocId === doc._id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border-transparent text-slate-600'}`}
                            >
                                <div className="font-medium truncate text-slate-900">{doc.title}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        doc.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                        {doc.status}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="application/pdf,image/*"
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                        Upload New
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {selectedDocument ? (
                    <>
                        <div className="h-16 border-b border-slate-100 flex items-center px-6 bg-white justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">AI Assistant</h3>
                                    <p className="text-xs text-slate-500">Chatting about: <span className="font-medium text-indigo-600">{selectedDocument.title}</span></p>
                                </div>
                            </div>
                            {selectedDocument.status !== 'COMPLETED' && (
                                <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                    <Loader2 size={12} className="animate-spin" /> Analysis in progress... Q&A may be limited.
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 opacity-60">
                                    <MessageSquare size={48} className="mb-4 text-indigo-200" />
                                    <p className="font-medium">Ask any question about this document.</p>
                                    <p className="text-sm mt-1">Example: "What is the diagnosis?" or "Are the values normal?"</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role !== 'user' && (
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : msg.role === 'system' ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0 mt-1">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={selectedDocument.status === 'COMPLETED' ? "Type your question here..." : "Waiting for analysis to complete..."}
                                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner text-sm"
                                    disabled={asking || selectedDocument.status !== 'COMPLETED'}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || asking || selectedDocument.status !== 'COMPLETED'}
                                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md"
                                >
                                    {asking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">
                                AI can make mistakes. Please verify important medical information.
                            </p>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>Select a document from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentQA;
