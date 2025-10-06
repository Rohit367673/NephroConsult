import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Save,
  Camera,
  Shield,
  Bell,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    medicalConditions: user?.medicalConditions?.join(', ') || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        ...formData,
        medicalConditions: formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c)
      };
      
      const success = await updateProfile(updateData);
      if (success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      medicalConditions: user?.medicalConditions?.join(', ') || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and medical details</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative mx-auto w-fit">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  Patient Account
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consultations</span>
                  <span className="font-medium">8 completed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last visit</span>
                  <span className="font-medium">10 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Your basic personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background disabled:opacity-50"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="min-h-[80px]"
                  placeholder="Your full address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Your medical history and conditions for better care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                  placeholder="List your medical conditions separated by commas (e.g., Hypertension, Diabetes)"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple conditions with commas
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important Note</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Please ensure your medical information is accurate and up-to-date. 
                      This helps Dr. Ilango provide you with the best possible care.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}