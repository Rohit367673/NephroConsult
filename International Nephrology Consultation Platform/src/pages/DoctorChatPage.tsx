import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Stethoscope, 
  RefreshCw, 
  Pill, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from 'sonner';

interface Message {
  _id?: string;
  sender: 'patient' | 'doctor' | 'system';
  senderName?: string;
  text: string;
  attachments?: string[];
  timestamp: string | Date;
}

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  link?: string;
}

interface DoctorChatData {
  _id: string;
  ticketId: string;
  status: 'waiting_doctor' | 'doctor_replied' | 'waiting_patient' | 'closed';
  patient: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
  doctor: {
    name: string;
    title: string;
  };
  initialQuery: string;
  documents: string[];
  messages: Message[];
  prescription?: {
    notes?: string;
    medicines?: Medicine[];
    closedAt?: string;
  };
  price?: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DoctorChatPage() {
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTicket, setActiveTicket] = useState<DoctorChatData | null>(null);
  const [allTickets, setAllTickets] = useState<DoctorChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showReports, setShowReports] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch patient's chats
  const fetchChats = async (selectTicketId?: string) => {
    try {
      const email = user?.email || '';
      const params = new URLSearchParams();
      if (email) params.set('email', email);

      const res = await fetch(`/api/doctor-chat/mine?${params.toString()}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.chats)) {
          setAllTickets(data.chats);

          // If a specific ticketId is requested, select it
          const targetId = selectTicketId || ticketIdParam;
          let selected = data.chats.find((c: DoctorChatData) => c.ticketId === targetId);

          // If not found in /mine (e.g. guest or new ticket), fetch directly by ticketId
          if (!selected && targetId) {
            try {
              const directRes = await fetch(`/api/doctor-chat/${targetId}?email=${encodeURIComponent(email)}`, {
                credentials: 'include',
              });
              if (directRes.ok) {
                const directData = await directRes.json();
                if (directData.chat) {
                  selected = directData.chat;
                  setAllTickets((prev) => [directData.chat, ...prev.filter((c) => c.ticketId !== targetId)]);
                }
              }
            } catch {}
          }

          if (!selected && data.chats.length > 0) {
            selected = data.chats[0];
          }

          setActiveTicket(selected || null);
        }
      }
    } catch (err) {
      console.warn('Error fetching doctor chats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats(ticketIdParam || undefined);
  }, [ticketIdParam, user?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  // Periodic polling for doctor replies (every 15s when active)
  useEffect(() => {
    if (!activeTicket || activeTicket.status === 'closed') return;
    const interval = setInterval(() => {
      if (activeTicket.ticketId) {
        fetch(`/api/doctor-chat/${activeTicket.ticketId}`, { credentials: 'include' })
          .then((r) => r.json())
          .then((data) => {
            if (data.chat && data.chat.messages?.length !== activeTicket.messages?.length) {
              setActiveTicket(data.chat);
            }
          })
          .catch(() => {});
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTicket?.ticketId, activeTicket?.status, activeTicket?.messages?.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeTicket || sending) return;

    if (activeTicket.status === 'closed') {
      toast.error('This consultation has been closed. Please start a new consultation to chat.');
      return;
    }

    setSending(true);
    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch(`/api/doctor-chat/${activeTicket.ticketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setActiveTicket(data.chat);
          toast.success('Message sent to Dr. Ilango');
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send message');
        setNewMessage(textToSend); // restore
      }
    } catch {
      toast.error('Network error. Failed to send message.');
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting_doctor':
        return (
          <span
            style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Waiting for Doctor Review (12–24h)
          </span>
        );
      case 'doctor_replied':
        return (
          <span
            style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Doctor Replied
          </span>
        );
      case 'closed':
        return (
          <span
            style={{ backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          >
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            Consultation Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            Active
          </span>
        );
    }
  };

  const getInitialQueryDisplay = (query: any) => {
    if (!query) return 'No description provided.';
    if (typeof query === 'string') return query;
    return query.symptoms || query.primaryQuestion || query.medicalHistory || 'No description provided.';
  };

  const handleDownloadReport = (doc: string) => {
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
      } catch {
        toast.error('Failed to download document');
      }
    } else if (typeof doc === 'string' && doc.startsWith('http')) {
      window.open(doc, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#006f6f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your doctor consultation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If no ticket found at all
  if (!activeTicket) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navigation />
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-2xl text-center">
          <Card className="p-8 shadow-md border-gray-200">
            <Stethoscope className="w-16 h-16 text-[#006f6f] mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Consultation Found</h2>
            <p className="text-gray-600 mb-6 text-sm">
              You haven't initiated a Doctor Chat consultation yet, or your session has expired. You can upload your reports and chat directly with Dr. Ilango for just ₹100 / $1.
            </p>
            <Button
              className="bg-[#006f6f] hover:bg-[#005555] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md"
              onClick={() => navigate('/booking')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Files & Consult Doctor (₹100 / $1)
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navigation />

      {/* Top spacer for fixed Navigation */}
      <div className="h-16 shrink-0" />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-4xl flex flex-col">
        {/* Back Link & Ticket Selector */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#006f6f] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>

          {allTickets.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">Consultations:</span>
              <select
                value={activeTicket.ticketId}
                onChange={(e) => {
                  const sel = allTickets.find((t) => t.ticketId === e.target.value);
                  if (sel) setActiveTicket(sel);
                }}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-gray-700 font-medium focus:outline-none focus:border-[#006f6f]"
              >
                {allTickets.map((t) => (
                  <option key={t.ticketId} value={t.ticketId}>
                    {t.ticketId} ({t.status === 'closed' ? 'Closed' : 'Active'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Doctor Consultation Header Card */}
        <Card className="border border-slate-200/90 shadow-sm mb-3.5 overflow-hidden rounded-2xl bg-white">
          <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#006f6f] border border-teal-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">
                    Dr. Ilango S. Prakasam
                  </h1>
                  <span className="text-[11px] bg-teal-50 text-[#006f6f] border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                    Senior Nephrologist
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                  <span>Ticket: <strong className="font-mono text-slate-700 font-semibold">{activeTicket.ticketId}</strong></span>
                  <span>•</span>
                  <span>Patient: <strong className="text-slate-700 font-semibold">{activeTicket.patient?.name}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {getStatusBadge(activeTicket.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsRefreshing(true);
                  fetchChats(activeTicket.ticketId);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 rounded-full"
                title="Refresh messages"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Asynchronous Turnaround Banner (when waiting for doctor) */}
          {activeTicket.status === 'waiting_doctor' && (
            <div
              className="px-4 py-2.5 text-xs sm:text-sm border-t bg-sky-50/70 border-sky-100 text-sky-900 flex items-start sm:items-center gap-2.5"
            >
              <Clock className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-sky-600" />
              <div className="leading-snug">
                <strong>Turnaround Notice:</strong> Dr. Ilango reviews consultations personally within <strong>12 to 24 hours</strong>. You do not need to keep this page open — we will email you immediately the moment Dr. Ilango replies or prescribes advice!
              </div>
            </div>
          )}

          {/* Collapsible Submitted Reports & Medical Query Drawer */}
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowReports(!showReports)}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-[#006f6f] font-bold transition-colors"
            >
              <FileText className="w-4 h-4 text-[#006f6f]" />
              <span>View Submitted Reports ({activeTicket.documents?.length || 0}) & Symptoms</span>
              {showReports ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-slate-400 text-[11px]">
              {new Date(activeTicket.createdAt).toLocaleDateString()}
            </span>
          </div>

          <AnimatePresence>
            {showReports && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50 border-t border-gray-200 px-4 py-3.5 space-y-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Patient Medical Query / Symptoms:
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {getInitialQueryDisplay(activeTicket.initialQuery)}
                  </div>
                </div>

                {activeTicket.documents && activeTicket.documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Uploaded Lab Reports ({activeTicket.documents.length}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeTicket.documents.map((doc, idx) => {
                        const parts = typeof doc === 'string' ? doc.split('|') : [];
                        const fileName = parts.length > 1 ? parts[0] : `Lab Report ${idx + 1}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs"
                          >
                            <span className="truncate max-w-[180px] font-medium text-gray-800" title={fileName}>
                              📎 {fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDownloadReport(doc)}
                              className="text-[#006f6f] hover:underline font-semibold shrink-0 ml-2 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Prescription Card (if Dr. Ilango attached one) */}
        {activeTicket.prescription && (
          (activeTicket.prescription as any).diagnosis ||
          (activeTicket.prescription as any).instructions ||
          activeTicket.prescription.notes ||
          (activeTicket.prescription.medicines && activeTicket.prescription.medicines.length > 0)
        ) && (
          <Card className="border border-slate-200 shadow-sm mb-3 bg-white">
            <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#006f6f]" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Doctor's Digital Prescription & Advice
                </CardTitle>
              </div>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px]">
                Official
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {(activeTicket.prescription as any).diagnosis && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Diagnosis:</h5>
                  <p className="text-xs sm:text-sm text-gray-900 font-medium bg-white p-2.5 rounded-lg border border-emerald-100">
                    {(activeTicket.prescription as any).diagnosis}
                  </p>
                </div>
              )}

              {((activeTicket.prescription as any).instructions || activeTicket.prescription.notes) && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Clinical Instructions & Diet:</h5>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-white p-3 rounded-lg border border-emerald-100 whitespace-pre-line">
                    {(activeTicket.prescription as any).instructions || activeTicket.prescription.notes}
                  </p>
                </div>
              )}

              {activeTicket.prescription.medicines && activeTicket.prescription.medicines.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Prescribed Medicines:</h5>
                  <div className="space-y-1.5">
                    {activeTicket.prescription.medicines.map((m, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-gray-900">{m.name}</strong>
                          <span className="text-gray-600 ml-2">
                            {m.dosage && `(${m.dosage})`} {m.frequency && `• ${m.frequency}`}
                          </span>
                        </div>
                        {m.link && (
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline font-medium">
                            Buy / Info ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTicket.prescription as any).nextReview && (
                <div className="text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                  <strong>Recommended Next Review:</strong> {(activeTicket.prescription as any).nextReview}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Messages Feed */}
        <Card className="flex-1 border border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white min-h-[460px] max-h-[620px] rounded-2xl">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
            {activeTicket.messages && activeTicket.messages.length > 0 ? (
              activeTicket.messages.map((msg, index) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={index} className="flex justify-center my-3">
                      <div className="bg-white border border-slate-200 text-slate-600 text-xs px-4 py-1.5 rounded-full text-center max-w-md shadow-2xs">
                        ℹ️ {msg.text}
                      </div>
                    </div>
                  );
                }

                const isPatient = msg.sender === 'patient';

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isPatient ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isPatient
                          ? 'bg-slate-800 text-white shadow-2xs'
                          : 'bg-[#006f6f] text-white shadow-2xs'
                      }`}
                    >
                      {isPatient ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[72%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isPatient
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      <div className={`flex items-center justify-between gap-3 mb-1.5 pb-1 border-b text-[11px] ${
                        isPatient ? 'border-white/15' : 'border-slate-100'
                      }`}>
                        <span className={`font-bold ${isPatient ? 'text-slate-300' : 'text-[#006f6f]'}`}>
                          {isPatient ? 'You' : (msg.senderName || 'Dr. Ilango S. Prakasam')}
                        </span>
                        <span className={isPatient ? 'text-slate-400' : 'text-slate-400'}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div className={`whitespace-pre-wrap leading-relaxed font-normal ${isPatient ? 'text-white' : 'text-slate-800'}`}>
                        {msg.text}
                      </div>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-3 pt-2.5 border-t space-y-1.5 ${isPatient ? 'border-white/15' : 'border-slate-200'}`}>
                          <div className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${isPatient ? 'text-slate-300' : 'text-slate-600'}`}>
                            <FileText className="w-3 h-3" />
                            <span>Attached Lab Reports ({msg.attachments.length}):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                                  isPatient
                                    ? 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
                                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 mr-1.5">
                                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isPatient ? 'text-teal-300' : 'text-[#006f6f]'}`} />
                                  <span className="truncate font-medium text-[11px]">{att}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchingDoc = activeTicket.documents?.find(d => d.includes(att));
                                    if (matchingDoc) handleDownloadReport(matchingDoc);
                                    else handleDownloadReport(att);
                                  }}
                                  className={`p-1 rounded-md transition-colors shrink-0 ${
                                    isPatient
                                      ? 'text-teal-200 hover:text-white hover:bg-white/15'
                                      : 'text-[#006f6f] hover:text-[#004f4f] hover:bg-teal-50'
                                  }`}
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
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
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No messages yet. Send a message below.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Area: Message Input OR Closed State */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            {activeTicket.status === 'closed' ? (
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-700 text-xs font-semibold">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>This consultation has been closed by Dr. Ilango S. Prakasam</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Your chat and prescription history are permanently saved above. Need to consult with Dr. Ilango again?
                </p>
                <Button
                  onClick={() => navigate('/booking')}
                  className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Start New Doctor Consultation (₹100 / $1)
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message or follow-up question for Dr. Ilango (Enter to send)..."
                  className="min-h-[44px] max-h-[100px] text-xs sm:text-sm bg-white resize-none border-gray-300 focus:border-[#006f6f]"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-[#006f6f] hover:bg-[#005555] text-white shrink-0 px-4 py-2.5 h-[44px] rounded-lg"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
