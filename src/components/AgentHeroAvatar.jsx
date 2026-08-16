import React, { useEffect, useRef } from 'react';
import { User, HeartHandshake, Bot, Sparkles, Volume2, Mic, Activity } from 'lucide-react';

export const AgentHeroAvatar = ({ persona, isAISpeaking, isListening, metrics, onChangePersonaClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const rms = metrics?.energyRMS || 0.03;
      const time = Date.now() / 400;

      const isFemale = persona === 'ananya';
      const mainHue = isFemale ? '340, 100%, 60%' : '185, 100%, 50%';
      const secondaryHue = isFemale ? '25, 100%, 65%' : '210, 100%, 60%';

      // 1. Concentric Radial Wave Rings
      const baseRadius = 85 + rms * 140;
      const ringCount = 4;

      for (let i = 0; i < ringCount; i++) {
        const ringRadius = baseRadius + i * 22 + Math.sin(time + i) * 8;
        const alpha = Math.max(0, 0.5 - i * 0.12);

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${isFemale ? 340 : 185}, 100%, 60%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. Animated Particle Orbs Around Center
      const particleCount = 16;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.8;
        const dist = baseRadius + Math.sin(time * 2 + i) * 15;
        const px = centerX + Math.cos(angle) * dist;
        const py = centerY + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${isFemale ? 340 : 185}, 100%, 70%, 0.8)`;
        ctx.shadowColor = `hsla(${isFemale ? 340 : 185}, 100%, 60%, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Central Radial Glow Orb
      const orbRadius = 70 + (isAISpeaking ? Math.sin(time * 6) * 10 : isListening ? Math.sin(time * 3) * 6 : 0);
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        orbRadius
      );

      gradient.addColorStop(0, `hsla(${isFemale ? 340 : 185}, 100%, 65%, 0.95)`);
      gradient.addColorStop(0.6, `hsla(${isFemale ? 340 : 185}, 90%, 50%, 0.4)`);
      gradient.addColorStop(1, `hsla(${isFemale ? 340 : 185}, 100%, 50%, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [persona, isAISpeaking, isListening, metrics]);

  return (
    <div className="relative w-full h-[320px] flex flex-col items-center justify-center glass-panel overflow-hidden border-cyan-500/20 shadow-2xl">
      {/* Background Canvas Effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

      {/* Central Hero Avatar Badge & Icon */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-500 ${
            isAISpeaking
              ? persona === 'ananya'
                ? 'bg-rose-600/90 border-rose-300 shadow-rose-500/80 scale-110 animate-pulse'
                : 'bg-cyan-500/90 border-cyan-200 shadow-cyan-500/80 scale-110 animate-pulse'
              : persona === 'ananya'
              ? 'bg-gradient-to-tr from-rose-600 to-pink-500 border-rose-300/60 shadow-rose-500/40'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-300/60 shadow-cyan-500/40'
          }`}
        >
          {persona === 'ananya' ? (
            <HeartHandshake className="w-14 h-14 text-white drop-shadow-md" />
          ) : (
            <User className="w-14 h-14 text-black drop-shadow-md" />
          )}
        </div>

        {/* Persona Title & Switcher */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
              {persona === 'ananya' ? 'Ananya (Female Agent)' : 'Aarav (Male Agent)'}
            </h2>
            <button
              onClick={onChangePersonaClick}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-1"
              title="Switch Male/Female Persona"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Switch
            </button>
          </div>

          <p className="text-xs text-slate-300/90 font-medium">
            {isAISpeaking
              ? 'Speaking in natural empathic voice...'
              : isListening
              ? 'Listening to user vocal prosody...'
              : 'Ready for human voice conversation.'}
          </p>
        </div>

        {/* Live Speech Emotion Pill */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-slate-300 flex items-center gap-1.5 shadow-md">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Emotion: <span className="text-cyan-300 font-bold">{metrics?.emotion || 'Calm / Neutral'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
