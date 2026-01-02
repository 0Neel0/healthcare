import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, Activity, Search } from 'lucide-react';
import axios from 'axios';
import Button from '../../components/ui/Button';

// Direct call to Python Service for MVP (Assuming CORS enabled)
// In prod, use environment variable: VITE_AI_SERVICE_URL
const AI_URL = "http://localhost:8000";

const PredictiveAnalytics = () => {
    const [inflowData, setInflowData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Risk Calculator State
    const [riskParams, setRiskParams] = useState({
        age: 45,
        gender: 'Male',
        appointment_type: 'Checkup',
        patient_id: ''
    });
    const [riskResult, setRiskResult] = useState(null);

    useEffect(() => {
        fetchInflow();
    }, []);

    const fetchInflow = async () => {
        try {
            const res = await axios.get(`${AI_URL}/predictions/inflow`);
            setInflowData(res.data);
        } catch (error) {
            console.error("AI Service Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRisk = async () => {
        try {
            const res = await axios.post(`${AI_URL}/predictions/risk`, riskParams);
            setRiskResult(res.data);
        } catch (error) {
            console.error("Risk calc error:", error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-900">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-purple-600" /> Predictive Analytics (Dynamic)
                </h1>
                <p className="text-slate-500">Real-time forecasts using Hospital Data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inflow Forecast Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" /> Patient Inflow Forecast
                        </h2>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Next 7 Days</span>
                    </div>

                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-slate-400">Loading AI Model...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-end gap-2 h-40 pb-2 border-b border-slate-100">
                                {inflowData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                                        <div
                                            className="w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                                            style={{ height: `${(d.predicted_count > 100 ? 100 : d.predicted_count)}%` }}
                                        ></div>
                                        <span className="text-[10px] text-slate-500 mt-1 font-medium">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-xs text-slate-400">
                                Projected daily appointments based on actual database history
                            </div>
                        </div>
                    )}
                </div>

                {/* No-Show Risk Calculator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <AlertTriangle size={20} className="text-orange-500" /> No-Show Risk Calculator
                    </h2>

                    <div className="space-y-4">
                        {/* Patient ID Search */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <label className="label-modern flex items-center gap-1 text-slate-600">
                                <Search size={14} /> Patient ID (Optional)
                            </label>
                            <input
                                type="text"
                                className="input-modern bg-white"
                                placeholder="Enter Mongo ID (e.g. 64f1...)"
                                value={riskParams.patient_id}
                                onChange={e => setRiskParams({ ...riskParams, patient_id: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Found? Uses personal cancellation history.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-modern">Age</label>
                                <input
                                    type="number" className="input-modern"
                                    value={riskParams.age}
                                    onChange={e => setRiskParams({ ...riskParams, age: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="label-modern">Gender</label>
                                <select
                                    className="input-modern"
                                    value={riskParams.gender}
                                    onChange={e => setRiskParams({ ...riskParams, gender: e.target.value })}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label-modern">Appointment Type</label>
                            <select
                                className="input-modern"
                                value={riskParams.appointment_type}
                                onChange={e => setRiskParams({ ...riskParams, appointment_type: e.target.value })}
                            >
                                <option>Checkup</option>
                                <option>Follow-up</option>
                                <option>Emergency</option>
                            </select>
                        </div>

                        <Button onClick={calculateRisk} className="w-full flex justify-center items-center gap-2">
                            <Activity size={18} /> Calculate Risk Score
                        </Button>

                        {riskResult && (
                            <div className={`mt-4 p-4 rounded-xl text-center border ${riskResult.level === 'High' ? 'bg-red-50 border-red-200 text-red-800' :
                                    riskResult.level === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                        'bg-green-50 border-green-200 text-green-800'
                                }`}>
                                <p className="text-xs uppercase font-bold tracking-wider">Risk Assessment</p>
                                <p className="text-3xl font-black">{riskResult.risk_score}%</p>
                                <p className="font-bold">{riskResult.level} Probability of No-Show</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics;
