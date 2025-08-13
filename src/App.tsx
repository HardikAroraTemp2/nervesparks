import React from 'react';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { QueryInterface } from './components/QueryInterface';
import { MetricsPanel } from './components/MetricsPanel';
import { Header } from './components/Header';
import { FileText, Brain, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = React.useState('upload');
  const [documents, setDocuments] = React.useState([]);
  const [selectedDocuments, setSelectedDocuments] = React.useState([]);
  const [metrics, setMetrics] = React.useState(null);

  const tabs = [
    { id: 'upload', label: 'Upload & Process', icon: FileText },
    { id: 'query', label: 'Query Documents', icon: Brain },
    { id: 'metrics', label: 'Performance', icon: BarChart3 }
  ];

  const handleDocumentUploaded = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleQueryResponse = (response, queryMetrics) => {
    setMetrics(queryMetrics);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'upload' && (
              <div className="space-y-8">
                <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
                <DocumentList 
                  documents={documents}
                  selectedDocuments={selectedDocuments}
                  onSelectionChange={setSelectedDocuments}
                />
              </div>
            )}

            {activeTab === 'query' && (
              <QueryInterface 
                selectedDocuments={selectedDocuments}
                onQueryResponse={handleQueryResponse}
              />
            )}

            {activeTab === 'metrics' && (
              <MetricsPanel metrics={metrics} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="font-semibold text-blue-600">{documents.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selected</span>
                  <span className="font-semibold text-purple-600">{selectedDocuments.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
              </div>

              {selectedDocuments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Documents</h4>
                  <div className="space-y-2">
                    {selectedDocuments.slice(0, 3).map(docId => {
                      const doc = documents.find(d => d._id === docId);
                      return doc ? (
                        <div key={docId} className="text-xs text-gray-600 truncate">
                          {doc.filename}
                        </div>
                      ) : null;
                    })}
                    {selectedDocuments.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{selectedDocuments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;