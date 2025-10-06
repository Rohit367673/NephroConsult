import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Video,
  ArrowRight,
  TrendingUp,
  Activity,
  FileText,
  Bell,
  Star
} from 'lucide-react';

export function DoctorDashboard() {
  const { user } = useAuth();

  // Mock data for doctor dashboard
  const todayAppointments = [
    {
      id: '1',
      time: '10:00 AM',
      patient: 'John Doe',
      type: 'Video Consultation',
      status: 'upcoming',
      duration: 30,
      condition: 'Hypertension Follow-up'
    },
    {
      id: '2',
      time: '2:30 PM',
      patient: 'Sarah Johnson',
      type: 'Initial Consultation',
      status: 'upcoming',
      duration: 45,
      condition: 'Kidney Function Assessment'
    },
    {
      id: '3',
      time: '4:00 PM',
      patient: 'Mike Wilson',
      type: 'Follow-up',
      status: 'upcoming',
      duration: 30,
      condition: 'Medication Review'
    }
  ];

  const recentPatients = [
    {
      id: '1',
      name: 'John Doe',
      lastVisit: '2024-09-10',
      condition: 'Hypertension',
      status: 'stable',
      nextAppointment: '2024-09-18'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      lastVisit: '2024-09-08',
      condition: 'CKD Stage 2',
      status: 'monitoring',
      nextAppointment: '2024-09-22'
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      lastVisit: '2024-09-05',
      condition: 'Diabetes Nephropathy',
      status: 'improving',
      nextAppointment: '2024-10-05'
    }
  ];

  const stats = {
    todayAppointments: 3,
    totalPatients: 124,
    monthlyEarnings: 12500,
    completedConsultations: 89,
    patientSatisfaction: 4.9,
    averageConsultationTime: 28
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'improving':
        return 'bg-blue-100 text-blue-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name}
            </h1>
            <p className="text-muted-foreground">
              Here's your practice overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/doctor/appointments">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/doctor/patients">
                <Users className="h-4 w-4 mr-2" />
                Patient List
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.todayAppointments}</p>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${stats.monthlyEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completedConsultations}</p>
                <p className="text-sm text-muted-foreground">Completed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Today's Schedule</span>
                </CardTitle>
                <CardDescription>
                  Your appointments for today
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/doctor/appointments">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">{appointment.condition}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.type} • {appointment.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium text-foreground">{appointment.time}</p>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <Button size="sm">Join Call</Button>
                  </div>
                </div>
              ))}
              
              {todayAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Recent Patients</span>
                </CardTitle>
                <CardDescription>
                  Patients you've recently consulted with
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/doctor/patients">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.condition}</p>
                      <p className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Records
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Performance Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Patient Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{stats.patientSatisfaction}/5.0</span>
                  </div>
                </div>
                <Progress value={98} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Avg. Consultation Time</span>
                  <span className="text-sm font-medium">{stats.averageConsultationTime} min</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Monthly Goal</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium text-foreground">{stats.completedConsultations} consultations</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/doctor/appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Prescription
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Patient Records
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Monthly Earnings</h3>
                  <p className="text-2xl font-bold text-primary">${stats.monthlyEarnings.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultations</span>
                  <span className="font-medium">${(stats.monthlyEarnings * 0.9).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fees</span>
                  <span className="font-medium">-${(stats.monthlyEarnings * 0.1).toLocaleString()}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                View Detailed Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}