import React, { useEffect, useRef } from 'react';

export const VoiceVisualizer = ({ metrics, isListening, isAISpeaking, persona }) => {
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

      // Background Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerY = height / 2;
      const rms = metrics?.energyRMS || 0.02;
      const pitch = metrics?.f0Pitch || 180;
      const time = Date.now() / 300;

      // Color Theme by Persona
      const primaryColor = persona === 'ananya' ? 'rgba(255, 8, 68, ' : 'rgba(0, 242, 254, ';
      const secondaryColor = persona === 'ananya' ? 'rgba(255, 177, 153, ' : 'rgba(79, 172, 254, ';

      // 1. Draw Multi-Layer Dynamic Sine Waves
      const waveLayers = [
        { freq: 0.015, amp: 20 + rms * 150, speed: 1.0, alpha: 0.8 },
        { freq: 0.025, amp: 15 + rms * 100, speed: 1.4, alpha: 0.5 },
        { freq: 0.035, amp: 10 + rms * 80, speed: 2.0, alpha: 0.3 },
      ];

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = primaryColor + layer.alpha + ')';

        for (let x = 0; x < width; x++) {
          const y =
            centerY +
            Math.sin(x * layer.freq + time * layer.speed) *
              layer.amp *
              Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // 2. Draw Pitch Contour Dot Overlay
      if (metrics?.pitchContour && metrics.pitchContour.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = secondaryColor + '0.9)';
        ctx.lineWidth = 2;
        const step = width / 20;

        metrics.pitchContour.forEach((p, idx) => {
          const px = idx * step;
          const py = height - ((p - 60) / 400) * height;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);

          // Glowing dot for last pitch
          if (idx === metrics.pitchContour.length - 1) {
            ctx.fillStyle = secondaryColor + '1)';
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.stroke();
      }

      // 3. Pulse Halo if Speaking or Listening
      if (isListening || isAISpeaking) {
        const pulseRadius = 50 + rms * 200;
        const gradient = ctx.createRadialGradient(
          width / 2,
          centerY,
          10,
          width / 2,
          centerY,
          pulseRadius
        );
        gradient.addColorStop(0, primaryColor + (isAISpeaking ? '0.4)' : '0.25)'));
        gradient.addColorStop(1, primaryColor + '0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width / 2, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [metrics, isListening, isAISpeaking, persona]);

  return (
    <div className="visualizer-box flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-3 left-4 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>F0 Pitch: {metrics?.f0Pitch || 180} Hz</span>
        <span className="text-slate-600">|</span>
        <span>RMS: {(metrics?.energyRMS || 0).toFixed(3)}</span>
      </div>

      <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800">
        <span>VAD Latency: &lt;40ms</span>
      </div>
    </div>
  );
};
