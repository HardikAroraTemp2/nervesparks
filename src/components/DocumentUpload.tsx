import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface DocumentUploadProps {
  onDocumentUploaded: (document: any) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadStatus('success');
      setUploadedDocument(response.data);
      onDocumentUploaded(response.data);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.error || 'Upload failed');
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setUploadedDocument(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Document Upload & Processing
        </h2>
        <p className="text-gray-600">
          Upload PDFs, images, or scanned documents for intelligent processing and analysis
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />

        {uploadStatus === 'idle' && (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop the file here' : 'Upload Document'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag & drop a file here, or click to select one
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText size={16} />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-1">
                <Image size={16} />
                <span>Images</span>
              </div>
              <span>Max 50MB</span>
            </div>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <>
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
            <p className="text-gray-600 mb-4">
              Extracting text, tables, and visual elements...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
          </>
        )}

        {uploadStatus === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful</h3>
            <p className="text-gray-600 mb-4">
              Document processed and ready for querying
            </p>
            {uploadedDocument && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Filename:</span>
                    <span className="text-sm font-medium">{uploadedDocument.processingResult?.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">{uploadedDocument.processingResult?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Chunks:</span>
                    <span className="text-sm font-medium">{uploadedDocument.processingResult?.chunks?.length || 0}</span>
                  </div>
                  {uploadedDocument.processingResult?.metadata && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Has Tables:</span>
                        <span className="text-sm font-medium">
                          {uploadedDocument.processingResult.metadata.hasTables ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Has Images:</span>
                        <span className="text-sm font-medium">
                          {uploadedDocument.processingResult.metadata.hasImages ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Another Document
            </button>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Failed</h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Supported Processing Features:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• OCR for scanned documents and images</li>
          <li>• Table structure recognition and data extraction</li>
          <li>• Chart and graph interpretation</li>
          <li>• Mixed text-image content understanding</li>
          <li>• Intelligent chunking strategies</li>
        </ul>
      </div>
    </div>
  );
};