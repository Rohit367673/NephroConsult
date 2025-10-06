import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  Plus,
  Send,
  ExternalLink,
  Stethoscope,
  Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Enhanced mock data for consultations with patient details
const mockConsultations = [
  {
    id: '1',
    patientName: 'John Doe',
    patientEmail: 'john.doe@email.com',
    patientPhone: '+1-555-0123',
    patientAge: 45,
    patientAddress: '123 Main St, New York, NY 10001',
    consultationType: 'initial',
    date: '2025-10-03',
    time: '14:00',
    istTime: '18:30',
    status: 'scheduled',
    urgency: 'normal',
    timezone: 'America/New_York',
    country: 'US',
    price: 150,
    currency: 'USD',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    medicalHistory: 'Hypertension, family history of kidney disease',
    currentMedications: 'Lisinopril 10mg daily',
    labReports: [
      { name: 'Blood Test Report', date: '2025-09-25', url: '#' },
      { name: 'Kidney Function Test', date: '2025-09-20', url: '#' }
    ],
    queries: 'Experiencing frequent urination and fatigue. Blood pressure has been elevated recently.'
  },
  {
    id: '2',
    patientName: 'Priya Sharma',
    patientEmail: 'priya.sharma@email.com',
    patientPhone: '+91-9876543210',
    patientAge: 38,
    patientAddress: 'Bandra West, Mumbai, Maharashtra 400050',
    consultationType: 'urgent',
    date: '2025-10-02',
    time: '16:30',
    istTime: '21:00',
    status: 'completed',
    urgency: 'urgent',
    timezone: 'Asia/Kolkata',
    country: 'IN',
    price: 3750,
    currency: 'INR',
    meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    medicalHistory: 'Diabetes Type 2, chronic kidney disease stage 3',
    currentMedications: 'Metformin 500mg twice daily, Ramipril 5mg',
    labReports: [
      { name: 'Creatinine Test', date: '2025-09-28', url: '#' },
      { name: 'HbA1c Report', date: '2025-09-25', url: '#' }
    ],
    queries: 'Sudden swelling in legs and decreased urine output. Very concerned.',
    prescription: {
      id: 'RX002',
      medicines: [
        { name: 'Furosemide 40mg', dosage: '1 tablet twice daily', url: 'https://1mg.com/drugs/furosemide' },
        { name: 'Potassium Chloride', dosage: '1 tablet daily', url: 'https://1mg.com/drugs/potassium-chloride' }
      ],
      advice: 'Reduce salt intake. Monitor weight daily. Follow up in 1 week.',
      followUpDate: '2025-10-09'
    }
  },
  {
    id: '3',
    patientName: 'Sarah Johnson',
    patientEmail: 'sarah.j@email.com',
    patientPhone: '+44-20-7946-0958',
    patientAge: 52,
    patientAddress: 'Kensington, London SW7 2AZ, UK',
    consultationType: 'followup',
    date: '2025-10-04',
    time: '10:00',
    istTime: '14:30',
    status: 'scheduled',
    urgency: 'normal',
    timezone: 'Europe/London',
    country: 'GB',
    price: 120,
    currency: 'GBP',
    meetLink: 'https://meet.google.com/def-ghij-klm',
    medicalHistory: 'Previous kidney stones, recurrent UTIs',
    currentMedications: 'Citrate supplements, increased water intake',
    labReports: [
      { name: 'Urine Analysis', date: '2025-09-30', url: '#' }
    ],
    queries: 'Follow-up on kidney stone prevention. Any dietary changes needed?'
  }
];

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: 'patient',
    country: 'US',
    joinDate: '2025-09-15',
    consultations: 3,
    lastActive: '2025-10-01'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    role: 'patient',
    country: 'IN',
    joinDate: '2025-08-20',
    consultations: 5,
    lastActive: '2025-10-02'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    role: 'patient',
    country: 'GB',
    joinDate: '2025-09-30',
    consultations: 1,
    lastActive: '2025-10-01'
  }
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [consultations, setConsultations] = useState(mockConsultations);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medicines: [{ name: '', dosage: '', url: '' }],
    advice: '',
    followUpDate: ''
  });

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Filter consultations based on search and status
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalConsultations: consultations.length,
    scheduledConsultations: consultations.filter(c => c.status === 'scheduled').length,
    completedConsultations: consultations.filter(c => c.status === 'completed').length,
    totalUsers: users.length,
    totalRevenue: consultations.reduce((sum, c) => sum + c.price, 0),
    urgentConsultations: consultations.filter(c => c.urgency === 'urgent').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'consultations', label: 'Consultations', icon: Calendar },
            { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
            { id: 'users', label: 'Users', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#006f6f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Consultations',
                  value: stats.totalConsultations,
                  icon: Calendar,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-100'
                },
                {
                  title: 'Scheduled Today',
                  value: stats.scheduledConsultations,
                  icon: Clock,
                  color: 'text-green-600',
                  bgColor: 'bg-green-100'
                },
                {
                  title: 'Total Users',
                  value: stats.totalUsers,
                  icon: Users,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-100'
                },
                {
                  title: 'Urgent Cases',
                  value: stats.urgentConsultations,
                  icon: AlertCircle,
                  color: 'text-red-600',
                  bgColor: 'bg-red-100'
                }
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultations.slice(0, 5).map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(consultation.status)}`}>
                          {getStatusIcon(consultation.status)}
                        </div>
                        <div>
                          <p className="font-medium">{consultation.patientName}</p>
                          <p className="text-sm text-gray-600">{consultation.consultationType} - {consultation.date}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'consultations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by patient name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Consultations Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Consultations ({filteredConsultations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Patient</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Date & Time</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Price</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConsultations.map((consultation) => (
                        <tr key={consultation.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{consultation.patientName}</p>
                              <p className="text-sm text-gray-600">{consultation.patientEmail}</p>
                              <p className="text-xs text-gray-500">{consultation.country}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {consultation.consultationType}
                            </Badge>
                            {consultation.urgency === 'urgent' && (
                              <Badge className="ml-2 bg-red-100 text-red-800">
                                Urgent
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{consultation.date}</p>
                              <p className="text-sm text-gray-600">
                                {consultation.time} ({consultation.timezone})
                              </p>
                              <p className="text-xs text-gray-500">
                                IST: {consultation.istTime}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(consultation.status)}>
                              {consultation.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">
                              {consultation.currency === 'INR' ? '₹' : 
                               consultation.currency === 'USD' ? '$' :
                               consultation.currency === 'EUR' ? '€' :
                               consultation.currency === 'GBP' ? '£' : ''}
                              {consultation.price}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">User</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium">Country</th>
                        <th className="text-left p-4 font-medium">Join Date</th>
                        <th className="text-left p-4 font-medium">Consultations</th>
                        <th className="text-left p-4 font-medium">Last Active</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">{user.country}</td>
                          <td className="p-4">{user.joinDate}</td>
                          <td className="p-4">{user.consultations}</td>
                          <td className="p-4">{user.lastActive}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
