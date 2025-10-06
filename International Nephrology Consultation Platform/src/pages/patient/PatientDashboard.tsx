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
  FileText, 
  Clock, 
  CheckCircle, 
  User, 
  Bell,
  ArrowRight,
  Heart,
  Activity,
  Pill,
  Upload,
  Video
} from 'lucide-react';

export function PatientDashboard() {
  const { user } = useAuth();

  // Mock data for dashboard
  const upcomingAppointments = [
    {
      id: '1',
      date: '2024-09-18',
      time: '10:00 AM',
      doctor: 'Dr. Ilango',
      type: 'Video Consultation',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2024-09-25',
      time: '2:30 PM',
      doctor: 'Dr. Ilango',
      type: 'Follow-up Consultation',
      status: 'pending'
    }
  ];

  const recentPrescriptions = [
    {
      id: '1',
      date: '2024-09-10',
      diagnosis: 'Hypertension Management',
      status: 'ready',
      medications: 3
    },
    {
      id: '2',
      date: '2024-08-28',
      diagnosis: 'Kidney Function Follow-up',
      status: 'downloaded',
      medications: 2
    }
  ];

  const healthMetrics = {
    bloodPressure: { value: '130/85', status: 'moderate', trend: 'stable' },
    creatinine: { value: '1.2 mg/dL', status: 'normal', trend: 'improving' },
    lastVisit: '10 days ago',
    nextAppointment: '2 days'
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
              Here's an overview of your kidney health journey and upcoming appointments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/patient/book-appointment">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/patient/medical-history">
                <FileText className="h-4 w-4 mr-2" />
                View History
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Completed Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pill className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">New Prescription</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Good</p>
                <p className="text-sm text-muted-foreground">Health Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Upcoming Appointments</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled consultations with Dr. Ilango
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/patient/book-appointment">
                  Book New
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-sm text-muted-foreground">with {appointment.doctor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                    {appointment.status === 'confirmed' && (
                      <Button size="sm">Join Call</Button>
                    )}
                  </div>
                </div>
              ))}
              
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button className="mt-4" asChild>
                    <Link to="/patient/book-appointment">Book Your First Appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <span>Recent Prescriptions</span>
                </CardTitle>
                <CardDescription>
                  Your latest prescriptions and treatment plans
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/patient/medical-history">
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{prescription.diagnosis}</p>
                      <p className="text-sm text-muted-foreground">{prescription.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.medications} medications prescribed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={prescription.status === 'ready' ? 'default' : 'secondary'}>
                      {prescription.status === 'ready' ? 'Ready' : 'Downloaded'}
                    </Badge>
                    {prescription.status === 'ready' && (
                      <Button size="sm" variant="outline">
                        <Link to={`/patient/prescription/${prescription.id}`}>
                          View
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Health Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Blood Pressure</span>
                  <span className="text-sm text-muted-foreground">{healthMetrics.bloodPressure.value}</span>
                </div>
                <Progress value={70} className="h-2" />
                <p className="text-xs text-muted-foreground">Target: &lt;130/80 mmHg</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Creatinine</span>
                  <span className="text-sm text-muted-foreground">{healthMetrics.creatinine.value}</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground">Normal range</p>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Visit</span>
                    <span className="font-medium text-foreground">{healthMetrics.lastVisit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Appointment</span>
                    <span className="font-medium text-foreground">in {healthMetrics.nextAppointment}</span>
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
                <Link to="/patient/book-appointment">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Lab Report
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/patient/profile">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/patient/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is here to assist you 24/7
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}