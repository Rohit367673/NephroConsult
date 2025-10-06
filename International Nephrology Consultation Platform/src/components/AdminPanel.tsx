import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Shield, Download, FileText, DollarSign, Users, Activity, Calendar as CalendarIcon, Filter, Search, Eye, ChevronDown } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const activityLogs = [
    { id: 1, timestamp: '2024-03-15 14:30', user: 'Dr. Sarah Chen', action: 'Video Consultation', patient: 'John Smith', status: 'Completed', duration: '45 min' },
    { id: 2, timestamp: '2024-03-15 13:15', user: 'John Smith', action: 'Lab Report Upload', patient: 'John Smith', status: 'Success', duration: '2 min' },
    { id: 3, timestamp: '2024-03-15 12:00', user: 'Dr. Sarah Chen', action: 'Prescription Created', patient: 'Jane Doe', status: 'Sent', duration: '5 min' },
    { id: 4, timestamp: '2024-03-15 10:45', user: 'Payment System', action: 'Payment Processed', patient: 'Mike Johnson', status: 'Success', duration: '1 min' },
    { id: 5, timestamp: '2024-03-15 09:30', user: 'Jane Doe', action: 'Appointment Booked', patient: 'Jane Doe', status: 'Confirmed', duration: '3 min' }
  ];

  const paymentRecords = [
    { id: 'PAY-001', date: '2024-03-15', patient: 'John Smith', amount: '$150.00', method: 'Credit Card', status: 'Completed', consultation: 'Video Consultation' },
    { id: 'PAY-002', date: '2024-03-15', patient: 'Jane Doe', amount: '$120.00', method: 'PayPal', status: 'Completed', consultation: 'Phone Consultation' },
    { id: 'PAY-003', date: '2024-03-14', patient: 'Mike Johnson', amount: '$100.00', method: 'Bank Transfer', status: 'Pending', consultation: 'Chat Consultation' },
    { id: 'PAY-004', date: '2024-03-14', patient: 'Sarah Wilson', amount: '$150.00', method: 'Credit Card', status: 'Failed', consultation: 'Video Consultation' }
  ];

  const stats = {
    totalConsultations: 1247,
    totalRevenue: 186750,
    activePatients: 892,
    pendingPayments: 12,
    thisMonth: {
      consultations: 156,
      revenue: 23400,
      newPatients: 67
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo authentication
    if (loginData.username === 'admin' && loginData.password === 'demo123') {
      setIsAuthenticated(true);
    } else {
      alert('Demo credentials: admin / demo123');
    }
  };

  const exportData = (type: string) => {
    // Simulate data export
    const filename = `nephrology_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    alert(`Exporting ${filename}...`);
  };

  if (!isAuthenticated) {
    return (
      <section className="py-20 bg-gray-100">
        <div className="container-medical">
          <div className="max-w-md mx-auto">
            <Card className="p-8 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#006f6f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-[#006f6f]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Admin Access</h3>
                  <p className="text-gray-600">Secure login for administrators and auditors</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      className="mt-2"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#006f6f] hover:bg-[#005555] text-white py-3 rounded-xl"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Login to Admin Panel
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Access:</strong><br />
                    Username: admin<br />
                    Password: demo123
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-100">
      <div className="container-medical">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600">Monitor platform activity and manage operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsAuthenticated(false)}
                className="border-gray-300"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalConsultations.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Consultations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.activePatients}</div>
                    <div className="text-sm text-gray-600">Active Patients</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</div>
                    <div className="text-sm text-gray-600">Pending Payments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity Logs */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Activity Logs</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportData('activity_logs')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Date Range</Label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">Last 7 days</SelectItem>
                            <SelectItem value="30days">Last 30 days</SelectItem>
                            <SelectItem value="90days">Last 90 days</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Action Type</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultations</SelectItem>
                            <SelectItem value="payment">Payments</SelectItem>
                            <SelectItem value="upload">File Uploads</SelectItem>
                            <SelectItem value="prescription">Prescriptions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Search</Label>
                        <div className="relative mt-1">
                          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <Input placeholder="Search logs..." className="pl-9" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.timestamp}</TableCell>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.patient}</TableCell>
                          <TableCell>
                            <Badge className={
                              log.status === 'Completed' || log.status === 'Success' ? 'bg-green-100 text-green-800' :
                              log.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              log.status === 'Failed' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.duration}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Reconciliation */}
          <div className="space-y-8">
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Payment Reconciliation</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('payment_reconciliation')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {paymentRecords.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{payment.id}</div>
                        <div className="text-sm text-gray-600">{payment.patient}</div>
                        <div className="text-xs text-gray-500">{payment.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{payment.amount}</div>
                        <Badge className={
                          payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Payments
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportData('all_data')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    System Health Check
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">System Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Version</span>
                    <span className="font-medium">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server Status</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};