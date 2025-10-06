import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Pill, 
  Calendar, 
  Download, 
  Eye, 
  Search,
  Filter,
  Clock,
  User,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Printer
} from 'lucide-react';

export function PrescriptionView() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock prescription data
  const activePrescriptions = [
    {
      id: '1',
      date: '2024-09-10',
      doctor: 'Dr. Ilango Krishnamurthy',
      diagnosis: 'Hypertension Management',
      medications: [
        {
          name: 'Lisinopril',
          genericName: 'Lisinopril',
          strength: '10mg',
          form: 'Tablet',
          quantity: 30,
          directions: 'Take 1 tablet by mouth once daily',
          refills: 2,
          refillsUsed: 0,
          daysSupply: 30,
          lastFilled: '2024-09-10'
        },
        {
          name: 'Amlodipine',
          genericName: 'Amlodipine Besylate',
          strength: '5mg',
          form: 'Tablet',
          quantity: 30,
          directions: 'Take 1 tablet by mouth once daily',
          refills: 2,
          refillsUsed: 0,
          daysSupply: 30,
          lastFilled: '2024-09-10'
        }
      ],
      pharmacy: {
        name: 'CVS Pharmacy',
        address: '123 Main Street, City, State 12345',
        phone: '(555) 123-4567'
      },
      status: 'active',
      nextRefillDate: '2024-10-10'
    },
    {
      id: '2',
      date: '2024-08-28',
      doctor: 'Dr. Ilango Krishnamurthy',
      diagnosis: 'Kidney Function Support',
      medications: [
        {
          name: 'Losartan',
          genericName: 'Losartan Potassium',
          strength: '50mg',
          form: 'Tablet',
          quantity: 30,
          directions: 'Take 1 tablet by mouth once daily',
          refills: 1,
          refillsUsed: 1,
          daysSupply: 30,
          lastFilled: '2024-09-28'
        }
      ],
      pharmacy: {
        name: 'Walgreens',
        address: '456 Oak Avenue, City, State 12345',
        phone: '(555) 987-6543'
      },
      status: 'needs-refill',
      nextRefillDate: '2024-10-28'
    }
  ];

  const pastPrescriptions = [
    {
      id: '3',
      date: '2024-08-15',
      doctor: 'Dr. Ilango Krishnamurthy',
      diagnosis: 'Initial Kidney Management',
      medications: [
        {
          name: 'Furosemide',
          genericName: 'Furosemide',
          strength: '20mg',
          form: 'Tablet',
          quantity: 30,
          directions: 'Take 1 tablet by mouth twice daily',
          refills: 0,
          refillsUsed: 0,
          daysSupply: 15,
          lastFilled: '2024-08-15'
        }
      ],
      pharmacy: {
        name: 'CVS Pharmacy',
        address: '123 Main Street, City, State 12345',
        phone: '(555) 123-4567'
      },
      status: 'completed',
      completedDate: '2024-08-30'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'needs-refill':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Refill</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const PrescriptionCard = ({ prescription, showRefillButton = false }: { prescription: any, showRefillButton?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">Prescription #{prescription.id}</CardTitle>
              {getStatusBadge(prescription.status)}
            </div>
            <CardDescription className="space-y-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Prescribed: {prescription.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{prescription.doctor}</span>
                </span>
              </div>
              <p className="text-sm">Diagnosis: {prescription.diagnosis}</p>
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medications */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Medications</h4>
          <div className="space-y-4">
            {prescription.medications.map((med: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="font-semibold text-foreground">{med.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {med.genericName} • {med.strength} • {med.form}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Directions:</strong> {med.directions}
                    </p>
                  </div>
                  {showRefillButton && med.refills > med.refillsUsed && (
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Refill
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{med.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Days Supply</p>
                    <p className="font-medium">{med.daysSupply} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Refills</p>
                    <p className="font-medium">{med.refills - med.refillsUsed} of {med.refills}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Filled</p>
                    <p className="font-medium">{med.lastFilled}</p>
                  </div>
                </div>

                {prescription.status === 'needs-refill' && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      This medication needs to be refilled by {prescription.nextRefillDate}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pharmacy Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-foreground mb-3">Pharmacy Information</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="font-medium text-foreground">{prescription.pharmacy.name}</p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{prescription.pharmacy.address}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{prescription.pharmacy.phone}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {prescription.status === 'active' && prescription.nextRefillDate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next refill available</span>
              <span className="font-medium text-foreground">{prescription.nextRefillDate}</span>
            </div>
          </div>
        )}

        {prescription.status === 'completed' && prescription.completedDate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed on</span>
              <span className="font-medium text-foreground">{prescription.completedDate}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Prescriptions</h1>
          <p className="text-muted-foreground">
            View and manage your digital prescriptions from Dr. Ilango
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activePrescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activePrescriptions.filter(p => p.status === 'needs-refill').length}
                </p>
                <p className="text-sm text-muted-foreground">Need Refill</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activePrescriptions.reduce((total, p) => total + p.medications.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Active Prescriptions</span>
            <Badge variant="secondary" className="ml-1">
              {activePrescriptions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Past Prescriptions</span>
            <Badge variant="secondary" className="ml-1">
              {pastPrescriptions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Active Prescriptions */}
        <TabsContent value="active" className="space-y-6">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No active prescriptions</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active prescriptions at the moment.
                </p>
                <Button asChild>
                  <Link to="/patient/book-appointment">Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activePrescriptions.map((prescription) => (
                <PrescriptionCard 
                  key={prescription.id} 
                  prescription={prescription} 
                  showRefillButton={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Prescriptions */}
        <TabsContent value="past" className="space-y-6">
          {pastPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No past prescriptions</h3>
                <p className="text-muted-foreground">
                  Your completed prescriptions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pastPrescriptions.map((prescription) => (
                <PrescriptionCard 
                  key={prescription.id} 
                  prescription={prescription}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}