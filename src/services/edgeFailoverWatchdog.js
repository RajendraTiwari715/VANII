/**
 * VANII Edge Failover & Sandboxed Security Guardrails
 * Implements PDF Specification:
 * 1. Offline Edge Failover Strategy (Local rule execution during network drop).
 * 2. Sandboxed Execution & High-Risk Deterministic Confirmation Guardrails.
 */

export class EdgeFailoverWatchdog {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.pendingConfirmations = new Map();

    this._initNetworkListeners();
  }

  _initNetworkListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  checkNetworkHealth() {
    return {
      isOnline: this.isOnline,
      mode: this.isOnline ? 'CLOUD_WEBRTC_ACTIVE' : 'OFFLINE_EDGE_FALLBACK',
    };
  }

  /**
   * Deterministic Action Guardrails for High-Risk Operations
   */
  evaluateActionRisk(actionType, params = {}) {
    const highRiskActions = ['DELETE_FILE', 'FORMAT_DRIVE', 'EXECUTE_ROOT_SHELL', 'MUTATE_CREDENTIALS'];

    if (highRiskActions.includes(actionType)) {
      const confirmationId = `CONFIRM_${Date.now()}`;
      this.pendingConfirmations.set(confirmationId, { actionType, params, timestamp: Date.now() });

      return {
        requiresConfirmation: true,
        confirmationId,
        spokenWarning: `राज जी, यह एक संवेदनशील कार्य (${actionType}) है। क्या आप निश्चित रूप से इसे निष्पादित करना चाहते हैं? कृपया 'हाँ' या 'पुष्टि करें' बोलें।`,
      };
    }

    return {
      requiresConfirmation: false,
      isAllowed: true,
    };
  }

  confirmAction(confirmationId) {
    if (this.pendingConfirmations.has(confirmationId)) {
      const action = this.pendingConfirmations.get(confirmationId);
      this.pendingConfirmations.delete(confirmationId);
      return { confirmed: true, action };
    }
    return { confirmed: false, error: 'Confirmation expired or invalid.' };
  }
}

export const edgeFailoverInstance = new EdgeFailoverWatchdog();
