'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DriveFile } from '@/lib/googleDrive';

interface FileWithSelected extends DriveFile {
  selected: boolean;
}

export default function Home() {
  const [files, setFiles] = useState<FileWithSelected[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch files from API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        setFiles(data.files.map((file: DriveFile) => ({ ...file, selected: false })));
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to load images. Please check your Google Drive configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, selected: !file.selected } : file
    ));
  };

  // Select all files
  const selectAll = () => {
    const allSelected = files.every(file => file.selected);
    setFiles(files.map(file => ({ ...file, selected: !allSelected })));
  };

  // Download selected files as ZIP
  const downloadSelected = async () => {
    const selectedFiles = files.filter(file => file.selected);
    if (selectedFiles.length === 0) {
      alert('Please select at least one image to download.');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds: selectedFiles.map(file => file.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download files');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Download single file
  const downloadSingle = (fileId: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = `/api/download/${fileId}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedCount = files.filter(file => file.selected).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Required</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please configure your Google Drive service account credentials in the environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Private Photo Album</h1>
              <p className="text-gray-600 mt-1">
                {files.length} image{files.length !== 1 ? 's' : ''} available
                {selectedCount > 0 && ` • ${selectedCount} selected`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {files.length > 0 && (
                <button
                  onClick={selectAll}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
                >
                  {files.every(file => file.selected) ? 'Deselect All' : 'Select All'}
                </button>
              )}
              {selectedCount > 0 && (
                <button
                  onClick={downloadSelected}
                  disabled={downloading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Selected ({selectedCount})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <main className="container mx-auto px-4 py-8">
        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-500">
              No images were found in the configured Google Drive folder.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={file.selected}
                    onChange={() => toggleFileSelection(file.id)}
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>

                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  {file.thumbnailLink ? (
                    <Image
                      src={file.thumbnailLink}
                      alt={file.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  {file.size && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                  <button
                    onClick={() => downloadSingle(file.id, file.name)}
                    className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-300 hover:border-blue-400 rounded transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
