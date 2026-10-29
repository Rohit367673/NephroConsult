import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Clock, FileText, Heart, Shield, Edit3, Save, Camera, Star, Award, Bell, Video, Upload, Activity, TrendingUp, CheckCircle2, Menu, X, LogOut, CreditCard, Download, Eye, ExternalLink, AlertCircle, Plus, MessageSquare, Sparkles, Stethoscope, ArrowRight, Check, Droplets } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
// Removed Tabs components - using conditional rendering instead
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Navigation } from '../components/Navigation';
import Footer from '../components/Footer';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  country: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  bloodType: string;
}



export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Bug 13 fix: ALL hooks must be declared BEFORE any early returns/navigate() calls
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard');
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<number>>(new Set());

  // Bug 15 fix: Use empty string defaults instead of fake placeholder data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    age: (user as any)?.age || '',
    gender: (user as any)?.gender || '',
    country: user?.country === 'IN' ? 'India' : 
             user?.country === 'US' ? 'United States' :
             user?.country === 'GB' ? 'United Kingdom' :
             user?.country === 'EU' ? 'Europe' :
             user?.country || '',
    address: (user as any)?.address || '',
    emergencyContact: (user as any)?.emergencyContact || '',
    medicalHistory: (user as any)?.medicalHistory || '',
    allergies: (user as any)?.allergies || '',
    currentMedications: (user as any)?.currentMedications || '',
    bloodType: (user as any)?.bloodType || ''
  });

  // Fetch real appointments from API
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [doctorChats, setDoctorChats] = useState<any[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const [doctorStats, setDoctorStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingConsultations: 0,
    completedToday: 0
  });
  const [doctorFilter, setDoctorFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  
  // Update profileData when user changes (Bug 15 fix: empty string defaults)
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as any)?.phone || '',
        age: (user as any)?.age || '',
        gender: (user as any)?.gender || '',
        country: user?.country === 'IN' ? 'India' : 
                 user?.country === 'US' ? 'United States' :
                 user?.country === 'GB' ? 'United Kingdom' :
                 user?.country === 'EU' ? 'Europe' :
                 user?.country || '',
        address: (user as any)?.address || '',
        emergencyContact: (user as any)?.emergencyContact || '',
        medicalHistory: (user as any)?.medicalHistory || '',
        allergies: (user as any)?.allergies || '',
        currentMedications: (user as any)?.currentMedications || '',
        bloodType: (user as any)?.bloodType || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchAppointments();
    } else if (user?.role === 'doctor' || user?.role === 'admin') {
      fetchDoctorAppointments();
    }
  }, [user?.role]);

  // Bug 14 fix: Use actual DB currency/amount; only override if currency is genuinely missing
  const getCorrectCurrency = (appointment: any) => {
    const price = appointment.price;
    if (price?.amount === 0 || price?.discountApplied) {
      return 'FREE';
    }
    // If DB has a valid non-zero amount and a currency symbol, trust it
    if (price?.symbol && price?.amount && price?.currency) {
      return `${price.symbol}${price.amount}`;
    }
    // Fallback: derive from user country
    const userCountry = user?.country || 'US';
    if (userCountry === 'IN' || userCountry === 'India') {
      return `₹${price?.amount ?? 2500}`;
    }
    if (userCountry === 'GB') return `£${price?.amount ?? 90}`;
    if (userCountry === 'AU') return `A$${price?.amount ?? 130}`;
    return `$${price?.amount ?? 120}`;
  };

  // Show loading state while user data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#006f6f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Bug 13 fix: Early returns placed AFTER all hooks
  if (!loading && !user) {
    navigate('/');
    return null;
  }
  if (!loading && user?.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      // Fetch both appointments and doctor chats in parallel
      const [aptRes, chatRes] = await Promise.all([
        fetch('/api/appointments/mine', { credentials: 'include' }).catch(() => null),
        fetch('/api/doctor-chat/mine', { credentials: 'include' }).catch(() => null)
      ]);
      
      if (aptRes && aptRes.ok) {
        const text = await aptRes.text().catch(() => '');
        const data = text ? JSON.parse(text) : {};
        console.log('📋 API Appointments:', data.appointments);
        setAppointments(data.appointments || []);
      } else {
        setAppointments([]);
      }

      if (chatRes && chatRes.ok) {
        const chatData = await chatRes.json().catch(() => ({}));
        console.log('💬 API Doctor Chats:', chatData.chats);
        setDoctorChats(chatData.chats || []);
      } else {
        setDoctorChats([]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setAppointments([]);
      setDoctorChats([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      // Use same-origin endpoint to keep cookies first-party on mobile
      const doctorEndpoint = '/api/appointments/doctor';
      
      const response = await fetch(doctorEndpoint, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const text = await response.text().catch(() => '');
        const data = text ? JSON.parse(text) : {};
        console.log('📋 Doctor appointments:', data);
        setDoctorAppointments(data.appointments || []);
        
        // Calculate real statistics
        const today = new Date().toDateString();
        const todayAppointments = data.appointments?.filter((apt: any) => 
          new Date(apt.date).toDateString() === today
        ).length || 0;
        
        const upcomingConsultations = data.appointments?.filter((apt: any) => 
          apt.status === 'confirmed' && new Date(apt.date) >= new Date()
        ).length || 0;
        
        const completedToday = data.appointments?.filter((apt: any) => 
          apt.status === 'completed' && new Date(apt.date).toDateString() === today
        ).length || 0;
        
        const uniquePatients = new Set(data.appointments?.map((apt: any) => apt.patient?.email)).size || 0;
        
        setDoctorStats({
          todayAppointments,
          totalPatients: uniquePatients,
          upcomingConsultations,
          completedToday
        });
      } else {
        console.error('Failed to fetch doctor appointments');
        setDoctorAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      setDoctorAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Smart appointment filtering logic - Dashboard shows all active (non-completed, non-cancelled) appointments
  const getDisplayAppointments = () => {
    console.log('Filtering appointments:', appointments);
    console.log('Available statuses:', appointments.map(apt => apt.status));
    console.log('First appointment full data:', appointments[0]);
    console.log('Meet link check:', appointments[0]?.meetLink);
    console.log('Price check:', appointments[0]?.price);
    
    // Active = everything that's not completed or cancelled
    const active = appointments
      .filter(apt => {
        const st = String(apt.status || '').toLowerCase();
        return st !== 'completed' && st !== 'cancelled';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return active;
  };

  const displayAppointments = getDisplayAppointments();

  // Helpers to classify appointments by status
  const activeAppointments = appointments
    .filter((apt) => {
      const status = String(apt.status || '').toLowerCase();
      return status !== 'completed' && status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const historyAppointments = appointments
    .filter((apt) => String(apt.status || '').toLowerCase() === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastCompleted = historyAppointments[0] || null;
  const lastCheckupDate = lastCompleted ? new Date(lastCompleted.date) : null;
  const nextUpcoming = (activeAppointments.find(a => new Date(a.date) >= new Date()) || activeAppointments[0]) || null;

  const fmtDate = (d?: Date | null, s?: string) => {
    if (!d && !s) return '—';
    const dd = d || (s ? new Date(s) : null);
    return dd ? dd.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  };

  const lastCheckupLabel = fmtDate(lastCheckupDate);
  const nextAppointmentLabel = nextUpcoming ? fmtDate(null, nextUpcoming.date) : '—';

  const now = new Date();
  let scoreLabel = 'Good';
  let barW = 'w-16';
  let color = 'text-green-600';
  let barColor = 'bg-green-500';
  if (!lastCheckupDate) { scoreLabel = 'New'; barW = 'w-12'; color = 'text-blue-600'; barColor = 'bg-blue-500'; }
  else {
    const months = (now.getTime() - lastCheckupDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (months > 12) { scoreLabel = 'Needs follow-up'; barW = 'w-8'; color = 'text-red-600'; barColor = 'bg-red-500'; }
    else if (months > 6) { scoreLabel = 'Fair'; barW = 'w-12'; color = 'text-yellow-600'; barColor = 'bg-yellow-500'; }
  }
  // Mock documents data
  const documents = [
    {
      id: 1,
      name: 'Blood Test Report - Sep 2025',
      type: 'Lab Report',
      uploadDate: '2025-09-10',
      size: '2.4 MB',
      url: '#'
    },
    {
      id: 2,
      name: 'Kidney Function Test',
      type: 'Lab Report',
      uploadDate: '2025-08-25',
      size: '1.8 MB',
      url: '#'
    },
    {
      id: 3,
      name: 'Previous Prescription',
      type: 'Prescription',
      uploadDate: '2025-08-15',
      size: '0.5 MB',
      url: '#'
    }
  ];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = () => {
    // In real app, save to database
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleViewPrescription = (appointmentId: number) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  const handleDownloadReceipt = (appointment: any) => {
    // Generate and download receipt
    const receiptContent = `
NephroConsult - Payment Receipt
=====================================

Receipt ID: ${appointment._id || 'APT_' + Date.now()}
Date: ${new Date().toLocaleDateString()}

CONSULTATION DETAILS:
Type: ${appointment.type}
Date: ${appointment.date}
Time: ${appointment.timeSlot || appointment.time}
Doctor: ${appointment.doctor?.name || 'Dr. Ilango S. Prakasam'}

PATIENT DETAILS:
Name: ${appointment.patient?.name || user?.name}
Email: ${appointment.patient?.email || user?.email}

PAYMENT DETAILS:
Amount: ${getCorrectCurrency(appointment)}
Currency: ${user?.country === 'IN' || user?.country === 'India' ? 'INR' : 'USD'}
Status: ${appointment.paymentStatus || 'Paid'}
${appointment.price?.discountApplied ? 'Discount Applied: First consultation' : ''}

Thank you for choosing NephroConsult!
For support: suyambu54321@gmail.com
    `.trim();

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${appointment.type.replace(' ', '_')}_${appointment.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Receipt downloaded successfully!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 overflow-x-hidden">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-24 sm:pt-28 pb-20 px-3 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#006f6f] via-[#005a5a] to-[#004242] p-6 sm:p-8 text-white shadow-xl border border-teal-800/30">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    Patient Portal • Dr. Ilango S. Prakasam (Senior Nephrologist)
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    Welcome back, {profileData.name || user?.name || 'Patient'} 👋
                  </h1>
                  <p className="mt-1.5 text-teal-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                    Manage your kidney consultations, review clinical prescriptions, and chat directly with Dr. Ilango S. Prakasam.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => navigate('/booking')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-950/20 rounded-xl px-5 py-2.5 h-auto text-sm transition-all transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Book Consultation
                  </Button>
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md rounded-xl px-4 py-2.5 h-auto text-sm font-semibold transition-all"
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-1.5" />
                        Save Profile
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Ambient background circles */}
              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl" />
              <div className="absolute right-36 -top-16 w-52 h-52 rounded-full bg-teal-400/10 pointer-events-none blur-lg" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile Card & Quick Info */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
              {/* Profile Overview Card */}
              <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white overflow-hidden">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative mb-5 inline-block"
                  >
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center relative shadow-lg ring-4 ring-teal-50">
                      {((user as any)?.photoURL || user?.avatar) && ((user as any)?.photoURL?.trim() !== '' || user?.avatar?.trim() !== '') ? (
                        <>
                          <img 
                            src={(user as any)?.photoURL || user?.avatar} 
                            alt={user?.name || 'Profile'} 
                            className="w-full h-full object-cover absolute inset-0"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onLoad={(e) => {
                              console.log('Profile image loaded successfully:', user?.avatar);
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'none';
                            }}
                            onError={(e) => {
                              console.log('Profile image failed to load, trying fallback methods');
                              const currentSrc = e.currentTarget.src;
                              if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                                const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=300&h=300&fit=cover&mask=circle`;
                                e.currentTarget.src = newSrc;
                                return;
                              }
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-full h-full bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center absolute inset-0"
                            style={{ display: 'flex' }}
                          >
                            <span className="text-white text-3xl sm:text-4xl font-extrabold">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-white text-3xl sm:text-4xl font-extrabold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => toast.info('Profile picture is synced from your Google account')}
                      className="absolute bottom-0 right-1 bg-white rounded-full p-2 shadow-md hover:shadow-lg border border-gray-100 transition-all text-[#006f6f]"
                      title="Update avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </motion.div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{profileData.name || 'Nephrology Patient'}</h2>
                  <p className="text-sm text-gray-500 mb-4 truncate">{profileData.email}</p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 font-semibold text-xs">
                      <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Verified Patient
                    </Badge>
                    {profileData.bloodType && (
                      <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 text-xs">
                        <Droplets className="w-3 h-3 mr-1 text-red-500" />
                        {profileData.bloodType}
                      </Badge>
                    )}
                    {profileData.country && (
                      <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 text-xs">
                        <MapPin className="w-3 h-3 mr-1 text-teal-600" />
                        {profileData.country}
                      </Badge>
                    )}
                  </div>

                  {/* Consultation Counters */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                    <div className="p-2">
                      <div className="text-2xl font-extrabold text-[#006f6f]">{appointments.length}</div>
                      <div className="text-xs font-medium text-gray-600 mt-0.5">Video Visits</div>
                    </div>
                    <div className="p-2 border-l border-slate-200">
                      <div className="text-2xl font-extrabold text-[#006f6f]">{doctorChats.length}</div>
                      <div className="text-xs font-medium text-gray-600 mt-0.5">Doctor Chats</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Journey Card */}
              <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base font-bold text-gray-900">
                    <Award className="w-5 h-5 mr-2 text-[#006f6f]" />
                    Kidney Care Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Last Checkup</span>
                    <span className="font-semibold text-gray-800">{lastCheckupLabel}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Next Visit</span>
                    <span className="font-semibold text-[#006f6f]">{nextAppointmentLabel}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Health Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`${barW} h-2 ${barColor} rounded-full`}></div>
                      </div>
                      <span className={`text-xs font-bold ${color}`}>{scoreLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Doctor Chat Assist Card */}
              <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Have New Lab Reports?</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Upload your KFT, Urine Protein, or Ultrasound files. Dr. Ilango evaluates them within 12–24h for just ₹100 / $1.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/booking')}
                  size="sm"
                  className="w-full bg-[#006f6f] hover:bg-[#005555] text-white font-semibold text-xs rounded-xl h-9"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Upload Reports & Start Chat (₹100 / $1)
                </Button>
              </div>
            </motion.div>

            {/* Right Column: Main Content & Tabs */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
              {/* Segmented Pill Navigation Bar */}
              <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap sm:flex-nowrap gap-1.5">
                <button
                  onClick={() => setActiveTab((user?.role === 'doctor' || user?.role === 'admin') ? 'doctor-dashboard' : 'dashboard')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    activeTab === ((user?.role === 'doctor' || user?.role === 'admin') ? 'doctor-dashboard' : 'dashboard')
                      ? 'bg-white text-[#006f6f] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  {(user?.role === 'doctor' || user?.role === 'admin') ? 'Practice' : 'Consultations'}
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    activeTab === 'personal'
                      ? 'bg-white text-[#006f6f] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Personal Info
                </button>
                {(user?.role !== 'doctor' && user?.role !== 'admin') && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      activeTab === 'history'
                        ? 'bg-white text-[#006f6f] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Past History
                  </button>
                )}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setActiveTab('medical')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'medical'
                          ? 'bg-white text-[#006f6f] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      Credentials
                    </button>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'appointments'
                          ? 'bg-white text-[#006f6f] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        activeTab === 'documents'
                          ? 'bg-white text-[#006f6f] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      Documents
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-6">

                {/* Dashboard Content */}
                {activeTab === ((user?.role === 'doctor' || user?.role === 'admin') ? 'doctor-dashboard' : 'dashboard') && (
                  <div className="grid gap-6">
                    {(user?.role === 'doctor' || user?.role === 'admin') ? (
                      // Doctor Dashboard
                      <>
                        <div className="grid md:grid-cols-3 gap-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Today's Appointments</p>
                                  <p className="text-3xl font-bold text-[#006f6f]">{doctorStats.todayAppointments}</p>
                                </div>
                                <Calendar className="w-12 h-12 text-[#006f6f]/20" />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Total Patients</p>
                                  <p className="text-3xl font-bold text-[#006f6f]">{doctorStats.totalPatients}</p>
                                </div>
                                <User className="w-12 h-12 text-[#006f6f]/20" />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Upcoming Consultations</p>
                                  <p className="text-3xl font-bold text-[#006f6f]">{doctorStats.upcomingConsultations}</p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-[#006f6f]/20" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Today's Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {appointmentsLoading ? (
                                  <p className="text-center text-gray-500">Loading appointments...</p>
                                ) : doctorAppointments.length === 0 ? (
                                  <p className="text-center text-gray-500">No appointments scheduled</p>
                                ) : doctorAppointments.filter(apt => 
                                  new Date(apt.date).toDateString() === new Date().toDateString()
                                ).map((appointment) => (
                                  <div key={appointment._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="min-w-0">
                                      <p className="font-medium truncate max-w-[220px] sm:max-w-none">{appointment.patient?.name || 'Patient'}</p>
                                      <p className="text-sm text-gray-600 truncate max-w-[220px] sm:max-w-none">{appointment.type}</p>
                                      <p className="text-xs text-gray-500 truncate max-w-[220px] sm:max-w-xs">{appointment.patient?.email}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-medium text-[#006f6f]">{appointment.timeSlot}</p>
                                      <div className="flex gap-2 mt-2">
                                        {appointment.meetLink && (
                                          <button
                                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => window.open(appointment.meetLink, '_blank')}
                                          >
                                            Join Meeting
                                          </button>
                                        )}
                                        <Button size="sm" variant="outline">View</Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <Button 
                                  className="w-full justify-start" 
                                  variant="outline"
                                  onClick={() => setActiveTab('schedule')}
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  View Today's Schedule
                                </Button>
                                <Button 
                                  className="w-full justify-start" 
                                  variant="outline"
                                  onClick={() => {
                                    // Refresh appointments
                                    fetchDoctorAppointments();
                                  }}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Refresh Patient List
                                </Button>
                                <Button 
                                  className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    // Open the next upcoming meeting
                                    const upcomingMeeting = doctorAppointments.find(apt => 
                                      apt.status === 'confirmed' && 
                                      new Date(apt.date) >= new Date() && 
                                      apt.meetLink
                                    );
                                    if (upcomingMeeting) {
                                      window.open(upcomingMeeting.meetLink, '_blank');
                                    } else {
                                      alert('No upcoming consultations with meeting links available');
                                    }
                                  }}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Next Consultation
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Doctor Appointment Management */}
                        <Card>
                          <CardHeader>
                            <CardTitle>All Appointments</CardTitle>
                            <div
                              className="flex flex-wrap sm:flex-nowrap gap-2 mt-4 overflow-x-auto sm:overflow-visible pr-3"
                              style={{ WebkitOverflowScrolling: 'touch', scrollbarGutter: 'stable both-edges' as any }}
                            >
                              <Button 
                                size="sm" 
                                variant={doctorFilter === 'upcoming' ? 'default' : 'outline'}
                                onClick={() => setDoctorFilter('upcoming')}
                                className="whitespace-normal sm:whitespace-nowrap"
                              >
                                Upcoming ({doctorStats.upcomingConsultations})
                              </Button>
                              <Button 
                                size="sm" 
                                variant={doctorFilter === 'completed' ? 'default' : 'outline'}
                                onClick={() => setDoctorFilter('completed')}
                                className="whitespace-normal sm:whitespace-nowrap"
                              >
                                Completed ({doctorStats.completedToday})
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => fetchDoctorAppointments()}
                                className="whitespace-normal sm:whitespace-nowrap"
                              >
                                🔄 Refresh
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {appointmentsLoading ? (
                                <p className="text-center text-gray-500">Loading appointments...</p>
                              ) : doctorAppointments.length === 0 ? (
                                <p className="text-center text-gray-500">No appointments found</p>
                              ) : doctorAppointments
                                .filter(apt => {
                                  if (doctorFilter === 'upcoming') return apt.status === 'confirmed';
                                  if (doctorFilter === 'completed') return apt.status === 'completed';
                                  return true; // show all by default
                                })
                                .map((appointment) => (
                                <div key={appointment._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0">
                                      <h4 className="font-semibold">{appointment.type}</h4>
                                      <p className="text-sm text-gray-600">
                                        Patient: {appointment.patient?.name || 'Unknown'}
                                      </p>
                                      <p className="text-sm text-gray-600 truncate max-w-[220px] sm:max-w-none">
                                        Email: {appointment.patient?.email || 'N/A'}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
                                      </p>
                                      <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                                        appointment.status === 'confirmed' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {appointment.status}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                      {appointment.meetLink && appointment.status === 'confirmed' && (
                                        <button
                                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                          onClick={() => window.open(appointment.meetLink, '_blank')}
                                        >
                                          <Video className="w-4 h-4 inline mr-1" />
                                          Join Meeting
                                        </button>
                                      )}
                                      <Button size="sm" variant="outline">
                                        View Details
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      // Patient Dashboard
                      <>
                        <div className="space-y-6">
                          {/* Quick Consultation Action Banners (2 Plans) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Plan 1: Initial Video Consultation */}
                            <div className="rounded-3xl border border-teal-200/90 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <Sparkles className="w-3 h-3" />
                                    1st Consultation Free
                                  </span>
                                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                                    <Video className="w-4 h-4" />
                                  </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base">Video Consultation</h3>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  30-min confidential 1-on-1 video call with Dr. Ilango S. Prakasam. Includes clinical diagnosis and verified digital prescription.
                                </p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-700">₹0 / $0 for 1st visit</span>
                                <Button
                                  size="sm"
                                  onClick={() => navigate('/booking')}
                                  className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-8 px-3"
                                >
                                  Book Visit →
                                </Button>
                              </div>
                            </div>

                            {/* Plan 2: Doctor Chat & Reports */}
                            <div className="rounded-3xl border border-cyan-200/90 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/20 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                                    Direct Doctor Review
                                  </span>
                                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4" />
                                  </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base">Doctor Chat & Reports</h3>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  Upload lab reports (KFT, Urine, Blood, Ultrasound) + ask questions. Dr. Ilango replies within 12–24h with medical advice.
                                </p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#006f6f]">₹100 INR / $1 USD</span>
                                <Button
                                  size="sm"
                                  onClick={() => navigate('/booking')}
                                  className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-8 px-3"
                                >
                                  Upload & Chat →
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Doctor Chats & Report Reviews Section */}
                          <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white overflow-hidden">
                            <CardHeader className="p-5 sm:p-6 pb-4 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#006f6f] flex items-center justify-center">
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                    Doctor Chats & Report Reviews
                                    {doctorChats.length > 0 && (
                                      <Badge variant="secondary" className="bg-teal-50 text-teal-800 font-bold ml-1">
                                        {doctorChats.length}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Direct asynchronous chat, report evaluation & digital prescriptions with Dr. Ilango S. Prakasam
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-9 self-start sm:self-auto px-4"
                                  onClick={() => navigate('/booking')}
                                >
                                  + Start New Chat (₹100 / $1)
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6">
                              {doctorChats.length === 0 ? (
                                <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
                                  <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-[#006f6f] flex items-center justify-center mx-auto mb-3 shadow-sm">
                                    <Stethoscope className="w-7 h-7" />
                                  </div>
                                  <h4 className="text-base font-bold text-gray-900">No Doctor Chat Consultations Yet</h4>
                                  <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                                    Upload your kidney blood work, urine protein, or ultrasound reports and ask Dr. Ilango S. Prakasam medical questions directly for just ₹100 / $1.
                                  </p>
                                  <Button
                                    size="sm"
                                    className="mt-4 bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-9 px-5 shadow-sm"
                                    onClick={() => navigate('/booking')}
                                  >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                                    Submit Reports & Start Chat (₹100 / $1)
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {doctorChats.map((chat) => (
                                    <div
                                      key={chat.ticketId}
                                      className="p-4 sm:p-5 rounded-2xl border border-gray-200/90 hover:border-teal-300 bg-white shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                      <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                                            #{chat.ticketId}
                                          </span>
                                          <Badge
                                            className={
                                              chat.status === 'waiting_doctor'
                                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                : chat.status === 'doctor_replied'
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                : 'bg-gray-100 text-gray-700 border-gray-300'
                                            }
                                            variant="outline"
                                          >
                                            {chat.status === 'waiting_doctor'
                                              ? '⏳ Doctor Reviewing (12–24h)'
                                              : chat.status === 'doctor_replied'
                                              ? '✓ Doctor Replied'
                                              : 'Concluded'}
                                          </Badge>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                          {chat.initialQuery?.symptoms || 'Report Review & Medical Query'}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                          <span>{chat.documents?.length || 0} report(s) attached</span>
                                          <span>•</span>
                                          <span>Last update: {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}</span>
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                          size="sm"
                                          className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-9 px-4"
                                          onClick={() => navigate(`/doctor-chat?ticketId=${chat.ticketId}`)}
                                        >
                                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                          Open Doctor Chat
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Your Consultations (Video Appointments) Section */}
                          <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white overflow-hidden">
                            <CardHeader className="p-5 sm:p-6 pb-4 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                      <Video className="w-4 h-4" />
                                    </div>
                                    Your Consultations (Video Appointments)
                                    {activeAppointments.length > 0 && (
                                      <Badge variant="secondary" className="bg-blue-50 text-blue-800 font-bold ml-1">
                                        {activeAppointments.length}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Face-to-face video consultations with Dr. Ilango S. Prakasam
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-9 self-start sm:self-auto px-4"
                                  onClick={() => navigate('/booking')}
                                >
                                  + Book Video Visit
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6">
                              <div className="space-y-4">
                                {activeAppointments.length === 0 ? (
                                  <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                                      <Video className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900">No Upcoming Video Consultations</h4>
                                    <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                                      You don't have any upcoming video appointments scheduled. Book your 30-minute face-to-face consultation today (1st session free for new patients).
                                    </p>
                                    <Button
                                      size="sm"
                                      className="mt-4 bg-[#006f6f] hover:bg-[#005555] text-white text-xs font-bold rounded-xl h-9 px-5 shadow-sm"
                                      onClick={() => navigate('/booking')}
                                    >
                                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                                      Book 1st Free Consultation
                                    </Button>
                                  </div>
                                ) : (
                                  activeAppointments.map((appointment) => (
                                    <motion.div
                                      key={appointment._id || appointment.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="rounded-2xl border border-gray-200/90 hover:border-teal-300 p-5 bg-white shadow-sm transition-all"
                                    >
                                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-start space-x-4">
                                          {/* Date block */}
                                          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-center shrink-0 w-20">
                                            <div className="text-xs font-bold text-[#006f6f] uppercase">
                                              {new Date(appointment.date).toLocaleDateString(undefined, { month: 'short' })}
                                            </div>
                                            <div className="text-2xl font-extrabold text-gray-900 leading-tight">
                                              {new Date(appointment.date).getDate()}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-medium">
                                              {appointment.timeSlot || appointment.time}
                                            </div>
                                          </div>

                                          <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <h4 className="font-bold text-gray-900 text-base">{appointment.type}</h4>
                                              <Badge 
                                                variant="outline" 
                                                className={
                                                  appointment.status === 'completed' 
                                                    ? 'text-blue-700 border-blue-300 bg-blue-50 font-bold' 
                                                    : 'text-emerald-700 border-emerald-300 bg-emerald-50 font-bold'
                                                }
                                              >
                                                {appointment.status || 'confirmed'}
                                              </Badge>
                                            </div>

                                            <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                                              <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot || appointment.time}</span>
                                              <span className="text-gray-400 font-mono">(IST: {appointment.timeSlot || appointment.istTime})</span>
                                            </p>

                                            <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                              <User className="w-3.5 h-3.5 text-gray-400" />
                                              <span>{appointment.doctor?.name || 'Dr. Ilango S. Prakasam'}</span>
                                            </p>

                                            <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                              <span className="font-semibold text-gray-800">{getCorrectCurrency(appointment)}</span>
                                              <span>—</span>
                                              <span className="text-emerald-700 font-medium">{appointment.paymentStatus || 'Confirmed'}</span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                          {appointment.status !== 'completed' && (
                                            <Button
                                              size="sm"
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9 px-4 shadow-sm"
                                              onClick={() => {
                                                if (appointment.meetLink) {
                                                  window.open(appointment.meetLink, '_blank');
                                                } else {
                                                  toast.error('Meeting link will be activated closer to your consultation time.');
                                                }
                                              }}
                                            >
                                              <Video className="w-3.5 h-3.5 mr-1.5" />
                                              Join Meeting
                                            </Button>
                                          )}

                                          {appointment.prescription && (
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl h-9 text-xs"
                                              onClick={() => handleViewPrescription(appointment.id || appointment._id)}
                                            >
                                              <FileText className="w-3.5 h-3.5 mr-1.5" />
                                              {expandedPrescriptions.has(appointment.id || appointment._id) ? 'Hide Prescription' : 'View Prescription'}
                                            </Button>
                                          )}

                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl h-9 text-xs font-semibold"
                                            onClick={() => handleDownloadReceipt(appointment)}
                                          >
                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                            Receipt
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Prescription Details */}
                                      {appointment.prescription && expandedPrescriptions.has(appointment.id || appointment._id) && (
                                        <div className="mt-4 p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                                          <h5 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
                                            <FileText className="w-4 h-4 text-blue-700" />
                                            Digital Prescription
                                          </h5>
                                          <div className="space-y-2">
                                            {appointment.prescription.medicines && appointment.prescription.medicines.length > 0 && (
                                              <div>
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Medicines:</p>
                                                <div className="space-y-1.5">
                                                  {appointment.prescription.medicines.map((medicine: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-blue-100">
                                                      <span className="font-semibold text-gray-800">{medicine.name} — {medicine.dosage}</span>
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-blue-600 hover:text-blue-800 p-1 h-auto text-xs"
                                                        onClick={() => {
                                                          const searchQuery = encodeURIComponent(`${medicine.name} ${medicine.dosage}`);
                                                          const fallbackUrl = `https://www.1mg.com/search/all?name=${searchQuery}`;
                                                          const url = medicine.link && String(medicine.link).trim() !== '' ? medicine.link : fallbackUrl;
                                                          window.open(url, '_blank');
                                                        }}
                                                      >
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        Buy Online
                                                      </Button>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {appointment.prescription.notes && (
                                              <div className="mt-2">
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Doctor's Advice:</p>
                                                <p className="text-xs text-blue-900 mt-0.5">{appointment.prescription.notes}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* History Content */}
                {activeTab === 'history' && (
                  <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white overflow-hidden">
                    <CardHeader className="p-5 sm:p-6 pb-4 border-b border-gray-100">
                      <CardTitle className="text-lg font-bold">Past Consultation History</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">Review your completed consultations and digital prescriptions</p>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                      <div className="space-y-4">
                        {historyAppointments.length === 0 ? (
                          <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <h4 className="font-bold text-gray-800 text-sm">No Completed Consultations Yet</h4>
                            <p className="text-xs text-gray-500 mt-1">Your past appointments and doctor reports will appear here after completion.</p>
                          </div>
                        ) : (
                          historyAppointments.map((appointment) => (
                            <motion.div
                              key={appointment._id || appointment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-2xl border border-gray-200/90 p-5 bg-white shadow-sm space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900">{appointment.type}</h4>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-800 font-semibold text-xs">
                                      Completed
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot || appointment.time} • {appointment.doctor?.name || 'Dr. Ilango S. Prakasam'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {appointment.prescription && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="rounded-xl text-xs border-blue-200 text-blue-700"
                                      onClick={() => handleViewPrescription(appointment.id || appointment._id)}
                                    >
                                      <FileText className="w-3.5 h-3.5 mr-1" />
                                      Prescription
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="rounded-xl text-xs"
                                    onClick={() => handleDownloadReceipt(appointment)}
                                  >
                                    <Download className="w-3.5 h-3.5 mr-1" />
                                    Receipt
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Personal Information Content */}
                {activeTab === 'personal' && (
                  <Card className="rounded-3xl border border-gray-200/90 shadow-md bg-white overflow-hidden">
                    <CardHeader className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg font-bold">Personal & Medical Details</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">Your confidential details used for consultations and official prescriptions</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className="bg-[#006f6f] hover:bg-[#005555] text-white font-bold rounded-xl h-9 px-4 text-xs"
                      >
                        {isEditing ? (
                          <>
                            <Save className="w-3.5 h-3.5 mr-1.5" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                            Edit Information
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 space-y-6">
                      {/* Section 1: Personal Details */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Personal Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Full Name</Label>
                            <Input
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Email Address</Label>
                            <Input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Phone Number</Label>
                            <Input
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Age</Label>
                            <Input
                              type="number"
                              value={profileData.age}
                              onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Gender</Label>
                            <Select
                              value={profileData.gender}
                              onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                              disabled={!isEditing}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Medical & Emergency */}
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Medical & Emergency Details</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Country</Label>
                            <Input
                              value={profileData.country}
                              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700">Blood Type</Label>
                            <Select
                              value={profileData.bloodType}
                              onValueChange={(value) => setProfileData({ ...profileData, bloodType: value })}
                              disabled={!isEditing}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label className="text-xs font-semibold text-gray-700">Emergency Contact (Name & Phone)</Label>
                          <Input
                            value={profileData.emergencyContact}
                            onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>

                        <div className="mt-4">
                          <Label className="text-xs font-semibold text-gray-700">Residential Address</Label>
                          <Textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1 min-h-[90px]"
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="pt-4 flex justify-end">
                          <Button
                            onClick={handleSave}
                            className="bg-[#006f6f] hover:bg-[#005555] text-white font-bold rounded-xl px-6 h-11 shadow-md"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save All Changes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Medical History / Credentials Content - Only for Doctors */}
                {activeTab === 'medical' && user?.role === 'doctor' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label>Medical License Number</Label>
                              <Input
                                value="MD123456789"
                                disabled={!isEditing}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>License Expiry Date</Label>
                              <Input
                                type="date"
                                value="2025-12-31"
                                disabled={!isEditing}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Specializations</Label>
                            <Textarea
                              value="Nephrology, Internal Medicine, Chronic Kidney Disease, Dialysis Management, Kidney Transplantation"
                              disabled={!isEditing}
                              className="mt-1 min-h-24"
                            />
                          </div>

                          <div>
                            <Label>Education & Certifications</Label>
                            <Textarea
                              value="MBBS - AIIMS New Delhi (2005)&#10;MD Internal Medicine - PGIMER Chandigarh (2008)&#10;DNB Nephrology - National Board (2011)&#10;MRCP (UK) - Royal College of Physicians (2012)"
                              disabled={!isEditing}
                              className="mt-1 min-h-32"
                            />
                          </div>

                          <div>
                            <Label>Professional Experience</Label>
                            <Textarea
                              value="Senior Consultant Nephrologist - Apollo Hospitals (2015-2023)&#10;Assistant Professor - Medical College (2011-2015)&#10;Research Fellow - Mayo Clinic USA (2013-2014)&#10;Consultant - Multiple leading hospitals across India"
                              disabled={!isEditing}
                              className="mt-1 min-h-32"
                            />
                          </div>
                        </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Heart className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800">Important Note</p>
                            <p className="text-sm text-yellow-700">
                              {user?.role === 'doctor' 
                                ? 'Keep your professional credentials updated for verification and compliance purposes.'
                                : 'Keep your medical information up to date for the best consultation experience. This information is securely encrypted and only accessible to your healthcare providers.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents Content - Only for Doctors */}
                {activeTab === 'documents' && user?.role === 'doctor' && (
                  <div className="space-y-6">
                    {/* Upload Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                        <p className="text-sm text-gray-600">
                          Upload lab reports, prescriptions, or medical queries for your consultation
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#006f6f] transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="text-lg font-medium text-gray-900">Drop files here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: PDF, JPG, PNG, DOCX (Max 10MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                toast.success(`File "${file.name}" selected for upload`);
                              }
                            }}
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-block mt-4 px-6 py-2 bg-[#006f6f] text-white rounded-lg cursor-pointer hover:bg-[#005555] transition-colors"
                          >
                            Choose File
                          </label>
                          {selectedFile && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                              </p>
                              <Button 
                                size="sm" 
                                className="mt-2 bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  // Simulate upload
                                  toast.success('Document uploaded successfully!');
                                  setSelectedFile(null);
                                }}
                              >
                                Upload Document
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Documents List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {documents.map((document) => (
                            <motion.div
                              key={document.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                  <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{document.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{document.type}</span>
                                    <span>•</span>
                                    <span>{document.size}</span>
                                    <span>•</span>
                                    <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {documents.length === 0 && (
                          <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No documents uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">Upload your lab reports and medical documents above</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Doctor Appointments Content */}
                {activeTab === 'appointments' && user?.role === 'doctor' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Doctor scheduling interface would go here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}