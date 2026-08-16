import React, { useState } from 'react';
import { Mic, MicOff, Send, Volume2, ShieldCheck, Sliders, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';

export const VoiceConsole = ({
  isListening,
  onToggleListening,
  onSendText,
  isAISpeaking,
  metrics,
  persona,
  noiseSuppression,
  onToggleNoiseSuppression,
  bargeInSensitivity,
  onChangeBargeInSensitivity,
  latencyBreakdown,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendText(inputText);
    setInputText('');
  };

  const handleQuickPrompt = (promptText) => {
    onSendText(promptText);
  };

  return (
    <div className="glass-panel p-5 flex flex-col justify-between gap-4 h-full">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isAISpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          <h2 className="text-base font-semibold text-slate-100">
            {isAISpeaking
              ? `${persona === 'aarav' ? 'Aarav' : 'Ananya'} is Speaking...`
              : isListening
              ? 'Listening to User Speech...'
              : 'Voice Engine Ready'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Speaker Extraction / Noise Suppression Button */}
          <button
            onClick={onToggleNoiseSuppression}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
              noiseSuppression
                ? 'bg-cyan-950 text-cyan-400 border-cyan-700'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Target Speaker Extraction & Noise Suppression (5dB SNR)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TSE Noise: {noiseSuppression ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Visualizer */}
      <VoiceVisualizer
        metrics={metrics}
        isListening={isListening}
        isAISpeaking={isAISpeaking}
        persona={persona}
      />

      {/* Interactive Controls & Barge-In Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-mono">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Barge-In Sensitivity:
            </span>
            <span className="text-cyan-400 font-bold">{bargeInSensitivity} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={bargeInSensitivity}
            onChange={(e) => onChangeBargeInSensitivity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Preempts & cuts off AI voice playback within &lt;50ms when user interrupts.
          </p>
        </div>

        {/* Latency Breakdown Ticker */}
        <div className="text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
            <span>Pipeline Component</span>
            <span>Latency</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">VAD + WebRTC Transport:</span>
            <span className="text-emerald-400">{latencyBreakdown?.vadMs || 38}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">SER Emotion Extraction:</span>
            <span className="text-emerald-400">{latencyBreakdown?.serMs || 82}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">LLM Core Reasoning:</span>
            <span className="text-emerald-400">{latencyBreakdown?.llmReasoningMs || 210}ms</span>
          </div>
        </div>
      </div>

      {/* Quick Human Emotional Test Prompts */}
      <div>
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Try Human Voice Test Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPrompt('Mujhe late night work karte waqt bohot akelapan lagta hai.')}
            className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            😔 Late Night Loneliness
          </button>
          <button
            onClick={() => handleQuickPrompt('Mujhe customer care par flight cancellation ke liye refund chahiye.')}
            className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            ✈️ Flight Negotiator Call
          </button>
          <button
            onClick={() => handleQuickPrompt('Mera mood bohot kharab hai, gussa aa raha hai!')}
            className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            🤬 Anger & Frustration
          </button>
          <button
            onClick={() => handleQuickPrompt('Suno, aaj mera promotion ho gaya! Bohot khush hoon!')}
            className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            🎉 Promotion Joy
          </button>
        </div>
      </div>

      {/* Bottom Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onToggleListening}
          className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
              : 'btn-primary'
          }`}
          title={isListening ? 'Stop Listening' : 'Start Voice Input'}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message in Hinglish / English / Hindi..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
