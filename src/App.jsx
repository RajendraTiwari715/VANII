import React, { useState, useEffect, useRef } from 'react';
import { HolographicVisualizer } from './components/HolographicVisualizer';
import { CornerSettings } from './components/CornerSettings';

import { audioEngineInstance } from './services/audioEngine';
import { speechSynthesizerInstance } from './services/speechSynthesis';
import { speechRecognitionInstance } from './services/speechRecognitionService';
import { aiReasoningInstance } from './services/aiReasoning';
import { getTimeBasedGreeting } from './services/geminiService';
import { directStreamingInstance } from './services/directStreamingEngine';
import { dialogueStateInstance } from './services/dialogueStateMachine';

import { Settings, Sparkles, Send, Mic, MicOff, Music, Play, Pause, ExternalLink } from 'lucide-react';

export function App() {
  const [persona, setPersona] = useState('ananya'); // Default: Female Mode (Ananya)
  const [language, setLanguage] = useState('hi'); // Default: Hindi (हिंदी)
  const [theme, setTheme] = useState('dark');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Real-time voice subtitle & response state
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState('');
  const [textInput, setTextInput] = useState('');

  // Direct Media Streaming state
  const [activeTrack, setActiveTrack] = useState({
    title: '',
    artist: '',
    videoId: '',
    streamUrl: '',
    isPlaying: false,
  });

  const isProcessingRef = useRef(false);
  const lastDispatchTimestampRef = useRef(0);
  const safetyTimeoutRef = useRef(null);

  // Acoustic metrics state
  const [metrics, setMetrics] = useState({
    f0Pitch: 185,
    pitchContour: [],
    energyRMS: 0.04,
    tempoBpm: 118,
    arousal: 0.42,
    valence: 0.58,
    emotion: 'Calm / Neutral',
  });

  useEffect(() => {
    speechSynthesizerInstance.setPersona('ananya');
  }, []);

  useEffect(() => {
    audioEngineInstance.onAcousticUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    directStreamingInstance.onTrackChange((track) => {
      setActiveTrack(track);
    });

    // Instant User Interruption / Barge-in
    audioEngineInstance.onBargeIn(() => {
      if (speechSynthesizerInstance.isSpeaking) {
        speechSynthesizerInstance.cancel();
        setIsAISpeaking(false);
        isProcessingRef.current = false;
      }
    });

    // Real-time interim speech subtitle display
    speechRecognitionInstance.onInterim((interimText) => {
      if (!isProcessingRef.current) {
        setCurrentTranscript(interimText);
      }
    });

    // Web Speech ASR Result Callback with State Locking & Debounce Guard
    speechRecognitionInstance.onResult((realText) => {
      const now = Date.now();
      if (isProcessingRef.current || now - lastDispatchTimestampRef.current < 800) {
        return;
      }

      const cleanSpoken = realText.trim().toLowerCase();

      // Immediate Quiet / Stop command check
      if (
        cleanSpoken === 'shant' ||
        cleanSpoken === 'शांत' ||
        cleanSpoken === 'chup' ||
        cleanSpoken === 'चुप' ||
        cleanSpoken === 'ruko' ||
        cleanSpoken === 'रुको' ||
        cleanSpoken === 'stop' ||
        cleanSpoken.includes('shant raho') ||
        cleanSpoken.includes('शांत रहो') ||
        cleanSpoken.includes('chup raho')
      ) {
        speechSynthesizerInstance.cancel();
        setIsAISpeaking(false);
        isProcessingRef.current = false;
        dialogueStateInstance.setPlaybackStatus('stopped');
        const quietAck = persona === 'ananya' ? 'जी राज, मैं शांत हूँ।' : 'जी राज, मैं शांत हूँ।';
        setLastAIResponse(quietAck);
        setCurrentTranscript('');
        speechSynthesizerInstance.speak(quietAck, 'Calm / Neutral');
        return;
      }

      setCurrentTranscript('');
      lastDispatchTimestampRef.current = now;
      handleUserSpeechProcessed(realText, metrics);
    });

    speechSynthesizerInstance.onStartCallback = () => {
      setIsAISpeaking(true);
    };

    speechSynthesizerInstance.onEndCallback = () => {
      setIsAISpeaking(false);
      isProcessingRef.current = false;
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [persona, language]);

  // Handle Persona Switch
  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona);
    speechSynthesizerInstance.setPersona(newPersona);
    speechSynthesizerInstance.unmuteAudio();

    const greeting = getTimeBasedGreeting(newPersona);
    setLastAIResponse(greeting);
    speechSynthesizerInstance.speak(greeting, 'Calm / Neutral');
  };

  // Toggle Call via Touch on Central VANII Holographic Orb or Start Call button
  const handleToggleListening = async () => {
    speechSynthesizerInstance.unmuteAudio();

    if (isListening) {
      audioEngineInstance.stop();
      speechRecognitionInstance.stop();
      speechSynthesizerInstance.cancel();
      setIsListening(false);
      isProcessingRef.current = false;
    } else {
      await audioEngineInstance.initAudio();
      speechRecognitionInstance.setLanguage(language);
      speechRecognitionInstance.start();
      setIsListening(true);

      const dynamicGreeting = getTimeBasedGreeting(persona);
      setLastAIResponse(dynamicGreeting);
      speechSynthesizerInstance.speak(dynamicGreeting, 'Calm / Neutral');
    }
  };

  // Process User Speech -> Non-blocking Async Dispatch with State Machine Lock
  const handleUserSpeechProcessed = async (spokenText, currentMetrics) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      isProcessingRef.current = false;
      setIsAISpeaking(false);
    }, 6000);

    const queryText = (spokenText || '').trim();
    if (!queryText) {
      isProcessingRef.current = false;
      return;
    }

    try {
      setIsAISpeaking(true);

      const reasoning = await aiReasoningInstance.generateResponse(queryText, currentMetrics, persona, language);

      if (reasoning?.responseText) {
        setLastAIResponse(reasoning.responseText);
        speechSynthesizerInstance.speak(reasoning.responseText, reasoning.emotionIntent);
      } else {
        isProcessingRef.current = false;
        setIsAISpeaking(false);
      }
    } catch (err) {
      console.warn('Speech processing error:', err);
      isProcessingRef.current = false;
      setIsAISpeaking(false);
    }
  };

  // Handle Text Submission fallback
  const handleTextSubmit = (e) => {
    e?.preventDefault();
    if (!textInput.trim() || isProcessingRef.current) return;
    const query = textInput.trim();
    setTextInput('');
    setCurrentTranscript(query);
    handleUserSpeechProcessed(query, metrics);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-between p-3 sm:p-5 cyber-backdrop selection:bg-cyan-500 selection:text-black">
      {/* 1. Top Header Bar */}
      <header className="flex items-center justify-between py-2.5 px-5 glass-panel rounded-2xl border-cyan-500/20 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-cyan-500 flex items-center justify-center text-black font-bold shadow-md shadow-rose-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-sky-200 to-cyan-400">
              VANII Voice Agent
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Raj's AI Companion | {persona === 'ananya' ? '🌸 Ananya (Female Active)' : '⚡ Aarav (Jarvis Male Active)'} | {isAISpeaking ? '🟢 Green Signal Active' : isListening ? '🔴 Listening' : '⚪ Standby'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Call Button */}
          <button
            onClick={handleToggleListening}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-mono transition-all shadow-lg ${
              isListening
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-rose-950/50 ring-2 ring-rose-500/30'
                : 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-cyan-950/50 hover:bg-cyan-900/80'
            }`}
            title={isListening ? 'End Voice Call' : 'Start Voice Call'}
          >
            {isListening ? <MicOff className="w-4 h-4 text-rose-400 animate-pulse" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            <span className="font-semibold">{isListening ? 'End Call' : 'Start Call'}</span>
          </button>

          {/* Corner Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 hover:text-white hover:border-cyan-500 transition-all shadow-lg"
            title="Settings (Persona, Language, 6-Layer Jarvis Telemetry)"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
          </button>
        </div>
      </header>

      {/* 2. Main Center Screen: Pure 3D Holographic Visualizer Ring */}
      <main className="flex-1 flex flex-col justify-center my-2 overflow-hidden items-center relative">
        <div className="w-full h-full min-h-[280px] max-h-[440px] relative">
          <HolographicVisualizer
            metrics={metrics}
            isListening={isListening}
            isAISpeaking={isAISpeaking}
            persona={persona}
            onToggleListening={handleToggleListening}
          />
        </div>

        {/* Dynamic Voice Subtitle Overlay & Deterministic Media Controller */}
        <div className="w-full max-w-lg space-y-2 mt-1 z-30">
          {(currentTranscript || lastAIResponse) && (
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-1.5 text-xs font-mono">
              {currentTranscript && (
                <p className="text-slate-300 truncate">
                  <span className="text-cyan-400 font-bold">राज: </span>"{currentTranscript}"
                </p>
              )}
              {lastAIResponse && (
                <p className="text-emerald-300 text-xs leading-relaxed">
                  <span className="text-emerald-400 font-bold">{persona === 'ananya' ? '🌸 अनन्या: ' : '⚡ आरव: '}</span>
                  {lastAIResponse}
                </p>
              )}
            </div>
          )}

          {/* Deterministic Media Direct Stream Card (PDF Blueprint Implementation) */}
          {activeTrack.title && (
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between text-xs font-mono text-slate-200">
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Music className="w-4 h-4 animate-pulse" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-rose-300 truncate">{activeTrack.title}</p>
                  <p className="text-[10px] text-slate-400">{activeTrack.artist || 'Arijit Singh'} • Direct Stream Active</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (activeTrack.isPlaying) {
                      directStreamingInstance.pauseStream();
                      dialogueStateInstance.setPlaybackStatus('paused');
                    } else {
                      directStreamingInstance.resumeStream();
                      dialogueStateInstance.setPlaybackStatus('playing');
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-rose-300 transition-all shadow"
                  title={activeTrack.isPlaying ? 'Pause' : 'Resume'}
                >
                  {activeTrack.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${activeTrack.videoId}`}
                  target="VANII_YOUTUBE_PLAYER"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all shadow"
                  title="Open Dedicated Player"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. Bottom Text Input / Voice Bar */}
      <footer className="shrink-0 space-y-2 pt-1">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2 max-w-xl mx-auto w-full">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={isListening ? 'बोलिए राज जी (जैसे: "केसरिया गाना चालू करो", "मौसम बताओ")...' : 'Start Call पर क्लिक करें या यहाँ प्रश्न लिखें...'}
            className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessingRef.current}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-30 disabled:hover:bg-cyan-500 transition-all shadow-md"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAISpeaking ? 'bg-emerald-400 animate-ping ring-4 ring-emerald-500/50' : isListening ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className={isAISpeaking ? 'text-emerald-400 font-bold' : ''}>
            {isAISpeaking
              ? `${persona === 'ananya' ? '🌸 Ananya' : '⚡ Aarav'} is Responding Out Loud to Raj (Green Signal Active)...`
              : isListening
              ? 'Listening to Raj... (बोलिए राज जी, मैं सुन रही/रहा हूँ)'
              : 'Touch Central 3D Orb or click "Start Call"'}
          </span>
        </div>
      </footer>

      {/* Corner Settings Modal */}
      <CornerSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        persona={persona}
        onPersonaChange={handlePersonaChange}
        language={language}
        onLanguageChange={(l) => {
          setLanguage(l);
          speechRecognitionInstance.setLanguage(l);
        }}
        theme={theme}
        onThemeChange={(t) => setTheme(t)}
      />
    </div>
  );
}

export default App;
