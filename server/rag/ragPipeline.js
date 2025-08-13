import { VectorStore } from '../vector/vectorStore.js';

export class RAGPipeline {
  constructor() {
    this.vectorStore = new VectorStore();
    this.maxContextLength = 4000;
    this.topK = 5;
  }

  async query(query, documentIds = null, filters = {}) {
    try {
      // Step 1: Query preprocessing and intent recognition
      const processedQuery = await this.preprocessQuery(query);
      
      // Step 2: Retrieve relevant chunks
      const relevantChunks = await this.vectorStore.searchWithQuery(
        processedQuery.text,
        documentIds,
        {
          minSimilarity: 0.3,
          ...filters
        }
      );
      
      // Step 3: Rerank and select best chunks
      const rerankedChunks = await this.rerank(query, relevantChunks);
      const selectedChunks = rerankedChunks.slice(0, this.topK);
      
      // Step 4: Generate context-aware response
      const context = this.buildContext(selectedChunks);
      const response = await this.generate(query, context, processedQuery.intent);
      
      // Step 5: Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(selectedChunks, response);
      
      return {
        answer: response,
        sources: selectedChunks.map(chunk => ({
          content: chunk.content,
          similarity: chunk.similarity,
          documentId: chunk.documentId,
          type: chunk.type,
          metadata: chunk.metadata
        })),
        relevanceScore,
        context,
        queryIntent: processedQuery.intent
      };
    } catch (error) {
      console.error('RAG pipeline error:', error);
      throw error;
    }
  }

  async preprocessQuery(query) {
    // Analyze query intent and extract key information
    const intent = this.classifyIntent(query);
    const entities = this.extractEntities(query);
    const keywords = this.extractKeywords(query);
    
    return {
      text: query,
      intent,
      entities,
      keywords,
      processedText: this.expandQuery(query, keywords)
    };
  }

  classifyIntent(query) {
    const intents = {
      'factual': /what is|define|explain|tell me about/i,
      'comparison': /compare|versus|vs|difference between/i,
      'procedural': /how to|steps|process|procedure/i,
      'analytical': /analyze|analysis|insights|trends/i,
      'numerical': /statistics|numbers|data|metrics/i,
      'visual': /chart|graph|table|image|figure/i
    };
    
    for (const [intentType, pattern] of Object.entries(intents)) {
      if (pattern.test(query)) {
        return intentType;
      }
    }
    
    return 'general';
  }

  extractEntities(query) {
    // Simple entity extraction (would use NER in production)
    const entities = [];
    const patterns = {
      'date': /\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/gi,
      'number': /\d+\.?\d*/g,
      'organization': /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|LLC|Corp|Company|Ltd)\b/g
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = query.match(pattern) || [];
      entities.push(...matches.map(match => ({ type, value: match })));
    }
    
    return entities;
  }

  extractKeywords(query) {
    // Extract important keywords, removing stop words
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  expandQuery(query, keywords) {
    // Simple query expansion with synonyms
    const synonyms = {
      'data': ['information', 'statistics', 'metrics'],
      'analyze': ['examine', 'study', 'review'],
      'show': ['display', 'present', 'demonstrate']
    };
    
    let expanded = query;
    for (const keyword of keywords) {
      if (synonyms[keyword]) {
        expanded += ' ' + synonyms[keyword].join(' ');
      }
    }
    
    return expanded;
  }

  async rerank(query, chunks) {
    // Advanced reranking considering multiple factors
    return chunks.map(chunk => {
      let score = chunk.similarity;
      
      // Boost score for exact keyword matches
      const queryWords = query.toLowerCase().split(/\s+/);
      const contentWords = chunk.content.toLowerCase().split(/\s+/);
      const exactMatches = queryWords.filter(word => contentWords.includes(word)).length;
      score += (exactMatches / queryWords.length) * 0.2;
      
      // Boost score for certain content types based on query intent
      if (query.toLowerCase().includes('table') && chunk.type === 'visual_context') {
        score += 0.1;
      }
      
      // Consider content length (moderate penalty for very short or very long content)
      const lengthScore = Math.max(0, 1 - Math.abs(chunk.content.length - 300) / 1000);
      score += lengthScore * 0.05;
      
      return { ...chunk, rerankedScore: score };
    }).sort((a, b) => b.rerankedScore - a.rerankedScore);
  }

  buildContext(chunks) {
    let context = '';
    let currentLength = 0;
    
    for (const chunk of chunks) {
      const chunkText = `Source: ${chunk.type}\n${chunk.content}\n\n`;
      if (currentLength + chunkText.length <= this.maxContextLength) {
        context += chunkText;
        currentLength += chunkText.length;
      } else {
        break;
      }
    }
    
    return context;
  }

  async generate(query, context, intent) {
    // Simulate LLM response generation (would use OpenAI/Anthropic in production)
    const templates = {
      'factual': `Based on the provided context, here's what I found about "${query}":\n\n`,
      'comparison': `Comparing the information from the documents:\n\n`,
      'procedural': `Here are the steps based on the documentation:\n\n`,
      'analytical': `Based on my analysis of the provided data:\n\n`,
      'numerical': `Here are the key statistics and numbers:\n\n`,
      'visual': `Based on the charts, tables, and visual elements:\n\n`,
      'general': `Based on the available information:\n\n`
    };
    
    const template = templates[intent] || templates['general'];
    
    // Simple response generation (would use actual LLM)
    const contextSummary = this.summarizeContext(context);
    const response = template + contextSummary;
    
    // Add confidence indicator
    const confidence = this.calculateResponseConfidence(context, query);
    
    return {
      text: response,
      confidence,
      intent,
      contextUsed: context.length > 0
    };
  }

  summarizeContext(context) {
    if (!context || context.length === 0) {
      return "I couldn't find specific information in the uploaded documents to answer your question. Please make sure the relevant documents are uploaded and try rephrasing your question.";
    }
    
    // Extract key sentences from context
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keySentences = sentences.slice(0, 3).join('. ');
    
    return keySentences + (sentences.length > 3 ? '...' : '.');
  }

  calculateResponseConfidence(context, query) {
    let confidence = 0.5;
    
    // Increase confidence based on context relevance
    if (context.length > 500) confidence += 0.2;
    
    // Check for query keywords in context
    const queryWords = query.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase().split(/\s+/);
    const matchRatio = queryWords.filter(word => contextWords.includes(word)).length / queryWords.length;
    confidence += matchRatio * 0.3;
    
    return Math.min(confidence, 1.0);
  }

  calculateRelevanceScore(chunks, response) {
    if (chunks.length === 0) return 0;
    
    // Average similarity of retrieved chunks
    const avgSimilarity = chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunks.length;
    
    // Response confidence
    const responseConfidence = response.confidence || 0.5;
    
    // Combine scores
    return (avgSimilarity * 0.6 + responseConfidence * 0.4);
  }
}