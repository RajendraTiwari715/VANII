import React, { useEffect, useRef, useState } from 'react';
import { avatarLipSyncInstance } from '../services/avatarLipSyncEngine';

export const HolographicVisualizer = ({ metrics, isListening, isAISpeaking, persona, onToggleListening }) => {
  const canvasRef = useRef(null);
  const [avatarState, setAvatarState] = useState({
    viseme: 'sil',
    mouthOpen: 0.0,
    expression: 'calm',
    eyeBlink: 0.0,
    headTilt: { x: 0, y: 0, z: 0 },
    isSpeaking: false,
  });

  useEffect(() => {
    const unsub = avatarLipSyncInstance.subscribe((state) => {
      setAvatarState(state);
    });
    return unsub;
  }, []);

  useEffect(() => {
    avatarLipSyncInstance.setSpeakingState(isAISpeaking);
    if (isAISpeaking && metrics) {
      avatarLipSyncInstance.processAudioFrame(metrics.energyRMS || 0.05, metrics.f0Pitch || 170);
    }
  }, [isAISpeaking, metrics]);

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
      const rms = metrics?.energyRMS || 0.04;
      const time = Date.now() / 350;

      const isFemale = persona === 'ananya';

      const cyanHue = isAISpeaking ? '145, 100%, 50%' : isFemale ? '340, 100%, 65%' : '185, 100%, 50%';
      const magentaHue = isAISpeaking ? '160, 100%, 45%' : isFemale ? '25, 100%, 65%' : '300, 100%, 60%';

      // 1. Ambient Background Glow
      const bgGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        width * 0.48
      );
      const glowAlpha = isAISpeaking ? 0.5 : isListening ? 0.35 : 0.18;
      bgGradient.addColorStop(0, `hsla(${isAISpeaking ? 145 : isFemale ? 340 : 185}, 100%, 50%, ${glowAlpha})`);
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Orbit Rings
      const ringRadii = [80, 110, 140, 170];
      ringRadii.forEach((radius, idx) => {
        const ringAlpha = (isAISpeaking ? 0.65 : isListening ? 0.45 : 0.25) + Math.sin(time + idx) * 0.1;
        const rotSpeed = (idx % 2 === 0 ? 1 : -1) * (0.3 + idx * 0.1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1.0, 0.42);
        ctx.rotate(time * rotSpeed * 0.1);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.setLineDash(idx === 1 ? [8, 12] : idx === 3 ? [4, 20] : []);
        ctx.strokeStyle = idx % 2 === 0 ? `hsla(${cyanHue}, ${ringAlpha})` : `hsla(${magentaHue}, ${ringAlpha})`;
        ctx.lineWidth = isAISpeaking ? 3.5 : idx === 1 ? 2.5 : 1.5;
        ctx.stroke();

        ctx.restore();
      });

      // 3. Central 3D Embodied Avatar Core with Real-Time Lip-Sync
      const sphereRadius = 52 + (isAISpeaking ? Math.sin(time * 6) * 8 : isListening ? Math.sin(time * 3) * 4 : 0) + rms * 30;

      ctx.save();
      ctx.translate(centerX + (avatarState.headTilt?.x || 0), centerY + (avatarState.headTilt?.y || 0));

      const sphereGrad = ctx.createRadialGradient(
        -sphereRadius * 0.3,
        -sphereRadius * 0.3,
        4,
        0,
        0,
        sphereRadius
      );
      sphereGrad.addColorStop(0, `hsla(${cyanHue}, 0.95)`);
      sphereGrad.addColorStop(0.6, `hsla(${magentaHue}, 0.6)`);
      sphereGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = isAISpeaking ? 'rgba(16, 240, 120, 1)' : `hsla(${cyanHue}, ${isListening ? 1.0 : 0.7})`;
      ctx.shadowBlur = isAISpeaking ? 40 : isListening ? 30 : 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Embodied Avatar Facial Features (Eyes, Eyebrows, Dynamic Lip-Sync Mouth)
      // Eyes (Glowing with Blinking)
      const eyeOffsetY = -12;
      const eyeSpacing = 18;
      const blinkScale = 1.0 - (avatarState.eyeBlink || 0) * 0.85;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;

      // Left Eye
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeOffsetY, 5, 6 * blinkScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(eyeSpacing, eyeOffsetY, 5, 6 * blinkScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye pupils (Look towards user)
      ctx.fillStyle = isAISpeaking ? '#003311' : isFemale ? '#330011' : '#001133';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeOffsetY, 2.5 * blinkScale, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeOffsetY, 2.5 * blinkScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eyebrows (Micro-Expression deformation)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const browTilt = avatarState.expression === 'happy' ? -2 : avatarState.expression === 'concerned' ? 3 : 0;

      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 7, eyeOffsetY - 9 + browTilt);
      ctx.lineTo(-eyeSpacing + 7, eyeOffsetY - 9 - browTilt);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(eyeSpacing - 7, eyeOffsetY - 9 - browTilt);
      ctx.lineTo(eyeSpacing + 7, eyeOffsetY - 9 + browTilt);
      ctx.stroke();

      // REAL-TIME LIP-SYNC MOUTH (Visemes: aa, ee, oo, oh, sil)
      const mouthOffsetY = 16;
      const mouthOpenness = Math.max(2, (avatarState.mouthOpen || 0) * 16 + (isAISpeaking ? Math.sin(time * 12) * 5 + 6 : 2));
      const mouthWidth = avatarState.viseme === 'ee' ? 22 : avatarState.viseme === 'oo' ? 10 : 16;

      ctx.fillStyle = isAISpeaking ? '#ff4488' : '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (isAISpeaking) {
        // Dynamic Phoneme Viseme Aperture
        ctx.ellipse(0, mouthOffsetY, mouthWidth, mouthOpenness, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Gentle Natural Smile when idle
        ctx.arc(0, mouthOffsetY - 4, 12, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();
      }

      ctx.restore();

      // 5. 3D Equalizer Frequency Soundwave Spectrum Ring
      const numBars = 120;
      const spectrumRadius = 145;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1.0, 0.42);

      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2 + time * (isAISpeaking ? 0.6 : 0.2);
        const noise = Math.sin(angle * 6 + time * 5) * Math.cos(angle * 3);

        const activityMultiplier = isAISpeaking ? 3.5 : isListening ? 2.5 : 0.8;
        const barHeight = Math.max(12, (18 + Math.abs(noise) * 50 + rms * 220) * activityMultiplier);

        const x1 = Math.cos(angle) * spectrumRadius;
        const y1 = Math.sin(angle) * spectrumRadius;
        const x2 = Math.cos(angle) * (spectrumRadius + barHeight);
        const y2 = Math.sin(angle) * (spectrumRadius + barHeight);

        const barGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        barGradient.addColorStop(0, `hsla(${cyanHue}, 0.95)`);
        barGradient.addColorStop(1, `hsla(${magentaHue}, 0.95)`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = barGradient;
        ctx.lineWidth = isAISpeaking ? 3.2 : 2.4;
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [metrics, isListening, isAISpeaking, persona, avatarState]);

  return (
    <div
      onClick={onToggleListening}
      className={`relative w-full h-full min-h-[260px] max-h-[420px] flex items-center justify-center overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
        isAISpeaking
          ? 'border-emerald-400 shadow-2xl shadow-emerald-500/50 bg-black/90 ring-4 ring-emerald-400/60'
          : isListening
          ? 'border-rose-500/80 shadow-2xl shadow-rose-500/40 bg-black/80 ring-2 ring-rose-500/50'
          : 'border-cyan-500/30 hover:border-cyan-400 shadow-2xl bg-black/60 hover:bg-black/75'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />

      {/* Visual Avatar Telemetry Status */}
      <div className="absolute bottom-3 left-4 z-30 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D Embodied Avatar: {isAISpeaking ? '🗣️ Viseme Lip-Syncing' : '👁️ Attentive Gaze'} ({avatarState.expression})</span>
      </div>

      {/* Visual Green Signal Badge Overlay when Agent Responds */}
      {isAISpeaking && (
        <div className="absolute top-4 z-30 px-4 py-1.5 rounded-full bg-emerald-500/90 text-black font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/50 animate-pulse pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span>VANII RESPONDING (GREEN SIGNAL ACTIVE)</span>
        </div>
      )}
    </div>
  );
};
