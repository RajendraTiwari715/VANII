/**
 * VANII Audio Engine & DSP Human Speech Filter Pipeline
 * Implements dual BiquadFilter DSP chain to isolate human speech (85Hz - 3400Hz)
 * and reject background ambient noise (fans, hums, hiss, traffic).
 */

import { speechSynthesizerInstance } from './speechSynthesis';

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.mediaStream = null;
    this.highPassFilter = null;
    this.lowPassFilter = null;
    this.sourceNode = null;
    this.isListening = false;

    // Human Voice VAD Thresholds
    this.vadThreshold = 0.055;
    this.silenceTimer = null;
    this.speechStartTime = 0;
    this.onBargeInCallback = null;
    this.onSpeechEndCallback = null;
    this.onAcousticUpdateCallback = null;

    // Acoustic Metrics
    this.currentMetrics = {
      f0Pitch: 180,
      pitchContour: [],
      energyRMS: 0.0,
      tempoBpm: 120,
      arousal: 0.5,
      valence: 0.5,
      emotion: 'Calm / Neutral',
    };

    this.animFrameId = null;
  }

  async initAudio() {
    if (this.audioCtx) return true;

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);

      // 1. High-pass filter (cut low rumble < 85Hz)
      this.highPassFilter = this.audioCtx.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.setValueAtTime(85, this.audioCtx.currentTime);

      // 2. Low-pass filter (cut high hiss > 3400Hz)
      this.lowPassFilter = this.audioCtx.createBiquadFilter();
      this.lowPassFilter.type = 'lowpass';
      this.lowPassFilter.frequency.setValueAtTime(3400, this.audioCtx.currentTime);

      // Analyser Node
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect DSP pipeline
      this.sourceNode.connect(this.highPassFilter);
      this.highPassFilter.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.analyser);

      this.isListening = true;
      this._startAnalysisLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access unavailable. Using synthetic loop:', err);
      this._startSyntheticLoop();
      return false;
    }
  }

  onBargeIn(cb) {
    this.onBargeInCallback = cb;
  }

  onSpeechEnd(cb) {
    this.onSpeechEndCallback = cb;
  }

  onAcousticUpdate(cb) {
    this.onAcousticUpdateCallback = cb;
  }

  _startAnalysisLoop() {
    const bufferLength = this.analyser.frequencyBinCount;
    const timeDomainData = new Float32Array(bufferLength);
    const freqDomainData = new Uint8Array(bufferLength);

    let isSpeaking = false;
    let silenceStart = 0;

    const analyze = () => {
      if (!this.isListening) return;

      this.analyser.getFloatTimeDomainData(timeDomainData);
      this.analyser.getByteFrequencyData(freqDomainData);

      let sumSq = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        sumSq += timeDomainData[i] * timeDomainData[i];
      }
      const rms = Math.sqrt(sumSq / timeDomainData.length);
      this.currentMetrics.energyRMS = rms;

      const pitch = this._estimatePitch(timeDomainData, this.audioCtx.sampleRate);
      if (pitch > 85 && pitch < 380) {
        this.currentMetrics.f0Pitch = Math.round(pitch);
        this.currentMetrics.pitchContour.push(pitch);
        if (this.currentMetrics.pitchContour.length > 20) {
          this.currentMetrics.pitchContour.shift();
        }
      }

      // DO NOT trigger false barge-in from mic while AI is speaking
      if (!speechSynthesizerInstance.isSpeaking && rms > this.vadThreshold && pitch > 85) {
        if (!isSpeaking) {
          isSpeaking = true;
          this.speechStartTime = Date.now();
        }
        silenceStart = 0;
      } else if (isSpeaking) {
        if (silenceStart === 0) silenceStart = Date.now();
        if (Date.now() - silenceStart > 450) {
          isSpeaking = false;
          silenceStart = 0;
        }
      }

      this._calculateArousalValence(rms, pitch);

      if (this.onAcousticUpdateCallback) {
        this.onAcousticUpdateCallback({ ...this.currentMetrics });
      }

      this.animFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  _startSyntheticLoop() {
    this.isListening = true;
    const simulate = () => {
      if (!this.isListening) return;

      const time = Date.now() / 1000;
      this.currentMetrics.energyRMS = 0.05 + Math.sin(time * 3) * 0.03;
      this.currentMetrics.f0Pitch = 180 + Math.sin(time * 1.5) * 45;

      this._calculateArousalValence(this.currentMetrics.energyRMS, this.currentMetrics.f0Pitch);

      if (this.onAcousticUpdateCallback) {
        this.onAcousticUpdateCallback({ ...this.currentMetrics });
      }

      this.animFrameId = requestAnimationFrame(() => {
        setTimeout(simulate, 100);
      });
    };
    simulate();
  }

  _estimatePitch(buffer, sampleRate) {
    let SIZE = buffer.length;
    let r1 = 0, r2 = SIZE - 1;
    let thres = 0.2;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    if (T0 === -1 || T0 === 0) return -1;
    return sampleRate / T0;
  }

  _calculateArousalValence(rms, pitch) {
    let arousal = Math.min(1.0, Math.max(0.0, (rms * 12) + ((pitch - 140) / 300)));
    let pitchVariance = 0;
    if (this.currentMetrics.pitchContour.length > 5) {
      const mean = this.currentMetrics.pitchContour.reduce((a, b) => a + b, 0) / this.currentMetrics.pitchContour.length;
      pitchVariance = Math.sqrt(this.currentMetrics.pitchContour.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.currentMetrics.pitchContour.length);
    }

    let valence = 0.5;
    if (arousal < 0.35) {
      valence = pitchVariance > 15 ? 0.75 : 0.2;
    } else if (arousal > 0.65) {
      valence = pitchVariance > 25 ? 0.85 : 0.15;
    } else {
      valence = 0.5 + (pitchVariance - 10) / 50;
    }

    this.currentMetrics.arousal = parseFloat(arousal.toFixed(2));
    this.currentMetrics.valence = parseFloat(valence.toFixed(2));

    if (arousal < 0.35 && valence > 0.6) {
      this.currentMetrics.emotion = 'Deep Intimacy / Love';
    } else if (arousal < 0.35 && valence <= 0.4) {
      this.currentMetrics.emotion = 'Sadness / Depression';
    } else if (arousal >= 0.65 && valence <= 0.4) {
      this.currentMetrics.emotion = 'Anger / Frustration';
    } else if (arousal >= 0.65 && valence > 0.6) {
      this.currentMetrics.emotion = 'Joy / Enthusiasm';
    } else {
      this.currentMetrics.emotion = 'Calm / Neutral';
    }
  }

  stop() {
    this.isListening = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export const audioEngineInstance = new AudioEngine();
