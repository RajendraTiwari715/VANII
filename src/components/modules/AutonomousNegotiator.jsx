import React, { useState } from 'react';
import { PhoneCall, Bot, CheckCircle, Clock, Volume2, ShieldCheck, Play, ArrowRight } from 'lucide-react';

export const AutonomousNegotiator = () => {
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'dialing' | 'ivr' | 'hold' | 'negotiating' | 'completed'
  const [callLogs, setCallLogs] = useState([]);

  const startNegotiationCall = () => {
    setCallStatus('dialing');
    setCallLogs(['[00:01] Dialing IndiAir Support (+91 1800-419-0001)...']);

    setTimeout(() => {
      setCallStatus('ivr');
      setCallLogs((prev) => [...prev, '[00:03] Connected to IVR Menu. Navigating option 2 (Flight Cancellations)...']);
    }, 2000);

    setTimeout(() => {
      setCallStatus('hold');
      setCallLogs((prev) => [
        ...prev,
        '[00:07] Detected Customer Care Hold Music (Silence & Tonal Analysis Active). Agent waiting in background...',
      ]);
    }, 4500);

    setTimeout(() => {
      setCallStatus('negotiating');
      setCallLogs((prev) => [
        ...prev,
        '[00:12] Agent answered. Negotiating full refund waiver for Flight 6E-204 as per DGCA rules...',
      ]);
    }, 7500);

    setTimeout(() => {
      setCallStatus('completed');
      setCallLogs((prev) => [
        ...prev,
        '[00:18] Negotiation Success! Refund of ₹7,850 approved to original payment source. Summary pushed to user.',
      ]);
    }, 11000);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">4.1 User-Side Personal Negotiator Agent</h3>
            <p className="text-xs text-slate-400">Goal-Based Agentic Decision Engine & SIP Telephony API</p>
          </div>
        </div>

        <button
          onClick={startNegotiationCall}
          disabled={callStatus !== 'idle' && callStatus !== 'completed'}
          className="btn-primary text-xs"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{callStatus === 'idle' || callStatus === 'completed' ? 'Simulate Refund Call' : 'Call in Progress...'}</span>
        </button>
      </div>

      {/* Call Status Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
        <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${callStatus === 'dialing' ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <Clock className="w-4 h-4" /> 1. IVR Navigation
        </div>
        <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${callStatus === 'hold' ? 'bg-amber-950 border-amber-700 text-amber-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <Volume2 className="w-4 h-4" /> 2. Hold Music Analysis
        </div>
        <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${callStatus === 'negotiating' ? 'bg-indigo-950 border-indigo-700 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <Bot className="w-4 h-4" /> 3. Policy Negotiation
        </div>
        <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${callStatus === 'completed' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
          <CheckCircle className="w-4 h-4" /> 4. Refund Pushed
        </div>
      </div>

      {/* Live Call Console Log */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 min-h-[100px]">
        {callLogs.length === 0 ? (
          <p className="text-slate-600 italic">Click "Simulate Refund Call" to test autonomous telephony negotiation...</p>
        ) : (
          callLogs.map((log, idx) => (
            <p key={idx} className="text-cyan-400">
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
};
