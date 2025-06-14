# AI Assistant Architecture Deep Dive

## 🏗️ Comprehensive AI Assistant Architecture for Costa Beach

### Executive Summary
This document provides a detailed technical architecture for implementing a sophisticated AI assistant that leverages the existing Costa Beach platform infrastructure. The system will provide intelligent document search, community Q&A, and multilingual support while maintaining security, performance, and cost efficiency.

## 🎯 System Overview

### Core Capabilities
1. **Intelligent Document Search** - Semantic search across all community documents
2. **Contextual Q&A** - AI-powered responses with document citations
3. **Multilingual Support** - French, Arabic, and English interactions
4. **Permission-Aware** - Respects user access levels and document permissions
5. **Real-time Chat** - WebSocket-based interactive interface
6. **Knowledge Management** - Admin-managed FAQ and knowledge base

## 🧠 AI Architecture Components

### 1. Vector Database & Embeddings Layer

#### **PostgreSQL + pgvector Setup**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document embeddings table
CREATE TABLE document_embeddings (
  id SERIAL PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  language VARCHAR(5) NOT NULL,
  category VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge base embeddings
CREATE TABLE knowledge_embeddings (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  language VARCHAR(5) NOT NULL,
  keywords TEXT[],
  embedding vector(1536),
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation history
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  message_type VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity indexes
CREATE INDEX document_embeddings_vector_idx ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX knowledge_embeddings_vector_idx ON knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### **Embedding Service Architecture**
```typescript
// src/lib/services/embeddingService.ts
import OpenAI from 'openai';
import { createHash } from 'crypto';

export class EmbeddingService {
  private openai: OpenAI;
  private readonly MODEL = 'text-embedding-ada-002';
  private readonly CHUNK_SIZE = 1000; // tokens
  private readonly CHUNK_OVERLAP = 100; // tokens

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate embeddings for document content
   */
  async generateDocumentEmbeddings(
    documentId: string,
    content: string,
    language: string,
    category: string
  ): Promise<DocumentEmbedding[]> {
    // 1. Chunk the document content
    const chunks = this.chunkContent(content);
    
    // 2. Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const contentHash = this.generateContentHash(chunk);
        
        // Check if embedding already exists
        const existing = await this.getExistingEmbedding(documentId, contentHash);
        if (existing) return existing;
        
        const embedding = await this.generateEmbedding(chunk);
        
        return {
          documentId,
          chunkIndex: index,
          content: chunk,
          contentHash,
          embedding,
          language,
          category,
          metadata: {
            wordCount: chunk.split(' ').length,
            tokens: this.estimateTokens(chunk),
            originalLength: content.length,
          }
        };
      })
    );

    // 3. Store embeddings in database
    await this.storeDocumentEmbeddings(embeddings);
    
    return embeddings;
  }

  /**
   * Smart content chunking with semantic boundaries
   */
  private chunkContent(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokens(sentence);
      
      if (currentTokens + sentenceTokens > this.CHUNK_SIZE && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        currentTokens = sentenceTokens;
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Generate single embedding with caching
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.MODEL,
        input: text.trim(),
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation: 1 token ≈ 4 characters
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    return createHash('sha256').update(content.trim()).digest('hex');
  }
}
```

### 2. Semantic Search Engine

#### **Hybrid Search Implementation**
```typescript
// src/lib/services/searchService.ts
export class SemanticSearchService {
  private embeddingService: EmbeddingService;
  
  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Hybrid search combining semantic and keyword search
   */
  async search(
    query: string,
    userId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      minSimilarity = 0.7,
      language,
      category,
      includeDocuments = true,
      includeKnowledge = true
    } = options;

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // Parallel search across both document and knowledge embeddings
    const [documentResults, knowledgeResults] = await Promise.all([
      includeDocuments ? this.searchDocuments(queryEmbedding, query, userId, {
        limit: Math.ceil(limit * 0.7),
        minSimilarity,
        language,
        category
      }) : [],
      includeKnowledge ? this.searchKnowledge(queryEmbedding, query, {
        limit: Math.ceil(limit * 0.3),
        minSimilarity,
        language
      }) : []
    ]);

    // Combine and re-rank results
    const combinedResults = [...documentResults, ...knowledgeResults];
    return this.reRankResults(combinedResults, query).slice(0, limit);
  }

  /**
   * Search document embeddings with permission filtering
   */
  private async searchDocuments(
    queryEmbedding: number[],
    query: string,
    userId: string,
    options: DocumentSearchOptions
  ): Promise<DocumentSearchResult[]> {
    const { limit, minSimilarity, language, category } = options;

    // Build permission-aware query
    const permissionFilter = await this.buildPermissionFilter(userId);
    
    const searchQuery = `
      SELECT 
        de.id,
        de.document_id,
        de.content,
        de.chunk_index,
        de.language,
        de.category,
        de.metadata,
        d.title,
        d.file_path,
        d.created_at,
        1 - (de.embedding <=> $1::vector) as similarity,
        ts_rank(to_tsvector(de.content), plainto_tsquery($2)) as keyword_score
      FROM document_embeddings de
      JOIN documents d ON de.document_id = d.id
      WHERE 
        (1 - (de.embedding <=> $1::vector)) > $3
        AND (d.id IN (${permissionFilter.documentIds.map((_, i) => `$${i + 4}`).join(', ')}))
        ${language ? 'AND de.language = $' + (permissionFilter.documentIds.length + 4) : ''}
        ${category ? 'AND de.category = $' + (permissionFilter.documentIds.length + 5) : ''}
      ORDER BY 
        (similarity * 0.7 + keyword_score * 0.3) DESC
      LIMIT $${permissionFilter.documentIds.length + (language ? 5 : 4) + (category ? 1 : 0)}
    `;

    const params = [
      JSON.stringify(queryEmbedding),
      query,
      minSimilarity,
      ...permissionFilter.documentIds,
      ...(language ? [language] : []),
      ...(category ? [category] : []),
      limit
    ];

    const results = await db.query(searchQuery, params);
    
    return results.rows.map(row => ({
      type: 'document',
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      content: row.content,
      chunkIndex: row.chunk_index,
      similarity: row.similarity,
      keywordScore: row.keyword_score,
      combinedScore: row.similarity * 0.7 + row.keyword_score * 0.3,
      language: row.language,
      category: row.category,
      metadata: row.metadata,
      filePath: row.file_path,
      createdAt: row.created_at
    }));
  }

  /**
   * Search knowledge base embeddings
   */
  private async searchKnowledge(
    queryEmbedding: number[],
    query: string,
    options: KnowledgeSearchOptions
  ): Promise<KnowledgeSearchResult[]> {
    const { limit, minSimilarity, language } = options;

    const searchQuery = `
      SELECT 
        id,
        question,
        answer,
        category,
        language,
        keywords,
        priority,
        1 - (embedding <=> $1::vector) as similarity,
        ts_rank(to_tsvector(question || ' ' || answer), plainto_tsquery($2)) as keyword_score
      FROM knowledge_embeddings
      WHERE 
        is_active = true
        AND (1 - (embedding <=> $1::vector)) > $3
        ${language ? 'AND language = $4' : ''}
      ORDER BY 
        priority DESC,
        (similarity * 0.8 + keyword_score * 0.2) DESC
      LIMIT $${language ? 5 : 4}
    `;

    const params = [
      JSON.stringify(queryEmbedding),
      query,
      minSimilarity,
      ...(language ? [language] : []),
      limit
    ];

    const results = await db.query(searchQuery, params);
    
    return results.rows.map(row => ({
      type: 'knowledge',
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      language: row.language,
      keywords: row.keywords,
      priority: row.priority,
      similarity: row.similarity,
      keywordScore: row.keyword_score,
      combinedScore: row.similarity * 0.8 + row.keyword_score * 0.2
    }));
  }

  /**
   * Advanced re-ranking using contextual signals
   */
  private reRankResults(results: SearchResult[], query: string): SearchResult[] {
    return results
      .map(result => ({
        ...result,
        reRankScore: this.calculateReRankScore(result, query)
      }))
      .sort((a, b) => b.reRankScore - a.reRankScore);
  }

  private calculateReRankScore(result: SearchResult, query: string): number {
    let score = result.combinedScore;
    
    // Boost recent documents
    if (result.type === 'document') {
      const ageInDays = (Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 1 - ageInDays / 365) * 0.1; // Up to 10% boost for recent docs
      score += recencyBoost;
    }
    
    // Boost high-priority knowledge base items
    if (result.type === 'knowledge' && result.priority > 1) {
      score += (result.priority - 1) * 0.05; // 5% boost per priority level
    }
    
    // Boost exact keyword matches
    const queryTerms = query.toLowerCase().split(' ');
    const contentLower = (result.content || result.answer || '').toLowerCase();
    const exactMatches = queryTerms.filter(term => contentLower.includes(term)).length;
    const exactMatchBoost = (exactMatches / queryTerms.length) * 0.1;
    score += exactMatchBoost;
    
    return score;
  }

  /**
   * Build permission filter for user
   */
  private async buildPermissionFilter(userId: string): Promise<PermissionFilter> {
    // Get user permissions and accessible documents
    const userQuery = `
      SELECT u.role, u.permissions 
      FROM users u 
      WHERE u.id = $1
    `;
    
    const userResult = await db.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get accessible documents based on permissions
    const documentsQuery = `
      SELECT DISTINCT d.id
      FROM documents d
      WHERE 
        d.is_public = true
        OR d.created_by = $1
        OR $2 = 'admin'
        OR (
          d.category = ANY($3) AND 
          $4 && ARRAY['VIEW_DOCUMENTS']
        )
    `;
    
    const categories = this.getCategoriesForPermissions(user.permissions);
    const documentsResult = await db.query(documentsQuery, [
      userId,
      user.role,
      categories,
      user.permissions
    ]);
    
    return {
      documentIds: documentsResult.rows.map(row => row.id),
      userRole: user.role,
      permissions: user.permissions
    };
  }
}
```

### 3. AI Response Generation

#### **Advanced RAG Pipeline**
```typescript
// src/lib/services/aiAssistantService.ts
export class AIAssistantService {
  private searchService: SemanticSearchService;
  private aiClient: OpenAI;
  
  constructor() {
    this.searchService = new SemanticSearchService();
    this.aiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate AI response with RAG
   */
  async generateResponse(
    query: string,
    userId: string,
    conversationHistory: ConversationMessage[] = [],
    language: string = 'en'
  ): Promise<AIResponse> {
    // 1. Search for relevant context
    const searchResults = await this.searchService.search(query, userId, {
      limit: 8,
      language,
      minSimilarity: 0.6
    });

    // 2. Build context from search results
    const context = this.buildContext(searchResults);
    
    // 3. Generate response using AI
    const response = await this.generateContextualResponse(
      query,
      context,
      conversationHistory,
      language
    );

    // 4. Extract citations and confidence
    const citations = this.extractCitations(searchResults, response);
    const confidence = this.calculateConfidence(searchResults, response);

    // 5. Log conversation
    await this.logConversation(userId, query, response, {
      searchResults: searchResults.length,
      confidence,
      language
    });

    return {
      response,
      citations,
      confidence,
      searchResults: searchResults.slice(0, 3), // Top 3 for UI
      language,
      timestamp: new Date()
    };
  }

  /**
   * Build context from search results
   */
  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return 'No specific documents found to answer this question.';
    }

    const documentSections = searchResults
      .filter(result => result.type === 'document')
      .map((result, index) => {
        return `[Document ${index + 1}: ${result.title}]\n${result.content}\n`;
      });

    const knowledgeSections = searchResults
      .filter(result => result.type === 'knowledge')
      .map((result, index) => {
        return `[Knowledge Base ${index + 1}]\nQ: ${result.question}\nA: ${result.answer}\n`;
      });

    return [
      ...documentSections,
      ...knowledgeSections
    ].join('\n---\n');
  }

  /**
   * Generate response with advanced prompting
   */
  private async generateContextualResponse(
    query: string,
    context: string,
    conversationHistory: ConversationMessage[],
    language: string
  ): Promise<string> {
    const languageNames = {
      en: 'English',
      fr: 'French',
      ar: 'Arabic'
    };

    const systemPrompt = `You are a helpful AI assistant for Costa Beach, a premium residential community. You have access to community documents, policies, and knowledge base.

INSTRUCTIONS:
1. Answer questions based on the provided context
2. Be helpful, professional, and concise
3. Always respond in ${languageNames[language]}
4. Include the Costa Beach emoji 🏖️ in your responses
5. If information isn't in the context, clearly state this
6. Reference specific documents when relevant
7. For emergency situations, always direct to emergency services first

CONTEXT DOCUMENTS:
${context}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

RESPONSE GUIDELINES:
- Keep responses under 300 words for readability
- Use bullet points when listing multiple items
- Include document references like [Document 1] when citing
- Be empathetic and understanding of resident concerns
- Always maintain a professional but friendly tone

Current query: ${query}`;

    try {
      const completion = await this.aiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || 
        'I apologize, but I encountered an issue generating a response. Please try again or contact building management for assistance.';
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.getFailureResponse(language);
    }
  }

  /**
   * Calculate response confidence based on search quality
   */
  private calculateConfidence(searchResults: SearchResult[], response: string): number {
    if (searchResults.length === 0) return 0.3;
    
    // Average similarity score
    const avgSimilarity = searchResults.reduce((sum, result) => 
      sum + result.similarity, 0) / searchResults.length;
    
    // Number of high-quality results
    const highQualityResults = searchResults.filter(result => 
      result.similarity > 0.8).length;
    
    // Response length (too short might indicate uncertainty)
    const responseLength = response.length;
    const lengthScore = Math.min(responseLength / 200, 1);
    
    // Combine factors
    let confidence = (avgSimilarity * 0.5) + 
                    (highQualityResults / searchResults.length * 0.3) + 
                    (lengthScore * 0.2);
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Extract document citations from response
   */
  private extractCitations(searchResults: SearchResult[], response: string): Citation[] {
    const citations: Citation[] = [];
    
    // Look for document references in response
    const documentRegex = /\[Document (\d+)\]/g;
    let match;
    
    while ((match = documentRegex.exec(response)) !== null) {
      const docIndex = parseInt(match[1]) - 1;
      const searchResult = searchResults.filter(r => r.type === 'document')[docIndex];
      
      if (searchResult) {
        citations.push({
          type: 'document',
          title: searchResult.title,
          documentId: searchResult.documentId,
          chunkIndex: searchResult.chunkIndex,
          similarity: searchResult.similarity,
          excerpt: searchResult.content.substring(0, 150) + '...'
        });
      }
    }
    
    return citations;
  }

  /**
   * Enhanced conversation logging
   */
  private async logConversation(
    userId: string,
    query: string,
    response: string,
    metadata: any
  ): Promise<void> {
    const sessionId = this.generateSessionId(userId);
    
    await db.query(`
      INSERT INTO ai_conversations (user_id, session_id, message_type, content, metadata)
      VALUES 
        ($1, $2, 'user', $3, $4),
        ($1, $2, 'assistant', $5, $6)
    `, [
      userId,
      sessionId,
      query,
      JSON.stringify({ timestamp: new Date(), ...metadata }),
      response,
      JSON.stringify({ timestamp: new Date(), ...metadata })
    ]);
  }
}
```

### 4. Real-time Chat Interface

#### **WebSocket Implementation**
```typescript
// src/lib/websocket/aiChatHandler.ts
export class AIChatHandler {
  private aiAssistant: AIAssistantService;
  private activeConnections: Map<string, WebSocket> = new Map();

  constructor() {
    this.aiAssistant = new AIAssistantService();
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WebSocket, userId: string): void {
    const connectionId = this.generateConnectionId(userId);
    this.activeConnections.set(connectionId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(connectionId, userId, message);
      } catch (error) {
        this.sendError(connectionId, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.activeConnections.delete(connectionId);
    });

    // Send welcome message
    this.sendMessage(connectionId, {
      type: 'welcome',
      content: '🏖️ Welcome to Costa Beach AI Assistant! How can I help you today?',
      timestamp: new Date()
    });
  }

  /**
   * Handle incoming chat message
   */
  private async handleMessage(
    connectionId: string,
    userId: string,
    message: ChatMessage
  ): Promise<void> {
    const { content, language = 'en', conversationId } = message;

    // Send typing indicator
    this.sendMessage(connectionId, {
      type: 'typing',
      isTyping: true
    });

    try {
      // Get conversation history
      const history = await this.getConversationHistory(userId, conversationId);
      
      // Generate AI response
      const aiResponse = await this.aiAssistant.generateResponse(
        content,
        userId,
        history,
        language
      );

      // Send response
      this.sendMessage(connectionId, {
        type: 'message',
        content: aiResponse.response,
        citations: aiResponse.citations,
        confidence: aiResponse.confidence,
        language: aiResponse.language,
        timestamp: aiResponse.timestamp
      });

    } catch (error) {
      console.error('Chat message handling failed:', error);
      this.sendError(connectionId, 'Failed to generate response');
    } finally {
      // Remove typing indicator
      this.sendMessage(connectionId, {
        type: 'typing',
        isTyping: false
      });
    }
  }

  /**
   * Send message to specific connection
   */
  private sendMessage(connectionId: string, message: any): void {
    const ws = this.activeConnections.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
```

## 🔧 Implementation Phases

### Phase 1: Foundation (Days 1-3)
1. **Database Setup**
   - Create pgvector extension
   - Set up embedding tables
   - Create indexes and constraints

2. **Core Services**
   - Implement EmbeddingService
   - Build basic SearchService
   - Create document indexing pipeline

### Phase 2: AI Integration (Days 4-6)
1. **AI Assistant Service**
   - Implement RAG pipeline
   - Add response generation
   - Create citation system

2. **API Layer**
   - Build tRPC routers
   - Add authentication
   - Implement rate limiting

### Phase 3: UI Components (Days 7-9)
1. **Chat Interface**
   - Create chat components
   - Add real-time WebSocket
   - Implement typing indicators

2. **Admin Interface**
   - Knowledge base management
   - Analytics dashboard
   - Performance monitoring

## 📊 Performance Optimizations

### Caching Strategy
```typescript
// Multi-layer caching
1. Embedding Cache: Redis for frequent embeddings
2. Search Cache: Cache similar queries for 1 hour
3. Response Cache: Cache common Q&A for 24 hours
4. Session Cache: Keep conversation context in memory
```

### Scaling Considerations
```typescript
// Horizontal scaling approach
1. Database: Read replicas for search queries
2. Embeddings: Separate service for generation
3. AI Responses: Queue system for peak loads
4. WebSocket: Connection pooling and load balancing
```

## 🔒 Security & Privacy

### Data Protection
- All embeddings use document IDs, not sensitive content
- Permission filtering at database level
- Conversation logs encrypted at rest
- GDPR-compliant data retention

### Access Control
- Role-based access to documents
- Rate limiting per user
- Audit logging for all AI interactions
- Admin controls for knowledge base

## 📈 Monitoring & Analytics

### Key Metrics
- Response accuracy (user feedback)
- Average response time
- Search result relevance
- User engagement rates
- Cost per interaction

### Alerts
- High error rates
- Slow response times
- Embedding generation failures
- Unusual usage patterns

---

*This architecture provides a robust, scalable foundation for the Costa Beach AI Assistant while maintaining security, performance, and cost efficiency.*