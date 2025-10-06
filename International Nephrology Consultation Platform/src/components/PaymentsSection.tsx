import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  CreditCard, 
  Building2, 
  CheckCircle, 
  AlertCircle,
  Receipt,
  Download,
  ExternalLink,
  Lock,
  Shield,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

const PaymentsSection = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState({
    amount: '150.00',
    currency: 'USD',
    service: 'Video Consultation',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    country: '',
    postalCode: ''
  });

  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-001',
      date: '2024-09-15',
      service: 'Video Consultation',
      amount: '$150.00',
      status: 'completed',
      paymentMethod: 'Visa ****1234',
      invoiceUrl: '#'
    },
    {
      id: 'TXN-002',
      date: '2024-08-20',
      service: 'Lab Report Review',
      amount: '$75.00',
      status: 'completed',
      paymentMethod: 'PayPal',
      invoiceUrl: '#'
    },
    {
      id: 'TXN-003',
      date: '2024-08-01',
      service: 'Phone Consultation',
      amount: '$120.00',
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      invoiceUrl: '#'
    }
  ]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const PaymentForm = () => {
    const renderPaymentStep = () => {
      switch (paymentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center flex-1 cursor-pointer">
                      <CreditCard className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                      </div>
                    </Label>
                    <div className="flex space-x-1">
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzAwNTFBNSIvPjx0ZXh0IHg9IjUiIHk9IjE0IiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI4Ij5WSVNBPC90ZXh0Pjwvc3ZnPg==" alt="Visa" className="w-8 h-5" />
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI0VCMDAxQiIvPjx0ZXh0IHg9IjMiIHk9IjE0IiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI2Ij5NQVNURVJDQVJEPC90ZXh0Pjwvc3ZnPg==" alt="Mastercard" className="w-8 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center flex-1 cursor-pointer">
                      <div className="w-5 h-5 mr-3 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>
                      <div>
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center flex-1 cursor-pointer">
                      <Building2 className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <div className="font-medium">Bank Transfer (International)</div>
                        <div className="text-sm text-gray-600">Direct bank transfer with confirmation</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{paymentData.service}</span>
                  <span className="font-medium">{paymentData.currency} {paymentData.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span>Included</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>{paymentData.currency} {paymentData.amount}</span>
                </div>
              </div>
            </div>
          );

        case 2:
          if (paymentMethod === 'card') {
            return (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Card Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="12345"
                      value={paymentData.postalCode}
                      onChange={(e) => setPaymentData({...paymentData, postalCode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment information is encrypted and processed securely through Stripe.
                  </p>
                </div>
              </div>
            );
          } else if (paymentMethod === 'paypal') {
            return (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">PayPal Payment</h3>
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">P</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">PayPal Checkout</h4>
                  <p className="text-gray-600 mb-4">
                    You'll be redirected to PayPal to complete your payment securely.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Continue to PayPal
                  </Button>
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Bank Transfer Details</h3>
                <div className="p-6 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">International Wire Transfer</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Bank Name:</span>
                      <p className="text-gray-600">First National Bank</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">SWIFT Code:</span>
                      <p className="text-gray-600">FNBKUS33XXX</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Account Number:</span>
                      <p className="text-gray-600">1234567890</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Reference:</span>
                      <p className="text-gray-600">PAT-{Date.now()}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Please include the reference number in your transfer. 
                      Payment confirmation typically takes 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

        case 3:
          return (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
              <div className="p-6 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">TXN-{Date.now()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{paymentData.currency} {paymentData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{paymentData.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-2" />
                  Email Invoice
                </Button>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= paymentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step < paymentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 3 && <div className={`w-8 h-0.5 ${step < paymentStep ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {renderPaymentStep()}

        {/* Navigation Buttons */}
        {paymentStep < 3 && (
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setPaymentStep(Math.max(1, paymentStep - 1))}
              disabled={paymentStep === 1}
            >
              Back
            </Button>
            <Button 
              onClick={() => setPaymentStep(Math.min(3, paymentStep + 1))}
              className="bg-primary hover:bg-primary/90"
            >
              {paymentStep === 2 ? 'Pay Now' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="payments" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Payments</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multiple payment options with bank-level security. Support for international payments 
            in various currencies with transparent pricing.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Payment Options */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Credit/Debit Cards</h3>
                  <p className="text-sm text-gray-600 mb-3">Visa, Mastercard, American Express</p>
                  <Badge variant="secondary">Instant</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">PayPal</h3>
                  <p className="text-sm text-gray-600 mb-3">Pay with PayPal balance or linked cards</p>
                  <Badge variant="secondary">Instant</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer</h3>
                  <p className="text-sm text-gray-600 mb-3">International wire transfers</p>
                  <Badge variant="outline">1-3 days</Badge>
                </CardContent>
              </Card>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                  <Lock className="w-5 h-5 mr-2" />
                  Secure Payment Checkout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Secure Payment</DialogTitle>
                </DialogHeader>
                <PaymentForm />
              </DialogContent>
            </Dialog>
          </div>

          {/* Security & Features */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">256-bit SSL Encryption</h4>
                    <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">PCI DSS Compliant</h4>
                    <p className="text-sm text-gray-600">Highest security standards for card data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Fraud Protection</h4>
                    <p className="text-sm text-gray-600">Advanced fraud detection and prevention</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Supported Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map((currency) => (
                    <div key={currency.code} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                      <span className="font-medium">{currency.symbol}</span>
                      <span className="text-sm text-gray-600">{currency.code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Transaction History
              </span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.service}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {transaction.date}
                        </span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{transaction.amount}</div>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { PaymentsSection };