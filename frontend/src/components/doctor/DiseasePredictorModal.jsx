import React, { useState } from 'react';
import Button from '../ui/Button';
import { X, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import doctorService from '../../services/doctorService';

const DiseasePredictorModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('symptoms'); // 'symptoms' or 'image'

    // Symptom State
    const [symptoms, setSymptoms] = useState('');

    // Image State
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Shared State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [imageAnalysis, setImageAnalysis] = useState(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageAnalysis(null);
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setResult(null);
        setImageAnalysis(null);

        try {
            if (mode === 'symptoms') {
                if (!symptoms.trim()) {
                    toast.error("Please enter symptoms");
                    setLoading(false);
                    return;
                }
                const data = await doctorService.predictDisease(symptoms);
                setResult(data);
                if (data.error) toast.error("Prediction failed");
                else toast.success("Prediction complete");
            }
            else if (mode === 'image') {
                if (!selectedImage) {
                    toast.error("Please select an image");
                    setLoading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('image', selectedImage);

                const data = await doctorService.analyzeImage(formData);

                if (data && data.analysis) {
                    setImageAnalysis(data.analysis);
                    toast.success("Image Analysis Complete");
                } else {
                    toast.error(data.message || "Analysis failed");
                }
            }
        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Failed to analyze");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            <h2 className="text-lg font-bold">AI Medical Assistant</h2>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b shrink-0">
                        <button
                            onClick={() => setMode('symptoms')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Symptom Checker
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'image' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Medical Imaging (X-Ray/Scan)
                        </button>
                    </div>

                    {/* Body - Scrollable */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

                        {/* MODE: SYMPTOMS */}
                        {mode === 'symptoms' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700">
                                        Uses a <strong>Random Forest model</strong> trained on synthetic data.
                                        Enter symptoms separated by commas.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
                                    <textarea
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        placeholder="e.g. fever, cough, headache..."
                                        className="w-full h-32 p-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50"
                                    />
                                </div>
                                {result && (
                                    <div className={`p-4 rounded-xl border ${result.confidence_score > 0.8 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Prediction</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-center text-slate-800 mb-1">{result.disease}</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-sm font-bold ${result.confidence_score > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {(result.confidence_score * 100).toFixed(1)}% Confidence
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODE: IMAGE */}
                        {mode === 'image' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-purple-50 p-3 rounded-lg flex items-start gap-3 border border-purple-100">
                                    <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-purple-700">
                                        Uses <strong>Gemini Vision AI</strong> to analyze medical images.
                                        Supports X-Rays, CT Scans, and skin photos.
                                    </p>
                                </div>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center relative hover:bg-slate-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {!previewUrl ? (
                                        <>
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                <Activity className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                                        </>
                                    ) : (
                                        <div className="relative w-full h-48 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                                            <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedImage(null); }}
                                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {imageAnalysis && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Analysis Report</h3>
                                        <div className="prose prose-sm max-w-none text-slate-600">
                                            {/* Simple rendering of markdown text - in real app use react-markdown */}
                                            <pre className="whitespace-pre-wrap font-sans text-sm">{imageAnalysis}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="flex items-start gap-2 text-xs text-slate-400 mt-6 px-2">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                            <p>This is a demonstration AI model. Do not use for actual medical diagnosis.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={onClose} className="text-slate-500">Close</Button>
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || (mode === 'symptoms' && !symptoms) || (mode === 'image' && !selectedImage)}
                            className={`bg-blue-600 hover:bg-blue-700 text-white gap-2 w-32 ${loading ? 'opacity-80' : ''}`}
                        >
                            {loading ? <span className="loading loading-spinner loading-xs" /> : 'Analyze'}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DiseasePredictorModal;
