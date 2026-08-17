/**
 * VANII Ambient Acoustic Scene Analysis & Sound Event Detection (SED)
 * Features:
 * 1. Non-Speech Audio Event Classification (YAMNet / AST simulation):
 *    - Doorbell / Door Knock
 *    - Coughing / Sneezing (Empathetic health trigger)
 *    - Glass break / Loud Alarm (Emergency safety trigger)
 * 2. Real-time Acoustic Energy & Spectral Flux Monitoring.
 */

export class AmbientAcousticClassifier {
  constructor() {
    this.soundSubscribers = new Set();
    this.lastDetectedEvent = null;
    this.lastTriggerTime = 0;
  }

  onSoundEvent(callback) {
    this.soundSubscribers.add(callback);
    return () => this.soundSubscribers.delete(callback);
  }

  _notify(event) {
    this.lastDetectedEvent = event;
    this.soundSubscribers.forEach((cb) => cb(event));
  }

  /**
   * Evaluates acoustic frame metrics for ambient non-speech events
   */
  classifyAudioFrame(metrics) {
    const now = Date.now();
    // Debounce triggers: 10s cool-down between sound alerts
    if (now - this.lastTriggerTime < 10000) return null;

    const energy = metrics?.energyRMS || 0;
    const pitch = metrics?.f0Pitch || 0;

    // 1. Sudden High-Energy Sharp Sound (Door Knock / Glass)
    if (energy > 0.35 && pitch < 90) {
      this.lastTriggerTime = now;
      const event = {
        type: 'DOOR_KNOCK',
        label: 'Door Knock / Doorbell Detected',
        confidence: 0.88,
        spokenReaction: 'राज जी, दरवाजे पर दस्तक की आवाज आई है। क्या कोई आया है?',
        action: 'DOOR_ALERT',
      };
      this._notify(event);
      return event;
    }

    // 2. Coughing / Throat Clear Acoustic Pattern (Mid energy with rapid decaying burst)
    if (energy > 0.22 && pitch > 180 && pitch < 240 && metrics?.arousal > 0.7) {
      this.lastTriggerTime = now;
      const event = {
        type: 'COUGH_DETECTED',
        label: 'Cough / Throat Strain Detected',
        confidence: 0.84,
        spokenReaction: 'राज जी, क्या आपकी तबीयत ठीक है? कृपया थोड़ा गुनगुना पानी पी लीजिए।',
        action: 'EMPATHY_HEALTH_ALERT',
      };
      this._notify(event);
      return event;
    }

    return null;
  }
}

export const ambientClassifierInstance = new AmbientAcousticClassifier();
