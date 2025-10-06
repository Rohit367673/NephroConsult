import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft,
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserCheck,
  FileText,
  Settings
} from 'lucide-react';

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for admin dashboard
  const stats = {
    totalPatients: 1247,
    activeConsultations: 23,
    totalRevenue: 89450,
    completedConsultations: 856
  };

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      user: 'John Doe',
      action: 'Booked consultation',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'payment',
      user: 'Sarah Johnson',
      action: 'Payment processed',
      amount: '$150',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'consultation',
      user: 'Dr. Ilango',
      action: 'Completed consultation',
      time: '12 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'registration',
      user: 'Maria Rodriguez',
      action: 'New patient registration',
      time: '1 hour ago',
      status: 'completed'
    }
  ];

  const appointments = [
    {
      id: 'APT001',
      patient: 'John Doe',
      doctor: 'Dr. Ilango',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Video Consultation',
      status: 'scheduled',
      amount: '$150'
    },
    {
      id: 'APT002',
      patient: 'Sarah Johnson',
      doctor: 'Dr. Ilango',
      date: '2024-01-15',
      time: '2:00 PM',
      type: 'Follow-up',
      status: 'completed',
      amount: '$100'
    },
    {
      id: 'APT003',
      patient: 'Ahmed Hassan',
      doctor: 'Dr. Ilango',
      date: '2024-01-16',
      time: '9:00 AM',
      type: 'Initial Consultation',
      status: 'in-progress',
      amount: '$200'
    }
  ];

  const patients = [
    {
      id: 'PAT001',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2024-01-10',
      consultations: 3,
      status: 'active'
    },
    {
      id: 'PAT002',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 987-6543',
      joinDate: '2024-01-08',
      consultations: 5,
      status: 'active'
    },
    {
      id: 'PAT003',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      phone: '+1 (555) 456-7890',
      joinDate: '2024-01-12',
      consultations: 1,
      status: 'new'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'completed': { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      'scheduled': { color: 'bg-purple-100 text-purple-800', label: 'Scheduled' },
      'in-progress': { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
      'new': { color: 'bg-gray-100 text-gray-800', label: 'New' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Main</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Platform management and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+12% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Consultations</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeConsultations}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600">Real-time data</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+8% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed Consultations</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedConsultations}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">98% satisfaction rate</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest platform activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {activity.type === 'appointment' && <Calendar className="h-5 w-5 text-primary" />}
                            {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-primary" />}
                            {activity.type === 'consultation' && <Activity className="h-5 w-5 text-primary" />}
                            {activity.type === 'registration' && <Users className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.user}</p>
                            <p className="text-sm text-gray-600">{activity.action}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {activity.amount && <span className="font-medium text-green-600">{activity.amount}</span>}
                            {getStatusBadge(activity.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Appointments Management</CardTitle>
                      <CardDescription>View and manage all appointments</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search appointments..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-900">ID</th>
                          <th className="text-left p-3 font-medium text-gray-900">Patient</th>
                          <th className="text-left p-3 font-medium text-gray-900">Doctor</th>
                          <th className="text-left p-3 font-medium text-gray-900">Date & Time</th>
                          <th className="text-left p-3 font-medium text-gray-900">Type</th>
                          <th className="text-left p-3 font-medium text-gray-900">Status</th>
                          <th className="text-left p-3 font-medium text-gray-900">Amount</th>
                          <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm">{appointment.id}</td>
                            <td className="p-3">{appointment.patient}</td>
                            <td className="p-3">{appointment.doctor}</td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{appointment.date}</p>
                                <p className="text-sm text-gray-600">{appointment.time}</p>
                              </div>
                            </td>
                            <td className="p-3">{appointment.type}</td>
                            <td className="p-3">{getStatusBadge(appointment.status)}</td>
                            <td className="p-3 font-medium text-green-600">{appointment.amount}</td>
                            <td className="p-3">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Patient Management</CardTitle>
                      <CardDescription>View and manage patient records</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search patients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-900">ID</th>
                          <th className="text-left p-3 font-medium text-gray-900">Name</th>
                          <th className="text-left p-3 font-medium text-gray-900">Email</th>
                          <th className="text-left p-3 font-medium text-gray-900">Phone</th>
                          <th className="text-left p-3 font-medium text-gray-900">Join Date</th>
                          <th className="text-left p-3 font-medium text-gray-900">Consultations</th>
                          <th className="text-left p-3 font-medium text-gray-900">Status</th>
                          <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <tr key={patient.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm">{patient.id}</td>
                            <td className="p-3 font-medium">{patient.name}</td>
                            <td className="p-3 text-blue-600">{patient.email}</td>
                            <td className="p-3">{patient.phone}</td>
                            <td className="p-3">{patient.joinDate}</td>
                            <td className="p-3 text-center">{patient.consultations}</td>
                            <td className="p-3">{getStatusBadge(patient.status)}</td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
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
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Security</CardTitle>
                    <CardDescription>Security and compliance overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">HIPAA Compliance</p>
                          <p className="text-sm text-green-700">Active and monitored</p>
                        </div>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">SSL Encryption</p>
                          <p className="text-sm text-blue-700">256-bit encryption active</p>
                        </div>
                      </div>
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">Security Audit</p>
                          <p className="text-sm text-yellow-700">Due in 30 days</p>
                        </div>
                      </div>
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>Platform performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Server Uptime</span>
                          <span>99.9%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Time</span>
                          <span>&lt; 200ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>User Satisfaction</span>
                          <span>98.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98.2%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}