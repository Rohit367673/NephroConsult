import { useState } from "react";
import { Upload, FileText, Image, Download, Share2, Eye, Plus, Filter, Search, Calendar, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface LabReportsProps {
  onNavigate: (view: string) => void;
}

export function LabReports({ onNavigate }: LabReportsProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const reports = [
    {
      id: 1,
      name: "Comprehensive Metabolic Panel",
      type: "Blood Work",
      date: "2025-09-15",
      doctor: "Dr. Sarah Wilson",
      status: "Normal",
      fileType: "PDF",
      size: "2.3 MB",
      category: "Routine",
      notes: "All values within normal range. Continue current medication.",
      results: {
        "Creatinine": { value: "1.0", unit: "mg/dL", range: "0.6-1.2", status: "normal" },
        "BUN": { value: "15", unit: "mg/dL", range: "7-20", status: "normal" },
        "eGFR": { value: "85", unit: "mL/min/1.73m²", range: ">60", status: "normal" },
        "Albumin": { value: "4.2", unit: "g/dL", range: "3.5-5.0", status: "normal" }
      }
    },
    {
      id: 2,
      name: "Kidney Function Test",
      type: "Urine Analysis",
      date: "2025-09-10",
      doctor: "Dr. Asha Verma",
      status: "Attention Required",
      fileType: "PDF",
      size: "1.8 MB",
      category: "Follow-up",
      notes: "Slight elevation in protein levels. Recommend dietary consultation.",
      results: {
        "Protein": { value: "0.8", unit: "g/L", range: "<0.3", status: "high" },
        "Microalbumin": { value: "35", unit: "mg/L", range: "<30", status: "high" },
        "Specific Gravity": { value: "1.020", unit: "", range: "1.005-1.030", status: "normal" }
      }
    },
    {
      id: 3,
      name: "Lipid Panel",
      type: "Blood Work",
      date: "2025-09-05",
      doctor: "Dr. Michael Chen",
      status: "Normal",
      fileType: "PDF",
      size: "1.5 MB",
      category: "Routine",
      notes: "Cholesterol levels improved since last test.",
      results: {
        "Total Cholesterol": { value: "185", unit: "mg/dL", range: "<200", status: "normal" },
        "HDL": { value: "55", unit: "mg/dL", range: ">40", status: "normal" },
        "LDL": { value: "110", unit: "mg/dL", range: "<100", status: "borderline" }
      }
    },
    {
      id: 4,
      name: "Ultrasound - Kidneys",
      type: "Imaging",
      date: "2025-08-28",
      doctor: "Dr. James Thompson",
      status: "Normal",
      fileType: "DICOM",
      size: "15.2 MB",
      category: "Imaging",
      notes: "Both kidneys appear normal in size and structure. No stones detected."
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
    // Handle file upload logic here
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'attention required': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return FileText;
      case 'dicom':
      case 'jpg':
      case 'png': return Image;
      default: return FileText;
    }
  };

  const renderUploadArea = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload New Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2 font-medium">Upload Lab Reports</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="space-y-2">
            <Button>
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground">
              Supports: PDF, JPG, PNG, DICOM (Max 25MB)
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="reportTitle">Report Title</Label>
            <Input id="reportTitle" placeholder="e.g., Blood Work Results" className="mt-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood-work">Blood Work</SelectItem>
                  <SelectItem value="urine-analysis">Urine Analysis</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="biopsy">Biopsy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="testDate">Test Date</Label>
              <Input id="testDate" type="date" className="mt-2" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any additional information about this report..."
              className="mt-2"
              rows={3}
            />
          </div>

          <Button className="w-full">
            Upload Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderReportCard = (report: any) => {
    const FileIcon = getFileIcon(report.fileType);
    
    return (
      <Card key={report.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground">{report.type}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {report.doctor}
                  </span>
                  <span>{report.size}</span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(report.status)}>
              {report.status}
            </Badge>
          </div>

          {report.notes && (
            <p className="text-sm text-muted-foreground mb-4 p-3 bg-accent rounded">
              {report.notes}
            </p>
          )}

          {report.results && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-sm">Key Results:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.results).slice(0, 4).map(([key, result]: [string, any]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium">{key}:</span>
                    <span className={`ml-1 ${
                      result.status === 'high' ? 'text-red-600' :
                      result.status === 'low' ? 'text-blue-600' :
                      result.status === 'borderline' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {result.value} {result.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{report.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Doctor</p>
                      <p className="text-sm text-muted-foreground">{report.doctor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">{report.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </div>
                  </div>

                  {report.results && (
                    <div>
                      <h3 className="font-medium mb-4">Detailed Results</h3>
                      <div className="space-y-3">
                        {Object.entries(report.results).map(([key, result]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{key}</p>
                              <p className="text-sm text-muted-foreground">Reference: {result.range}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                result.status === 'high' ? 'text-red-600' :
                                result.status === 'low' ? 'text-blue-600' :
                                result.status === 'borderline' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {result.value} {result.unit}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  result.status === 'high' ? 'border-red-300 text-red-600' :
                                  result.status === 'low' ? 'border-blue-300 text-blue-600' :
                                  result.status === 'borderline' ? 'border-yellow-300 text-yellow-600' :
                                  'border-green-300 text-green-600'
                                }`}
                              >
                                {result.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.notes && (
                    <div>
                      <h3 className="font-medium mb-2">Doctor's Notes</h3>
                      <p className="text-sm text-muted-foreground p-3 bg-accent rounded">
                        {report.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with Doctor
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Share with Doctor</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-verma">Dr. Asha Verma</SelectItem>
                        <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                        <SelectItem value="dr-williams">Dr. Sarah Williams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Add Message (Optional)</Label>
                    <Textarea 
                      placeholder="Any additional context for the doctor..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">Share Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Lab Reports</h1>
          <p className="text-muted-foreground">
            Upload, view, and share your medical reports with healthcare providers
          </p>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search reports..."
                      className="pl-10"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="blood-work">Blood Work</SelectItem>
                      <SelectItem value="urine-analysis">Urine Analysis</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="biopsy">Biopsy</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="attention">Attention Required</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {reports.map(renderReportCard)}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline">
                Load More Reports
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            {renderUploadArea()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}