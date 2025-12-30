import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle, Activity, Brain, Shield, Clock, X, FileCheck, ChevronRight, Printer, Share2 } from 'lucide-react';
import { patientDocumentService } from '../../services/patientDocumentService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SummarizeReport = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle'); // idle, uploading, scanning, analyzing, complete
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("File size must be less than 10MB");
                return;
            }
            setFile(selectedFile);
            setSummary(null);
            setError(null);
            setProcessingStep('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setProcessingStep('uploading');
            setError(null);

            const title = `AI Analysis - ${file.name}`;
            const description = "Automated Medical Report Analysis";

            // 1. Upload Document
            const doc = await patientDocumentService.uploadDocument(file, title, description);

            setProcessingStep('scanning');

            // 2. Poll for Status
            if (doc.status === 'PENDING' || doc.status === 'PROCESSING') {
                const pollInterval = setInterval(async () => {
                    try {
                        const updatedDocs = await patientDocumentService.getMyDocuments();
                        const currentDoc = updatedDocs.find(d => d._id === doc._id);

                        // Fake progress transition for UI effect
                        setProcessingStep(prev => prev === 'scanning' ? 'analyzing' : prev);

                        if (currentDoc) {
                            if (currentDoc.status === 'COMPLETED') {
                                clearInterval(pollInterval);
                                setSummary(currentDoc.summary);
                                setProcessingStep('complete');
                                setUploading(false);
                                toast.success("Analysis Complete!");
                            } else if (currentDoc.status === 'FAILED') {
                                clearInterval(pollInterval);
                                setError(currentDoc.processingError || "AI processing failed");
                                setProcessingStep('idle');
                                setUploading(false);
                            }
                        }
                    } catch (e) {
                        console.error("Polling error", e);
                    }
                }, 2000);

                setTimeout(() => {
                    clearInterval(pollInterval);
                    if (uploading) {
                        setUploading(false);
                        setProcessingStep('idle');
                        setError("Analysis timed out. Please try again later.");
                    }
                }, 45000); // 45s timeout
            } else if (doc.summary) {
                setSummary(doc.summary);
                setProcessingStep('complete');
                setUploading(false);
            }

        } catch (err) {
            console.error("Error:", err);
            setError("Failed to upload/analyze document.");
            setProcessingStep('idle');
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 min-h-[calc(100vh-80px)] flex flex-col font-inter">
            {/* Compact Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Medical Report Summarizer</h1>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 text-xs font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                    <span className="flex items-center gap-1"><Shield size={14} /> Encrypted</span>
                    <span className="w-px h-4 bg-indigo-200"></span>
                    <span className="flex items-center gap-1"><Brain size={14} /> Smart Analysis</span>
                </div>
            </div>

            {/* Main Content Area - Vertical Layout */}
            <div className="flex flex-col gap-6 flex-1">

                {/* 1. Upload & Action Bar */}
                <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-300 ${processingStep !== 'idle' ? 'opacity-80 pointer-events-none' : ''}`}>

                    {/* File Drop Zone */}
                    <div className="md:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                        <div className={`relative h-20 md:h-24 rounded-xl border-2 border-dashed transition-all flex items-center px-6 gap-6 ${file ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}`}>

                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                accept="application/pdf,image/*"
                                disabled={uploading}
                            />

                            {file ? (
                                <>
                                    <div className="w-12 h-12 bg-white rounded-lg border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 z-10">
                                        <FileCheck size={24} />
                                    </div>
                                    <div className="flex-1 z-10 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-lg truncate">{file.name}</h4>
                                        <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setFile(null);
                                        }}
                                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors z-30"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                        <Upload size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-700">Upload Medical Document</h4>
                                        <p className="text-slate-400 text-sm">PDF, JPEG, PNG (Max 10MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="md:col-span-3">
                        <Button
                            className={`w-full h-full min-h-[5rem] text-lg font-bold shadow-lg shadow-indigo-200 transition-all rounded-2xl ${!file ? 'opacity-50 cursor-not-allowed bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95'}`}
                            onClick={handleUpload}
                            disabled={!file || uploading}
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Analyze Report <ChevronRight size={20} />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* 2. Results Area (Fills space) */}
                <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-200 p-2 md:p-4 shadow-inner min-h-[600px] flex flex-col relative overflow-hidden">

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                    {/* Content Container - The "Paper" */}
                    <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-hidden flex flex-col relative z-10 transition-all duration-500">

                        {/* Header of the "Paper" */}
                        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                            <div className="flex items-center gap-2 text-slate-400">
                                <FileText size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Analysis Result</span>
                            </div>
                            {summary && (
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="Print" onClick={() => window.print()}>
                                        <Printer size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="Share">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                            {processingStep !== 'idle' && processingStep !== 'complete' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-20">
                                    <div className="relative w-32 h-40 bg-white rounded-lg border border-slate-200 shadow-xl mb-8 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-50 flex flex-col gap-2 p-3">
                                            <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                            <div className="h-2 w-full bg-slate-200 rounded"></div>
                                            <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                                            <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="absolute top-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-scan"></div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Document...</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className={`transition-colors ${['uploading', 'scanning', 'analyzing'].includes(processingStep) ? 'text-indigo-600 font-medium' : ''}`}>Uploading</span>
                                        <ChevronRight size={12} />
                                        <span className={`transition-colors ${['scanning', 'analyzing'].includes(processingStep) ? 'text-indigo-600 font-medium' : ''}`}>Scanning</span>
                                        <ChevronRight size={12} />
                                        <span className={`transition-colors ${['analyzing'].includes(processingStep) ? 'text-indigo-600 font-medium' : ''}`}>Synthesizing</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Processing Failed</h3>
                                    <p className="text-slate-500 max-w-xs mt-2">{error}</p>
                                    <Button variant="ghost" className="mt-4 text-indigo-600" onClick={() => { setError(null); setProcessingStep('idle'); }}>
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {processingStep === 'complete' && summary && (
                                <div className="p-8 md:p-12 animate-fade-in-up max-w-4xl mx-auto">
                                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-slate-800">Key Insights & Summary</h2>
                                            <p className="text-slate-500 text-sm">AI Analysis of {file?.name}</p>
                                        </div>
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-slate-400 font-mono uppercase">Report ID</p>
                                            <p className="font-mono text-slate-600">#AI-{Math.floor(Math.random() * 10000)}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
                                        <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                            {summary}
                                        </div>
                                    </div>

                                    <div className="mt-12 p-6 bg-slate-50 border-l-4 border-indigo-500 rounded-r-lg">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Shield size={16} className="text-indigo-500" /> AI Disclaimer
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            This summary is generated by an artificial intelligence model (Gemini 2.5 Flash) and is intended for informational clarity only.
                                            It may not capture all clinical nuances. Please verify all critical information with the original document and a certified medical professional.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {processingStep === 'idle' && !error && !summary && (
                                <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Activity size={40} className="text-slate-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-400">No Report Analyzed Yet</h2>
                                    <p className="text-slate-400 mt-2 max-w-sm">
                                        Upload a medical document above to see the AI-generated summary, key findings, and action items here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummarizeReport;
