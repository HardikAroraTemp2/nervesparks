import React from 'react';
import { TrendingUp, Clock, Target, CheckCircle, BarChart3, Zap } from 'lucide-react';

interface MetricsPanelProps {
  metrics: any;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  // Mock performance data for demonstration
  const performanceData = {
    overview: {
      totalQueries: 47,
      avgLatency: 1250,
      avgRelevanceScore: 0.78,
      successRate: 0.91
    },
    detailedMetrics: {
      avgFaithfulness: 0.82,
      avgAnswerRelevancy: 0.76,
      avgContextRecall: 0.74,
      avgContextPrecision: 0.68
    },
    latencyDistribution: {
      fast: 28,  // < 1s
      medium: 15, // 1-3s
      slow: 4    // > 3s
    }
  };

  const currentMetrics = metrics || {
    faithfulness: 0.85,
    answerRelevancy: 0.78,
    contextRecall: 0.72,
    contextPrecision: 0.69,
    latency: 1100,
    sourcesCount: 3
  };

  return (
    <div className="space-y-6">
      {/* Current Query Metrics */}
      {metrics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Latest Query Performance
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">
                  {Math.round(currentMetrics.faithfulness * 100)}%
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Faithfulness</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Target className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-700">
                  {Math.round(currentMetrics.answerRelevancy * 100)}%
                </span>
              </div>
              <p className="text-sm text-purple-600 mt-1">Relevancy</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {Math.round(currentMetrics.contextRecall * 100)}%
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">Context Recall</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                <span className="text-2xl font-bold text-orange-700">
                  {Math.round(currentMetrics.contextPrecision * 100)}%
                </span>
              </div>
              <p className="text-sm text-orange-600 mt-1">Context Precision</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Response Time</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {currentMetrics.latency}ms
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sources Retrieved</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {currentMetrics.sourcesCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overall Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          System Performance Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {performanceData.overview.totalQueries}
            </div>
            <p className="text-sm text-gray-600">Total Queries</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {performanceData.overview.avgLatency}ms
            </div>
            <p className="text-sm text-gray-600">Avg Latency</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Math.round(performanceData.overview.avgRelevanceScore * 100)}%
            </div>
            <p className="text-sm text-gray-600">Avg Relevance</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {Math.round(performanceData.overview.successRate * 100)}%
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>

        {/* Detailed RAGAS Metrics */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RAGAS Evaluation Metrics</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Faithfulness</span>
                <span>{Math.round(performanceData.detailedMetrics.avgFaithfulness * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.detailedMetrics.avgFaithfulness * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Answer Relevancy</span>
                <span>{Math.round(performanceData.detailedMetrics.avgAnswerRelevancy * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.detailedMetrics.avgAnswerRelevancy * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Context Recall</span>
                <span>{Math.round(performanceData.detailedMetrics.avgContextRecall * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.detailedMetrics.avgContextRecall * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Context Precision</span>
                <span>{Math.round(performanceData.detailedMetrics.avgContextPrecision * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.detailedMetrics.avgContextPrecision * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latency Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Distribution</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Fast (&lt; 1s)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(performanceData.latencyDistribution.fast / performanceData.overview.totalQueries) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {performanceData.latencyDistribution.fast}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Medium (1-3s)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(performanceData.latencyDistribution.medium / performanceData.overview.totalQueries) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {performanceData.latencyDistribution.medium}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Slow (&gt; 3s)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(performanceData.latencyDistribution.slow / performanceData.overview.totalQueries) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {performanceData.latencyDistribution.slow}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">High Success Rate</p>
              <p className="text-green-700">91% of queries return relevant results</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Optimal Response Time</p>
              <p className="text-blue-700">Average latency of 1.25s meets performance targets</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Context Precision Opportunity</p>
              <p className="text-orange-700">68% precision suggests room for chunking optimization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};