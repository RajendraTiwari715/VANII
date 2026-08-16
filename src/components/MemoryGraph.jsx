import React, { useState, useEffect, useRef } from 'react';
import { Database, Network, Clock, Brain, Tag, Plus, CheckCircle2 } from 'lucide-react';

export const MemoryGraph = ({ memoryState }) => {
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'semantic' | 'episodic' | 'procedural'
  const canvasRef = useRef(null);

  // Render Canvas Node Graph
  useEffect(() => {
    if (activeTab !== 'graph') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const triples = memoryState?.graphTriples || [];

    // Map unique nodes
    const nodeMap = new Map();
    triples.forEach((t) => {
      if (!nodeMap.has(t.subject)) nodeMap.set(t.subject, { name: t.subject, type: 'subject' });
      if (!nodeMap.has(t.object)) nodeMap.set(t.object, { name: t.object, type: 'object' });
    });

    const nodes = Array.from(nodeMap.values());
    const time = Date.now() / 1000;

    const render = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.32;

      // Position nodes radially around Central User node
      const nodePositions = new Map();
      nodePositions.set('User', { x: centerX, y: centerY });

      const outerNodes = nodes.filter((n) => n.name !== 'User');
      outerNodes.forEach((node, idx) => {
        const angle = (idx / outerNodes.length) * Math.PI * 2 + time * 0.05;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        nodePositions.set(node.name, { x, y });
      });

      // Draw Connections (Triples)
      triples.forEach((triple) => {
        const pos1 = nodePositions.get(triple.subject);
        const pos2 = nodePositions.get(triple.object);

        if (pos1 && pos2) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.stroke();

          // Relation Text
          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(`[:${triple.relation}]`, midX, midY - 4);
        }
      });

      // Draw Nodes
      nodePositions.forEach((pos, name) => {
        const isUser = name === 'User';
        ctx.beginPath();
        ctx.fillStyle = isUser ? '#00f2fe' : '#38bdf8';
        ctx.shadowColor = isUser ? 'rgba(0, 242, 254, 0.8)' : 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = isUser ? 15 : 8;
        ctx.arc(pos.x, pos.y, isUser ? 14 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = isUser ? '#ffffff' : '#cbd5e1';
        ctx.font = isUser ? 'bold 12px Inter' : '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(name, pos.x, pos.y + (isUser ? 26 : 22));
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, memoryState]);

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Mem0 + FalkorDB Graph Memory</h3>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'graph' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400'
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setActiveTab('semantic')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'semantic' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400'
            }`}
          >
            Semantic
          </button>
          <button
            onClick={() => setActiveTab('episodic')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'episodic' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400'
            }`}
          >
            Episodic
          </button>
          <button
            onClick={() => setActiveTab('procedural')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'procedural' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400'
            }`}
          >
            Procedural
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[220px] relative">
        {activeTab === 'graph' && (
          <div className="w-full h-full min-h-[220px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500">
              Active FalkorDB Graph Triples: {memoryState?.graphTriples?.length || 0}
            </div>
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {memoryState?.semantic?.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <span className="text-cyan-400 font-medium block">{item.fact}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Category: {item.category}</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-800">
                  {(item.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'episodic' && (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {memoryState?.episodic?.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1"
              >
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-cyan-400 font-semibold">{item.emotionState}</span>
                </div>
                <p className="text-slate-200">{item.event}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'procedural' && (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {memoryState?.procedural?.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 leading-relaxed">{item.rule}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
