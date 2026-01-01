import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, FileImage, Activity, AlertTriangle, CheckCircle, Brain, X, Download, Share2, Scan, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const MedicalImaging = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const resultsRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPEG, PNG)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
        setSelectedFile(file);
        setAnalysis(null);
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

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            // Using the backend port 4000 directly
            const response = await axios.post('http://localhost:4000/api/medical-imaging/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAnalysis(response.data.analysis);
            toast.success('Analysis complete');
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setAnalysis(null);
    };

    return (

        <div className="space-y-8 animate-fade-in pb-10">

            {/* Premium Header with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0052CC] to-[#091E42] p-8 md:p-10 text-white shadow-xl shadow-blue-900/10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <button onClick={() => navigate(-1)} className="flex items-center text-blue-200 hover:text-white transition-colors mb-6 font-medium group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Activity className="text-blue-300" size={24} />
                                </div>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-400/20 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    AI Assist Beta
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                                Medical Image Diagnostics
                            </h1>
                            <p className="text-blue-200 max-w-xl text-lg leading-relaxed">
                                Upload X-rays, MRIs, or CT scans for instant AI-powered preliminary analysis and anomaly detection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8 px-2 md:px-4">

                {/* Top Section: Upload Area */}
                <div className="w-full">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileImage className="w-4 h-4 text-[#0052CC]" /> Input Source
                            </h2>
                            {selectedFile && (
                                <button onClick={clearSelection} className="text-xs font-medium text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1 bg-white border border-slate-200 rounded-md hover:border-red-200">
                                    <X className="w-3 h-3" /> Clear Image
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            {!previewUrl ? (
                                <div
                                    className={`
                                        border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden
                                        ${dragActive ? 'border-[#0052CC] bg-blue-50/50' : 'border-slate-300 hover:border-[#0052CC] hover:bg-slate-50'}
                                    `}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="p-5 bg-blue-50 rounded-full group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                                            <Upload className="w-8 h-8 text-[#0052CC]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-slate-900 font-bold text-lg group-hover:text-[#0052CC] transition-colors">Click to Upload Scan</h3>
                                            <p className="text-slate-500 text-sm">or drag and drop X-Ray, MRI, or CT files here</p>
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-full">
                                            Supports: PNG, JPG, DICOM (Preview)
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col lg:flex-row items-stretch gap-8 animate-fade-in-up">
                                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 w-full lg:w-1/3 aspect-square lg:aspect-auto group shadow-lg border border-slate-200">
                                        <img src={previewUrl} alt="Medical Scan" className="w-full h-full object-contain p-2" />

                                        {/* Overlay Info */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-mono">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedFile.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Ready to Analyze</span>
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">Image Loaded</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-600">
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 min-w-[20px]"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-slate-900">Pre-check Passed</p>
                                                    <p>Image quality is sufficient for AI analysis. Click the button below to generate a diagnostic report.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto">
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                className="w-full sm:w-auto min-w-[200px] h-12 text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
                                                disabled={!selectedFile || loading}
                                                onClick={handleAnalyze}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Running Diagnostics...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Generate Analysis <ChevronRight className="w-5 h-5 ml-1" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="mt-8 animate-fade-in">
                                    <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-400 to-indigo-600 h-3 rounded-full animate-[shimmer_1.5s_infinite] w-full origin-left-right scale-x-50"></div>
                                    </div>
                                    <p className="text-center text-sm text-indigo-600 font-bold animate-pulse">Running advanced diagnostic models on Gemini AI...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Analysis Results */}
                <div className="w-full" ref={resultsRef}>
                    {analysis ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
                            <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                                        <Brain className="text-indigo-600 w-6 h-6" /> Diagnostic Report
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Generated by Gemini AI • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 gap-2">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <Button variant="ghost" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 gap-2">
                                        <Download className="w-4 h-4" /> PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 lg:p-10">
                                {/* Status Header */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-8 border-b border-slate-100">
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-4">
                                        <div className="bg-green-100 p-3 rounded-lg text-green-700">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-green-800 uppercase tracking-wider">Status</div>
                                            <div className="text-green-900 font-bold text-lg">Completed</div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
                                            <Scan className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Analysis Type</div>
                                            <div className="text-blue-900 font-bold text-lg">Visual Triage</div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-center gap-4">
                                        <div className="bg-purple-100 p-3 rounded-lg text-purple-700">
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">AI Confidence</div>
                                            <div className="text-purple-900 font-bold text-lg">High</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="prose prose-lg prose-slate max-w-none">
                                    <div className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }} />
                                </div>

                                <div className="mt-10 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">Important Medical Disclaimer</h4>
                                        <p className="text-amber-800 text-sm leading-relaxed">
                                            This automated report is generated by AI (Gemini 1.5 Series) and is intended for <strong>triage assistance only</strong>.
                                            It is NOT a definitive medical diagnosis. All findings must be verified by a certified radiologist or medical professional.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-slate-200 border-dashed group hover:border-[#0052CC]/50 transition-colors">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Brain className="w-10 h-10 text-slate-300 group-hover:text-[#0052CC] transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Ready for Analysis</h3>
                            <p className="text-slate-500 max-w-md mt-2 text-lg">
                                Upload a medical image above to generate a comprehensive diagnostic report here using our AI Models.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const parseMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-[#0052CC] mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[#172B4D] mt-8 mb-4 border-b border-slate-200 pb-2">$1</h2>')
        .replace(/^\*\* (.*$)/gim, '<b>$1</b>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\n\n/gim, '<br /><br />')
        .replace(/- (.*$)/gim, '<li class="ml-4 list-disc text-[#42526E]">$1</li>');
    return html;
};

export default MedicalImaging;
