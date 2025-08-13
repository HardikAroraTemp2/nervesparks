import React, { useEffect, useState } from 'react';
import { FileText, Image, Calendar, CheckSquare, Square, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Document {
  _id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
  processingResult: any;
  status: string;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (selected: string[]) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents: propDocuments,
  selectedDocuments,
  onSelectionChange
}) => {
  const [documents, setDocuments] = useState<Document[]>(propDocuments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setDocuments(propDocuments);
  }, [propDocuments]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocument = (documentId: string) => {
    const isSelected = selectedDocuments.includes(documentId);
    if (isSelected) {
      onSelectionChange(selectedDocuments.filter(id => id !== documentId));
    } else {
      onSelectionChange([...selectedDocuments, documentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc._id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimetype.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Document Library
        </h2>
        {documents.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {selectedDocuments.length === documents.length ? (
              <CheckSquare size={16} />
            ) : (
              <Square size={16} />
            )}
            <span>Select All</span>
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-600">Upload your first document to get started with RAG queries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedDocuments.includes(doc._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleSelectDocument(doc._id)}
            >
              <button className="flex-shrink-0">
                {selectedDocuments.includes(doc._id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <div className="flex-shrink-0">
                {getFileIcon(doc.mimetype)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {doc.filename}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.status === 'processed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {doc.processingResult?.chunks && (
                    <span>{doc.processingResult.chunks.length} chunks</span>
                  )}
                </div>

                {doc.processingResult?.metadata && (
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    {doc.processingResult.metadata.hasTables && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Tables
                      </span>
                    )}
                    {doc.processingResult.metadata.hasImages && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Images
                      </span>
                    )}
                    {doc.processingResult.metadata.wordCount && (
                      <span className="text-gray-500">
                        {doc.processingResult.metadata.wordCount} words
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // View document details
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete document
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDocuments.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected</span>
            {' '}for querying. Switch to the Query tab to start asking questions.
          </p>
        </div>
      )}
    </div>
  );
};