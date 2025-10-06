import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  History, 
  Calendar, 
  FileText, 
  Download, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Video,
  Pill,
  Activity,
  User,
  Clock
} from 'lucide-react';

const MedicalHistory = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([1]);

  const historyData = [
    {
      id: 1,
      date: '2024-09-15',
      type: 'consultation',
      title: 'Video Consultation - Kidney Function Review',
      doctor: 'Dr. Sarah Chen',
      duration: '45 minutes',
      status: 'completed',
      summary: 'Reviewed recent lab results. Kidney function showing improvement. Adjusted medication dosage.',
      prescriptions: ['Lisinopril 10mg', 'Furosemide 40mg'],
      labResults: ['Creatinine: 1.2 mg/dL', 'eGFR: 65 mL/min/1.73m²'],
      notes: 'Patient reported feeling better with reduced swelling. Continue current treatment plan.',
      attachments: ['Lab_Results_Sept_2024.pdf', 'Prescription_Sept_15.pdf']
    },
    {
      id: 2,
      date: '2024-08-20',
      type: 'lab_report',
      title: 'Comprehensive Metabolic Panel',
      doctor: 'Dr. Sarah Chen',
      duration: '-',
      status: 'reviewed',
      summary: 'Complete blood chemistry panel including kidney function markers.',
      prescriptions: [],
      labResults: [
        'Creatinine: 1.4 mg/dL (↑)', 
        'BUN: 28 mg/dL', 
        'eGFR: 58 mL/min/1.73m²',
        'Potassium: 4.2 mEq/L',
        'Sodium: 140 mEq/L'
      ],
      notes: 'Slight increase in creatinine levels. Recommend follow-up consultation.',
      attachments: ['Lab_Results_Aug_2024.pdf']
    },
    {
      id: 3,
      date: '2024-08-01',
      type: 'prescription',
      title: 'Medication Adjustment',
      doctor: 'Dr. Sarah Chen',
      duration: '-',
      status: 'active',
      summary: 'Updated prescription with dosage modifications based on patient response.',
      prescriptions: ['Lisinopril 5mg (discontinued)', 'Lisinopril 10mg (new)', 'Furosemide 40mg (continued)'],
      labResults: [],
      notes: 'Increased Lisinopril dosage due to blood pressure readings. Monitor for side effects.',
      attachments: ['Prescription_Aug_01.pdf']
    },
    {
      id: 4,
      date: '2024-07-15',
      type: 'consultation',
      title: 'Initial Consultation - Chronic Kidney Disease',
      doctor: 'Dr. Sarah Chen',
      duration: '60 minutes',
      status: 'completed',
      summary: 'Comprehensive evaluation for chronic kidney disease management and treatment planning.',
      prescriptions: ['Lisinopril 5mg', 'Dietary supplements'],
      labResults: ['Baseline creatinine: 1.3 mg/dL', 'eGFR: 62 mL/min/1.73m²'],
      notes: 'Established treatment plan. Patient education provided on dietary modifications and medication adherence.',
      attachments: ['Initial_Assessment.pdf', 'Diet_Plan.pdf']
    }
  ];

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'lab_report':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Badge className="bg-blue-100 text-blue-800">Consultation</Badge>;
      case 'lab_report':
        return <Badge className="bg-green-100 text-green-800">Lab Report</Badge>;
      case 'prescription':
        return <Badge className="bg-purple-100 text-purple-800">Prescription</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'active':
        return <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredHistory = historyData.filter(item => {
    const matchesDateRange = selectedDateRange === 'all' || 
      (selectedDateRange === '30days' && new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (selectedDateRange === '90days' && new Date(item.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDateRange && matchesType && matchesSearch;
  });

  return (
    <section id="history" className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Medical History Dashboard</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete timeline of your consultations, prescriptions, and lab reports. 
            Track your health journey and access all medical records in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Records</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Record Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="consultation">Consultations</SelectItem>
                      <SelectItem value="lab_report">Lab Reports</SelectItem>
                      <SelectItem value="prescription">Prescriptions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export History
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Records</span>
                  <Badge variant="secondary">{historyData.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Consultations</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {historyData.filter(item => item.type === 'consultation').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lab Reports</span>
                  <Badge className="bg-green-100 text-green-800">
                    {historyData.filter(item => item.type === 'lab_report').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prescriptions</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {historyData.filter(item => item.type === 'prescription').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredHistory.map((item) => (
                <Collapsible 
                  key={item.id}
                  open={expandedItems.includes(item.id)}
                  onOpenChange={() => toggleExpanded(item.id)}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {item.date}
                                </span>
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {item.doctor}
                                </span>
                                {item.duration !== '-' && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {item.duration}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-3">
                                {getTypeBadge(item.type)}
                                {getStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {expandedItems.includes(item.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-6">
                          {/* Summary */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                            <p className="text-gray-600 text-sm">{item.summary}</p>
                          </div>

                          {/* Prescriptions */}
                          {item.prescriptions.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Pill className="w-4 h-4 mr-2" />
                                Prescriptions
                              </h4>
                              <div className="space-y-2">
                                {item.prescriptions.map((prescription, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">{prescription}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lab Results */}
                          {item.labResults.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Lab Results
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {item.labResults.map((result, index) => (
                                  <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                                    {result}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                              <p className="text-gray-600 text-sm bg-muted/50 p-3 rounded-lg">
                                {item.notes}
                              </p>
                            </div>
                          )}

                          {/* Attachments */}
                          {item.attachments.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.attachments.map((attachment, index) => (
                                  <Button key={index} variant="outline" size="sm">
                                    <FileText className="w-3 h-3 mr-2" />
                                    {attachment}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}

              {filteredHistory.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
                    <p className="text-gray-600">
                      No medical records match your current filters. Try adjusting your search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { MedicalHistory };