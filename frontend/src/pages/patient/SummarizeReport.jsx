import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle, Activity, Brain, Shield, Clock, X, FileCheck, ChevronRight, Printer, Share2, Scan } from 'lucide-react';
import { patientDocumentService } from '../../services/patientDocumentService';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SummarizeReport = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [processingStep, setProcessingStep] = useState('idle'); // idle, uploading, scanning, analyzing, complete
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const resultsRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (file) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error("File size must be less than 10MB");
            return;
        }
        setFile(file);
        setSummary(null);
        setError(null);
        setProcessingStep('idle');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setProcessingStep('uploading');
            setError(null);

            // Scroll to results anticipating content
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);

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

    const clearSelection = () => {
        setFile(null);
        setSummary(null);
        setProcessingStep('idle');
    };

    return (
        <div className="space-y-8 animate-fade-in p-2 font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="text-[#0052CC]" size={32} />
                        Medical Report Analysis
                    </h1>
                    <p className="text-[#42526E] mt-1">AI-Powered Interpretation & Summarization</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Encrypted & Private
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8">

                {/* Top Section: Upload */}
                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#F4F5F7]/50">
                            <h2 className="font-bold text-[#253858] flex items-center gap-2">
                                <Upload className="w-4 h-4 text-[#0052CC]" /> Source Document
                            </h2>
                            {file && (
                                <button onClick={clearSelection} className="text-xs font-medium text-[#42526E] hover:text-[#DE350B] flex items-center gap-1 transition-colors">
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            {!file ? (
                                <div
                                    className={`
                                        border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center text-center transition-all cursor-pointer group
                                        ${dragActive ? 'border-[#0052CC] bg-[#DEEBFF]' : 'border-slate-300 hover:border-[#4C9AFF] hover:bg-slate-50'}
                                    `}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('report-upload').click()}
                                >
                                    <input id="report-upload" type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileSelect} />
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#F4F5F7] rounded-full group-hover:scale-110 transition-transform">
                                            <FileText className="w-6 h-6 text-[#7A869A] group-hover:text-[#0052CC]" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-[#253858] font-bold text-lg">Upload Report</h3>
                                            <p className="text-[#42526E] text-sm">Drag & drop PDF, JPG, or PNG files (Max 10MB)</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 text-[#00875A]">
                                        <FileCheck className="w-8 h-8" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#253858] text-lg">{file.name}</h3>
                                        <p className="text-xs text-[#7A869A] uppercase tracking-wider mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                                    </div>

                                    <div className="w-full md:w-auto">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full md:w-auto shadow-lg shadow-indigo-900/10 whitespace-nowrap"
                                            disabled={!file || uploading}
                                            onClick={handleUpload}
                                        >
                                            {uploading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <>
                                                    Analyze with AI <ChevronRight className="w-4 h-4 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {uploading && (
                                <div className="mt-6">
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                        <div className="bg-[#0052CC] h-2 rounded-full animate-pulse w-2/3"></div>
                                    </div>
                                    <p className="text-center text-xs text-[#0052CC] font-bold animate-pulse">Reading content and generating summary...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Analysis Results */}
                <div className="w-full" ref={resultsRef}>
                    {summary ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
                            <div className="bg-[#F4F5F7]/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-[#253858] text-lg">Report Summary</h3>
                                    <p className="text-[#7A869A] text-xs font-medium uppercase tracking-wide">
                                        Generated by Gemini AI • {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="btn-square" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="sm" className="btn-square"><Share2 className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Status Header */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-dashed border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#00875A] text-white p-2 rounded-lg">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#7A869A] uppercase">Analysis Status</div>
                                            <div className="text-[#00875A] font-bold">SUCCESS</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-[#7A869A] uppercase">Report Type</div>
                                        <div className="text-[#253858] font-black text-lg">General</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="prose prose-slate max-w-none">
                                    <div className="text-[#253858] leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: parseMarkdown(summary) }} />
                                </div>

                                <div className="mt-8 p-4 bg-[#FFF0B3] border-l-4 border-[#FF991F] rounded-r-lg">
                                    <p className="text-[#172B4D] text-sm font-medium">
                                        Disclaimer: This summary is generated by AI for informational purposes. Always consult your doctor for medical advice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <div className="w-20 h-20 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10 text-[#7A869A]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#253858]">Ready to Summarize</h3>
                            <p className="text-[#7A869A] max-w-sm mt-2">
                                Upload a lab report or discharge summary to get an instant AI-powered explanation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reuse simple markdown parser
const parseMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-[#0052CC] mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[#172B4D] mt-8 mb-4 border-b border-slate-200 pb-2">$1</h2>')
        .replace(/^\*\* (.*$)/gim, '<b>$1</b>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\n\n/gim, '<br/><br/>')
        .replace(/- (.*$)/gim, '<li class="ml-4 list-disc text-[#42526E]">$1</li>');
    return html;
};

export default SummarizeReport;
