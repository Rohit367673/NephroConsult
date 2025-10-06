import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { 
  Bell, 
  Calendar, 
  FileText, 
  Pill, 
  Video,
  Settings,
  Check,
  Trash2,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

export function PatientNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'appointment',
      title: 'Upcoming Appointment Reminder',
      message: 'Your video consultation with Dr. Ilango is scheduled for tomorrow at 10:00 AM.',
      timestamp: '2024-09-17T10:00:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'prescription',
      title: 'Prescription Ready',
      message: 'Your prescription for Lisinopril is ready for pickup at CVS Pharmacy.',
      timestamp: '2024-09-16T14:30:00Z',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'lab-results',
      title: 'Lab Results Available',
      message: 'Your recent blood work results have been reviewed by Dr. Ilango and are now available.',
      timestamp: '2024-09-15T09:15:00Z',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your emergency contact information in your profile.',
      timestamp: '2024-09-14T16:45:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your follow-up appointment on September 25th has been confirmed.',
      timestamp: '2024-09-13T11:20:00Z',
      read: true,
      priority: 'medium'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    prescriptionAlerts: true,
    labResultsNotifications: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'prescription':
        return <Pill className="h-5 w-5 text-green-600" />;
      case 'lab-results':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'video-call':
        return <Video className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your health care notifications and manage your preferences
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up! New notifications will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications about your health care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-foreground">Email Notifications</label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-foreground">SMS Notifications</label>
                      <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-foreground mb-4">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <label className="font-medium text-foreground">Appointment Reminders</label>
                        <p className="text-sm text-muted-foreground">Reminders about upcoming appointments</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => handleSettingChange('appointmentReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className="h-5 w-5 text-green-600" />
                      <div>
                        <label className="font-medium text-foreground">Prescription Alerts</label>
                        <p className="text-sm text-muted-foreground">Updates about prescriptions and refills</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.prescriptionAlerts}
                      onCheckedChange={(checked) => handleSettingChange('prescriptionAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <label className="font-medium text-foreground">Lab Results</label>
                        <p className="text-sm text-muted-foreground">Notifications when lab results are available</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.labResultsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('labResultsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <div>
                        <label className="font-medium text-foreground">System Updates</label>
                        <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-orange-600" />
                      <div>
                        <label className="font-medium text-foreground">Marketing Emails</label>
                        <p className="text-sm text-muted-foreground">Health tips and promotional content</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Button className="w-full">
                  Save Notification Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}