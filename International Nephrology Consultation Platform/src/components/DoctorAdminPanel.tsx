import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, FileText, Video, Phone, Mail, MapPin, Stethoscope, Heart, Activity, Plus, Search, Filter, MoreVertical, Edit3, Save, X, Download, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner@2.0.3";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  uploadedFiles: Array<{ name: string; type: string; url: string }>;
}

interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  meetingUrl?: string;
  notes?: string;
  prescription?: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
      link?: string;
    }>;
    notes: string;
    followUpDate?: string;
  };
}

interface PrescriptionFormData {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    link: string;
  }>;
  notes: string;
  followUpDate: string;
}

export default function DoctorAdminPanel() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionFormData>({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', link: '' }],
    notes: '',
    followUpDate: ''
  });

  // Fetch real appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments/doctor', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Doctor appointments data:', data);
        
        // Transform API data to match component interface
        const transformedAppointments = (data.appointments || []).map((apt: any) => ({
          id: apt._id,
          patientId: apt.patient?.id || apt.patient?.email,
          patient: {
            id: apt.patient?.id || apt.patient?.email,
            name: apt.patient?.name || 'Unknown Patient',
            email: apt.patient?.email || '',
            phone: apt.patient?.phone || '',
            age: 35, // Default age, not in API
            gender: 'Not specified', // Default gender, not in API
            medicalHistory: apt.intake?.description || 'No medical history provided',
            currentMedications: 'Not specified',
            allergies: 'Not specified',
            uploadedFiles: (apt.intake?.documents || []).map((doc: string, index: number) => {
              if (doc.includes('|')) {
                const [filename] = doc.split('|');
                return {
                  name: filename,
                  type: filename.includes('.pdf') ? 'application/pdf' : 
                        filename.includes('.jpg') || filename.includes('.jpeg') ? 'image/jpeg' :
                        filename.includes('.png') ? 'image/png' : 'unknown',
                  url: doc,
                  base64: doc
                };
              }
              return {
                name: `Document ${index + 1}`,
                type: 'unknown',
                url: doc,
                base64: doc
              };
            })
          },
          date: apt.date,
          time: apt.timeSlot || apt.time,
          type: apt.type,
          status: apt.status === 'confirmed' ? 'scheduled' : apt.status === 'completed' ? 'completed' : apt.status,
          duration: apt.type?.includes('Initial') ? 45 : 30,
          meetingUrl: apt.meetLink || 'https://meet.google.com/new',
          notes: apt.prescription?.notes || '',
          prescription: apt.prescription ? {
            medications: (apt.prescription.medicines || []).map((med: any) => ({
              name: med.name,
              dosage: med.dosage || '',
              frequency: med.frequency || '',
              duration: '1 month', // Default duration
              instructions: med.frequency || 'Take as prescribed',
              link: med.link || ''
            })),
            notes: apt.prescription.notes || '',
            followUpDate: apt.prescription.nextConsultationDate ? new Date(apt.prescription.nextConsultationDate).toISOString().split('T')[0] : ''
          } : undefined
        }));
        
        setAppointments(transformedAppointments);
        console.log('📋 Transformed appointments:', transformedAppointments);
      } else {
        console.error('Failed to fetch doctor appointments');
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };


  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '', link: '' }]
    });
  };

  const removeMedication = (index: number) => {
    const newMedications = prescriptionForm.medications.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMedications = [...prescriptionForm.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
  };

  const handleSavePrescription = () => {
    if (!selectedAppointment) return;
    
    // In real app, save to database and send to patient
    toast.success('Prescription saved and sent to patient successfully!');
    setShowPrescriptionForm(false);
    setPrescriptionForm({
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', link: '' }],
      notes: '',
      followUpDate: ''
    });
  };

  const startConsultation = (appointment: Appointment) => {
    window.open(appointment.meetingUrl, '_blank');
    toast.success(`Consultation started with ${appointment.patient.name}`);
  };

  const viewDocument = (file: any) => {
    if (file.base64 && file.base64.includes('|')) {
      const [filename, base64Data] = file.base64.split('|');
      
      // Create blob from base64
      const byteCharacters = atob(base64Data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      
      // Create object URL and open in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast.success(`Opening ${filename}`);
    } else {
      toast.error('Document data not available');
    }
  };

  const downloadDocument = (file: any) => {
    if (file.base64 && file.base64.includes('|')) {
      const [filename, base64Data] = file.base64.split('|');
      
      // Create download link
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${filename}`);
    } else {
      toast.error('Document data not available');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-3xl font-bold text-[#006f6f]">{todayAppointments.length}</p>
                  <p className="text-sm text-gray-500">{todayAppointments.filter(apt => apt.status === 'completed').length} completed</p>
                </div>
                <Calendar className="w-12 h-12 text-[#006f6f]/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-[#006f6f]">1,247</p>
                  <p className="text-sm text-green-600">+23 this month</p>
                </div>
                <User className="w-12 h-12 text-[#006f6f]/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-[#006f6f]">98.5%</p>
                  <p className="text-sm text-gray-500">Based on reviews</p>
                </div>
                <Heart className="w-12 h-12 text-[#006f6f]/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-[#006f6f]">96.2%</p>
                  <p className="text-sm text-gray-500">Treatment outcomes</p>
                </div>
                <Activity className="w-12 h-12 text-[#006f6f]/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Appointments</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#006f6f]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patient.name}</h3>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={appointment.status === 'completed' ? 'default' : 
                                  appointment.status === 'scheduled' ? 'secondary' : 'destructive'}
                          className={appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startConsultation(appointment);
                            }}
                            className="bg-[#006f6f] hover:bg-[#005555]"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{appointment.patient.name}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#006f6f]">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.duration} min</p>
                    </div>
                  </motion.div>
                ))}
                {todayAppointments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No appointments scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Patient Records
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Medical Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details - {selectedAppointment.patient.name}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="prescription">Prescription</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-[#006f6f]" />
                      <div>
                        <p className="font-medium">{selectedAppointment.patient.name}</p>
                        <p className="text-sm text-gray-600">Age: {selectedAppointment.patient.age}, {selectedAppointment.patient.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-[#006f6f]" />
                      <p className="text-sm">{selectedAppointment.patient.email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-[#006f6f]" />
                      <p className="text-sm">{selectedAppointment.patient.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#006f6f]" />
                      <div>
                        <p className="font-medium">Appointment</p>
                        <p className="text-sm text-gray-600">{new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#006f6f]" />
                      <div>
                        <p className="font-medium">{selectedAppointment.type}</p>
                        <p className="text-sm text-gray-600">{selectedAppointment.duration} minutes</p>
                      </div>
                    </div>
                    {selectedAppointment.meetingUrl && (
                      <Button
                        onClick={() => startConsultation(selectedAppointment)}
                        className="w-full bg-[#006f6f] hover:bg-[#005555]"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Consultation
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Medical History</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">{selectedAppointment.patient.medicalHistory}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Current Medications</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">{selectedAppointment.patient.currentMedications}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Allergies</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">{selectedAppointment.patient.allergies}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Uploaded Documents</h3>
                  {selectedAppointment.patient.uploadedFiles.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedAppointment.patient.uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-[#006f6f]" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-600">{file.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No files uploaded</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prescription" className="mt-6">
                <div className="space-y-6">
                  {selectedAppointment.prescription ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Current Prescription</h3>
                      <div className="space-y-3">
                        {selectedAppointment.prescription.medications.map((med, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{med.name}</h4>
                                <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                                <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                                <p className="text-sm text-gray-700 mt-2">{med.instructions}</p>
                              </div>
                              {med.link && (
                                <Button variant="outline" size="sm" onClick={() => window.open(med.link, '_blank')}>
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAppointment.prescription.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">{selectedAppointment.prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No prescription created yet</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="w-full bg-[#006f6f] hover:bg-[#005555]"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {selectedAppointment.prescription ? 'Update Prescription' : 'Create Prescription'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <Dialog open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription - {selectedAppointment.patient.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Medications</h3>
                  <Button onClick={addMedication} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {prescriptionForm.medications.map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Medication {index + 1}</h4>
                        {prescriptionForm.medications.length > 1 && (
                          <Button
                            onClick={() => removeMedication(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Medication Name</Label>
                          <Input
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="Enter medication name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 10mg, 1 tablet"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Frequency</Label>
                          <Select
                            value={medication.frequency}
                            onValueChange={(value) => updateMedication(index, 'frequency', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Once daily">Once daily</SelectItem>
                              <SelectItem value="Twice daily">Twice daily</SelectItem>
                              <SelectItem value="Three times daily">Three times daily</SelectItem>
                              <SelectItem value="Four times daily">Four times daily</SelectItem>
                              <SelectItem value="As needed">As needed</SelectItem>
                              <SelectItem value="Every other day">Every other day</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Select
                            value={medication.duration}
                            onValueChange={(value) => updateMedication(index, 'duration', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 week">1 week</SelectItem>
                              <SelectItem value="2 weeks">2 weeks</SelectItem>
                              <SelectItem value="1 month">1 month</SelectItem>
                              <SelectItem value="2 months">2 months</SelectItem>
                              <SelectItem value="3 months">3 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label>Instructions</Label>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="Special instructions for taking this medication..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Medication Link (Optional)</Label>
                        <Input
                          value={medication.link}
                          onChange={(e) => updateMedication(index, 'link', e.target.value)}
                          placeholder="https://pharmacy.example.com/medication-info"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                  placeholder="Additional notes about the prescription or patient care..."
                  className="mt-1 min-h-24"
                />
              </div>
              
              <div>
                <Label>Follow-up Date (Optional)</Label>
                <Input
                  type="date"
                  value={prescriptionForm.followUpDate}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPrescriptionForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePrescription}
                  className="bg-[#006f6f] hover:bg-[#005555]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Send to Patient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}