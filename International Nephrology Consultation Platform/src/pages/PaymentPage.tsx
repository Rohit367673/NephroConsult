import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle,
  Shield,
  User,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  city: string;
  zipCode: string;
  country: string;
}

export function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'United States'
  });

  // Get appointment details from URL params or session storage
  const appointmentType = searchParams.get('type') || 'Video Consultation';
  const appointmentDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const appointmentTime = searchParams.get('time') || '10:00 AM';
  const patientName = searchParams.get('patient') || 'John Doe';
  const amount = searchParams.get('amount') || '150';

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPaymentSuccess(true);
      toast.success('Payment processed successfully!');
      
      // Redirect to patient dashboard after 3 seconds
      setTimeout(() => {
        navigate('/patient/dashboard', { 
          state: { 
            message: 'Appointment booked successfully! You will receive a confirmation email shortly.',
            appointmentDetails: {
              type: appointmentType,
              date: appointmentDate,
              time: appointmentTime,
              amount: amount
            }
          }
        });
      }, 3000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-medical">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your appointment has been confirmed. You will receive an email with the consultation details.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Redirecting to your dashboard...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-medical">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600">Secure checkout for your nephrology consultation</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                  <CardDescription>
                    Enter your payment details to complete the booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Billing Address</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Street Address</Label>
                        <Input
                          id="billingAddress"
                          type="text"
                          placeholder="123 Main Street"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            placeholder="10001"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <select
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Spain">Spain</option>
                          <option value="Italy">Italy</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your payment information is encrypted and secure. We use industry-standard 
                        SSL encryption to protect your data.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Payment...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4" />
                          <span>Pay ${amount}</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-semibold text-sm">Patient</p>
                        <p className="text-sm text-gray-600">{patientName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-semibold text-sm">Date</p>
                        <p className="text-sm text-gray-600">{appointmentDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-semibold text-sm">Time</p>
                        <p className="text-sm text-gray-600">{appointmentTime}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consultation Type</span>
                      <Badge variant="outline">{appointmentType}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consultation Fee</span>
                      <span className="text-sm">${amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platform Fee</span>
                      <span className="text-sm">$10</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Amount</span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {parseInt(amount) + 10}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Secure 256-bit SSL encryption</p>
                    <p>• HIPAA compliant platform</p>
                    <p>• 100% money-back guarantee</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}