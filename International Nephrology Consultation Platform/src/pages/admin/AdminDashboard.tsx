import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Video, Phone, FileText, User, Star, Mail, Globe, ChevronDown, ChevronUp, LogOut, Filter, CheckCircle2, AlertCircle, Users, ClipboardList, MessageSquare, Download, ExternalLink, Copy, Share, Eye, Send, RefreshCw, Search, Stethoscope } from 'lucide-react';
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
  const [doctorChatTab, setDoctorChatTab] = useState<'active' | 'completed'>('active');
  const [doctorChatFilter, setDoctorChatFilter] = useState<'all' | 'waiting_doctor' | 'doctor_replied'>('all');
  const [showPatientReportsDrawer, setShowPatientReportsDrawer] = useState(true);
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
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com', 'drs.ilangos@gmail.com'];
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

  const activeDoctorChats = doctorChats.filter(chat => chat.status !== 'closed');
  const completedDoctorChats = doctorChats.filter(chat => chat.status === 'closed');

  const filteredDoctorChats = doctorChats.filter(chat => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s ||
      chat.patient.name.toLowerCase().includes(s) ||
      chat.patient.email.toLowerCase().includes(s) ||
      chat.ticketId.toLowerCase().includes(s) ||
      (chat.initialQuery?.symptoms && chat.initialQuery.symptoms.toLowerCase().includes(s));
    
    if (doctorChatTab === 'completed') {
      return matchesSearch && chat.status === 'closed';
    }

    const isActive = chat.status !== 'closed';
    const matchesFilter = doctorChatFilter === 'all' || chat.status === doctorChatFilter;
    return matchesSearch && isActive && matchesFilter;
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
        user?.name || 'Dr. Ilango S. Prakasam',
        user?.email
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
      await adminService.closeDoctorChat(selectedDoctorChat.ticketId, chatCloseForm, user?.email);
      toast.success('Consultation concluded & removed from active queue! Summary emailed to patient.');
      setIsClosingDoctorChatModal(false);
      
      const closedTicketId = selectedDoctorChat.ticketId;
      setChatCloseForm({
        diagnosis: '',
        instructions: '',
        nextReview: '',
        medicines: [{ name: '', dosage: '', url: '' }]
      });

      const updated = await adminService.getDoctorChats();
      setDoctorChats(updated.chats);
      setDoctorChatCounts(updated.counts);

      // In active tab: the concluded consultation is REMOVED from the active queue!
      if (doctorChatTab === 'active') {
        const remainingActive = updated.chats.filter(c => c.status !== 'closed' && c.ticketId !== closedTicketId);
        if (remainingActive.length > 0) {
          setSelectedDoctorChat(remainingActive[0]);
        } else {
          setSelectedDoctorChat(null);
        }
      } else {
        const refreshed = updated.chats.find(c => c.ticketId === closedTicketId);
        setSelectedDoctorChat(refreshed || null);
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

        {/* Top Primary Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 sm:p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap w-full sm:w-auto pb-1 sm:pb-0" style={{ WebkitOverflowScrolling: 'touch' as any }}>
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setActiveTab('upcoming')}
              className={(activeTab === 'upcoming' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : 'border-slate-200 text-slate-700 hover:bg-slate-50 ') + 'shrink-0 text-xs sm:text-sm font-semibold'}
            >
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Upcoming Video ({upcomingCount})
            </Button>
            <Button
              variant={activeTab === 'doctor_chats' ? 'default' : 'outline'}
              onClick={() => {
                setActiveTab('doctor_chats');
                if (doctorChatTab === 'active') {
                  const first = activeDoctorChats[0] || doctorChats[0];
                  if (first) setSelectedDoctorChat(first);
                } else {
                  const first = completedDoctorChats[0] || doctorChats[0];
                  if (first) setSelectedDoctorChat(first);
                }
              }}
              className={(activeTab === 'doctor_chats' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : 'border-slate-200 text-slate-700 hover:bg-slate-50 ') + 'shrink-0 text-xs sm:text-sm font-semibold flex items-center gap-1.5'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Doctor Chat Consultations ({doctorChats.length})</span>
              {doctorChatCounts.waiting_doctor > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full ml-1">
                  {doctorChatCounts.waiting_doctor} needs reply
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'completed' ? 'default' : 'outline'}
              onClick={() => setActiveTab('completed')}
              className={(activeTab === 'completed' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : 'border-slate-200 text-slate-700 hover:bg-slate-50 ') + 'shrink-0 text-xs sm:text-sm font-semibold'}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Completed Video ({completedCount})
            </Button>
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className={(activeTab === 'all' ? 'bg-[#006f6f] hover:bg-[#005555] text-white ' : 'border-slate-200 text-slate-700 hover:bg-slate-50 ') + 'shrink-0 text-xs sm:text-sm font-semibold'}
            >
              All Video ({consultations.length})
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel: Doctor Chat Inbox (1/3) OR Video Consultations List (2/3) */}
          <div className={activeTab === 'doctor_chats' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <Card className="overflow-hidden border border-slate-200 shadow-sm">
              {activeTab === 'doctor_chats' ? (
                /* Doctor Chat Inbox Queue Header */
                <CardHeader className="p-4 border-b border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#006f6f]" />
                      <h3 className="font-bold text-slate-900 text-base">Doctor Chat Inbox</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          const res = await adminService.getDoctorChats();
                          setDoctorChats(res.chats);
                          setDoctorChatCounts(res.counts);
                          toast.success('Chat inbox refreshed');
                        } catch {}
                      }}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-full"
                      title="Refresh inbox"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Active vs Completed Segmented Switcher */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setDoctorChatTab('active');
                        const first = activeDoctorChats[0];
                        if (first) setSelectedDoctorChat(first);
                      }}
                      className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        doctorChatTab === 'active'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Active Queue</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeDoctorChats.length > 0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {activeDoctorChats.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDoctorChatTab('completed');
                        const first = completedDoctorChats[0];
                        if (first) setSelectedDoctorChat(first);
                      }}
                      className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        doctorChatTab === 'completed'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Completed</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-600">
                        {completedDoctorChats.length}
                      </span>
                    </button>
                  </div>

                  {/* Filter Pills for Active */}
                  {doctorChatTab === 'active' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      <button
                        type="button"
                        onClick={() => setDoctorChatFilter('all')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          doctorChatFilter === 'all'
                            ? 'bg-[#006f6f] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All Active ({activeDoctorChats.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDoctorChatFilter('waiting_doctor')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          doctorChatFilter === 'waiting_doctor'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <span>⏳ Needs Reply</span>
                        <span className="font-bold">({doctorChatCounts.waiting_doctor})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDoctorChatFilter('doctor_replied')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          doctorChatFilter === 'doctor_replied'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <span>✓ Replied</span>
                        <span className="font-bold">({doctorChatCounts.doctor_replied})</span>
                      </button>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative">
                    <Input
                      placeholder="Search patient, ticket, symptoms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-xs h-8 pl-8 border-slate-200"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </CardHeader>
              ) : (
                /* Video Consultations Header */
                <CardHeader className="sticky top-[56px] sm:static z-40 bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur border-b border-slate-100 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900">Video Consultations</CardTitle>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-36 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-2 relative">
                    <Input
                      placeholder="Search consultations by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-xs sm:text-sm pl-8"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </CardHeader>
              )}
              
              <CardContent className="p-0">

                {/* Left Column Content */}
                <div>
                  {activeTab === 'doctor_chats' ? (
                    <div className="divide-y divide-slate-100 max-h-[72vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' as any }}>
                      {filteredDoctorChats.length === 0 ? (
                        <div className="text-center py-12 px-4 text-slate-500">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-700 text-sm">No consultations in this view</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {doctorChatTab === 'active'
                              ? 'All caught up! No active chats waiting.'
                              : 'Completed consultations will appear here.'}
                          </p>
                        </div>
                      ) : (
                        filteredDoctorChats.map((chat) => {
                          const isSelected = selectedDoctorChat?.ticketId === chat.ticketId;
                          const isWaiting = chat.status === 'waiting_doctor';
                          const isReplied = chat.status === 'doctor_replied';
                          return (
                            <div
                              key={chat._id || chat.ticketId}
                              className={`p-3.5 sm:p-4 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-teal-50/90 border-l-4 border-l-[#006f6f] shadow-xs'
                                  : 'hover:bg-slate-50'
                              }`}
                              onClick={() => setSelectedDoctorChat(chat)}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {chat.ticketId}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    isWaiting
                                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                                      : isReplied
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {isWaiting ? '⏳ Needs Reply' : isReplied ? '✓ Replied' : '✓ Completed'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{chat.patient.name}</h4>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(chat.lastMessageAt || chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-2 my-1">
                                {chat.initialQuery?.symptoms || chat.initialQuery?.primaryQuestion || 'Clinical report review consultation'}
                              </p>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                                <span className="truncate max-w-[140px]">{chat.patient.email}</span>
                                {chat.documents && chat.documents.length > 0 && (
                                  <span className="text-[#006f6f] font-semibold flex items-center gap-1 shrink-0">
                                    <FileText className="w-3 h-3" />
                                    {chat.documents.length} report{chat.documents.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
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

          {/* Right Panel: Doctor Chat Consultation & Review Workspace (2/3) OR Video Patient Details (1/3) */}
          <div className={activeTab === 'doctor_chats' ? 'lg:col-span-2' : 'lg:col-span-1'}>
            {activeTab === 'doctor_chats' ? (
              selectedDoctorChat ? (
                <Card className="overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  {/* Workspace Header */}
                  <CardHeader className="bg-white border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {selectedDoctorChat.ticketId}
                          </span>
                          <span className="text-xs font-bold text-[#006f6f] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            {selectedDoctorChat.price?.amount === 0 ? '🎁 1st Consultation Free' : '₹100 Paid'}
                          </span>
                          <Badge 
                            className={
                              selectedDoctorChat.status === 'waiting_doctor' 
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                : selectedDoctorChat.status === 'doctor_replied'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            }
                            variant="outline"
                          >
                            {selectedDoctorChat.status === 'waiting_doctor'
                              ? '⏳ Needs Your Reply'
                              : selectedDoctorChat.status === 'doctor_replied'
                              ? '✓ You Replied'
                              : '✓ Completed'}
                          </Badge>
                        </div>
                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                          {selectedDoctorChat.patient.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-1">
                          <span>{selectedDoctorChat.patient.email}</span>
                          {selectedDoctorChat.patient.phone && <span>• {selectedDoctorChat.patient.phone}</span>}
                          {selectedDoctorChat.patient.age && <span>• {selectedDoctorChat.patient.age}y {selectedDoctorChat.patient.gender || ''}</span>}
                          {selectedDoctorChat.patient.country && <span>• {selectedDoctorChat.patient.country}</span>}
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 h-9"
                          onClick={() => window.open(`/doctor-chat?ticketId=${selectedDoctorChat.ticketId}`, '_blank')}
                          title="Open client chat view in a new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#006f6f]" />
                          <span className="hidden sm:inline">Open Client View</span>
                        </Button>
                        {selectedDoctorChat.status !== 'closed' && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 h-9 shadow-xs"
                            onClick={() => setIsClosingDoctorChatModal(true)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete & Conclude</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Patient Medical Profile Toggle Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowPatientReportsDrawer(!showPatientReportsDrawer)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#006f6f] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#006f6f]" />
                        <span>Patient Clinical Profile & Lab Reports ({selectedDoctorChat.documents?.length || 0})</span>
                        {showPatientReportsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[11px] text-slate-400">
                        Started {new Date(selectedDoctorChat.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Collapsible Patient Clinical Summary & Uploaded Reports */}
                    <AnimatePresence>
                      {showPatientReportsDrawer && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-slate-100 space-y-3 overflow-hidden text-xs"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                            <div>
                              <strong className="text-slate-900 block mb-0.5">Symptoms / Chief Complaints:</strong>
                              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                                {selectedDoctorChat.initialQuery?.symptoms || 'Report review consultation'}
                              </p>
                            </div>
                            <div>
                              <strong className="text-slate-900 block mb-0.5">Primary Question for Dr. Ilango:</strong>
                              <p className="text-teal-900 font-medium leading-relaxed bg-teal-50/60 p-2.5 rounded-lg border border-teal-200">
                                {selectedDoctorChat.initialQuery?.primaryQuestion || 'Comprehensive clinical opinion requested on attached reports'}
                              </p>
                            </div>
                            {selectedDoctorChat.initialQuery?.duration && (
                              <div>
                                <strong className="text-slate-900">Duration: </strong>
                                <span className="text-slate-700">{selectedDoctorChat.initialQuery.duration}</span>
                              </div>
                            )}
                            {selectedDoctorChat.initialQuery?.currentMedications && (
                              <div>
                                <strong className="text-slate-900">Current Medications: </strong>
                                <span className="text-slate-700">{selectedDoctorChat.initialQuery.currentMedications}</span>
                              </div>
                            )}
                            {selectedDoctorChat.initialQuery?.medicalHistory && (
                              <div>
                                <strong className="text-slate-900">Medical History: </strong>
                                <span className="text-slate-700">{selectedDoctorChat.initialQuery.medicalHistory}</span>
                              </div>
                            )}
                            {selectedDoctorChat.initialQuery?.allergies && (
                              <div>
                                <strong className="text-red-700">Known Allergies: </strong>
                                <span className="text-red-800 font-semibold">{selectedDoctorChat.initialQuery.allergies}</span>
                              </div>
                            )}
                          </div>

                          {/* Uploaded Lab Reports */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                                Uploaded Lab Reports ({selectedDoctorChat.documents?.length || 0})
                              </span>
                            </div>
                            {selectedDoctorChat.documents && selectedDoctorChat.documents.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedDoctorChat.documents.map((doc, idx) => {
                                  const filename = typeof doc === 'string' && doc.includes('|') ? doc.split('|')[0] : `Lab-Report-${idx + 1}`;
                                  return (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                                      <div className="flex items-center space-x-2 min-w-0 mr-2">
                                        <FileText className="w-4 h-4 text-[#006f6f] shrink-0" />
                                        <span className="truncate text-xs font-semibold text-slate-800">{filename}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 shrink-0">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                                          onClick={() => handleViewAnyDocument(doc)}
                                        >
                                          <Eye className="w-3 h-3 mr-1" /> View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-teal-300 text-[#006f6f] hover:bg-teal-50 font-semibold"
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
                              <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                No lab reports were attached with this consultation.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardHeader>

                  {/* Chat Messages Feed (Mirroring User Interface) */}
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Doctor-Patient Conversation Timeline
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {selectedDoctorChat.messages?.length || 0} message{selectedDoctorChat.messages?.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3.5">
                      {selectedDoctorChat.messages && selectedDoctorChat.messages.length > 0 ? (
                        selectedDoctorChat.messages.map((msg, index) => {
                          if (msg.sender === 'system') {
                            return (
                              <div key={index} className="flex justify-center my-2">
                                <div className="bg-white border border-slate-200 text-slate-600 text-xs px-3.5 py-1.5 rounded-full text-center max-w-md shadow-2xs">
                                  ℹ️ {msg.text}
                                </div>
                              </div>
                            );
                          }

                          const isPatient = msg.sender === 'patient';

                          return (
                            <div
                              key={index}
                              className={`flex items-start gap-2.5 ${isPatient ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                              {/* Avatar */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                  isPatient
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-[#006f6f] text-white'
                                }`}
                              >
                                {isPatient ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                              </div>

                              {/* Message Bubble */}
                              <div
                                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                                  isPatient
                                    ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
                                    : 'bg-[#006f6f] text-white rounded-tr-sm'
                                }`}
                              >
                                <div className={`flex items-center justify-between gap-3 mb-1.5 pb-1 border-b text-[11px] ${
                                  isPatient ? 'border-slate-100' : 'border-white/15'
                                }`}>
                                  <span className={`font-bold ${isPatient ? 'text-slate-800' : 'text-teal-100'}`}>
                                    {isPatient ? (msg.senderName || selectedDoctorChat.patient.name) : (msg.senderName || 'Dr. Ilango S. Prakasam')}
                                  </span>
                                  <span className={isPatient ? 'text-slate-400' : 'text-teal-200'}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>

                                <div className={`whitespace-pre-wrap ${isPatient ? 'text-slate-800' : 'text-white'}`}>
                                  {msg.text}
                                </div>

                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className={`mt-3 pt-2.5 border-t space-y-1.5 ${isPatient ? 'border-slate-100' : 'border-white/20'}`}>
                                    <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                                      isPatient ? 'text-slate-500' : 'text-teal-100'
                                    }`}>
                                      <FileText className="w-3 h-3" />
                                      <span>Attached Reports ({msg.attachments.length}):</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {msg.attachments.map((att, i) => (
                                        <div
                                          key={i}
                                          className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                                            isPatient
                                              ? 'bg-slate-50 border border-slate-200 text-slate-800'
                                              : 'bg-white/15 border border-white/25 text-white'
                                          }`}
                                        >
                                          <span className="truncate font-medium">{att}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const matchingDoc = selectedDoctorChat.documents?.find(d => d.includes(att));
                                              if (matchingDoc) handleDownloadAnyDocument(matchingDoc);
                                              else handleDownloadAnyDocument(att);
                                            }}
                                            className={`font-semibold text-xs ml-2 shrink-0 flex items-center gap-1 ${
                                              isPatient ? 'text-[#006f6f] hover:underline' : 'text-teal-100 hover:text-white underline'
                                            }`}
                                          >
                                            <Download className="w-3 h-3" /> Download
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No messages yet in this consultation.
                        </div>
                      )}
                    </div>

                    {/* Actions & Doctor Reply Box OR Concluded Prescription Summary */}
                    {selectedDoctorChat.status !== 'closed' ? (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div>
                          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                            Type Reply to Patient
                          </Label>
                          <Textarea
                            rows={3}
                            placeholder="Type clinical advice, report interpretation, or instructions for the patient..."
                            value={doctorReplyText}
                            onChange={(e) => setDoctorReplyText(e.target.value)}
                            className="text-xs sm:text-sm bg-white border-slate-200 focus:border-[#006f6f]"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Patient will immediately receive an email notification with a 1-click link to view and reply.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <Button
                            className="w-full sm:w-auto bg-[#006f6f] hover:bg-[#005555] text-white text-xs sm:text-sm h-10 px-5 flex items-center gap-2 font-semibold shadow-xs"
                            disabled={isSendingReply || !doctorReplyText.trim()}
                            onClick={handleSendDoctorReply}
                          >
                            <Send className="w-4 h-4" />
                            {isSendingReply ? 'Sending...' : 'Send Reply to Patient'}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm h-10 px-5 flex items-center gap-2 font-semibold"
                            onClick={() => setIsClosingDoctorChatModal(true)}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Complete & Conclude Consultation
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Concluded Prescription Summary Card */
                      <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs sm:text-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                          <div className="flex items-center text-emerald-950 font-bold gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>Consultation Concluded & Prescription Dispatched</span>
                          </div>
                          {selectedDoctorChat.closedAt && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Completed on {new Date(selectedDoctorChat.closedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {selectedDoctorChat.prescription?.diagnosis && (
                          <div>
                            <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider mb-0.5">Clinical Diagnosis:</span>
                            <p className="text-slate-900 bg-white p-2.5 rounded-lg border border-emerald-100 font-medium">
                              {selectedDoctorChat.prescription.diagnosis}
                            </p>
                          </div>
                        )}

                        {selectedDoctorChat.prescription?.instructions && (
                          <div>
                            <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider mb-0.5">Instructions & Diet:</span>
                            <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed whitespace-pre-line">
                              {selectedDoctorChat.prescription.instructions}
                            </p>
                          </div>
                        )}

                        {selectedDoctorChat.prescription?.medicines && selectedDoctorChat.prescription.medicines.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider mb-1">Prescribed Medicines:</span>
                            <div className="space-y-1">
                              {selectedDoctorChat.prescription.medicines.map((m, idx) => (
                                <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-900">{m.name}</span>
                                  <span className="text-slate-600">{m.dosage}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedDoctorChat.prescription?.nextReview && (
                          <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                            <strong className="text-slate-700">Next Review: </strong>
                            <span className="text-slate-900 font-medium">{selectedDoctorChat.prescription.nextReview}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-slate-200">
                  <CardContent className="p-12 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h3 className="font-bold text-slate-800 text-base">No Consultation Selected</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Select a consultation from the left queue to review patient clinical queries, lab reports, conversation timeline, and dispatch prescriptions.
                    </p>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Modal Header (Sticky shrink-0) */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center shrink-0 bg-slate-50/70">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Complete & Conclude Doctor Chat</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ticket: <span className="font-mono font-bold text-slate-800">{selectedDoctorChat.ticketId}</span> • Patient: <span className="font-semibold text-slate-800">{selectedDoctorChat.patient.name}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700"
                  onClick={() => setIsClosingDoctorChatModal(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Modal Body (Scrollable flex-1) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Clinical Diagnosis / Impression
                  </Label>
                  <Input
                    placeholder="e.g. Stage 2 CKD with mild proteinuria, stable renal function"
                    value={chatCloseForm.diagnosis}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="text-xs sm:text-sm"
                  />
                </div>

                {/* Prescribed Medications */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Prescribed Medications
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-teal-300 text-[#006f6f] hover:bg-teal-50"
                      onClick={addChatMedicine}
                    >
                      + Add Medicine
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {chatCloseForm.medicines.map((med, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <Input
                          placeholder="Medicine name (e.g. Telmisartan)"
                          value={med.name}
                          onChange={(e) => updateChatMedicine(idx, 'name', e.target.value)}
                          className="text-xs sm:text-sm flex-1 bg-white"
                        />
                        <Input
                          placeholder="Dosage & Frequency (e.g. 40mg OD morning)"
                          value={med.dosage}
                          onChange={(e) => updateChatMedicine(idx, 'dosage', e.target.value)}
                          className="text-xs sm:text-sm flex-1 bg-white"
                        />
                        {chatCloseForm.medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 h-8 px-2 text-xs shrink-0"
                            onClick={() => removeChatMedicine(idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dietary & Clinical Instructions */}
                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Dietary & Clinical Instructions
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="Low salt diet (<2g/day), adequate hydration (2-2.5L/day), avoid NSAID painkillers..."
                    value={chatCloseForm.instructions}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, instructions: e.target.value }))}
                    className="text-xs sm:text-sm"
                  />
                </div>

                {/* Next Review Recommended */}
                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Next Review Recommended
                  </Label>
                  <Input
                    placeholder="e.g. In 4 weeks with fresh Serum Creatinine & Urine Routine reports"
                    value={chatCloseForm.nextReview}
                    onChange={(e) => setChatCloseForm(prev => ({ ...prev, nextReview: e.target.value }))}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
                  ⚠️ <strong>Notice:</strong> Concluding this consultation marks it completed, moves it to the <strong>Completed</strong> archive, locks further messages, and dispatches the official prescription & summary email to <strong>{selectedDoctorChat.patient.email}</strong>.
                </div>
              </div>

              {/* Modal Footer (Sticky shrink-0) */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsClosingDoctorChatModal(false)}
                  disabled={isClosingDoctorChat}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-xs"
                  disabled={isClosingDoctorChat}
                  onClick={handleCloseDoctorChat}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isClosingDoctorChat ? 'Concluding...' : 'Complete & Dispatch Summary Email'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
