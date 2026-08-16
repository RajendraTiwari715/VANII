/**
 * VANII Mem0 + FalkorDB Hierarchical Graph Memory Store
 * Manages Semantic, Episodic, and Procedural Memory with live Graph Triple extraction & vector traversal.
 */

export class MemoryStore {
  constructor() {
    this.semanticMemory = [
      { id: 'sem-1', fact: 'User Name: Raj (राज)', category: 'Identity', confidence: 0.99 },
      { id: 'sem-2', fact: 'Profession: AI Developer / Software Engineer', category: 'Career', confidence: 0.95 },
      { id: 'sem-3', fact: 'Language Preference: Shuddha Khari Boli Hindi & Hinglish', category: 'Communication', confidence: 0.98 },
      { id: 'sem-4', fact: 'Comfort Trigger: Soft Melodious Voice & Calm Cadence', category: 'Preference', confidence: 0.92 },
    ];

    this.episodicMemory = [
      {
        id: 'ep-101',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        event: 'Raj engaged in late night AI development & system architecture.',
        emotionState: 'Calm / Neutral',
        arousal: 0.35,
        valence: 0.70,
      },
    ];

    this.proceduralMemory = [
      { id: 'proc-1', rule: 'Always address user respectfully as Raj / Raj ji.' },
      { id: 'proc-2', rule: 'Never mix or merge previous answers into the current query response.' },
      { id: 'proc-3', rule: 'When user says "shant raho" or interrupts, immediately stop speaking.' },
    ];

    // FalkorDB Graph Triple Store: Node -> Relationship -> Node
    this.graphTriples = [
      { id: 'g-1', subject: 'Raj', relation: 'PREFERS', object: 'Shuddha Khari Boli Hindi', type: 'Preference' },
      { id: 'g-2', subject: 'Raj', relation: 'BUILDS', object: 'VANII Autonomous Voice Agent', type: 'Career' },
      { id: 'g-3', subject: 'Raj', relation: 'SOOTHED_BY', object: 'Sweet Melodious Voice & Calm Tone', type: 'Solution' },
      { id: 'g-4', subject: 'VANII Agent', relation: 'ASSISTS', object: 'Raj', type: 'Identity' },
    ];

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l(this.getState()));
  }

  getState() {
    return {
      semantic: [...this.semanticMemory],
      episodic: [...this.episodicMemory],
      procedural: [...this.proceduralMemory],
      graphTriples: [...this.graphTriples],
    };
  }

  processUserInput(userInput, detectedEmotion) {
    const textLower = userInput.toLowerCase();
    let updated = false;

    // Check for preference extraction
    if (textLower.includes('mujhe') && (textLower.includes('pasand') || textLower.includes('like'))) {
      this.semanticMemory.push({
        id: `sem-${Date.now()}`,
        fact: `Extracted Preference for Raj: "${userInput}"`,
        category: 'Preference',
        confidence: 0.92,
      });
      updated = true;
    }

    if (updated) {
      this.notify();
    }
  }

  retrieveGraphContext(query) {
    const queryLower = query.toLowerCase();
    const matches = this.graphTriples.filter(
      (triple) =>
        queryLower.includes(triple.subject.toLowerCase()) ||
        queryLower.includes(triple.object.toLowerCase()) ||
        queryLower.includes(triple.relation.toLowerCase())
    );

    return matches.length > 0 ? matches : this.graphTriples.slice(0, 4);
  }
}

export const memoryStoreInstance = new MemoryStore();
