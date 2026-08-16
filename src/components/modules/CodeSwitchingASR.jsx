import React, { useState } from 'react';
import { Languages, Play, Sparkles, Check, ArrowRight } from 'lucide-react';

export const CodeSwitchingASR = ({ onTestCodeSwitching }) => {
  const [sampleText, setSampleText] = useState('Aaj ka weather bohot cool hai, par main thoda stressed feel kar raha hoon.');
  const [normalizedResult, setNormalizedResult] = useState('');

  const handleProcess = () => {
    const norm = sampleText
      .replace(/weather/gi, 'मौसम (weather)')
      .replace(/cool/gi, 'कूल (cool)')
      .replace(/stressed/gi, 'स्ट्रेस्ड (stressed)');
    setNormalizedResult(norm);

    if (onTestCodeSwitching) {
      onTestCodeSwitching(sampleText);
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">4.3 Real-Time Hinglish Code-Switching ASR/TTS</h3>
            <p className="text-xs text-slate-400">Sarvam Bulbul V3 / Shunya Zero-STT Single-Pass Pipeline</p>
          </div>
        </div>

        <button onClick={handleProcess} className="btn-primary text-xs">
          <Play className="w-3.5 h-3.5" />
          <span>Normalize & Synthesize</span>
        </button>
      </div>

      {/* Interactive Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-slate-400 font-mono">Raw Input Speech (Hinglish Mix):</label>
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 font-mono">Devanagari-Latin Normalization Output:</label>
          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-purple-300 font-mono min-h-[76px] flex items-center">
            {normalizedResult || <span className="text-slate-600 italic">Click "Normalize & Synthesize" to test...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
