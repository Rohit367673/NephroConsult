import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Video, Phone, FileText, User, Star, Mail, Globe, ChevronDown, LogOut, Filter, CheckCircle2, AlertCircle, Users, ClipboardList, MessageSquare, Download, ExternalLink, Copy, Share, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { toast } from "sonner";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService, { Consultation, Prescription } from '../../services/adminService';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicines: [{ name: '', dosage: '', url: '' }],
    instructions: '',
    nextVisit: ''
  });

  // Restore backend session for admin access
  const restoreSession = async () => {
    if (!user || !user.email) return;
    
    try {
      console.log('🔄 Restoring backend session for:', user.email);
      const response = await fetch('/api/auth/restore-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user })
      });

      if (response.ok) {
        console.log('✅ Backend session restored successfully');
      } else {
        console.warn('⚠️ Session restoration failed:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Error restoring session:', error);
    }
  };

  // Load consultations data
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        console.log('👤 Current user:', user);
        console.log('👤 User role:', user?.role);
        console.log('👤 User email:', user?.email);
        
        // First restore the backend session
        await restoreSession();
        
        // Then fetch consultations
        const data = await adminService.getConsultations();
        console.log('🏥 Admin Dashboard received consultations:', data);
        console.log('🏥 Total consultations:', data.length);
        setConsultations(data);
      } catch (error) {
        toast.error('Failed to load consultations');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadConsultations();
    }
  }, [user]);

  // Verify admin access
  useEffect(() => {
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
    if (!user || !adminEmails.includes(user.email || '')) {
      toast.error('Unauthorized access. Redirecting...');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || consultation.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'upcoming' && consultation.status === 'upcoming') ||
                      (activeTab === 'completed' && consultation.status === 'completed');
    
    const passes = matchesSearch && matchesFilter && matchesTab;
    
    if (!passes) {
      console.log(`🔍 Filtered out consultation: ${consultation.patientName} - Status: ${consultation.status}, ActiveTab: ${activeTab}, FilterStatus: ${filterStatus}`);
    }
    
    return passes;
  });
  
  console.log('🔍 Filtered consultations:', filteredConsultations.length, 'of', consultations.length);

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', url: '' }]
    }));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePrescription = async () => {
    if (!selectedConsultation) return;

    try {
      toast.info('Creating prescription...');
      
      // Call the backend API to create prescription
      await adminService.createPrescription(
        selectedConsultation.id, 
        prescriptionForm, 
        user?.name || 'Dr. Ilango S. Prakasam'
      );
      
      // Reload consultations to get updated data from backend
      const updatedConsultations = await adminService.getConsultations();
      setConsultations(updatedConsultations);
      
      // Reset form
      setPrescriptionForm({
        medicines: [{ name: '', dosage: '', url: '' }],
        instructions: '',
        nextVisit: ''
      });
      
      setIsCreatingPrescription(false);
      setSelectedConsultation(null);
      
      toast.success('Prescription created and consultation completed!');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const joinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const downloadDocument = (document: string) => {
    toast.info(`Downloading ${document}...`);
    // Implement actual download logic
  };

  const copyMeetingLink = (meetingLink: string) => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      toast.success('Meeting URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy meeting URL');
    });
  };

  const upcomingCount = consultations.filter(c => c.status === 'upcoming').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#006f6f]/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#006f6f] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NephroConsult Admin</h1>
                <p className="text-sm text-gray-600">Doctor Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Consultations</p>
                  <p className="text-3xl font-bold text-[#006f6f]">{upcomingCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#006f6f]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-blue-600">{consultations.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consultations List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Consultations</CardTitle>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={activeTab === 'upcoming' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('upcoming')}
                        className={activeTab === 'upcoming' ? 'bg-[#006f6f] hover:bg-[#005555]' : ''}
                      >
                        Upcoming ({upcomingCount})
                      </Button>
                      <Button
                        variant={activeTab === 'completed' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('completed')}
                        className={activeTab === 'completed' ? 'bg-[#006f6f] hover:bg-[#005555]' : ''}
                      >
                        Completed ({completedCount})
                      </Button>
                      
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">

                {/* Consultations Tab */}
                <div>
                  <div className="max-h-96 overflow-y-auto">
                    {filteredConsultations.map((consultation) => (
                    <motion.div
                      key={consultation.id}
                      className={`p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConsultation?.id === consultation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConsultation(consultation)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{consultation.patientName}</h3>
                            <Badge 
                              variant={consultation.status === 'upcoming' ? 'default' : 'secondary'}
                              className={consultation.status === 'upcoming' ? 'bg-[#006f6f]' : ''}
                            >
                              {consultation.status}
                            </Badge>
                            <Badge variant="outline">{consultation.type}</Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {consultation.date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {consultation.time} ({consultation.istTime})
                              </span>
                              <span className="flex items-center">
                                <Globe className="w-4 h-4 mr-1" />
                                {consultation.country}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {consultation.patientEmail}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {consultation.patientPhone}
                              </span>
                            </div>

                            {consultation.documents.length > 0 && (
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                <span>{consultation.documents.length} document(s) uploaded</span>
                              </div>
                            )}
                            
                            {consultation.status === 'upcoming' && consultation.meetingLink && (
                              <div className="flex items-center text-blue-600">
                                <Video className="w-4 h-4 mr-1" />
                                <span className="text-xs">Video meeting ready</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {consultation.status === 'upcoming' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (consultation.meetingLink) {
                                  joinMeeting(consultation.meetingLink);
                                }
                              }}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details Panel */}
          <div className="lg:col-span-1">
            {selectedConsultation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Patient Details
                    <Badge 
                      variant={selectedConsultation.status === 'upcoming' ? 'default' : 'secondary'}
                      className={selectedConsultation.status === 'upcoming' ? 'bg-[#006f6f]' : ''}
                    >
                      {selectedConsultation.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedConsultation.patientName}</div>
                      <div><strong>Email:</strong> {selectedConsultation.patientEmail}</div>
                      <div><strong>Phone:</strong> {selectedConsultation.patientPhone}</div>
                      <div><strong>Country:</strong> {selectedConsultation.country}</div>
                      <div><strong>Type:</strong> {selectedConsultation.type}</div>
                    </div>
                  </div>

                  {/* Query */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Patient Query</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedConsultation.query}
                    </p>
                  </div>

                  {/* Documents Section - Always show */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Patient Documents</h3>
                    {selectedConsultation.documents && selectedConsultation.documents.length > 0 ? (
                      <div className="space-y-2">
                        {selectedConsultation.documents.map((doc: any, index: any) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {typeof doc === 'string' ? doc : doc.name || `Document ${index + 1}`}
                                </p>
                                {doc.size && (
                                  <p className="text-xs text-blue-600">Size: {doc.size}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  // Handle document viewing
                                  if (typeof doc === 'string' && doc.startsWith('data:')) {
                                    // Base64 document - open in new tab
                                    const newWindow = window.open();
                                    if (newWindow) {
                                      newWindow.document.write(`<iframe src="${doc}" style="width:100%;height:100%;border:none;"></iframe>`);
                                    }
                                  } else {
                                    console.log('Document:', doc);
                                    toast.info('Opening document viewer...');
                                    // In a real app, this would download/view the document
                                    window.open(doc, '_blank');
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  console.log('Downloading document:', doc);
                                  toast.info('Document download started...');
                                  // In a real app, this would trigger file download
                                  if (typeof doc === 'string' && doc.startsWith('data:')) {
                                    const link = document.createElement('a');
                                    link.href = doc;
                                    link.download = `document_${index + 1}`;
                                    link.click();
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No documents uploaded by patient</p>
                        <p className="text-xs text-gray-400 mt-1">Documents uploaded during booking will appear here</p>
                      </div>
                    )}
                  </div>

                  {/* Meeting Details */}
                  {selectedConsultation.status === 'upcoming' && selectedConsultation.meetingLink && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Video Meeting</h3>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Meeting URL:</span>
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Same for Patient & Doctor
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-blue-800 font-mono bg-white p-2 rounded border break-all flex-1">
                            {selectedConsultation.meetingLink}
                          </div>
                          <div className="flex space-x-1 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyMeetingLink(selectedConsultation.meetingLink!)}
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#006f6f] hover:bg-[#005555] text-white"
                              onClick={() => {
                                if (selectedConsultation.meetingLink) {
                                  window.open(selectedConsultation.meetingLink, '_blank');
                                }
                              }}
                            >
                              <Video className="w-3 h-3 mr-1" />
                              Join
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ This URL is automatically shared with the patient
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    {selectedConsultation.status === 'upcoming' && (
                      <>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            if (selectedConsultation.meetingLink) {
                              joinMeeting(selectedConsultation.meetingLink);
                            }
                          }}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                        
                        <Button
                          className="w-full bg-[#006f6f] hover:bg-[#005555]"
                          onClick={() => setIsCreatingPrescription(true)}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Create Prescription
                        </Button>
                      </>
                    )}

                    {selectedConsultation.status === 'completed' && selectedConsultation.prescription && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Prescription</h3>
                        <div className="space-y-2 text-sm">
                          {selectedConsultation.prescription.medicines.map((med, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-gray-600">{med.dosage}</div>
                              {med.url && (
                                <a href={med.url} target="_blank" className="text-blue-600 hover:underline text-xs flex items-center mt-1">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Medicine
                                </a>
                              )}
                            </div>
                          ))}
                          
                          {selectedConsultation.prescription.instructions && (
                            <div className="mt-3">
                              <strong>Instructions:</strong>
                              <p className="text-gray-600 mt-1">{selectedConsultation.prescription.instructions}</p>
                            </div>
                          )}
                          
                          {selectedConsultation.prescription.nextVisit && (
                            <div className="mt-2">
                              <strong>Next Visit:</strong> {selectedConsultation.prescription.nextVisit}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a consultation to view patient details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {isCreatingPrescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Create Prescription</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingPrescription(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Patient Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Patient: {selectedConsultation?.patientName}</h3>
                    <p className="text-sm text-gray-600">{selectedConsultation?.patientEmail}</p>
                  </div>

                  {/* Medicines */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-base font-medium">Medicines</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMedicine}
                      >
                        Add Medicine
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {prescriptionForm.medicines.map((medicine, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`medicine-name-${index}`}>Medicine Name</Label>
                              <Input
                                id={`medicine-name-${index}`}
                                value={medicine.name}
                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                placeholder="e.g., Potassium Citrate"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`medicine-dosage-${index}`}>Dosage</Label>
                              <Input
                                id={`medicine-dosage-${index}`}
                                value={medicine.dosage}
                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                placeholder="e.g., 10mg twice daily"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Label htmlFor={`medicine-url-${index}`}>Medicine URL (Optional)</Label>
                            <Input
                              id={`medicine-url-${index}`}
                              value={medicine.url}
                              onChange={(e) => updateMedicine(index, 'url', e.target.value)}
                              placeholder="e.g., https://1mg.com/medicine-name"
                            />
                          </div>
                          
                          {prescriptionForm.medicines.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="mt-3"
                              onClick={() => removeMedicine(index)}
                            >
                              Remove Medicine
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <Label htmlFor="instructions" className="text-base font-medium">Additional Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Additional instructions for the patient..."
                      rows={4}
                    />
                  </div>

                  {/* Next Visit */}
                  <div>
                    <Label htmlFor="next-visit" className="text-base font-medium">Next Visit Date (Optional)</Label>
                    <Input
                      id="next-visit"
                      type="date"
                      value={prescriptionForm.nextVisit}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, nextVisit: e.target.value }))}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 bg-[#006f6f] hover:bg-[#005555]"
                      onClick={handleCreatePrescription}
                    >
                      Create & Send Prescription
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingPrescription(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
