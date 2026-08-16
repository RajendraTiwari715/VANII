import React from 'react';
import { Compass, Flame, Smile, Frown, HeartHandshake, Volume2 } from 'lucide-react';

export const EmotionRadar = ({ arousal = 0.5, valence = 0.5, emotion = 'Calm / Neutral' }) => {
  // Compute X and Y percentages (Valence: X 0-100%, Arousal: Y 100-0%)
  const posX = Math.max(5, Math.min(95, valence * 100));
  const posY = Math.max(5, Math.min(95, (1 - arousal) * 100));

  const getEmotionBadgeStyle = () => {
    switch (emotion) {
      case 'Deep Intimacy / Love':
        return 'intimacy';
      case 'Sadness / Depression':
        return 'sadness';
      case 'Anger / Frustration':
        return 'anger';
      case 'Joy / Enthusiasm':
        return 'joy';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Arousal-Valence Radar</h3>
        </div>
        <span className={`emotion-pill ${getEmotionBadgeStyle()}`}>{emotion}</span>
      </div>

      {/* 2D Quadrant Map */}
      <div className="relative flex-1 min-h-[170px] bg-slate-950/80 rounded-xl border border-slate-800 p-3 overflow-hidden">
        {/* Quadrant Labels */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-rose-400/80">
          <Flame className="w-3 h-3" /> Anger / Hate
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-amber-400/80">
          <Smile className="w-3 h-3" /> Joy / Enthusiasm
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-400/80">
          <Frown className="w-3 h-3" /> Loneliness / Sadness
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-pink-400/80">
          <HeartHandshake className="w-3 h-3" /> Deep Intimacy / Love
        </div>

        {/* Axis Crosshairs */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800" />
        <div className="absolute left-1/2 top-0 w-1 h-full bg-slate-800" />

        {/* Live Plot Point */}
        <div
          className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 border-2 border-white transition-all duration-300 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400/20 animate-ping absolute" />
        </div>
      </div>

      {/* Numerical Metrics Footer */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">AROUSAL (Intensity)</span>
          <span className="text-cyan-400 font-bold">{(arousal * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">VALENCE (Positivity)</span>
          <span className="text-emerald-400 font-bold">{(valence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
