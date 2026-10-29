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
import adminService, { Consultation, Prescription, DoctorChatTicket } from '../../services/adminService';

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

  // Doctor Chats State
  const [doctorChats, setDoctorChats] = useState<DoctorChatTicket[]>([]);
  const [doctorChatCounts, setDoctorChatCounts] = useState({ total: 0, waiting_doctor: 0, doctor_replied: 0, closed: 0 });
  const [selectedDoctorChat, setSelectedDoctorChat] = useState<DoctorChatTicket | null>(null);
  const [doctorReplyText, setDoctorReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isClosingDoctorChatModal, setIsClosingDoctorChatModal] = useState(false);
  const [isClosingDoctorChat, setIsClosingDoctorChat] = useState(false);
  const [doctorChatFilter, setDoctorChatFilter] = useState<'all' | 'waiting_doctor' | 'doctor_replied' | 'closed'>('all');
  const [chatCloseForm, setChatCloseForm] = useState({
    diagnosis: '',
    instructions: '',
    nextReview: '',
    medicines: [{ name: '', dosage: '', url: '' }]
  });

  // Restore backend session for admin access
  const restoreSession = async () => {
    if (!user || !user.email) return;
    
    try {
      console.log('🔄 Restoring backend session for:', user.email);
      // In production, always use same-origin so cookies remain first-party (Vercel proxies /api -> backend)
      // In development, VITE_API_URL can point to localhost backend.
      const configured = import.meta.env.VITE_API_URL as string | undefined;
      const hasWindow = typeof window !== 'undefined';
      const isProdSite = hasWindow && /(^|\.)nephroconsultation\.com$/.test(window.location.hostname);
      const baseUrl = isProdSite ? '' : (configured || '');

      const response = await fetch(`${baseUrl}/api/auth/restore-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
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
        
        // Fetch appointments and doctor chats in parallel
        const [data, chatRes] = await Promise.all([
          adminService.getConsultations().catch(err => {
            console.error('Failed to load appointments:', err);
            return [];
          }),
          adminService.getDoctorChats().catch(err => {
            console.error('Failed to load doctor chats:', err);
            return { chats: [], counts: { total: 0, waiting_doctor: 0, doctor_replied: 0, closed: 0 } };
          })
        ]);

        console.log('🏥 Admin Dashboard received consultations:', data);
        console.log('🏥 Total consultations:', data.length);
        console.log('💬 Admin Dashboard received doctor chats:', chatRes.chats?.length);
        setConsultations(data);
        setDoctorChats(chatRes.chats || []);
        setDoctorChatCounts(chatRes.counts || { total: 0, waiting_doctor: 0, doctor_replied: 0, closed: 0 });
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

  const filteredDoctorChats = doctorChats.filter(chat => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s ||
      chat.patient.name.toLowerCase().includes(s) ||
      chat.patient.email.toLowerCase().includes(s) ||
      chat.ticketId.toLowerCase().includes(s) ||
      (chat.initialQuery?.symptoms && chat.initialQuery.symptoms.toLowerCase().includes(s));
    const matchesFilter = doctorChatFilter === 'all' || chat.status === doctorChatFilter;
    return matchesSearch && matchesFilter;
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

  // Document handling helper for both Video Intake & Doctor Chat documents
  const handleViewAnyDocument = (doc: string) => {
    if (typeof doc === 'string' && doc.includes('|')) {
      try {
        const [filename, base64Data] = doc.split('|');
        let cleanBase64 = base64Data;
        if (base64Data.includes(',')) {
          cleanBase64 = base64Data.split(',')[1];
        }
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const extension = filename.split('.').pop()?.toLowerCase();
        let mimeType = 'application/octet-stream';
        if (extension === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(extension || '')) mimeType = 'image/jpeg';
        else if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'gif') mimeType = 'image/gif';
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch (e) {
        toast.error('Failed to open document preview');
      }
    } else if (typeof doc === 'string' && doc.startsWith('http')) {
      window.open(doc, '_blank');
    } else {
      toast.info('Document format not supported for preview');
    }
  };

  const handleDownloadAnyDocument = (doc: string) => {
    if (typeof doc === 'string' && doc.includes('|')) {
      try {
        const [filename, base64Data] = doc.split('|');
        let cleanBase64 = base64Data;
        if (base64Data.includes(',')) {
          cleanBase64 = base64Data.split(',')[1];
        }
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const extension = filename.split('.').pop()?.toLowerCase();
        let mimeType = 'application/octet-stream';
        if (extension === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(extension || '')) mimeType = 'image/jpeg';
        else if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'gif') mimeType = 'image/gif';
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success(`Downloaded: ${filename}`);
      } catch (e) {
        toast.error('Failed to download document');
      }
    } else if (typeof doc === 'string' && doc.startsWith('http')) {
      window.open(doc, '_blank');
    }
  };

  // Doctor Chat Handlers
  const addChatMedicine = () => {
    setChatCloseForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', url: '' }]
    }));
  };

  const updateChatMedicine = (index: number, field: string, value: string) => {
    setChatCloseForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const removeChatMedicine = (index: number) => {
    setChatCloseForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSendDoctorReply = async () => {
    if (!selectedDoctorChat || !doctorReplyText.trim()) return;
    try {
      setIsSendingReply(true);
      const res = await adminService.sendDoctorChatMessage(
        selectedDoctorChat.ticketId,
        doctorReplyText.trim(),
        user?.name || 'Dr. Ilango S. Prakasam'
      );
      toast.success('Reply sent & notification emailed to patient!');
      setDoctorReplyText('');
      if (res && res.message) {
        setSelectedDoctorChat(prev => prev ? ({
          ...prev,
          status: 'doctor_replied',
          messages: [...prev.messages, res.message]
        }) : null);
      }
      const updated = await adminService.getDoctorChats();
      setDoctorChats(updated.chats);
      setDoctorChatCounts(updated.counts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCloseDoctorChat = async () => {
    if (!selectedDoctorChat) return;
    try {
      setIsClosingDoctorChat(true);
      await adminService.closeDoctorChat(selectedDoctorChat.ticketId, chatCloseForm);
      toast.success('Consultation completed and digital summary emailed to patient!');
      setIsClosingDoctorChatModal(false);
      const updated = await adminService.getDoctorChats();
      setDoctorChats(updated.chats);
      setDoctorChatCounts(updated.counts);
      const refreshed = updated.chats.find(c => c.ticketId === selectedDoctorChat.ticketId);
      if (refreshed) {
        setSelectedDoctorChat(refreshed);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete consultation');
    } finally {
      setIsClosingDoctorChat(false);
    }
  };

  const upcomingCount = consultations.filter(c => c.status === 'upcoming').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#006f6f]/5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' as any }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top)' as any }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
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
                <p className="text-sm font-medium text-gray-900 truncate max-w-[140px] sm:max-w-none">{user?.name}</p>
                <p className="text-xs text-gray-600 hidden sm:block">{user?.email}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Video</p>
                  <p className="text-3xl font-bold text-[#006f6f]">{upcomingCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#006f6f]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctor Chats Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{doctorChatCounts.waiting_doctor}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Video</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-3xl font-bold text-blue-600">{consultations.length + doctorChats.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Consultations List */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="sticky top-[56px] sm:static z-40 bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <CardTitle>{activeTab === 'doctor_chats' ? 'Doctor Chat & Report Consultations' : 'Video Consultations'}</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 w-full sm:w-auto sm:justify-end mt-1 sm:mt-0">
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto whitespace-nowrap px-1 -mx-1" style={{ WebkitOverflowScrolling: 'touch' as any }}>
                      <Button
                        variant={activeTab === 'upcoming' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('upcoming')}
                        className={(activeTab === 'upcoming' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : '') + 'shrink-0 text-xs sm:text-sm'}
                      >
                        Upcoming Video ({upcomingCount})
                      </Button>
                      <Button
                        variant={activeTab === 'doctor_chats' ? 'default' : 'outline'}
                        onClick={() => {
                          setActiveTab('doctor_chats');
                          if (!selectedDoctorChat && doctorChats.length > 0) {
                            setSelectedDoctorChat(doctorChats[0]);
                          }
                        }}
                        className={(activeTab === 'doctor_chats' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : '') + 'shrink-0 text-xs sm:text-sm flex items-center gap-1.5'}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Doctor Chats ({doctorChats.length})</span>
                        {doctorChatCounts.waiting_doctor > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                            {doctorChatCounts.waiting_doctor}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant={activeTab === 'completed' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('completed')}
                        className={(activeTab === 'completed' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : '') + 'shrink-0 text-xs sm:text-sm'}
                      >
                        Completed Video ({completedCount})
                      </Button>
                      <Button
                        variant={activeTab === 'all' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('all')}
                        className={(activeTab === 'all' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : '') + 'shrink-0 text-xs sm:text-sm'}
                      >
                        All Video ({consultations.length})
                      </Button>
                    </div>
                    
                    {activeTab === 'doctor_chats' ? (
                      <Select value={doctorChatFilter} onValueChange={(val: any) => setDoctorChatFilter(val)}>
                        <SelectTrigger className="w-full sm:w-36 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Chats</SelectItem>
                          <SelectItem value="waiting_doctor">Waiting Doctor</SelectItem>
                          <SelectItem value="doctor_replied">Doctor Replied</SelectItem>
                          <SelectItem value="closed">Concluded</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                {/* Search Bar */}
                <div className="mt-3">
                  <Input
                    placeholder={activeTab === 'doctor_chats' ? "Search by patient name, email, ticket ID, symptoms..." : "Search consultations..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">

                {/* Left Column Content */}
                <div>
                  {activeTab === 'doctor_chats' ? (
                    <div className="md:max-h-[72vh] md:overflow-y-auto overflow-visible overflow-x-hidden overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' as any }}>
                      {filteredDoctorChats.length === 0 ? (
                        <div className="text-center py-12 px-4 text-gray-500">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="font-medium text-gray-700">No doctor chat consultations found</p>
                          <p className="text-xs text-gray-400 mt-1">Chats submitted by patients will appear here</p>
                        </div>
                      ) : (
                        filteredDoctorChats.map((chat) => (
                          <motion.div
                            key={chat._id || chat.ticketId}
                            className={`p-4 sm:p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedDoctorChat?.ticketId === chat.ticketId ? 'bg-teal-50/70 border-l-4 border-l-[#006f6f] border-teal-200' : ''
                            }`}
                            onClick={() => setSelectedDoctorChat(chat)}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                  {chat.ticketId}
                                </span>
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{chat.patient.name}</h3>
                              </div>
                              <Badge 
                                className={
                                  chat.status === 'waiting_doctor' 
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium'
                                    : chat.status === 'doctor_replied'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-gray-100 text-gray-700 border-gray-300'
                                }
                                variant="outline"
                              >
                                {chat.status === 'waiting_doctor'
                                  ? '⏳ Needs Reply'
                                  : chat.status === 'doctor_replied'
                                  ? '✓ Replied'
                                  : 'Concluded'}
                              </Badge>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 my-1">
                              <span className="font-medium text-gray-900">Symptoms: </span>
                              {chat.initialQuery?.symptoms || chat.initialQuery?.primaryQuestion || 'Report review consultation'}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-2">
                              <span>{chat.patient.email}</span>
                              {chat.patient.phone && <span>• {chat.patient.phone}</span>}
                              {chat.patient.age && <span>• {chat.patient.age}y {chat.patient.gender || ''}</span>}
                              {chat.documents && chat.documents.length > 0 && (
                                <span className="text-[#006f6f] font-medium flex items-center">
                                  <FileText className="w-3 h-3 mr-0.5 inline" />
                                  {chat.documents.length} report(s)
                                </span>
                              )}
                              <span className="ml-auto text-[11px] text-gray-400">
                                {new Date(chat.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="md:max-h-[72vh] md:overflow-y-auto overflow-visible overflow-x-hidden overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' as any }}>
                      {filteredConsultations.map((consultation) => (
                      <motion.div
                        key={consultation.id}
                        className={`p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConsultation?.id === consultation.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedConsultation(consultation)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0 break-words">
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
                            
                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                                <span className="flex items-center min-w-0">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {consultation.date}
                                </span>
                                <span className="flex items-center min-w-0">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {consultation.time} ({consultation.istTime})
                                </span>
                                <span className="flex items-center min-w-0">
                                  <Globe className="w-4 h-4 mr-1" />
                                  {consultation.country}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-start">
                                <span className="flex items-center min-w-0">
                                  <Mail className="w-4 h-4 mr-1" />
                                  <span className="truncate break-all max-w-[220px] sm:max-w-none">{consultation.patientEmail}</span>
                                </span>
                                <span className="flex items-center min-w-0">
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
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details Panel */}
          <div className="lg:col-span-1">
            {activeTab === 'doctor_chats' ? (
              selectedDoctorChat ? (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                            {selectedDoctorChat.ticketId}
                          </span>
                          <span className="text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                            {selectedDoctorChat.price?.currency === 'INR' ? '₹' : '$'}{selectedDoctorChat.price?.amount || 100} Paid
                          </span>
                        </div>
                        <CardTitle className="mt-2 text-lg font-bold text-gray-900">
                          {selectedDoctorChat.patient.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {selectedDoctorChat.patient.age ? `${selectedDoctorChat.patient.age} yrs • ` : ''}
                          {selectedDoctorChat.patient.gender || ''}
                          {selectedDoctorChat.patient.phone ? ` • ${selectedDoctorChat.patient.phone}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[240px]">
                          {selectedDoctorChat.patient.email}
                        </p>
                      </div>
                      <Badge 
                        className={
                          selectedDoctorChat.status === 'waiting_doctor' 
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium'
                            : selectedDoctorChat.status === 'doctor_replied'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
                            : 'bg-gray-100 text-gray-700 border-gray-300 font-medium'
                        }
                        variant="outline"
                      >
                        {selectedDoctorChat.status === 'waiting_doctor'
                          ? '⏳ Needs Reply'
                          : selectedDoctorChat.status === 'doctor_replied'
                          ? '✓ Doctor Replied'
                          : 'Concluded'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">
                    {/* Patient Clinical Info */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs sm:text-sm space-y-2">
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-[#006f6f]">Clinical Query & Symptoms</h4>
                      <p className="text-gray-800 font-medium">
                        {selectedDoctorChat.initialQuery?.symptoms || 'No specific symptoms described'}
                      </p>
                      {selectedDoctorChat.initialQuery?.duration && (
                        <p className="text-gray-600">
                          <strong>Duration:</strong> {selectedDoctorChat.initialQuery.duration}
                        </p>
                      )}
                      {selectedDoctorChat.initialQuery?.currentMedications && (
                        <p className="text-gray-600">
                          <strong>Current Medications:</strong> {selectedDoctorChat.initialQuery.currentMedications}
                        </p>
                      )}
                      {selectedDoctorChat.initialQuery?.medicalHistory && (
                        <p className="text-gray-600">
                          <strong>Medical History:</strong> {selectedDoctorChat.initialQuery.medicalHistory}
                        </p>
                      )}
                      {selectedDoctorChat.initialQuery?.allergies && (
                        <p className="text-gray-600">
                          <strong>Allergies:</strong> {selectedDoctorChat.initialQuery.allergies}
                        </p>
                      )}
                      {selectedDoctorChat.initialQuery?.primaryQuestion && (
                        <p className="text-teal-900 bg-teal-50/70 p-2 rounded border border-teal-200">
                          <strong>Primary Question:</strong> {selectedDoctorChat.initialQuery.primaryQuestion}
                        </p>
                      )}
                    </div>

                    {/* Uploaded Documents */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-between text-xs sm:text-sm">
                        <span>Uploaded Lab Reports ({selectedDoctorChat.documents?.length || 0})</span>
                      </h4>
                      {selectedDoctorChat.documents && selectedDoctorChat.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDoctorChat.documents.map((doc, idx) => {
                            const filename = typeof doc === 'string' && doc.includes('|') ? doc.split('|')[0] : `Report-${idx + 1}`;
                            return (
                              <div key={idx} className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
                                <div className="flex items-center space-x-2 min-w-0 mr-2">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="truncate font-medium text-blue-900">{filename}</span>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                                    onClick={() => handleViewAnyDocument(doc)}
                                  >
                                    <Eye className="w-3 h-3 mr-1" /> View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                                    onClick={() => handleDownloadAnyDocument(doc)}
                                  >
                                    <Download className="w-3 h-3 mr-1" /> Download
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded border border-gray-200">
                          No lab reports attached with this consultation.
                        </p>
                      )}
                    </div>

                    {/* Interactive Messages Timeline */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-xs sm:text-sm">Doctor-Patient Messages</h4>
                      <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
                        {/* Initial patient query */}
                        <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm text-xs">
                          <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                            <span className="font-semibold text-gray-700">{selectedDoctorChat.patient.name}</span>
                            <span>{new Date(selectedDoctorChat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-800">
                            {selectedDoctorChat.initialQuery?.symptoms || 'Submitted reports for clinical review.'}
                          </p>
                        </div>

                        {/* Subsequent messages */}
                        {selectedDoctorChat.messages?.map((msg, i) => {
                          const isDoc = msg.sender === 'doctor';
                          return (
                            <div 
                              key={i} 
                              className={`p-2.5 rounded-lg text-xs ${
                                isDoc 
                                  ? 'bg-[#006f6f] text-white ml-4 shadow-sm' 
                                  : 'bg-white text-gray-800 mr-4 border border-gray-200 shadow-sm'
                              }`}
                            >
                              <div className={`flex justify-between items-center text-[10px] mb-1 ${isDoc ? 'text-teal-100' : 'text-gray-400'}`}>
                                <span className="font-semibold">{msg.senderName || (isDoc ? 'Dr. Ilango' : 'Patient')}</span>
                                <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions & Reply Box */}
                    {selectedDoctorChat.status !== 'closed' ? (
                      <div className="space-y-3 pt-2 border-t border-gray-200">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Doctor Reply (Patient notified by email with 1-click reply link)
                          </Label>
                          <Textarea
                            rows={3}
                            placeholder="Type clinical advice or questions for the patient..."
                            value={doctorReplyText}
                            onChange={(e) => setDoctorReplyText(e.target.value)}
                            className="text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            className="flex-1 bg-[#006f6f] hover:bg-[#005555] text-white text-xs sm:text-sm h-9"
                            disabled={isSendingReply || !doctorReplyText.trim()}
                            onClick={handleSendDoctorReply}
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            {isSendingReply ? 'Sending...' : 'Send Reply to Patient'}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-green-600 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-9"
                            onClick={() => setIsClosingDoctorChatModal(true)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Complete & Conclude
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-300 text-xs space-y-2">
                        <div className="flex items-center text-gray-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                          Consultation Concluded
                        </div>
                        {selectedDoctorChat.prescription?.diagnosis && (
                          <p><strong>Diagnosis:</strong> {selectedDoctorChat.prescription.diagnosis}</p>
                        )}
                        {selectedDoctorChat.prescription?.instructions && (
                          <p><strong>Instructions:</strong> {selectedDoctorChat.prescription.instructions}</p>
                        )}
                        {selectedDoctorChat.prescription?.medicines && selectedDoctorChat.prescription.medicines.length > 0 && (
                          <div>
                            <strong>Prescribed:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              {selectedDoctorChat.prescription.medicines.map((m, idx) => (
                                <li key={idx}>{m.name} - {m.dosage}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedDoctorChat.prescription?.nextReview && (
                          <p><strong>Next Review:</strong> {selectedDoctorChat.prescription.nextReview}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium text-gray-700">No Doctor Chat Selected</p>
                    <p className="text-xs text-gray-400 mt-1">Select a consultation from the left to view medical query, lab reports, chat history, and prescribe medicines.</p>
                  </CardContent>
                </Card>
              )
            ) : (
              selectedConsultation ? (
                <Card className="overflow-hidden">
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
                          <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            {/* Document Header */}
                            <div className="flex items-center space-x-3 mb-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                  {typeof doc === 'string' && doc.includes('|') 
                                    ? doc.split('|')[0] 
                                    : typeof doc === 'string' 
                                      ? doc 
                                      : doc.name || `Document ${index + 1}`}
                                </p>
                                {doc.size && (
                                  <p className="text-xs text-blue-600">Size: {doc.size}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-3 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 max-w-[100px] border-blue-300 text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  console.log('📄 View button clicked for document:', doc);
                                  
                                  // Handle document viewing - documents are in format "filename|base64data"
                                  if (typeof doc === 'string' && doc.includes('|')) {
                                    try {
                                      const [filename, base64Data] = doc.split('|');
                                      console.log('📄 Viewing file:', filename);
                                      console.log('📄 Base64 data length:', base64Data?.length);
                                      
                                      // Handle different base64 formats
                                      let cleanBase64 = base64Data;
                                      if (base64Data.includes(',')) {
                                        cleanBase64 = base64Data.split(',')[1];
                                      }
                                      
                                      // Create blob URL for viewing
                                      const byteCharacters = atob(cleanBase64);
                                      const byteNumbers = new Array(byteCharacters.length);
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                      }
                                      const byteArray = new Uint8Array(byteNumbers);
                                      
                                      // Determine MIME type from filename
                                      const extension = filename.split('.').pop()?.toLowerCase();
                                      let mimeType = 'application/octet-stream';
                                      if (extension === 'pdf') mimeType = 'application/pdf';
                                      else if (['jpg', 'jpeg'].includes(extension || '')) mimeType = 'image/jpeg';
                                      else if (extension === 'png') mimeType = 'image/png';
                                      else if (extension === 'gif') mimeType = 'image/gif';
                                      
                                      const blob = new Blob([byteArray], { type: mimeType });
                                      const url = URL.createObjectURL(blob);
                                      
                                      // Open in new tab
                                      window.open(url, '_blank');
                                      
                                      // Clean up URL after a delay
                                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                                      
                                    } catch (error) {
                                      console.error('📄 Error viewing document:', error);
                                      toast.error('Failed to open document');
                                    }
                                  } else {
                                    console.log('📄 Unknown document format:', doc);
                                    toast.info('Document format not supported for viewing');
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 max-w-[100px] border-blue-300 text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  console.log('📄 Download button clicked for document:', doc);
                                  
                                  // Handle document downloading - documents are in format "filename|base64data"
                                  if (typeof doc === 'string' && doc.includes('|')) {
                                    try {
                                      const [filename, base64Data] = doc.split('|');
                                      console.log('📄 Downloading file:', filename);
                                      
                                      // Handle different base64 formats
                                      let cleanBase64 = base64Data;
                                      if (base64Data.includes(',')) {
                                        cleanBase64 = base64Data.split(',')[1];
                                      }
                                      
                                      // Create blob for downloading
                                      const byteCharacters = atob(cleanBase64);
                                      const byteNumbers = new Array(byteCharacters.length);
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                      }
                                      const byteArray = new Uint8Array(byteNumbers);
                                      
                                      // Determine MIME type from filename
                                      const extension = filename.split('.').pop()?.toLowerCase();
                                      let mimeType = 'application/octet-stream';
                                      if (extension === 'pdf') mimeType = 'application/pdf';
                                      else if (['jpg', 'jpeg'].includes(extension || '')) mimeType = 'image/jpeg';
                                      else if (extension === 'png') mimeType = 'image/png';
                                      else if (extension === 'gif') mimeType = 'image/gif';
                                      
                                      const blob = new Blob([byteArray], { type: mimeType });
                                      const url = URL.createObjectURL(blob);
                                      
                                      // Create download link
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = filename;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      
                                      // Clean up URL
                                      URL.revokeObjectURL(url);
                                      
                                      toast.success(`Downloaded: ${filename}`);
                                      
                                    } catch (error) {
                                      console.error('📄 Error downloading document:', error);
                                      toast.error('Failed to download document');
                                    }
                                  } else {
                                    console.log('📄 Unknown document format for download:', doc);
                                    toast.info('Document format not supported for download');
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
            ))}
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

      {/* Conclude Doctor Chat Modal */}
      <AnimatePresence>
        {isClosingDoctorChatModal && selectedDoctorChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Complete & Conclude Doctor Chat</h2>
                  <p className="text-xs text-gray-600">
                    Ticket: {selectedDoctorChat.ticketId} • Patient: {selectedDoctorChat.patient.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsClosingDoctorChatModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Clinical Diagnosis / Impression</Label>
                  <Input
                    placeholder="e.g. Stage 2 CKD with mild proteinuria, stable renal function"
                    value={chatCloseForm.diagnosis}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>

                {/* Medicines List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-semibold">Prescribed Medications</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={addChatMedicine}
                    >
                      + Add Medicine
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {chatCloseForm.medicines.map((med, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => updateChatMedicine(idx, 'name', e.target.value)}
                          className="text-xs sm:text-sm flex-1"
                        />
                        <Input
                          placeholder="Dosage (e.g. 5mg OD after breakfast)"
                          value={med.dosage}
                          onChange={(e) => updateChatMedicine(idx, 'dosage', e.target.value)}
                          className="text-xs sm:text-sm flex-1"
                        />
                        {chatCloseForm.medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 h-8 px-2 text-xs"
                            onClick={() => removeChatMedicine(idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Dietary & Clinical Instructions</Label>
                  <Textarea
                    rows={3}
                    placeholder="Low salt diet, hydrate well, repeat serum creatinine & urine albumin in 1 month..."
                    value={chatCloseForm.instructions}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, instructions: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Next Review Recommended</Label>
                  <Input
                    placeholder="e.g. In 4-6 weeks with fresh lab reports"
                    value={chatCloseForm.nextReview}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, nextReview: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                  ⚠️ Concluding this consultation locks further messages on this ticket and dispatches an official prescription & summary email to <strong>{selectedDoctorChat.patient.email}</strong>. The patient can start a new consultation anytime.
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsClosingDoctorChatModal(false)}
                    disabled={isClosingDoctorChat}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isClosingDoctorChat}
                    onClick={handleCloseDoctorChat}
                  >
                    {isClosingDoctorChat ? 'Closing...' : 'Complete & Dispatch Summary Email'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
