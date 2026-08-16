import React, { useRef, useEffect } from 'react';
import { User, Bot, Volume2, Sparkles, MessageSquare, Zap } from 'lucide-react';

export const LiveTranscript = ({ messages, onPlayAudio, persona }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Live Empathic Voice Stream</h3>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
          Devanagari-Latin Code-Switching Active
        </span>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[260px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 text-cyan-400/40 mb-2 animate-pulse" />
            <p className="text-xs font-medium">Start speaking or click a scenario to begin conversation.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              VANII will analyze your vocal prosody, F0 pitch contour, and emotion in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    isUser
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : persona === 'ananya'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl space-y-1.5 ${
                    isUser
                      ? 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-100 border border-cyan-900/50 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1 text-[10px]">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'User' : persona === 'aarav' ? 'Aarav (Empathic Male)' : 'Ananya (Warm Female)'}
                    </span>

                    {/* Emotion Tag */}
                    {msg.emotion && (
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                        {msg.emotion}
                      </span>
                    )}
                  </div>

                  <p className="leading-relaxed text-slate-200 text-xs sm:text-sm">{msg.text}</p>

                  {/* Latency & Audio Replay Footer for AI */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1.5 text-[10px] font-mono text-slate-500 border-t border-slate-800/50">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Zap className="w-3 h-3" /> {msg.latencyMs || 490}ms total latency
                      </span>
                      <button
                        onClick={() => onPlayAudio(msg.text, msg.emotion)}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Replay Voice Synthesis"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Speak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
