import React, { useState } from 'react';
import { Eye, Smartphone, Cpu, CheckCircle2, Play, Terminal } from 'lucide-react';

export const VoiceCopilot = ({ onTestCopilot }) => {
  const [copilotStatus, setCopilotStatus] = useState('idle'); // 'idle' | 'capturing' | 'analyzing' | 'executed'

  const handleRunCopilot = () => {
    setCopilotStatus('capturing');
    setTimeout(() => setCopilotStatus('analyzing'), 1500);
    setTimeout(() => {
      setCopilotStatus('executed');
      if (onTestCopilot) {
        onTestCopilot(
          'Maine aapki screen par form wrong field detect karke automatically correct values fill and submit kar di hain.'
        );
      }
    }, 3500);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">4.4 Voice-to-Action Execution & Live Vision</h3>
            <p className="text-xs text-slate-400">Model Context Protocol (MCP) & Android Accessibility APIs</p>
          </div>
        </div>

        <button onClick={handleRunCopilot} className="btn-primary text-xs">
          <Play className="w-3.5 h-3.5" />
          <span>Execute Vision Action</span>
        </button>
      </div>

      {/* Action Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className={`p-3 rounded-xl border ${copilotStatus === 'capturing' ? 'bg-amber-950 border-amber-600 text-amber-200 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Smartphone className="w-4 h-4 text-amber-400" />
            1. Screen & Camera Stream
          </div>
          <p className="text-[11px] text-slate-500">Continuous WebRTC frames captured at &lt;50ms latency.</p>
        </div>

        <div className={`p-3 rounded-xl border ${copilotStatus === 'analyzing' ? 'bg-cyan-950 border-cyan-600 text-cyan-200 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Cpu className="w-4 h-4 text-cyan-400" />
            2. MCP Vision Engine
          </div>
          <p className="text-[11px] text-slate-500">Detects form errors & UI element coordinates.</p>
        </div>

        <div className={`p-3 rounded-xl border ${copilotStatus === 'executed' ? 'bg-emerald-950 border-emerald-600 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            3. Hands-Free Execution
          </div>
          <p className="text-[11px] text-slate-500">Performs OS submit, clicks, & form fixes.</p>
        </div>
      </div>
    </div>
  );
};
