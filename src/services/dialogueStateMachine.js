/**
 * VANII Dialogue State Machine & Short-Term State Tracking (DST)
 * S_t = <M_t, E_t, A_t, U_id>
 * Dynamic media entity resolution without hardcoded track locks.
 */

export class DialogueStateMachine {
  constructor(userId = 'raj') {
    this.userId = userId;
    this.messages = [];
    this.activeMediaEntity = null; // Dynamically populated based on what user actually asks for
    this.playbackStatus = 'stopped';
    this.activeTaskQueue = [];
  }

  getState() {
    return {
      userId: this.userId,
      messages: [...this.messages],
      activeMediaEntity: this.activeMediaEntity ? { ...this.activeMediaEntity } : null,
      playbackStatus: this.playbackStatus,
      activeTaskQueue: [...this.activeTaskQueue],
    };
  }

  recordTurn(userText, agentText) {
    this.messages.push({ role: 'user', content: userText, timestamp: Date.now() });
    this.messages.push({ role: 'agent', content: agentText, timestamp: Date.now() });
    if (this.messages.length > 20) {
      this.messages.shift();
      this.messages.shift();
    }
  }

  setPlaybackStatus(status) {
    this.playbackStatus = status;
  }

  setActiveMediaEntity(entity) {
    this.activeMediaEntity = {
      ...entity,
      updatedAt: Date.now(),
    };
  }

  /**
   * Resolves elliptical follow-up commands like "chalu karo", "gana play karo", "chalao", "pause karo", "dusra gana bajao"
   */
  resolveEllipticalTurn(utterance, longTermMemoryPreference = null) {
    const uLower = utterance.toLowerCase().trim();

    // 1. If user explicitly asks for "koi dusra gana" / "change song"
    if (
      uLower.includes('dusra') ||
      uLower.includes('दूसरा') ||
      uLower.includes('change') ||
      uLower.includes('badlo') ||
      uLower.includes('aur gana') ||
      uLower.includes('agla')
    ) {
      return {
        isElliptical: true,
        action: 'CHANGE_TO_NEXT_SONG',
        resolvedEntity: { query: 'dusra gana' },
        reason: 'User explicitly requested a different song.',
      };
    }

    // 2. Resume / Play Directives (Pure Elliptical)
    const isResumeTrigger =
      uLower === 'chalu karo' ||
      uLower === 'चालू करो' ||
      uLower === 'play karo' ||
      uLower === 'प्ले करो' ||
      uLower === 'chalao' ||
      uLower === 'चलाओ' ||
      uLower === 'bajao' ||
      uLower === 'बजाओ' ||
      uLower === 'gana play karo' ||
      uLower === 'गाना प्ले करो' ||
      uLower === 'gana chalu karo' ||
      uLower === 'गाना चालू करो' ||
      uLower === 'ab bajao' ||
      uLower === 'ab chalao';

    if (isResumeTrigger) {
      if (this.playbackStatus === 'paused' && this.activeMediaEntity?.query) {
        this.playbackStatus = 'playing';
        return {
          isElliptical: true,
          action: 'RESUME_PLAYBACK',
          resolvedEntity: this.activeMediaEntity,
          reason: 'Resuming previously paused track without clarifying question.',
        };
      }

      if (this.activeMediaEntity?.query) {
        this.playbackStatus = 'playing';
        return {
          isElliptical: true,
          action: 'PLAY_ACTIVE_ENTITY',
          resolvedEntity: this.activeMediaEntity,
          reason: 'Binding active media entity from E_{t-1} dialogue state.',
        };
      }

      // Fallback
      const fallbackQuery = longTermMemoryPreference || 'Trending Bollywood Hits';
      const fallbackEntity = {
        track: 'Trending Bollywood Songs',
        artist: 'Popular Artist',
        query: fallbackQuery,
      };
      this.setActiveMediaEntity(fallbackEntity);
      this.playbackStatus = 'playing';
      return {
        isElliptical: true,
        action: 'PLAY_MEMORY_FALLBACK',
        resolvedEntity: fallbackEntity,
        reason: 'Resolved missing arguments via Long-Term Memory preference fallback.',
      };
    }

    // 3. Pause / Stop Directives
    const isPauseTrigger =
      uLower === 'rok do' ||
      uLower === 'रोक दो' ||
      uLower === 'pause karo' ||
      uLower === 'पॉज़ करो' ||
      uLower === 'band karo' ||
      uLower === 'बंद करो';

    if (isPauseTrigger) {
      this.playbackStatus = 'paused';
      return {
        isElliptical: true,
        action: 'PAUSE_PLAYBACK',
        resolvedEntity: this.activeMediaEntity,
        reason: 'Pausing active media playback.',
      };
    }

    return {
      isElliptical: false,
      action: 'NORMAL_PROCESSING',
      resolvedEntity: null,
    };
  }
}

export const dialogueStateInstance = new DialogueStateMachine('raj');
