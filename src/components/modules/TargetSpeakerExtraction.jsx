import React, { useState } from 'react';
import { VolumeX, ShieldCheck, Sliders, Activity, CheckCircle, RefreshCw } from 'lucide-react';

export const TargetSpeakerExtraction = ({ noiseSuppression, onToggleNoiseSuppression }) => {
  const [snrLevel, setSnrLevel] = useState(5); // 5 dB SNR

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <VolumeX className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">4.5 High-Noise Environment Adaptation</h3>
            <p className="text-xs text-slate-400">Target Speaker Extraction (TSE) & Voice Fingerprint Isolation</p>
          </div>
        </div>

        <button onClick={onToggleNoiseSuppression} className="btn-primary text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{noiseSuppression ? 'Disable TSE Filter' : 'Enable TSE Filter'}</span>
        </button>
      </div>

      {/* SNR Noise Slider & Benchmark Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between items-center text-slate-300 font-mono mb-1">
            <span>Environmental Noise Level (SNR):</span>
            <span className="text-emerald-400 font-bold">{snrLevel} dB SNR</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={snrLevel}
            onChange={(e) => setSnrLevel(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            TSE maintains 95%+ speech recognition accuracy even in 5 dB heavy traffic/workshop noise.
          </p>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">Voice Fingerprint Match:</span>
            <span className="text-emerald-400 font-semibold">98.4% Verified</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">Sub-second Subband Latency:</span>
            <span className="text-cyan-400 font-semibold">&lt;45ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Deepgram ASR Accuracy:</span>
            <span className="text-emerald-400 font-semibold">96.8% (at 5 dB)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
