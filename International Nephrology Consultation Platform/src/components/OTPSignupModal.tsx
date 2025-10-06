import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../services/apiService';
import { GoogleLoginButton } from './GoogleLoginButton';
import { hasFirebaseCredentials } from '../config/firebase';

interface OTPSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function OTPSignupModal({ isOpen, onClose }: OTPSignupModalProps) {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otp, setOtp] = useState('');
  
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleClose = () => {
    setStep('details');
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    setOtp('');
    setOtpTimer(0);
    onClose();
  };

  const validateSignupData = () => {
    if (!signupData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!signupData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupData()) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiService.sendOTP(signupData.email);
      
      if (response.success) {
        if (response.data?.fallback && response.data?.otp) {
          // Email service failed, show OTP directly
          toast.success(`⚠️ Email service unavailable. Your verification code is: ${response.data.otp}`, {
            duration: 10000 // Show for 10 seconds
          });
          console.log('Fallback OTP:', response.data.otp);
        } else if (response.data?.otp) {
          // Development mode
          toast.success(`📧 Development mode - Your OTP: ${response.data.otp}`, {
            duration: 8000
          });
          console.log('Dev OTP:', response.data.otp);
        } else {
          // Normal email sent successfully
          toast.success('📧 Verification code sent to your email!');
        }
        setStep('otp');
        setOtpTimer(60); // 60 second timer
      } else {
        toast.error(response.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiService.verifyOTP(signupData.email, otp, {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });
      
      if (response.success) {
        toast.success('🎉 Account created successfully!');
        handleClose();
        // Optionally trigger login
      } else {
        toast.error(response.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiService.sendOTP(signupData.email);
      
      if (response.success) {
        toast.success('📧 New verification code sent!');
        setOtpTimer(60);
      } else {
        toast.error(response.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div
                key="details"
                initial={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
                
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="Create a password"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Confirm Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#006f6f] hover:bg-[#005555]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>

                {/* Google Login */}
                {hasFirebaseCredentials && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <GoogleLoginButton 
                        onSuccess={handleClose}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-[#006f6f] hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-6">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="mr-3 p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#006f6f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-[#006f6f]" />
                  </div>
                  <p className="text-gray-600">
                    We've sent a 6-digit verification code to{' '}
                    <span className="font-medium">{signupData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#006f6f] hover:bg-[#005555]"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Resend code in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-[#006f6f] hover:underline"
                    >
                      Didn't receive code? Resend
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={handleClose}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
