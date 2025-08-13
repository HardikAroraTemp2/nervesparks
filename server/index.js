import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import { DocumentProcessor } from './processors/documentProcessor.js';
import { VectorStore } from './vector/vectorStore.js';
import { RAGPipeline } from './rag/ragPipeline.js';
import { EvaluationMetrics } from './evaluation/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/rag-system');
    await client.connect();
    db = client.db('rag-system');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Initialize components
const documentProcessor = new DocumentProcessor();
const vectorStore = new VectorStore();
const ragPipeline = new RAGPipeline();
const evaluationMetrics = new EvaluationMetrics();

// Routes
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process document
    const processingResult = await documentProcessor.processDocument(file);
    
    // Store in MongoDB
    const document = {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      processingResult,
      status: 'processed'
    };
    
    const result = await db.collection('documents').insertOne(document);
    
    // Generate embeddings and store in vector database
    await vectorStore.storeDocument(result.insertedId, processingResult);
    
    res.json({ 
      success: true, 
      documentId: result.insertedId,
      processingResult 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Document processing failed' });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { query, documentIds, filters } = req.body;
    
    // Perform RAG query
    const startTime = Date.now();
    const response = await ragPipeline.query(query, documentIds, filters);
    const latency = Date.now() - startTime;
    
    // Calculate evaluation metrics
    const metrics = evaluationMetrics.calculateMetrics(response, latency);
    
    res.json({
      response: response.answer,
      sources: response.sources,
      relevanceScore: response.relevanceScore,
      metrics,
      latency
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Query processing failed' });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const documents = await db.collection('documents')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();
    res.json(documents);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.get('/api/document/:id', async (req, res) => {
  try {
    const document = await db.collection('documents')
      .findOne({ _id: req.params.id });
    res.json(document);
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});