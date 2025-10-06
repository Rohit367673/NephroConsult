import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Send, 
  Save,
  User,
  Calendar,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  instructions: string;
  link?: string;
}

export function PrescriptionWriter() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  
  const [prescription, setPrescription] = useState({
    patientName: '',
    patientEmail: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    notes: '',
    followUpDate: '',
    followUpInstructions: ''
  });

  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      timing: 'After meals',
      instructions: '',
      link: ''
    }
  ]);

  // Load appointment details
  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAppointment(data.appointment);
        setPrescription(prev => ({
          ...prev,
          patientName: data.appointment?.patient?.name || '',
          patientEmail: data.appointment?.patient?.email || ''
        }));
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
    }
  };

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      timing: 'After meals',
      instructions: '',
      link: ''
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async (sendToPatient: boolean = false) => {
    setLoading(true);
    
    try {
      const prescriptionData = {
        ...prescription,
        medicines: medicines.filter(m => m.name), // Only include medicines with names
        appointmentId,
        sendEmail: sendToPatient
      };

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prescriptionData)
      });

      if (res.ok) {
        if (sendToPatient) {
          toast.success('✅ Prescription sent to patient successfully!');
        } else {
          toast.success('✅ Prescription saved as draft!');
        }
        
        // Navigate back to appointments or dashboard
        setTimeout(() => {
          navigate('/doctor/appointments');
        }, 1500);
      } else {
        throw new Error('Failed to save prescription');
      }
    } catch (error) {
      toast.error('❌ Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Digital Prescription
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and send prescriptions to your patients
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit(true)} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              Send to Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Patient Name</Label>
            <Input 
              value={prescription.patientName}
              onChange={(e) => setPrescription({...prescription, patientName: e.target.value})}
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              type="email"
              value={prescription.patientEmail}
              onChange={(e) => setPrescription({...prescription, patientEmail: e.target.value})}
              placeholder="patient@example.com"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input 
              type="date"
              value={prescription.date}
              onChange={(e) => setPrescription({...prescription, date: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis & Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Diagnosis & Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Diagnosis</Label>
            <Input 
              value={prescription.diagnosis}
              onChange={(e) => setPrescription({...prescription, diagnosis: e.target.value})}
              placeholder="e.g., Chronic Kidney Disease Stage 3"
            />
          </div>
          <div>
            <Label>Symptoms / Complaints</Label>
            <Textarea 
              value={prescription.symptoms}
              onChange={(e) => setPrescription({...prescription, symptoms: e.target.value})}
              placeholder="Describe patient's symptoms and complaints..."
              rows={3}
            />
          </div>
          <div>
            <Label>Clinical Notes</Label>
            <Textarea 
              value={prescription.notes}
              onChange={(e) => setPrescription({...prescription, notes: e.target.value})}
              placeholder="Additional clinical observations and notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescribed Medicines
            </CardTitle>
            <Button onClick={addMedicine} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicines.map((medicine, index) => (
            <div key={medicine.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Medicine {index + 1}</Badge>
                {medicines.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedicine(medicine.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Medicine Name</Label>
                  <Input 
                    value={medicine.name}
                    onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                    placeholder="e.g., Amlodipine"
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input 
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                    placeholder="e.g., 5mg"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select 
                    value={medicine.frequency}
                    onValueChange={(value) => updateMedicine(medicine.id, 'frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                      <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input 
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                    placeholder="e.g., 30 days"
                  />
                </div>
                <div>
                  <Label>Timing</Label>
                  <Select 
                    value={medicine.timing}
                    onValueChange={(value) => updateMedicine(medicine.id, 'timing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before meals">Before meals</SelectItem>
                      <SelectItem value="After meals">After meals</SelectItem>
                      <SelectItem value="With meals">With meals</SelectItem>
                      <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                      <SelectItem value="Bedtime">Bedtime</SelectItem>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Medicine Link (Optional)</Label>
                  <Input 
                    value={medicine.link}
                    onChange={(e) => updateMedicine(medicine.id, 'link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label>Special Instructions</Label>
                <Textarea 
                  value={medicine.instructions}
                  onChange={(e) => updateMedicine(medicine.id, 'instructions', e.target.value)}
                  placeholder="Any special instructions for this medicine..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Follow-up Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Follow-up Date</Label>
              <Input 
                type="date"
                value={prescription.followUpDate}
                onChange={(e) => setPrescription({...prescription, followUpDate: e.target.value})}
              />
            </div>
            <div>
              <Label>Follow-up Instructions</Label>
              <Input 
                value={prescription.followUpInstructions}
                onChange={(e) => setPrescription({...prescription, followUpInstructions: e.target.value})}
                placeholder="e.g., Blood test required before next visit"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={loading}>
          <Send className="h-4 w-4 mr-2" />
          Send to Patient
        </Button>
      </div>
    </div>
  );
}
