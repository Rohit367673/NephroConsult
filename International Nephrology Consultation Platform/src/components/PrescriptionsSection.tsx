import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  X, 
  Calendar,
  Clock,
  User,
  Pill,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PrescriptionsSection = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      date: '2024-09-15',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food in the morning'
        },
        {
          name: 'Furosemide',
          dosage: '40mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take in morning and early afternoon'
        }
      ],
      notes: 'Monitor blood pressure regularly. Follow up in 4 weeks.',
      status: 'active'
    }
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const addMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [...newPrescription.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index: number) => {
    const updatedMeds = newPrescription.medications.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, medications: updatedMeds });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMeds = newPrescription.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setNewPrescription({ ...newPrescription, medications: updatedMeds });
  };

  const savePrescription = () => {
    const prescription = {
      id: prescriptions.length + 1,
      ...newPrescription,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setPrescriptions([...prescriptions, prescription]);
    setNewPrescription({
      patientName: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: ''
    });
    setIsComposerOpen(false);
  };

  const pharmacyPartners = [
    { name: 'CVS Pharmacy', logo: '🏪', link: '#', description: 'Nationwide delivery available' },
    { name: 'Walgreens', logo: '🏪', link: '#', description: 'Same-day pickup' },
    { name: 'Rite Aid', logo: '🏥', link: '#', description: 'Insurance accepted' },
    { name: 'Costco Pharmacy', logo: '🏬', link: '#', description: 'Member pricing' },
    { name: 'Amazon Pharmacy', logo: '📦', link: '#', description: 'Home delivery' },
    { name: 'Express Scripts', logo: '💊', link: '#', description: 'Mail order specialty' }
  ];

  const PrescriptionComposer = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="patientName">Patient Name *</Label>
        <Input
          id="patientName"
          placeholder="Enter patient name"
          value={newPrescription.patientName}
          onChange={(e) => setNewPrescription({ ...newPrescription, patientName: e.target.value })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Medications</Label>
          <Button onClick={addMedication} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        <div className="space-y-4">
          {newPrescription.medications.map((med, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Medication {index + 1}</h4>
                  {newPrescription.medications.length > 1 && (
                    <Button 
                      onClick={() => removeMedication(index)}
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Medication Name *</Label>
                    <Input
                      placeholder="e.g., Lisinopril"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Dosage *</Label>
                    <Input
                      placeholder="e.g., 10mg"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Frequency *</Label>
                    <Select onValueChange={(value) => updateMedication(index, 'frequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">Once daily</SelectItem>
                        <SelectItem value="twice-daily">Twice daily</SelectItem>
                        <SelectItem value="three-times-daily">Three times daily</SelectItem>
                        <SelectItem value="four-times-daily">Four times daily</SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                        <SelectItem value="every-other-day">Every other day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration *</Label>
                    <Select onValueChange={(value) => updateMedication(index, 'duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7-days">7 days</SelectItem>
                        <SelectItem value="14-days">14 days</SelectItem>
                        <SelectItem value="30-days">30 days</SelectItem>
                        <SelectItem value="60-days">60 days</SelectItem>
                        <SelectItem value="90-days">90 days</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Instructions</Label>
                    <Input
                      placeholder="e.g., Take with food in the morning"
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional instructions or notes for the patient..."
          value={newPrescription.notes}
          onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => setIsComposerOpen(false)}>
          Cancel
        </Button>
        <Button onClick={savePrescription} className="bg-primary hover:bg-primary/90">
          <FileText className="w-4 h-4 mr-2" />
          Save Prescription
        </Button>
      </div>
    </div>
  );

  const PrescriptionView = ({ prescription }: { prescription: any }) => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              {prescription.patientName}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {prescription.date}
              </span>
              <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                {prescription.status === 'active' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {prescription.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Prescribed Medications
            </h4>
            <div className="space-y-3">
              {prescription.medications.map((med: any, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{med.name}</h5>
                    <Badge variant="outline">{med.dosage}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {med.duration}
                    </div>
                  </div>
                  {med.instructions && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Instructions:</span> {med.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {prescription.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
              <p className="text-gray-600 text-sm bg-muted/50 p-3 rounded-lg">
                {prescription.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-primary hover:bg-primary/90 flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Send to Pharmacy
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="prescriptions" className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prescriptions & Medication Management</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create, manage, and track prescriptions digitally. Send prescriptions directly to pharmacies 
            or provide downloadable PDFs for your patients.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Doctor Interface */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prescription Management</CardTitle>
                  <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        New Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Prescription</DialogTitle>
                      </DialogHeader>
                      <PrescriptionComposer />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Prescription List */}
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <PrescriptionView key={prescription.id} prescription={prescription} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setIsComposerOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Prescriptions
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Prescription Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Prescriptions</span>
                    <Badge variant="secondary">{prescriptions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <Badge className="bg-green-100 text-green-800">
                      {prescriptions.filter(p => p.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <Badge variant="secondary">
                      {prescriptions.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pharmacy Partners */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Partner Pharmacies
            </CardTitle>
            <p className="text-sm text-gray-600">
              Send prescriptions directly to our partner pharmacies for convenient pickup or delivery.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pharmacyPartners.map((pharmacy, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="text-3xl">{pharmacy.logo}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                    <p className="text-sm text-gray-600">{pharmacy.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Order Medicine Online
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Prescription delivery times and availability may vary by location. 
                Insurance coverage and pricing information will be provided by the selected pharmacy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { PrescriptionsSection };