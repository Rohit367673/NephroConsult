import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Eye, EyeOff, Heart, Stethoscope, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password, activeTab as 'patient' | 'doctor');
      
      if (success) {
        toast.success(`Welcome back! Redirecting to your ${activeTab} dashboard...`);
        navigate(activeTab === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (userType: 'patient' | 'doctor') => {
    if (userType === 'doctor') {
      setFormData({
        email: 'doctor@nephrology.com',
        password: 'doctor123'
      });
    } else {
      setFormData({
        email: 'patient@example.com',
        password: 'patient123'
      });
    }
    setActiveTab(userType);
  };

  return (
    <div className="py-20 bg-gradient-to-br from-primary/5 via-white to-accent/20 min-h-screen flex items-center">
      <div className="container-medical">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue your kidney care journey
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Choose your account type and enter your credentials
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

                <TabsContent value="patient" className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Access your patient dashboard to book appointments and manage your medical history.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fillDemoCredentials('patient')}
                      className="w-full"
                    >
                      Use Demo Patient Account
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="doctor" className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Access your doctor dashboard to manage appointments and patient consultations.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fillDemoCredentials('doctor')}
                      className="w-full"
                    >
                      Use Demo Doctor Account
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
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
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
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
                      placeholder="Enter your password"
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    `Sign In as ${activeTab === 'doctor' ? 'Doctor' : 'Patient'}`
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Demo Credentials:</p>
                  <p>Patient: patient@example.com / patient123</p>
                  <p>Doctor: doctor@nephrology.com / doctor123</p>
                </div>
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