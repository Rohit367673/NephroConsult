import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Clock, FileText, Heart, Shield, Edit3, Save, Camera, Star, Award, Bell, Video, Upload, Activity, TrendingUp, CheckCircle2, Menu, X, LogOut, CreditCard, Download, Eye, ExternalLink, AlertCircle, Plus } from 'lucide-react';
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

// Navigation Component (same as App.tsx)
function Navigation() {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    // Don't block navigation if still loading user data
    if (loading) {
      navigate(path);
      setIsMenuOpen(false);
      return;
    }
    
    if (!user && (path === '/booking' || path === '/profile' || path.includes('dashboard'))) {
      // For ProfilePage, we should not block since user should already be authenticated
      // But if somehow not authenticated, redirect to home
      if (path === '/profile') {
        navigate('/');
        setIsMenuOpen(false);
        return;
      }
    }
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
    >
      <div className="container-medical">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#006f6f] to-[#004f4f] rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NephroConsult</h1>
              <p className="text-xs text-gray-500">International Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={location.pathname === '/' ? 'text-[#006f6f]' : ''}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/about')}
              className={location.pathname === '/about' ? 'text-[#006f6f]' : ''}
            >
              About
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/booking')}
              className="text-[#006f6f] hover:text-[#005555]"
            >
              Book Appointment
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/contact')}
              className={location.pathname === '/contact' ? 'text-[#006f6f]' : ''}
            >
              Contact
            </Button>
            
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/profile')}
                  className={location.pathname === '/profile' ? 'text-[#006f6f]' : ''}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline">
                  Login
                </Button>
                <Button className="bg-[#006f6f] hover:bg-[#005555]">
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu and profile */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Profile Photo for Mobile */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {}} // Already on profile page
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.log('Profile image failed to load, trying fallback methods');
                        
                        // Try alternative Google image URL
                        const currentSrc = e.currentTarget.src;
                        if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                          const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=200&h=200&fit=cover&mask=circle`;
                          e.currentTarget.src = newSrc;
                          return;
                        }
                        
                        // If all methods fail, show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center"
                    style={{ display: user.avatar ? 'none' : 'flex' }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </motion.button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-2 overflow-hidden"
            >
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/')}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/about')}
              >
                About
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[#006f6f]"
                onClick={() => handleNavigation('/booking')}
              >
                Book Appointment
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/contact')}
              >
                Contact
              </Button>
              
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    Login
                  </Button>
                  <Button className="w-full justify-start bg-[#006f6f] hover:bg-[#005555]">
                    Sign Up
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard');
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<number>>(new Set());

  // Debug user data for reload issues
  console.log('ProfilePage - User data:', user);
  console.log('ProfilePage - User avatar:', user?.avatar);
  console.log('ProfilePage - Loading state:', loading);
  console.log('ProfilePage - Current activeTab:', activeTab);

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

  // Redirect to home if no user after loading
  if (!loading && !user) {
    navigate('/');
    return null;
  }
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    age: '35',
    gender: 'Male',
    country: 'United States',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: '+1 (555) 987-6543',
    medicalHistory: 'Hypertension since 2018, managed with medication. Family history of kidney disease.',
    allergies: 'Penicillin, Shellfish',
    currentMedications: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
    bloodType: 'A+'
  });

  // Mock appointments data with enhanced fields
  const appointments = [
    {
      id: 1,
      date: '2025-10-05',
      time: '10:00 AM',
      istTime: '14:30',
      type: 'Initial Consultation',
      status: 'Upcoming',
      doctor: 'Dr. Ilango S. Prakasam',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      price: 2500,
      currency: 'INR',
      paymentStatus: 'Paid'
    },
    {
      id: 2,
      date: '2025-09-15',
      time: '2:30 PM',
      istTime: '19:00',
      type: 'Follow-up',
      status: 'Completed',
      doctor: 'Dr. Ilango S. Prakasam',
      meetLink: 'https://meet.google.com/xyz-uvwx-yz',
      price: 1800,
      currency: 'INR',
      paymentStatus: 'Paid',
      prescription: {
        id: 'RX001',
        medicines: [
          { name: 'Lisinopril 10mg', dosage: '1 tablet daily', url: 'https://1mg.com/drugs/lisinopril' },
          { name: 'Metformin 500mg', dosage: '2 tablets daily', url: 'https://1mg.com/drugs/metformin' }
        ],
        advice: 'Continue current medication. Monitor blood pressure daily.',
        followUpDate: '2025-10-15'
      }
    },
    {
      id: 3,
      date: '2025-08-20',
      time: '11:00 AM',
      istTime: '15:30',
      type: 'Follow-up',
      status: 'Completed',
      doctor: 'Dr. Ilango S. Prakasam',
      meetLink: 'https://meet.google.com/def-ghij-klm',
      price: 1800,
      currency: 'INR',
      paymentStatus: 'Paid',
      prescription: {
        id: 'RX002',
        medicines: [
          { name: 'Amlodipine 5mg', dosage: '1 tablet daily', url: 'https://1mg.com/drugs/amlodipine' },
          { name: 'Atorvastatin 20mg', dosage: '1 tablet at night', url: 'https://1mg.com/drugs/atorvastatin' }
        ],
        advice: 'Continue medication as prescribed. Regular exercise recommended.',
        followUpDate: '2025-09-20'
      }
    },
    {
      id: 4,
      date: '2025-07-10',
      time: '3:00 PM',
      istTime: '19:30',
      type: 'Initial Consultation',
      status: 'Completed',
      doctor: 'Dr. Ilango S. Prakasam',
      meetLink: 'https://meet.google.com/nop-qrst-uvw',
      price: 2500,
      currency: 'INR',
      paymentStatus: 'Paid',
      prescription: {
        id: 'RX003',
        medicines: [
          { name: 'Losartan 50mg', dosage: '1 tablet daily', url: 'https://1mg.com/drugs/losartan' },
          { name: 'Furosemide 40mg', dosage: '1 tablet twice daily', url: 'https://1mg.com/drugs/furosemide' }
        ],
        advice: 'Monitor kidney function regularly. Reduce salt intake.',
        followUpDate: '2025-08-10'
      }
    }
  ];

  // Smart appointment filtering logic - Dashboard shows max 2 appointments
  const getDisplayAppointments = () => {
    const upcoming = appointments.filter(apt => apt.status === 'Upcoming');
    const completed = appointments.filter(apt => apt.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Dashboard shows: 1 upcoming + 1 most recent completed (max 2 total)
    const dashboardAppointments = [];
    
    // Add 1 upcoming appointment if available
    if (upcoming.length > 0) {
      dashboardAppointments.push(upcoming[0]);
    }
    
    // Add 1 most recent completed appointment if available
    if (completed.length > 0) {
      dashboardAppointments.push(completed[0]);
    }
    
    return dashboardAppointments;
  };

  const displayAppointments = getDisplayAppointments();

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
    // Simulate receipt download
    toast.success(`Receipt for ${appointment.type} on ${appointment.date} downloaded successfully!`);
    // In real app, this would generate and download a PDF receipt
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <div className="container-medical py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and medical details</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  className="px-6 py-3 bg-[#006f6f] hover:bg-[#005555]"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card>
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative mb-6"
                  >
                    <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-[#006f6f] to-[#004f4f] flex items-center justify-center">
                      {user?.avatar && user.avatar.trim() !== '' ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || 'Profile'} 
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onLoad={() => console.log('Profile image loaded successfully:', user.avatar)}
                          onError={(e) => {
                            console.log('Profile image failed to load, trying fallback methods');
                            
                            // Try alternative Google image URL
                            const currentSrc = e.currentTarget.src;
                            if (currentSrc.includes('googleusercontent.com') && !currentSrc.includes('proxy')) {
                              const newSrc = `https://images.weserv.nl/?url=${encodeURIComponent(currentSrc)}&w=300&h=300&fit=cover&mask=circle`;
                              console.log('Trying CORS proxy:', newSrc);
                              e.currentTarget.src = newSrc;
                              return;
                            }
                            
                            // Try without size restrictions
                            if (currentSrc.includes('googleusercontent.com') && currentSrc.includes('=s')) {
                              const newSrc = currentSrc.replace(/=s\d+-c$/, '');
                              console.log('Trying without size restrictions:', newSrc);
                              e.currentTarget.src = newSrc;
                              return;
                            }
                            
                            // Final fallback to initials
                            console.log('All image loading attempts failed, showing initials');
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white text-4xl font-bold">${user?.name?.charAt(0) || 'U'}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <button className="absolute bottom-0 right-1/4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                      <Camera className="w-5 h-5 text-[#006f6f]" />
                    </button>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                  <p className="text-gray-600 mb-4">{profileData.email}</p>

                  <div className="space-y-3 mb-6">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="w-4 h-4 mr-1" />
                      Verified Patient
                    </Badge>
                    <div className="flex items-center justify-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-900">4.8 Patient Rating</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#006f6f]">12</div>
                      <div className="text-sm text-gray-600">Consultations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#006f6f]">2</div>
                      <div className="text-sm text-gray-600">Years Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-[#006f6f]" />
                      Health Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Checkup</span>
                      <span className="font-medium">Aug 15, 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next Appointment</span>
                      <span className="font-medium text-[#006f6f]">Sep 25, 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Health Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="font-medium text-green-600">Good</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              {/* Horizontal Navigation */}
              <div className="mb-6">
                <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab(user?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === (user?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard')
                        ? 'bg-white text-[#006f6f] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {user?.role === 'doctor' ? 'Practice' : 'Dashboard'}
                  </button>
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'personal'
                        ? 'bg-white text-[#006f6f] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Personal Info
                  </button>
                  {user?.role !== 'doctor' && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'history'
                          ? 'bg-white text-[#006f6f] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      History
                    </button>
                  )}
                  {user?.role === 'doctor' && (
                    <>
                      <button
                        onClick={() => setActiveTab('medical')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'medical'
                            ? 'bg-white text-[#006f6f] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Credentials
                      </button>
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'appointments'
                            ? 'bg-white text-[#006f6f] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'documents'
                            ? 'bg-white text-[#006f6f] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Documents
                      </button>
                    </>
                  )}
                </nav>
              </div>

              <div className="space-y-6">

                {/* Dashboard Content */}
                {activeTab === (user?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard') && (
                  <div className="grid gap-6">
                    {user?.role === 'doctor' ? (
                      // Doctor Dashboard
                      <>
                        <div className="grid md:grid-cols-3 gap-6">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Today's Appointments</p>
                                  <p className="text-3xl font-bold text-[#006f6f]">8</p>
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
                                  <p className="text-3xl font-bold text-[#006f6f]">1,247</p>
                                </div>
                                <User className="w-12 h-12 text-[#006f6f]/20" />
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Success Rate</p>
                                  <p className="text-3xl font-bold text-[#006f6f]">98%</p>
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
                                {[
                                  { time: '9:00 AM', patient: 'John Smith', type: 'Initial Consultation' },
                                  { time: '10:30 AM', patient: 'Sarah Johnson', type: 'Follow-up' },
                                  { time: '2:00 PM', patient: 'Michael Brown', type: 'Lab Review' },
                                  { time: '3:30 PM', patient: 'Emily Davis', type: 'Urgent Consultation' }
                                ].map((appointment, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="font-medium">{appointment.patient}</p>
                                      <p className="text-sm text-gray-600">{appointment.type}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-[#006f6f]">{appointment.time}</p>
                                      <Button size="sm" variant="outline">View</Button>
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
                                <Button className="w-full justify-start" variant="outline">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Manage Schedule
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Patient Records
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                  <Video className="w-4 h-4 mr-2" />
                                  Start Consultation
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Resources
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    ) : (
                      // Patient Dashboard
                      <>

                        {/* Appointments Section */}
                        <div className="space-y-6">
                          {/* Quick Actions */}
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                  className="bg-[#006f6f] hover:bg-[#005555]"
                                  onClick={() => window.location.href = '/booking'}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Book New Consultation
                                </Button>
                                <Button variant="outline">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  View Calendar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Appointments List */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Your Consultations</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {displayAppointments.map((appointment) => (
                                  <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: appointment.id * 0.1 }}
                                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                      <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-full ${
                                          appointment.status === 'Upcoming' ? 'bg-blue-100' : 'bg-green-100'
                                        }`}>
                                          <Calendar className={`w-5 h-5 ${
                                            appointment.status === 'Upcoming' ? 'text-blue-600' : 'text-green-600'
                                          }`} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900">{appointment.type}</h4>
                                            <Badge variant={appointment.status === 'Upcoming' ? 'default' : 'secondary'}>
                                              {appointment.status}
                                            </Badge>
                                          </div>
                                          <div className="space-y-1 text-sm text-gray-600">
                                            <p className="flex items-center">
                                              <Clock className="w-4 h-4 mr-2" />
                                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                              <span className="ml-2 text-xs text-gray-500">(IST: {appointment.istTime})</span>
                                            </p>
                                            <p className="flex items-center">
                                              <User className="w-4 h-4 mr-2" />
                                              {appointment.doctor}
                                            </p>
                                            <p className="flex items-center">
                                              <CreditCard className="w-4 h-4 mr-2" />
                                              ₹{appointment.price} - {appointment.paymentStatus}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row gap-2">
                                        {appointment.status === 'Upcoming' && (
                                          <Button 
                                            size="sm" 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => window.open(appointment.meetLink, '_blank')}
                                          >
                                            <Video className="w-4 h-4 mr-2" />
                                            Join Meeting
                                          </Button>
                                        )}
                                        
                                        {appointment.prescription && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleViewPrescription(appointment.id)}
                                          >
                                            <FileText className="w-4 h-4 mr-2" />
                                            {expandedPrescriptions.has(appointment.id) ? 'Hide Prescription' : 'View Prescription'}
                                          </Button>
                                        )}
                                        
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleDownloadReceipt(appointment)}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download Receipt
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Prescription Details */}
                                    {appointment.prescription && expandedPrescriptions.has(appointment.id) && (
                                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h5 className="font-medium text-blue-900 mb-2">Digital Prescription (ID: {appointment.prescription.id})</h5>
                                        <div className="space-y-2">
                                          <div>
                                            <p className="text-sm font-medium text-blue-800">Medicines:</p>
                                            <div className="space-y-1">
                                              {appointment.prescription.medicines.map((medicine, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                  <span>{medicine.name} - {medicine.dosage}</span>
                                                  <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-blue-600 hover:text-blue-800 p-1 h-auto"
                                                    onClick={() => window.open(medicine.url, '_blank')}
                                                  >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Buy Online
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-blue-800">Doctor's Advice:</p>
                                            <p className="text-sm text-blue-700">{appointment.prescription.advice}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Appointment History</CardTitle>
                      <p className="text-sm text-gray-600">View all your past and upcoming consultations</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: appointment.id * 0.1 }}
                            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-full ${
                                  appointment.status === 'Upcoming' ? 'bg-blue-100' : 'bg-green-100'
                                }`}>
                                  <Calendar className={`w-5 h-5 ${
                                    appointment.status === 'Upcoming' ? 'text-blue-600' : 'text-green-600'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{appointment.type}</h4>
                                    <Badge variant={appointment.status === 'Upcoming' ? 'default' : 'secondary'}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                      <span className="ml-2 text-xs text-gray-500">(IST: {appointment.istTime})</span>
                                    </p>
                                    <p className="flex items-center">
                                      <User className="w-4 h-4 mr-2" />
                                      {appointment.doctor}
                                    </p>
                                    <p className="flex items-center">
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      ₹{appointment.price} - {appointment.paymentStatus}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2">
                                {appointment.status === 'Upcoming' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => window.open(appointment.meetLink, '_blank')}
                                  >
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Meeting
                                  </Button>
                                )}
                                
                                {appointment.prescription && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewPrescription(appointment.id)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {expandedPrescriptions.has(appointment.id) ? 'Hide Prescription' : 'View Prescription'}
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadReceipt(appointment)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </Button>
                              </div>
                            </div>

                            {/* Prescription Details */}
                            {appointment.prescription && expandedPrescriptions.has(appointment.id) && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h5 className="font-medium text-blue-900 mb-2">Digital Prescription (ID: {appointment.prescription.id})</h5>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">Medicines:</p>
                                    <div className="space-y-1">
                                      {appointment.prescription.medicines.map((medicine: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                          <span>{medicine.name} - {medicine.dosage}</span>
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-blue-600 hover:text-blue-800 p-1 h-auto"
                                            onClick={() => window.open(medicine.url, '_blank')}
                                          >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Buy Online
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">Doctor's Advice:</p>
                                    <p className="text-sm text-blue-700">{appointment.prescription.advice}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Personal Information Content */}
                {activeTab === 'personal' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Age</Label>
                          <Input
                            type="number"
                            value={profileData.age}
                            onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Gender</Label>
                          <Select
                            value={profileData.gender}
                            onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
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

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={profileData.country}
                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Blood Type</Label>
                          <Select
                            value={profileData.bloodType}
                            onValueChange={(value) => setProfileData({ ...profileData, bloodType: value })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
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

                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Emergency Contact</Label>
                        <Input
                          value={profileData.emergencyContact}
                          onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
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