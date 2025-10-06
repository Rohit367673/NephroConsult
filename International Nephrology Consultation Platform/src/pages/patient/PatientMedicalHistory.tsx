import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { 
  Calendar, 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  Upload,
  Activity,
  Pill,
  TestTube,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';

export function PatientMedicalHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const consultations = [
    {
      id: '1',
      date: '2024-09-10',
      doctor: 'Dr. Ilango Krishnamurthy',
      type: 'Video Consultation',
      diagnosis: 'Hypertension Management',
      status: 'completed',
      notes: 'Blood pressure improving with current medication. Continue monitoring.',
      prescriptions: ['Lisinopril 10mg', 'Amlodipine 5mg'],
      nextFollowUp: '2024-10-10'
    },
    {
      id: '2',
      date: '2024-08-28',
      doctor: 'Dr. Ilango Krishnamurthy',
      type: 'Follow-up Consultation',
      diagnosis: 'Kidney Function Assessment',
      status: 'completed',
      notes: 'Creatinine levels stable. Continue current treatment plan.',
      prescriptions: ['Losartan 50mg'],
      nextFollowUp: '2024-11-28'
    },
    {
      id: '3',
      date: '2024-08-15',
      doctor: 'Dr. Ilango Krishnamurthy',
      type: 'Initial Consultation',
      diagnosis: 'Chronic Kidney Disease Stage 2',
      status: 'completed',
      notes: 'Initial assessment shows mild kidney function decline. Diet and medication plan initiated.',
      prescriptions: ['Losartan 25mg', 'Furosemide 20mg'],
      nextFollowUp: '2024-09-15'
    }
  ];

  const labReports = [
    {
      id: '1',
      date: '2024-09-08',
      type: 'Comprehensive Metabolic Panel',
      status: 'reviewed',
      results: {
        creatinine: '1.2 mg/dL',
        bun: '18 mg/dL',
        gfr: '65 mL/min/1.73m²',
        sodium: '140 mEq/L',
        potassium: '4.2 mEq/L'
      },
      doctorNotes: 'Kidney function stable. Continue monitoring.'
    },
    {
      id: '2',
      date: '2024-08-25',
      type: 'Lipid Panel',
      status: 'reviewed',
      results: {
        totalCholesterol: '195 mg/dL',
        ldl: '115 mg/dL',
        hdl: '45 mg/dL',
        triglycerides: '175 mg/dL'
      },
      doctorNotes: 'Lipid levels within acceptable range. Continue current diet plan.'
    },
    {
      id: '3',
      date: '2024-08-10',
      type: 'Urinalysis',
      status: 'reviewed',
      results: {
        protein: 'Trace',
        glucose: 'Negative',
        blood: 'Negative',
        ketones: 'Negative'
      },
      doctorNotes: 'Minimal proteinuria, continue monitoring.'
    }
  ];

  const prescriptions = [
    {
      id: '1',
      date: '2024-09-10',
      doctor: 'Dr. Ilango Krishnamurthy',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }
      ],
      status: 'active',
      pharmacy: 'CVS Pharmacy',
      refillsRemaining: 2
    },
    {
      id: '2',
      date: '2024-08-28',
      doctor: 'Dr. Ilango Krishnamurthy',
      medications: [
        { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: '30 days' }
      ],
      status: 'completed',
      pharmacy: 'Walgreens',
      refillsRemaining: 0
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'active': { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      'reviewed': { color: 'bg-purple-100 text-purple-800', label: 'Reviewed' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical History</h1>
          <p className="text-muted-foreground">
            Your complete medical records and consultation history
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consultations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consultations" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Consultations</span>
          </TabsTrigger>
          <TabsTrigger value="lab-reports" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Lab Reports</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span>Prescriptions</span>
          </TabsTrigger>
        </TabsList>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          <div className="grid gap-6">
            {consultations.map((consultation) => (
              <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{consultation.type}</CardTitle>
                        {getStatusBadge(consultation.status)}
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{consultation.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{consultation.doctor}</span>
                        </span>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Diagnosis</h4>
                    <p className="text-muted-foreground">{consultation.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Doctor's Notes</h4>
                    <p className="text-muted-foreground">{consultation.notes}</p>
                  </div>

                  {consultation.prescriptions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Prescriptions</h4>
                      <div className="flex flex-wrap gap-2">
                        {consultation.prescriptions.map((med, index) => (
                          <Badge key={index} variant="secondary">{med}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {consultation.nextFollowUp && (
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">Next Follow-up</span>
                      <span className="text-sm font-medium text-foreground">{consultation.nextFollowUp}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Lab Reports Tab */}
        <TabsContent value="lab-reports" className="space-y-6">
          <div className="grid gap-6">
            {labReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{report.type}</CardTitle>
                        {getStatusBadge(report.status)}
                      </div>
                      <CardDescription className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{report.date}</span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Test Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(report.results).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </p>
                          <p className="text-lg font-semibold text-primary">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {report.doctorNotes && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium text-foreground mb-2">Doctor's Assessment</h4>
                      <p className="text-muted-foreground">{report.doctorNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid gap-6">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">Prescription #{prescription.id}</CardTitle>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{prescription.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{prescription.doctor}</span>
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Medications</h4>
                    <div className="space-y-3">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Pharmacy</p>
                      <p className="font-medium text-foreground">{prescription.pharmacy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Refills Remaining</p>
                      <p className="font-medium text-foreground">{prescription.refillsRemaining}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}