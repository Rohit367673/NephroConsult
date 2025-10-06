import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Eye, EyeOff, Heart, Stethoscope, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Patient specific
    dateOfBirth: '',
    gender: '',
    // Doctor specific
    specialization: '',
    experience: '',
    qualifications: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return 'Please fill in all required fields.';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (activeTab === 'patient' && (!formData.dateOfBirth || !formData.gender)) {
      return 'Please complete all patient information fields.';
    }
    
    if (activeTab === 'doctor' && (!formData.specialization || !formData.experience)) {
      return 'Please complete all doctor information fields.';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: activeTab as 'patient' | 'doctor',
        ...(activeTab === 'patient' && {
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        }),
        ...(activeTab === 'doctor' && {
          specialization: formData.specialization,
          experience: parseInt(formData.experience),
          qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(q => q)
        })
      };

      const success = await register(userData);
      
      if (success) {
        toast.success(`Account created successfully! Welcome to NephroConsult.`);
        navigate(activeTab === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      } else {
        setError('An account with this email already exists.');
        toast.error('Signup failed. Please try with a different email.');
      }
    } catch (error) {
      setError('An error occurred during signup. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-20 bg-gradient-to-br from-primary/5 via-white to-accent/20 min-h-screen">
      <div className="container-medical">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Join NephroConsult</h1>
            <p className="text-muted-foreground mt-2">
              Create your account to access expert kidney care services
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Choose your account type and fill in your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Patient</span>
                  </TabsTrigger>
                  <TabsTrigger value="doctor" className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Doctor</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="patient" className="space-y-2">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Patient Account Benefits</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Book video consultations with Dr. Ilango</li>
                          <li>• Upload and manage your lab reports</li>
                          <li>• Receive digital prescriptions</li>
                          <li>• Track your medical history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="doctor" className="space-y-2">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Doctor Account Features</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Manage patient appointments</li>
                          <li>• Create and send prescriptions</li>
                          <li>• Review patient medical history</li>
                          <li>• Track consultation earnings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Basic Information</h4>
                  
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Patient Specific Fields */}
                {activeTab === 'patient' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Patient Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                          Date of Birth *
                        </label>
                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gender" className="text-sm font-medium text-foreground">
                          Gender *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          required
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doctor Specific Fields */}
                {activeTab === 'doctor' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Professional Information</h4>
                    
                    <div className="space-y-2">
                      <label htmlFor="specialization" className="text-sm font-medium text-foreground">
                        Specialization *
                      </label>
                      <input
                        id="specialization"
                        name="specialization"
                        type="text"
                        required
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="e.g., Nephrology"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium text-foreground">
                        Years of Experience *
                      </label>
                      <input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Enter years of experience"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="qualifications" className="text-sm font-medium text-foreground">
                        Qualifications
                      </label>
                      <input
                        id="qualifications"
                        name="qualifications"
                        type="text"
                        value={formData.qualifications}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="e.g., MBBS, MD, FRCP (comma separated)"
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Security</h4>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Create a strong password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    `Create ${activeTab === 'doctor' ? 'Doctor' : 'Patient'} Account`
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
                
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our <Link to="/terms" className="underline">Terms &amp; Conditions</Link> and <Link to="/cookies" className="underline">Cookies Policy</Link>.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}