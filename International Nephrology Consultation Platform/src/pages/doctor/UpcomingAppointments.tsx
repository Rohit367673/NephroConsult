import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Calendar, 
  Video, 
  Clock, 
  User,
  Search,
  Filter,
  Phone,
  MessageSquare,
  FileText,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';

export function UpcomingAppointments() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock appointment data
  const todayAppointments = [
    {
      id: '1',
      time: '10:00 AM',
      patient: {
        name: 'John Doe',
        age: 45,
        gender: 'Male',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com'
      },
      type: 'Video Consultation',
      status: 'confirmed',
      duration: 30,
      condition: 'Hypertension Follow-up',
      notes: 'Patient reports improved symptoms with current medication',
      isFirstTime: false,
      timezone: 'EST'
    },
    {
      id: '2',
      time: '2:30 PM',
      patient: {
        name: 'Sarah Johnson',
        age: 38,
        gender: 'Female',
        phone: '+1 (555) 987-6543',
        email: 'sarah.johnson@email.com'
      },
      type: 'Initial Consultation',
      status: 'confirmed',
      duration: 45,
      condition: 'Kidney Function Assessment',
      notes: 'New patient with elevated creatinine levels',
      isFirstTime: true,
      timezone: 'PST'
    },
    {
      id: '3',
      time: '4:00 PM',
      patient: {
        name: 'Mike Wilson',
        age: 52,
        gender: 'Male',
        phone: '+1 (555) 456-7890',
        email: 'mike.wilson@email.com'
      },
      type: 'Follow-up',
      status: 'pending',
      duration: 30,
      condition: 'Medication Review',
      notes: 'Review side effects of current ACE inhibitor',
      isFirstTime: false,
      timezone: 'CST'
    }
  ];

  const upcomingAppointments = [
    {
      id: '4',
      date: '2024-09-19',
      time: '9:00 AM',
      patient: {
        name: 'Emily Davis',
        age: 29,
        gender: 'Female',
        phone: '+1 (555) 234-5678',
        email: 'emily.davis@email.com'
      },
      type: 'Video Consultation',
      status: 'confirmed',
      duration: 30,
      condition: 'Pregnancy-related kidney concerns',
      notes: 'Routine monitoring during pregnancy',
      isFirstTime: false,
      timezone: 'EST'
    },
    {
      id: '5',
      date: '2024-09-20',
      time: '11:30 AM',
      patient: {
        name: 'Robert Brown',
        age: 67,
        gender: 'Male',
        phone: '+1 (555) 345-6789',
        email: 'robert.brown@email.com'
      },
      type: 'Follow-up',
      status: 'confirmed',
      duration: 30,
      condition: 'Chronic Kidney Disease Stage 3',
      notes: 'Quarterly follow-up, check lab results',
      isFirstTime: false,
      timezone: 'PST'
    },
    {
      id: '6',
      date: '2024-09-22',
      time: '3:00 PM',
      patient: {
        name: 'Lisa Anderson',
        age: 41,
        gender: 'Female',
        phone: '+1 (555) 567-8901',
        email: 'lisa.anderson@email.com'
      },
      type: 'Initial Consultation',
      status: 'pending',
      duration: 45,
      condition: 'Diabetic Nephropathy',
      notes: 'Referred by endocrinologist for kidney evaluation',
      isFirstTime: true,
      timezone: 'MST'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment, showDate = false }: { appointment: any, showDate?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {appointment.patient.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-foreground">{appointment.patient.name}</h3>
                  {appointment.isFirstTime && (
                    <Badge variant="outline" className="text-xs">First Time</Badge>
                  )}
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.patient.age} years old • {appointment.patient.gender}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {showDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time} ({appointment.timezone})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{appointment.duration} min</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-foreground">{appointment.condition}</p>
                  <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground italic">"{appointment.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{appointment.patient.phone}</span>
                <span>•</span>
                <span>{appointment.patient.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {appointment.status === 'confirmed' && (
              <Button size="sm" className="min-w-[100px]">
                <Video className="h-4 w-4 mr-2" />
                Join Call
              </Button>
            )}
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your consultation schedule and patient appointments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {[...todayAppointments, ...upcomingAppointments].filter(a => a.status === 'confirmed').length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {[...todayAppointments, ...upcomingAppointments].filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {[...todayAppointments, ...upcomingAppointments].filter(a => a.isFirstTime).length}
                </p>
                <p className="text-sm text-muted-foreground">New Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Today</span>
            <Badge variant="secondary" className="ml-1">
              {todayAppointments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming</span>
            <Badge variant="secondary" className="ml-1">
              {upcomingAppointments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Today's Appointments */}
        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Schedule</span>
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No appointments today</h3>
                  <p className="text-muted-foreground">Enjoy your free day!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </CardTitle>
              <CardDescription>
                Your scheduled consultations for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming appointments</h3>
                  <p className="text-muted-foreground">Your schedule is clear for the upcoming days.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} showDate={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}