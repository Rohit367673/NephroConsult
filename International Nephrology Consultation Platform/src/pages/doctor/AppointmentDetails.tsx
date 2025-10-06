import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft,
  Calendar, 
  Video, 
  Clock, 
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Pill,
  TestTube,
  Heart,
  Edit,
  Save,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Mock appointment data - in real app, fetch based on ID
  const appointment = {
    id: id || '1',
    date: '2024-09-18',
    time: '10:00 AM',
    duration: 30,
    type: 'Video Consultation',
    status: 'confirmed',
    condition: 'Hypertension Follow-up',
    patient: {
      id: 'p1',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      dateOfBirth: '1979-03-15',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      address: '123 Main Street, City, State 12345',
      emergencyContact: '+1 (555) 987-6543',
      medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'High Cholesterol'],
      allergies: ['Penicillin', 'Iodine'],
      currentMedications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
      ]
    },
    consultationNotes: 'Patient reports improved blood pressure control with current medication. No side effects noted. Blood pressure readings at home averaging 130/80. Will continue current regimen and follow up in 3 months.',
    diagnosis: 'Essential Hypertension - Well controlled',
    prescriptions: [
      {
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '90 days',
        refills: 2,
        instructions: 'Take with food in the morning'
      }
    ],
    labResults: [
      {
        date: '2024-09-15',
        type: 'Basic Metabolic Panel',
        results: {
          'Sodium': '140 mEq/L (Normal)',
          'Potassium': '4.2 mEq/L (Normal)',
          'Creatinine': '1.0 mg/dL (Normal)',
          'BUN': '15 mg/dL (Normal)',
          'eGFR': '>60 (Normal)'
        }
      }
    ],
    vitalSigns: {
      bloodPressure: '132/78 mmHg',
      heartRate: '72 bpm',
      weight: '180 lbs',
      height: '5\'10"',
      bmi: '25.8'
    },
    nextAppointment: '2024-12-18',
    isFirstTime: false
  };

  const handleSaveNotes = () => {
    // In real app, save to backend
    toast.success('Notes saved successfully');
    setIsEditingNotes(false);
  };

  const handleStartConsultation = () => {
    navigate(`/video-consultation/${appointment.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Appointment Details</h1>
          <p className="text-muted-foreground">
            {appointment.type} with {appointment.patient.name}
          </p>
        </div>
        <div className="flex space-x-3">
          {appointment.status === 'confirmed' && (
            <Button onClick={handleStartConsultation}>
              <Video className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
          )}
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Patient
          </Button>
        </div>
      </div>

      {/* Appointment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-3">
                <span>Appointment #{appointment.id}</span>
                {getStatusBadge(appointment.status)}
                {appointment.isFirstTime && (
                  <Badge variant="outline">First Time Patient</Badge>
                )}
              </CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{appointment.duration} minutes</span>
                  </span>
                </div>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Chief Complaint</h4>
              <p className="text-muted-foreground">{appointment.condition}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Appointment Type</h4>
              <p className="text-muted-foreground">{appointment.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Profile */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{appointment.patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.patient.age} years old • {appointment.patient.gender}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DOB: {appointment.patient.dateOfBirth}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.patient.email}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{appointment.patient.address}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Emergency Contact</h4>
                <p className="text-sm text-muted-foreground">{appointment.patient.emergencyContact}</p>
              </div>

              {/* Medical Overview */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Medical Overview</h4>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Medical History</p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.patient.medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="consultation" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="consultation">Consultation</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            </TabsList>

            {/* Consultation Tab */}
            <TabsContent value="consultation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Consultation Notes</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                    >
                      {isEditingNotes ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <Textarea
                        value={notes || appointment.consultationNotes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[200px]"
                        placeholder="Enter consultation notes..."
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveNotes}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Notes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingNotes(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {appointment.consultationNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis & Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Primary Diagnosis</h4>
                    <p className="text-muted-foreground">{appointment.diagnosis}</p>
                  </div>
                  
                  {appointment.nextAppointment && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Next Appointment</h4>
                      <p className="text-muted-foreground">{appointment.nextAppointment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Medications</span>
                    <Button variant="outline" size="sm">
                      <Pill className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointment.patient.currentMedications.map((med, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{med.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointment.prescriptions.map((prescription, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{prescription.medication}</h4>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Dosage:</span> {prescription.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {prescription.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {prescription.duration}
                          </div>
                          <div>
                            <span className="font-medium">Refills:</span> {prescription.refills}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Instructions:</span> {prescription.instructions}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Results Tab */}
            <TabsContent value="labs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Lab Results</span>
                    <Button variant="outline" size="sm">
                      <TestTube className="h-4 w-4 mr-2" />
                      Order Labs
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {appointment.labResults.map((lab, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{lab.type}</h4>
                            <p className="text-sm text-muted-foreground">{lab.date}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(lab.results).map(([test, result]) => (
                            <div key={test} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-foreground">{test}</p>
                              <p className="text-sm text-muted-foreground">{result}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vital Signs Tab */}
            <TabsContent value="vitals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Vital Signs</span>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Update Vitals
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(appointment.vitalSigns).map(([vital, value]) => (
                      <div key={vital} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground capitalize mb-1">
                          {vital.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                        <p className="text-lg font-bold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}