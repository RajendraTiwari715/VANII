import React, { useState } from 'react';
import { Settings, X, User, HeartHandshake, Languages, Moon, Sun, Cpu, ShieldCheck, Network, Layers, Sparkles, Terminal } from 'lucide-react';
import { mcpHostInstance } from '../services/mcpSystem';
import { edgeInferenceInstance } from '../services/edgeInferenceRouter';
import { asrRouterInstance } from '../services/asrRouterService';
import { cognitiveMemoryInstance } from '../services/cognitiveMemoryEngine';

export const CornerSettings = ({
  isOpen,
  onClose,
  persona,
  onPersonaChange,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'jarvis_telemetry'

  if (!isOpen) return null;

  const languages = [
    { id: 'hi', name: 'Hindi (हिंदी - Default)' },
    { id: 'hinglish', name: 'Hinglish (Hindi + English)' },
    { id: 'en', name: 'English' },
    { id: 'bn', name: 'Bengali (বাংলা)' },
    { id: 'ta', name: 'Tamil (தமிழ்)' },
    { id: 'te', name: 'Telugu (తెలుగు)' },
    { id: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { id: 'mr', name: 'Marathi (मराठी)' },
  ];

  const mcpTools = mcpHostInstance.getAllAvailableTools();
  const hardware = edgeInferenceInstance.getHardwareTelemetry();
  const asrStatus = asrRouterInstance.getRouterStatus();
  const graphCount = cognitiveMemoryInstance.graphRelations.length;

  return (
    <div className="modal-overlay z-[2000] animate-fadeIn backdrop-blur-2xl bg-black/90">
      <div className="glass-panel p-6 max-w-lg w-full border-cyan-500/40 bg-slate-950/95 space-y-5 relative shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">VANII Settings & Architecture</h3>
              <p className="text-xs text-slate-400">Jarvis 6-Layer Engine & Persona Config</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'general' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice & Persona
          </button>
          <button
            onClick={() => setActiveTab('jarvis_telemetry')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'jarvis_telemetry' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Jarvis 6-Layer Engine
          </button>
        </div>

        {activeTab === 'general' ? (
          <>
            {/* 1. Voice Agent Persona Switcher (Male / Female) */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Voice Agent Persona:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onPersonaChange('ananya')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    persona === 'ananya'
                      ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-md shadow-rose-950/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  <div className="text-left">
                    <span>Ananya (Female)</span>
                    <span className="text-[10px] text-slate-400 block font-normal">Sweet & Meethi Voice</span>
                  </div>
                </button>

                <button
                  onClick={() => onPersonaChange('aarav')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    persona === 'aarav'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <span>Aarav (Male)</span>
                    <span className="text-[10px] text-slate-400 block font-normal">Deep Soothing Tone</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Language Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" /> Select Language:
              </label>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Theme Toggle (Dark / Light) */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-cyan-400" /> Select Theme:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark Cyber Studio
                </button>
                <button
                  onClick={() => onThemeChange('light')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Cyber Light Glass
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Jarvis 6-Layer Architecture Live Telemetry */
          <div className="space-y-3.5 text-xs font-mono">
            {/* Layer 1: Perception & ASR */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Layer 1: ASR & Speaker Diarization</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Active</span>
              </div>
              <p className="text-slate-300 text-[11px]">Provider: <span className="text-cyan-300 font-semibold">{asrStatus.activeProvider}</span> (Causal Attention Code-Switching)</p>
              <p className="text-slate-400 text-[10px]">Speaker ID: {asrStatus.lastDiarization.speakerId} | DER: {asrStatus.lastDiarization.derScore * 100}% | Transport: {asrStatus.transport}</p>
            </div>

            {/* Layer 2: Model Context Protocol (MCP) */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span className="flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Layer 2: MCP Dynamic Tools (Universal Nervous System)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">{mcpTools.length} Tools Discovered</span>
              </div>
              <div className="space-y-0.5 pt-1">
                {mcpTools.slice(0, 4).map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/60 px-2 py-1 rounded">
                    <span className="text-indigo-300 font-semibold">{tool.name}</span>
                    <span className="text-slate-500">{tool.server}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layer 3: Vision & OS Automation */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-purple-400 font-bold">
                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Layer 3: Anthropic Computer Use & Hybrid UI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Ready</span>
              </div>
              <p className="text-slate-300 text-[11px]">Protocol: <span className="text-purple-300">computer_use_20251124</span> (DOM Tree + Pixel Zoom fallback)</p>
              <p className="text-slate-400 text-[10px]">HITL Security Gate: Irreversible operations intercepted for human confirmation.</p>
            </div>

            {/* Layer 4: Cognitive Memory Hierarchy */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Layer 4: Letta Core & FalkorDB Graph</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">{graphCount} Graph Triples</span>
              </div>
              <p className="text-slate-300 text-[11px]">Paradigm: Letta Self-Editing (<code className="text-emerald-300">core_memory_replace</code>) + Mem0 ADD-only</p>
              <p className="text-slate-400 text-[10px]">Relations: OCCURRED_BEFORE, RELATES_TO, LEADS_TO, CAUSES, PREFERS, EXPERIENCES</p>
            </div>

            {/* Layer 5: Guardrails & MCPTox */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Layer 5: NeMo Guardrails & MindGuard TPA</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Guarded</span>
              </div>
              <p className="text-slate-300 text-[11px]">Execution Rails: Colang 2.0 <code className="text-rose-300">BotToolCalls</code> deterministic validator</p>
              <p className="text-slate-400 text-[10px]">MCPTox Defense: Sanitizes incoming tool metadata against prompt injection attacks.</p>
            </div>

            {/* Layer 6: Hardware & Edge Inference */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Layer 6: Nvidia Jetson Orin AGX 64GB</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Edge Online</span>
              </div>
              <p className="text-slate-300 text-[11px]">Bandwidth: <span className="text-amber-300">{hardware.memoryBandwidth}</span> | Ampere 2048 Cores</p>
              <p className="text-slate-400 text-[10px]">KVSwap: {hardware.telemetry.nvmeSwapped} NVMe offload (1.8 GB/s) | Routing: Smart Edge/Cloud</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
