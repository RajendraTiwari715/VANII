import React from 'react';
import { Mic, User, PhoneCall, Zap, Activity, HeartHandshake, ShieldAlert } from 'lucide-react';

export const Navbar = ({ persona, onPersonaChange, onOpenCrisisModal, isLive, latencyMs = 490 }) => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between glass-panel mb-6 sticky top-2 z-50">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Activity className="w-6 h-6 text-black animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              VANII
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              v2.4 Neural
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Ultra-Empathic & Emotion-Aware AI Voice Agent
          </p>
        </div>
      </div>

      {/* Latency Budget & Live Status */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-xs font-mono text-slate-300">
            {isLive ? 'WebRTC Active' : 'Standby'}
          </span>
        </div>

        <div className="badge-latency flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Latency: {latencyMs}ms</span>
          <span className="text-[10px] text-emerald-500/70 font-sans">(Target &lt;500ms)</span>
        </div>
      </div>

      {/* Persona Switcher & Crisis Button */}
      <div className="flex items-center gap-3">
        {/* Male / Female Persona Selector */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onPersonaChange('aarav')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              persona === 'aarav'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Aarav (Male)</span>
          </button>

          <button
            onClick={() => onPersonaChange('ananya')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              persona === 'ananya'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Ananya (Female)</span>
          </button>
        </div>

        {/* Emergency Crisis Button */}
        <button
          onClick={onOpenCrisisModal}
          className="btn-danger text-xs px-3 py-2 flex items-center gap-1.5"
          title="Tele-MANAS & Helpline Crisis Support"
        >
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline">Crisis Helpline</span>
        </button>
      </div>
    </header>
  );
};
