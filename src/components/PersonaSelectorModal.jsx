import React from 'react';
import { User, HeartHandshake, Sparkles, Volume2, ShieldCheck, Check } from 'lucide-react';

export const PersonaSelectorModal = ({ isOpen, onSelectPersona }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-[2000] animate-fadeIn backdrop-blur-2xl bg-black/90">
      <div className="glass-panel p-8 max-w-xl w-full border-cyan-500/30 bg-slate-950/95 space-y-6 relative shadow-2xl shadow-cyan-950/60 rounded-3xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            VANII Neural Voice AI
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-200 to-rose-400">
            Select Your AI Companion Persona
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Kisse baat karna chahenge? Select Male or Female voice persona to begin:
          </p>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Male Persona: Aarav */}
          <button
            onClick={() => onSelectPersona('aarav')}
            className="group relative glass-panel p-6 rounded-2xl border-cyan-800/60 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between h-[230px]"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300">
                  Aarav (Male)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Calm, deep-toned, protective and grounded empathic male voice.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-cyan-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4" /> Male Voice
              </span>
              <span className="bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                Select
              </span>
            </div>
          </button>

          {/* Female Persona: Ananya */}
          <button
            onClick={() => onSelectPersona('ananya')}
            className="group relative glass-panel p-6 rounded-2xl border-rose-800/60 hover:border-rose-400 hover:bg-rose-950/40 text-left transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between h-[230px]"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-rose-300">
                  Ananya (Female)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Warm, soothing, expressive and gentle compassionate female voice.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-rose-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4" /> Female Voice
              </span>
              <span className="bg-rose-950 px-2.5 py-1 rounded-full border border-rose-800">
                Select
              </span>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-900">
          Aap kabhi bhi top navbar se voice persona change kar sakte hain.
        </div>
      </div>
    </div>
  );
};
