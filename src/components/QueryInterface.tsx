import React, { useState } from 'react';
import { Send, Brain, Clock, Target, FileText, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface QueryResponse {
  response: {
    text: string;
    confidence: number;
    intent: string;
  };
  sources: Array<{
    content: string;
    similarity: number;
    documentId: string;
    type: string;
    metadata: any;
  }>;
  relevanceScore: number;
  metrics: any;
  latency: number;
}

interface QueryInterfaceProps {
  selectedDocuments: string[];
  onQueryResponse?: (response: QueryResponse, metrics: any) => void;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  selectedDocuments,
  onQueryResponse
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{
    query: string;
    response: QueryResponse;
    timestamp: Date;
  }>>([]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    if (selectedDocuments.length === 0) {
      alert('Please select at least one document to query');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/query', {
        query: query.trim(),
        documentIds: selectedDocuments,
        filters: {}
      });

      const queryResponse: QueryResponse = response.data;
      setResponse(queryResponse);
      
      // Add to history
      setQueryHistory(prev => [{
        query: query.trim(),
        response: queryResponse,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 queries

      // Callback to parent
      onQueryResponse?.(queryResponse, queryResponse.metrics);
      
      setQuery('');
    } catch (error: any) {
      console.error('Query failed:', error);
      alert(error.response?.data?.error || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    "What are the key findings in the documents?",
    "Can you extract data from any tables?",
    "What charts or graphs are shown?",
    "Summarize the main points",
    "What statistical data is available?"
  ];

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Query Documents
          </h2>
          <p className="text-gray-600">
            Ask questions about your uploaded documents using natural language
          </p>
        </div>

        <form onSubmit={handleQuery} className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Brain className="w-4 h-4 animate-pulse" />
                <span>Processing query...</span>
              </div>
            )}
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Response */}
      {response && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{response.latency}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target size={14} />
                <span>{Math.round(response.relevanceScore * 100)}% relevance</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 size={14} />
                <span>{Math.round(response.response.confidence * 100)}% confidence</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-800 leading-relaxed">
                {response.response.text}
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Query Intent:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {response.response.intent}
              </span>
            </div>
          </div>

          {/* Sources */}
          {response.sources.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Sources</h4>
              <div className="space-y-3">
                {response.sources.map((source, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Source {index + 1}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {source.type}
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">
                        {Math.round(source.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {response.metrics && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(response.metrics.faithfulness * 100)}%
                </div>
                <div className="text-xs text-gray-600">Faithfulness</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {Math.round(response.metrics.answerRelevancy * 100)}%
                </div>
                <div className="text-xs text-gray-600">Answer Relevancy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(response.metrics.contextRecall * 100)}%
                </div>
                <div className="text-xs text-gray-600">Context Recall</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {Math.round(response.metrics.contextPrecision * 100)}%
                </div>
                <div className="text-xs text-gray-600">Context Precision</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
          <div className="space-y-3">
            {queryHistory.slice(0, 5).map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{item.query}</p>
                  <span className="text-xs text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>{Math.round(item.response.relevanceScore * 100)}% relevance</span>
                  <span>{item.response.sources.length} sources</span>
                  <span>{item.response.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};