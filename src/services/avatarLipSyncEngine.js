/**
 * VANII 3D Embodied Avatar & Real-Time Lip-Sync Engine
 * Features:
 * 1. Audio-to-Viseme Real-Time Mapping: Computes mouth aperture (open, closed, wide, round) from speech synthesis audio stream.
 * 2. Facial Micro-Expressions: Happiness, concern, thoughtful listening, playful, calm.
 * 3. Eye Blinking & Head Micro-Movements for lifelike human presence.
 */

export class AvatarLipSyncEngine {
  constructor() {
    this.currentViseme = 'sil'; // 'sil', 'aa', 'ee', 'oo', 'oh', 'ch'
    this.mouthOpen = 0.0; // 0.0 to 1.0
    this.expression = 'calm'; // 'happy', 'concerned', 'thoughtful', 'calm', 'smile'
    this.eyeBlink = 0.0;
    this.headTilt = { x: 0, y: 0, z: 0 };
    this.isSpeaking = false;
    this.subscribers = new Set();
    this._startIdleAnimationLoop();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  _notify() {
    const state = {
      viseme: this.currentViseme,
      mouthOpen: this.mouthOpen,
      expression: this.expression,
      eyeBlink: this.eyeBlink,
      headTilt: this.headTilt,
      isSpeaking: this.isSpeaking,
    };
    this.subscribers.forEach((cb) => cb(state));
  }

  setSpeakingState(speaking) {
    this.isSpeaking = speaking;
    if (!speaking) {
      this.mouthOpen = 0.0;
      this.currentViseme = 'sil';
    }
    this._notify();
  }

  setExpression(emotion) {
    const e = (emotion || '').toLowerCase();
    if (e.includes('joy') || e.includes('enthusiasm') || e.includes('happy')) {
      this.expression = 'happy';
    } else if (e.includes('sad') || e.includes('concern') || e.includes('depress')) {
      this.expression = 'concerned';
    } else if (e.includes('thought') || e.includes('reasoning') || e.includes('analy')) {
      this.expression = 'thoughtful';
    } else {
      this.expression = 'calm';
    }
    this._notify();
  }

  /**
   * Process raw acoustic energy and synthesize phoneme visemes
   */
  processAudioFrame(energyRMS, pitchF0) {
    if (!this.isSpeaking) return;

    // Map energy to mouth opening
    this.mouthOpen = Math.min(1.0, Math.max(0.1, energyRMS * 12 + Math.random() * 0.2));

    // Viseme selection based on pitch and energy
    if (pitchF0 > 220) {
      this.currentViseme = 'ee';
    } else if (pitchF0 > 170) {
      this.currentViseme = 'aa';
    } else if (pitchF0 > 130) {
      this.currentViseme = 'oh';
    } else {
      this.currentViseme = 'oo';
    }

    this._notify();
  }

  _startIdleAnimationLoop() {
    if (typeof window === 'undefined') return;

    // Natural eye blink every 3.5 seconds
    setInterval(() => {
      this.eyeBlink = 1.0;
      this._notify();
      setTimeout(() => {
        this.eyeBlink = 0.0;
        this._notify();
      }, 150);
    }, 3500);

    // Subtle natural head breathing sway
    let angle = 0;
    setInterval(() => {
      angle += 0.05;
      this.headTilt = {
        x: Math.sin(angle) * 2.5,
        y: Math.cos(angle * 0.8) * 2.0,
        z: Math.sin(angle * 0.5) * 1.5,
      };
      this._notify();
    }, 50);
  }
}

export const avatarLipSyncInstance = new AvatarLipSyncEngine();
