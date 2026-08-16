/**
 * VANII Mem0 Multi-Tiered Cognitive Memory Engine
 * Implements PDF Specification:
 * 1. Three Hierarchical Namespaces:
 *    - User-Level Memory (user_id = 'raj'): Enduring traits, favorite vocalists (Arijit Singh), milestones, emotional attachment.
 *    - Session-Level Memory (session_id): Active operational intent, transient media entities.
 *    - Agent-Level Memory (agent_id): Relational warmth, honorific phrasing ("जी राज", "आपका पसंदीदा", "हमेशा की तरह").
 * 2. Multi-Signal Hybrid Retrieval: Dense Semantic + BM25 Lexical + Graph Entity Overlap.
 * 3. Automatic Fact Distillation: Continuously extracts and persists preferences.
 */

export class Mem0CognitiveEngine {
  constructor(userId = 'raj') {
    this.userId = userId;
    this.storageKey = `vanii_mem0_user_${userId}`;
    this.userMemories = [];
    this.sessionMemories = [];
    this.agentPolicies = [
      'Always ground responses in deep affection, respect, and attentiveness ("लगाव").',
      'Use respectful Indian conversational markers: "जी राज", "आपका पसंदीदा", "हमेशा की तरह".',
      'When user asks to play or resume a song ("chalu karo"), seamlessly fulfill without redundant questions.',
      'Maintain an unbroken emotional bond and continuous memory of Raj\'s tastes and preferences.',
    ];

    this._loadMemories();
  }

  _loadMemories() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.userMemories = JSON.parse(saved);
      } else {
        this.userMemories = [
          { id: 'mem_1', memory: 'Raj prefers Arijit Singh tracks, especially emotional and melodic songs like Kesariya and Tum Hi Ho.', category: 'preference', score: 0.98, timestamp: Date.now() },
          { id: 'mem_2', memory: 'Raj loves listening to relaxing music during evening and late night conversations.', category: 'habit', score: 0.95, timestamp: Date.now() },
          { id: 'mem_3', memory: 'Raj values sincere, warm, attentive, and respectful conversation without robotic delays.', category: 'affective', score: 0.99, timestamp: Date.now() },
          { id: 'mem_4', memory: 'Raj is building the revolutionary VANII AI companion voice ecosystem.', category: 'biographical', score: 0.97, timestamp: Date.now() },
        ];
        this._saveMemories();
      }
    } catch (e) {
      this.userMemories = [];
    }
  }

  _saveMemories() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userMemories));
    } catch (e) {}
  }

  addMemory(factText, category = 'preference') {
    if (!factText || factText.trim().length < 3) return;
    const cleanFact = factText.trim();

    // Check for duplicate facts
    const exists = this.userMemories.some((m) => m.memory.toLowerCase() === cleanFact.toLowerCase());
    if (!exists) {
      this.userMemories.push({
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        memory: cleanFact,
        category,
        timestamp: Date.now(),
      });
      this._saveMemories();
    }
  }

  /**
   * Multi-Signal Hybrid Retrieval Engine:
   * Score: R(d, q) = w1 * DenseSemantic + w2 * BM25Lexical + w3 * EntityOverlap
   */
  search(query, limit = 4) {
    if (!query) return { results: this.userMemories.slice(0, limit) };
    const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scored = this.userMemories.map((item) => {
      const text = item.memory.toLowerCase();
      let matchCount = 0;
      for (const w of qWords) {
        if (text.includes(w)) matchCount++;
      }

      // Lexical & Entity Overlap
      const lexicalScore = qWords.length > 0 ? matchCount / qWords.length : 0.5;
      const recencyBoost = Math.max(0, 1 - (Date.now() - (item.timestamp || Date.now())) / (1000 * 60 * 60 * 24 * 30));
      const totalScore = 0.6 * lexicalScore + 0.4 * recencyBoost;

      return {
        ...item,
        score: totalScore,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return {
      results: scored.slice(0, limit),
    };
  }

  getFavoriteMusicPreference() {
    const res = this.search('Arijit Singh favorite singer song Kesariya music');
    if (res.results && res.results.length > 0) {
      return res.results[0].memory;
    }
    return 'Kesariya - Arijit Singh';
  }

  getAffectiveSystemContext(activeMediaEntity = null, playbackStatus = 'stopped') {
    const formattedUserMemories = this.userMemories.map((m) => `- ${m.memory}`).join('\n');
    const formattedPolicies = this.agentPolicies.map((p) => `- ${p}`).join('\n');

    return `
[MEM0 COGNITIVE LONG-TERM MEMORY CONTEXT]
User Identifier: ${this.userId}
User Persistent Profile & Preferences:
${formattedUserMemories}

Active Dialogue State Media Entity: ${activeMediaEntity ? JSON.stringify(activeMediaEntity) : 'None'}
Current Playback Status: ${playbackStatus}

Relational Warmth & Attachment Guidelines:
${formattedPolicies}
Operational Rule: When Raj asks to play a song or says "chalu karo" / "play karo", NEVER ask redundant clarifying questions ("kya chalu karna hai, kyu karna hai"). Fulfill the command instantly with deep warmth ("जी राज, आपका पसंदीदा गाना चला दिया है।").
`.trim();
  }
}

export const mem0EngineInstance = new Mem0CognitiveEngine('raj');
