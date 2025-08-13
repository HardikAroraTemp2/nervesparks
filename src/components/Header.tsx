import React from 'react';
import { Brain, FileText, Database } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced RAG System
              </h1>
              <p className="text-sm text-gray-600">
                Multi-format Document Processing & Intelligent Retrieval
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText size={16} />
              <span>PDF, Images, Scanned Docs</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database size={16} />
              <span>Vector Search</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};