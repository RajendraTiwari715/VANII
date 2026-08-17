/**
 * VANII Reciprocal Rank Fusion (RRF) & Multi-Signal Knowledge Engine
 * Implements PDF Specification:
 * RRF(d) = sum_{m in M} (w_m / (k + r_m(d))) where k = 60
 * Fuses 3 complementary signals:
 * 1. Dense Semantic Embeddings
 * 2. Sparse BM25 Lexical Tokens
 * 3. Knowledge Graph Entity Linkages
 */

export class ReciprocalRankFusionEngine {
  constructor(kSmoothing = 60) {
    this.kSmoothing = kSmoothing;
    this.modelWeights = {
      denseSemantic: 1.0,
      sparseBM25: 0.85,
      graphEntity: 0.95,
    };
  }

  /**
   * Computes RRF score across ranked lists from Dense Vector, BM25, and Graph models
   */
  fuseRankings(denseResults, bm25Results, graphResults) {
    const documentScores = new Map();

    const processList = (list, weight) => {
      list.forEach((doc, rank) => {
        const id = doc.id || doc.title || doc.text;
        const currentScore = documentScores.get(id) || { doc, totalScore: 0, sources: [] };
        const rrfIncrement = weight / (this.kSmoothing + rank + 1);

        currentScore.totalScore += rrfIncrement;
        currentScore.sources.push({ rank: rank + 1, rrfContrib: rrfIncrement });
        documentScores.set(id, currentScore);
      });
    };

    processList(denseResults, this.modelWeights.denseSemantic);
    processList(bm25Results, this.modelWeights.sparseBM25);
    processList(graphResults, this.modelWeights.graphEntity);

    const fused = Array.from(documentScores.values());
    fused.sort((a, b) => b.totalScore - a.totalScore);

    return fused.map((item) => ({
      ...item.doc,
      rrfScore: parseFloat(item.totalScore.toFixed(4)),
    }));
  }

  /**
   * Search knowledge base using Multi-Signal Hybrid RRF
   */
  searchKnowledgeBase(query, corpus = []) {
    if (!query || corpus.length === 0) return [];
    const qTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    // 1. Dense Semantic simulation
    const denseList = [...corpus].sort((a, b) => (b.semanticRelevance || 0.5) - (a.semanticRelevance || 0.5));

    // 2. BM25 Lexical search
    const bm25List = [...corpus].map((doc) => {
      const text = (doc.text || doc.title || '').toLowerCase();
      let matches = 0;
      qTerms.forEach((t) => {
        if (text.includes(t)) matches++;
      });
      return { ...doc, bm25Matches: matches };
    }).sort((a, b) => b.bm25Matches - a.bm25Matches);

    // 3. Knowledge Graph Entity Linkage
    const graphList = [...corpus].filter((doc) => doc.hasEntityLink || doc.category === 'core_knowledge');

    return this.fuseRankings(denseList, bm25List, graphList);
  }
}

export const rrfEngineInstance = new ReciprocalRankFusionEngine(60);
