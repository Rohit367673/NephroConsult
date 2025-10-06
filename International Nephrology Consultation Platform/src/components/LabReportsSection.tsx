import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, FileText, Download, Share2, Eye, Trash2, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
// Removed react-dropzone dependency

export const LabReportsSection: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'Kidney Function Panel - March 2024.pdf',
      type: 'Blood Test',
      date: '2024-03-15',
      size: '2.3 MB',
      status: 'reviewed',
      thumbnail: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Urinalysis Report - February 2024.pdf',
      type: 'Urine Test',
      date: '2024-02-28',
      size: '1.8 MB',
      status: 'pending',
      thumbnail: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: 'CT Scan - Kidney Stones - January 2024.dcm',
      type: 'Imaging',
      date: '2024-01-20',
      size: '15.7 MB',
      status: 'reviewed',
      thumbnail: '/api/placeholder/100/100'
    }
  ]);

  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add new files to the list
          const newFiles = Array.from(files).map((file, index) => ({
            id: uploadedFiles.length + index + 1,
            name: file.name,
            type: 'Lab Report',
            date: new Date().toISOString().split('T')[0],
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            status: 'uploading',
            thumbnail: '/api/placeholder/100/100'
          }));
          
          setUploadedFiles(prev => [...newFiles, ...prev]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const labPartners = [
    { name: 'LabCorp', logo: '/api/placeholder/80/40', link: 'https://labcorp.com' },
    { name: 'Quest Diagnostics', logo: '/api/placeholder/80/40', link: 'https://questdiagnostics.com' },
    { name: 'Mayo Clinic Labs', logo: '/api/placeholder/80/40', link: 'https://mayocliniclabs.com' },
    { name: 'Cleveland Clinic', logo: '/api/placeholder/80/40', link: 'https://clevelandclinic.org' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'uploading': return <Upload className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-20">
      <div className="container-medical">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Lab Reports & Medical Records</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Securely upload, store, and share your medical reports with your nephrologist. 
            Get quick access to lab results and imaging studies.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload New Reports</h3>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragActive 
                      ? 'border-[#006f6f] bg-[#006f6f]/5' 
                      : 'border-gray-300 hover:border-[#006f6f] hover:bg-gray-50'
                  }`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.dcm"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#006f6f]/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-[#006f6f]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {isDragActive ? 'Drop files here' : 'Upload Lab Reports'}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Drag & drop files here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: PDF, JPG, PNG, DICOM • Max size: 50MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f]/5"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Uploading...</span>
                      <span className="text-sm text-blue-700">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* File Type Hints */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-[#006f6f] mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Lab Reports</div>
                    <div className="text-xs text-gray-600">Blood, urine tests</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Eye className="w-8 h-8 text-[#006f6f] mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Imaging</div>
                    <div className="text-xs text-gray-600">CT, MRI, X-ray</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Plus className="w-8 h-8 text-[#006f6f] mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Other Records</div>
                    <div className="text-xs text-gray-600">Prescriptions, notes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Your Reports</h3>
                  <Badge variant="secondary">{uploadedFiles.length} files</Badge>
                </div>

                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-[#006f6f]" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">{file.type}</span>
                          <span className="text-sm text-gray-500">{file.date}</span>
                          <span className="text-sm text-gray-500">{file.size}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(file.status)}>
                          {getStatusIcon(file.status)}
                          <span className="ml-1 capitalize">{file.status}</span>
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Lab Partners */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Partner Lab Networks</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Get your tests done at our partner labs for seamless integration
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {labPartners.map((partner, index) => (
                    <a
                      key={index}
                      href={partner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center"
                    >
                      <div className="w-full h-8 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{partner.name}</span>
                      </div>
                    </a>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f]/5"
                >
                  Find Lab Near You
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Reports
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Doctor
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Lab Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Guidelines */}
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Upload Guidelines</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ensure images are clear and legible</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Remove any personal identifiers if sharing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Upload recent reports first</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use descriptive filenames</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};