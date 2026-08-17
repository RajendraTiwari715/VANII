/**
 * VANII Proactive Heartbeat Daemon & Affective Cognitive Interventions
 * Implements PDF Specification:
 * 1. Asynchronous 5-minute Proactive Heartbeat Cron Cycle.
 * 2. Mathematical Utility Function: U(event) = w1*Relevance + w2*Urgency + w3*Contextual_Fit - w4*Intrusiveness_Penalty
 * 3. Proactive vocal dispatch when U(event) >= T_proactive and operator is available.
 */

export class ProactiveHeartbeatDaemon {
  constructor(userId = 'raj') {
    this.userId = userId;
    this.proactiveThreshold = 0.72; // T_proactive
    this.weights = {
      relevance: 0.35, // w1
      urgency: 0.30,   // w2
      contextualFit: 0.25, // w3
      intrusivenessPenalty: 0.20, // w4
    };
    this.eventQueue = [];
    this.isMutedObserver = false;
    this.onProactiveAlertCallback = null;
    this.intervalHandle = null;

    this._seedDefaultEvents();
    this._startHeartbeatLoop();
  }

  _seedDefaultEvents() {
    this.eventQueue = [
      { id: 'evt_1', type: 'SCHEDULE', title: 'शाम का ध्यान और विश्राम सत्र', relevance: 0.9, urgency: 0.8, contextualFit: 0.85, spokenMessage: 'राज जी, आपके शाम के विश्राम का समय हो गया है। क्या मैं कोई मधुर संगीत चला दूँ?' },
      { id: 'evt_2', type: 'SYSTEM', title: 'सिस्टम ऑप्टिमाइजेशन पूर्ण', relevance: 0.7, urgency: 0.5, contextualFit: 0.8, spokenMessage: 'राज जी, बैकग्राउंड मेमोरी और सिस्टम पूरी तरह ऑप्टिमाइज़ हो चुके हैं।' },
    ];
  }

  setMutedObserver(isMuted) {
    this.isMutedObserver = isMuted;
  }

  onProactiveAlert(cb) {
    this.onProactiveAlertCallback = cb;
  }

  /**
   * Evaluates Proactive Utility Function: U(event) = w1*Rel + w2*Urg + w3*Fit - w4*Intrusion
   */
  evaluateEventUtility(event, isOperatorSpeaking = false) {
    const intrusion = isOperatorSpeaking || this.isMutedObserver ? 0.95 : 0.10;
    const utility =
      this.weights.relevance * (event.relevance || 0.5) +
      this.weights.urgency * (event.urgency || 0.5) +
      this.weights.contextualFit * (event.contextualFit || 0.5) -
      this.weights.intrusivenessPenalty * intrusion;

    return {
      utilityScore: parseFloat(utility.toFixed(3)),
      threshold: this.proactiveThreshold,
      shouldDispatch: utility >= this.proactiveThreshold && !this.isMutedObserver && !isOperatorSpeaking,
    };
  }

  triggerCheck(isOperatorSpeaking = false) {
    if (this.isMutedObserver || this.eventQueue.length === 0) return null;

    const currentEvent = this.eventQueue[0];
    const evaluation = this.evaluateEventUtility(currentEvent, isOperatorSpeaking);

    if (evaluation.shouldDispatch) {
      const dispatched = this.eventQueue.shift();
      if (this.onProactiveAlertCallback) {
        this.onProactiveAlertCallback(dispatched.spokenMessage);
      }
      return dispatched;
    }

    return null;
  }

  _startHeartbeatLoop() {
    // 5-minute interval daemon
    this.intervalHandle = setInterval(() => {
      this.triggerCheck(false);
    }, 5 * 60 * 1000);
  }
}

export const proactiveDaemonInstance = new ProactiveHeartbeatDaemon('raj');
