import React, { useState, useEffect } from 'react';
import { User, Activity } from 'lucide-react';
import { operationsService } from '../../services/operationsService';
import Logo from '../../components/ui/Logo';

const QueueDisplay = () => {
    const [queues, setQueues] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const data = await operationsService.getPublicQueue();
                setQueues(data);
            } catch (error) {
                console.error("Queue fetch error", error);
            }
        };

        fetchQueue();
        // Poll every 10 seconds for real-time updates without socket complexity for this specific view
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <header className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl">
                        <Logo className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">OPD TOKEN DISPLAY</h1>
                        <p className="text-slate-400">Please wait for your number</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-mono font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
                    <p className="text-slate-400">{new Date().toLocaleDateString()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {queues.map((q, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                        <div className="bg-blue-600 p-4 text-center">
                            <h2 className="text-2xl font-bold">{q.doctorName}</h2>
                            <p className="text-blue-200 text-sm uppercase tracking-widest">Consulting Room</p>
                        </div>

                        <div className="p-8 text-center space-y-8">
                            <div>
                                <p className="text-slate-400 text-sm uppercase font-bold mb-2">Current Token</p>
                                <div className="text-8xl font-black text-green-400 font-mono tracking-tighter">
                                    {q.current || '--'}
                                </div>
                            </div>

                            <div className="bg-slate-700/50 rounded-xl p-4">
                                <p className="text-slate-500 text-xs uppercase font-bold mb-2">Next up</p>
                                <div className="flex justify-center gap-3">
                                    {q.upcoming.slice(0, 3).map(t => (
                                        <span key={t} className="bg-slate-600 text-white px-3 py-1 rounded-lg font-mono text-xl">
                                            {t}
                                        </span>
                                    ))}
                                    {q.upcoming.length === 0 && <span className="text-slate-500 italic">Queue Empty</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {queues.length === 0 && (
                <div className="text-center py-24 text-slate-600">
                    <Activity size={64} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl">No Active Queues</h2>
                </div>
            )}
        </div>
    );
};

export default QueueDisplay;
