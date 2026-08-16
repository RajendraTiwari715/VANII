import React, { useEffect, useRef } from 'react';

export const HolographicVisualizer = ({ metrics, isListening, isAISpeaking, persona, onToggleListening }) => {
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
      const rms = metrics?.energyRMS || 0.04;
      const time = Date.now() / 350;

      const isFemale = persona === 'ananya';

      // COLOR HUES:
      // If AI is speaking -> VIBRANT EMERALD GREEN (145, 100%, 50%)
      // If Listening -> MAGENTA / CYAN (340 / 185)
      const cyanHue = isAISpeaking ? '145, 100%, 50%' : isFemale ? '340, 100%, 65%' : '185, 100%, 50%';
      const magentaHue = isAISpeaking ? '160, 100%, 45%' : isFemale ? '25, 100%, 65%' : '300, 100%, 60%';

      // 1. Ambient Background Glow (Glows vibrant NEON GREEN when AI speaks!)
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

      // 2. Dynamic Green Signal Beams when AI Speaks
      if (isAISpeaking) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const rayCount = 12;
        for (let r = 0; r < rayCount; r++) {
          const angle = (r / rayCount) * Math.PI * 2 + time * 0.5;
          const rayLen = 160 + Math.sin(time * 6 + r) * 40;
          const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
          rayGrad.addColorStop(0, 'rgba(16, 230, 110, 0.8)');
          rayGrad.addColorStop(1, 'rgba(16, 230, 110, 0)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. 3D Orbit Rings
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

      // 4. Central Floating Holographic Sphere (NEON GREEN PULSE WHEN SPEAKING)
      const sphereRadius = 44 + (isAISpeaking ? Math.sin(time * 6) * 12 : isListening ? Math.sin(time * 3) * 5 : 0) + rms * 50;

      ctx.save();
      ctx.translate(centerX, centerY);

      const sphereGrad = ctx.createRadialGradient(
        -sphereRadius * 0.3,
        -sphereRadius * 0.3,
        4,
        0,
        0,
        sphereRadius
      );
      sphereGrad.addColorStop(0, `hsla(${cyanHue}, 0.95)`);
      sphereGrad.addColorStop(0.5, `hsla(${magentaHue}, 0.6)`);
      sphereGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = isAISpeaking ? 'rgba(16, 240, 120, 1)' : `hsla(${cyanHue}, ${isListening ? 1.0 : 0.7})`;
      ctx.shadowBlur = isAISpeaking ? 45 : isListening ? 35 : 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sphere Grid Lines
      ctx.strokeStyle = isAISpeaking ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const r = sphereRadius * Math.cos(rad);
        ctx.beginPath();
        ctx.ellipse(0, sphereRadius * Math.sin(rad) * 0.4, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 5. 3D Equalizer Frequency Soundwave Spectrum Ring (NEON GREEN WAVELENGTHS)
      const numBars = 120;
      const spectrumRadius = 140;

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
  }, [metrics, isListening, isAISpeaking, persona]);

  return (
    <div
      onClick={onToggleListening}
      className={`relative w-full h-full min-h-[240px] max-h-[400px] flex items-center justify-center overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
        isAISpeaking
          ? 'border-emerald-400 shadow-2xl shadow-emerald-500/50 bg-black/90 ring-4 ring-emerald-400/60'
          : isListening
          ? 'border-rose-500/80 shadow-2xl shadow-rose-500/40 bg-black/80 ring-2 ring-rose-500/50'
          : 'border-cyan-500/30 hover:border-cyan-400 shadow-2xl bg-black/60 hover:bg-black/75'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />

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
