export class VectorStore {
  constructor() {
    this.vectors = new Map(); // In-memory store (would use Pinecone/Weaviate in production)
    this.documents = new Map();
    this.embeddingDimensions = 384; // For sentence-transformers
  }

  async storeDocument(documentId, processingResult) {
    try {
      const chunks = processingResult.chunks || [];
      const embeddings = await this.generateEmbeddings(chunks);
      
      // Store document metadata
      this.documents.set(documentId.toString(), {
        id: documentId,
        metadata: processingResult.metadata,
        chunksCount: chunks.length,
        storedAt: new Date()
      });

      // Store chunk embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${documentId}_${chunks[i].id}`;
        this.vectors.set(chunkId, {
          id: chunkId,
          documentId: documentId.toString(),
          chunkId: chunks[i].id,
          embedding: embeddings[i],
          content: chunks[i].content,
          metadata: chunks[i].metadata,
          type: chunks[i].type
        });
      }

      console.log(`Stored ${chunks.length} chunks for document ${documentId}`);
      return { success: true, chunksStored: chunks.length };
    } catch (error) {
      console.error('Vector store error:', error);
      throw error;
    }
  }

  async generateEmbeddings(chunks) {
    // Simulate embedding generation (would use actual embedding model)
    // Using OpenAI embeddings or HuggingFace sentence-transformers
    const embeddings = [];
    
    for (const chunk of chunks) {
      const embedding = this.simulateEmbedding(chunk.content);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }

  simulateEmbedding(text) {
    // Generate consistent pseudo-embeddings based on text content
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.embeddingDimensions).fill(0);
    
    // Simple hash-based embedding simulation
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash + word.charCodeAt(j)) & 0xffffffff;
      }
      
      const index = Math.abs(hash) % this.embeddingDimensions;
      embedding[index] += 1 / Math.sqrt(words.length);
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  async search(queryEmbedding, documentIds = null, limit = 10) {
    const results = [];
    
    for (const [chunkId, vectorData] of this.vectors) {
      // Filter by document IDs if specified
      if (documentIds && !documentIds.includes(vectorData.documentId)) {
        continue;
      }
      
      const similarity = this.cosineSimilarity(queryEmbedding, vectorData.embedding);
      results.push({
        ...vectorData,
        similarity
      });
    }
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async searchWithQuery(query, documentIds = null, filters = {}) {
    const queryEmbedding = this.simulateEmbedding(query);
    const vectorResults = await this.search(queryEmbedding, documentIds);
    
    // Apply additional filters
    let filteredResults = vectorResults;
    
    if (filters.contentType) {
      filteredResults = filteredResults.filter(r => 
        r.type === filters.contentType
      );
    }
    
    if (filters.minSimilarity) {
      filteredResults = filteredResults.filter(r => 
        r.similarity >= filters.minSimilarity
      );
    }
    
    return filteredResults.map(result => ({
      content: result.content,
      similarity: result.similarity,
      documentId: result.documentId,
      chunkId: result.chunkId,
      metadata: result.metadata,
      type: result.type
    }));
  }

  cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  getDocumentStats(documentId) {
    const doc = this.documents.get(documentId);
    if (!doc) return null;
    
    const chunks = Array.from(this.vectors.values())
      .filter(v => v.documentId === documentId);
    
    return {
      ...doc,
      actualChunks: chunks.length,
      contentTypes: [...new Set(chunks.map(c => c.type))]
    };
  }
}