import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

const VoiceRecorder = ({ onTranscriptChange, placeholder = "Start recording..." }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    const newText = transcript + finalTranscript + ' ';
                    setTranscript(newText);
                    onTranscriptChange && onTranscriptChange(newText);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
        } else {
            console.warn("Web Speech API not supported in this browser");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [transcript]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isRecording ? "Listening..." : "Voice Note"}
                </span>
                <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-full transition-all ${isRecording
                            ? 'bg-red-100 text-red-600 animate-pulse'
                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                >
                    {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                </button>
            </div>

            <textarea
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={3}
                placeholder={placeholder}
                value={transcript}
                onChange={(e) => {
                    setTranscript(e.target.value);
                    onTranscriptChange && onTranscriptChange(e.target.value);
                }}
            />
        </div>
    );
};

export default VoiceRecorder;
