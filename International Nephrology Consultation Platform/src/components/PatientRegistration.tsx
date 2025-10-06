import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Shield, Clock, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface PatientRegistrationProps {
  onNavigate: (view: string) => void;
}

export function PatientRegistration({ onNavigate }: PatientRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('email');
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  const steps = [
    { number: 1, title: "Account Setup", completed: currentStep > 1 },
    { number: 2, title: "Verification", completed: currentStep > 2 },
    { number: 3, title: "Profile Information", completed: currentStep > 3 },
    { number: 4, title: "Privacy & Preferences", completed: currentStep > 4 }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            step.completed ? 'bg-primary border-primary text-white' :
            currentStep === step.number ? 'border-primary text-primary' :
            'border-gray-300 text-gray-400'
          }`}>
            {step.completed ? <Check className="w-4 h-4" /> : step.number}
          </div>
          <div className="ml-2 text-sm font-medium">
            {step.title}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-4 ${
              step.completed ? 'bg-primary' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Create Your Account</h2>
        <p className="text-muted-foreground">
          Join NephroConsult to connect with kidney specialists worldwide
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" className="mt-2" />
            </div>
          </div>

          <div>
            <Label>Registration Method</Label>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setRegistrationMethod('email')}
                className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                  registrationMethod === 'email' ? 'border-primary bg-accent' : 'border-border'
                }`}
              >
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">Verify via email</p>
              </button>
              <button
                onClick={() => setRegistrationMethod('phone')}
                className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                  registrationMethod === 'phone' ? 'border-primary bg-accent' : 'border-border'
                }`}
              >
                <Phone className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">Verify via SMS</p>
              </button>
            </div>
          </div>

          {registrationMethod === 'email' ? (
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                className="mt-2" 
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2 mt-2">
                <Select defaultValue="+1">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+86">🇨🇳 +86</SelectItem>
                    <SelectItem value="+81">🇯🇵 +81</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  id="phone" 
                  placeholder="(555) 123-4567" 
                  className="flex-1" 
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="mt-2" 
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              className="mt-2" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <Button onClick={() => setCurrentStep(2)}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Verify Your Account</h2>
        <p className="text-muted-foreground">
          We've sent a verification code to your {registrationMethod}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          {!verificationSent ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                {registrationMethod === 'email' ? 
                  <Mail className="w-8 h-8 text-primary" /> : 
                  <Phone className="w-8 h-8 text-primary" />
                }
              </div>
              <p className="text-sm text-muted-foreground">
                Click the button below to send a verification code to<br />
                <strong>
                  {registrationMethod === 'email' ? 'john@example.com' : '+1 (555) 123-4567'}
                </strong>
              </p>
              <Button onClick={() => setVerificationSent(true)}>
                Send Verification Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the 6-digit code sent to your {registrationMethod}
              </p>
              
              <div className="flex justify-center gap-2 mb-6">
                {otpCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-bold"
                    maxLength={1}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStep(3)}
                  disabled={otpCode.some(digit => !digit)}
                >
                  Verify Code
                </Button>
                <Button variant="ghost" size="sm">
                  Didn't receive code? Resend
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {verificationSent && (
          <Button 
            onClick={() => setCurrentStep(3)}
            disabled={otpCode.some(digit => !digit)}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Help us provide you with personalized care
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">🇺🇸 United States</SelectItem>
                <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="in">🇮🇳 India</SelectItem>
                <SelectItem value="au">🇦🇺 Australia</SelectItem>
                <SelectItem value="de">🇩🇪 Germany</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                <SelectItem value="ist">IST (India Standard Time)</SelectItem>
                <SelectItem value="jst">JST (Japan Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferredLanguage">Preferred Language</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input id="emergencyContact" placeholder="Name and phone number" className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentConditions">Current Medical Conditions</Label>
            <Input 
              id="currentConditions" 
              placeholder="e.g., Diabetes, Hypertension, Kidney stones..." 
              className="mt-2" 
            />
          </div>

          <div>
            <Label htmlFor="medications">Current Medications</Label>
            <Input 
              id="medications" 
              placeholder="List any medications you're currently taking..." 
              className="mt-2" 
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Input 
              id="allergies" 
              placeholder="Any known allergies or drug reactions..." 
              className="mt-2" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={() => setCurrentStep(4)}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Privacy & Preferences</h2>
        <p className="text-muted-foreground">
          Configure your privacy settings and communication preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm mb-4">
              NephroConsult is committed to protecting your privacy and ensuring HIPAA compliance. 
              Your medical information will be securely stored and only shared with your chosen healthcare providers.
            </p>
            <Badge className="bg-green-100 text-green-800">HIPAA Compliant</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the <Link to="/terms" className="text-primary underline">Terms &amp; Conditions</Link> and 
                <Link to="/cookies" className="text-primary underline ml-1">Cookies Policy</Link>
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="hipaa" />
              <Label htmlFor="hipaa" className="text-sm leading-relaxed">
                I consent to the secure collection, storage, and sharing of my medical information 
                with my chosen healthcare providers through this platform
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox id="marketing" />
              <Label htmlFor="marketing" className="text-sm leading-relaxed">
                I would like to receive health tips, appointment reminders, and platform updates 
                (you can unsubscribe anytime)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Appointment reminders and updates</p>
              </div>
              <Checkbox defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Important alerts and reminders</p>
              </div>
              <Checkbox defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WhatsApp Updates</p>
                <p className="text-sm text-muted-foreground">Consultation links and reports</p>
              </div>
              <Checkbox />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={() => onNavigate('doctors')} className="bg-success hover:bg-success/90">
          Complete Registration
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {renderStepIndicator()}

        <div className="bg-white rounded-lg p-6 shadow-sm">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}