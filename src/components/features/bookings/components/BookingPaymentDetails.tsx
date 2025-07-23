import { useState } from 'react';
import { useGetBookingByIdQuery, useGetBookingPaymentQuery, useProcessBookingPaymentMutation } from '@/redux/api/bookingsApi';
import { useGetServiceByIdQuery } from '@/redux/api/servicesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CreditCard, Banknote, Building, Wallet, CheckCircle, AlertCircle, Shield, Receipt, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface BookingPaymentDetailsProps {
    bookingId: string;
}

const BookingPaymentDetails = ({ bookingId }: BookingPaymentDetailsProps) => {
    const { toast } = useToast();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer' | 'digital_wallet'>('card');
    const [showCardForm, setShowCardForm] = useState(true);
    const [cardDetails, setCardDetails] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });
    const [savePaymentMethod, setSavePaymentMethod] = useState(false);
    const [activeTab, setActiveTab] = useState('payment');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: booking, isLoading: isBookingLoading } = useGetBookingByIdQuery({ id: bookingId });
    const { data: payment, isLoading: isPaymentLoading } = useGetBookingPaymentQuery({ bookingId });
    const { data: service } = useGetServiceByIdQuery(
        { id: booking?.serviceId || '' },
        { skip: !booking?.serviceId }
    );

    const [processPayment, { isLoading: isProcessingPayment }] = useProcessBookingPaymentMutation();

    // Calculate total based on service price and any additional fees
    const basePrice = service?.basePrice || booking?.totalAmount || 0;
    const serviceFee = basePrice * 0.05; // 5% service fee
    const taxRate = 0.08; // 8% tax
    const taxes = basePrice * taxRate;
    const total = basePrice + serviceFee + taxes;

    const handlePaymentMethodChange = (value: string) => {
        setPaymentMethod(value as any);
        setShowCardForm(value === 'card');
    };

    const handleCardDetailChange = (field: keyof typeof cardDetails, value: string) => {
        setCardDetails(prev => ({ ...prev, [field]: value }));
    };

    const isCardFormValid = () => {
        if (paymentMethod !== 'card') return true;
        return (
            cardDetails.cardName.trim() !== '' &&
            cardDetails.cardNumber.trim().length >= 16 &&
            cardDetails.expiry.trim().length >= 5 &&
            cardDetails.cvc.trim().length >= 3
        );
    };

    const handleProcessPayment = async () => {
        try {
            setIsProcessing(true);
            const result = await processPayment({
                bookingId,
                paymentMethod,
                amount: total
            }).unwrap();

            toast({
                title: 'Payment successful',
                description: `Your payment of $${total.toFixed(2)} has been processed successfully.`,
            });
            setActiveTab('receipt');
        } catch (error) {
            toast({
                title: 'Payment failed',
                description: 'There was an error processing your payment. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const simulatePaymentProcessing = () => {
        setIsProcessing(true);
        setTimeout(() => {
            handleProcessPayment();
        }, 2000);
    };

    if (isBookingLoading || isPaymentLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium">Booking not found</h3>
                <p className="mt-1 text-gray-500">The booking information could not be loaded.</p>
            </div>
        );
    }

    // If payment is already completed
    if (payment && payment.status === 'completed') {
        return (
            <div className="space-y-6">
                <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-lg font-medium">Payment Completed</h3>
                    <p className="mt-1 text-gray-500">
                        Payment of ${payment.amount.toFixed(2)} was processed on {format(new Date(payment.paidAt || Date.now()), 'MMMM d, yyyy')}
                    </p>
                </div>

                <Tabs defaultValue="receipt">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="receipt">Receipt</TabsTrigger>
                        <TabsTrigger value="details">Payment Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="receipt" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Payment Receipt</CardTitle>
                                        <CardDescription>
                                            Transaction ID: {payment.transactionId || 'N/A'}
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <p className="font-medium">{service?.name || 'Service'}</p>
                                        <p className="text-sm text-gray-500">Booking #{bookingId.slice(-6)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${basePrice.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(payment.paidAt || Date.now()), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span>${payment.fees.serviceFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee</span>
                                        <span>${payment.fees.platformFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxes</span>
                                        <span>${payment.fees.taxes.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-medium pt-2 border-t">
                                    <span>Total</span>
                                    <span>${payment.amount.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="flex items-center">
                                        <span className="text-gray-600 mr-2">Payment Method:</span>
                                        <span className="capitalize flex items-center">
                                            {payment.paymentMethod === 'card' ? (
                                                <><CreditCard className="h-4 w-4 mr-1" /> Credit/Debit Card</>
                                            ) : payment.paymentMethod === 'cash' ? (
                                                <><Banknote className="h-4 w-4 mr-1" /> Cash</>
                                            ) : payment.paymentMethod === 'bank_transfer' ? (
                                                <><Building className="h-4 w-4 mr-1" /> Bank Transfer</>
                                            ) : (
                                                <><Wallet className="h-4 w-4 mr-1" /> Digital Wallet</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start border-t pt-4">
                                <p className="text-sm text-gray-500">
                                    Thank you for your payment. If you have any questions about this receipt, please contact our customer support.
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span>{payment.transactionId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span>{payment.paidAt ? format(new Date(payment.paidAt), 'MMM d, yyyy - h:mm a') : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-medium">${payment.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="flex items-center text-green-600">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Completed
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // If payment is pending or not started
    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="receipt" disabled={!payment || payment.status !== 'completed'}>Receipt</TabsTrigger>
                </TabsList>

                <TabsContent value="payment" className="space-y-6 mt-4">
                    {isProcessing && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center py-4">
                                    <LoadingSpinner className="h-8 w-8 text-blue-500 mb-4" />
                                    <h3 className="text-lg font-medium text-blue-700">Processing Payment</h3>
                                    <p className="text-blue-600 mt-1">Please wait while we process your payment...</p>
                                    <Progress value={45} className="h-2 mt-4 w-full max-w-md" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isProcessing && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={paymentMethod}
                                        onValueChange={handlePaymentMethodChange}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="card" id="payment-card" />
                                            <Label htmlFor="payment-card" className="flex items-center cursor-pointer w-full">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Credit/Debit Card
                                                <span className="ml-auto text-xs text-gray-500">Secure payment</span>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="cash" id="payment-cash" />
                                            <Label htmlFor="payment-cash" className="flex items-center cursor-pointer w-full">
                                                <Banknote className="mr-2 h-4 w-4" />
                                                Cash on Delivery
                                                <span className="ml-auto text-xs text-gray-500">Pay after service</span>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="bank_transfer" id="payment-bank" />
                                            <Label htmlFor="payment-bank" className="flex items-center cursor-pointer w-full">
                                                <Building className="mr-2 h-4 w-4" />
                                                Bank Transfer
                                                <span className="ml-auto text-xs text-gray-500">Manual verification</span>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                            <RadioGroupItem value="digital_wallet" id="payment-wallet" />
                                            <Label htmlFor="payment-wallet" className="flex items-center cursor-pointer w-full">
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Digital Wallet
                                                <span className="ml-auto text-xs text-gray-500">PayPal, Apple Pay, etc.</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>

                            {showCardForm && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Card Details</CardTitle>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Shield className="h-4 w-4 mr-1" />
                                                Secure Payment
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="card-name">Name on Card</Label>
                                            <Input
                                                id="card-name"
                                                placeholder="John Doe"
                                                value={cardDetails.cardName}
                                                onChange={(e) => handleCardDetailChange('cardName', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="card-number">Card Number</Label>
                                            <Input
                                                id="card-number"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardDetails.cardNumber}
                                                onChange={(e) => handleCardDetailChange('cardNumber', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="card-expiry">Expiry Date</Label>
                                                <Input
                                                    id="card-expiry"
                                                    placeholder="MM/YY"
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => handleCardDetailChange('expiry', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="card-cvc">CVC</Label>
                                                <Input
                                                    id="card-cvc"
                                                    placeholder="123"
                                                    value={cardDetails.cvc}
                                                    onChange={(e) => handleCardDetailChange('cvc', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="save-payment"
                                                checked={savePaymentMethod}
                                                onCheckedChange={(checked) => setSavePaymentMethod(!!checked)}
                                            />
                                            <Label htmlFor="save-payment" className="text-sm">
                                                Save this card for future payments
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    onClick={simulatePaymentProcessing}
                                    disabled={isProcessingPayment || !isCardFormValid()}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <LoadingSpinner className="mr-2 h-4 w-4" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Process Payment'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="summary" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{service?.name || 'Service'}</p>
                                    <p className="text-sm text-gray-500">Booking #{bookingId.slice(-6)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">${basePrice.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service Fee</span>
                                    <span>${serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes</span>
                                    <span>${taxes.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full"
                                    onClick={() => setActiveTab('payment')}
                                    variant="outline"
                                >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Proceed to Payment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-800">Payment Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                                <li className="text-sm text-blue-700">Payment is processed after service completion</li>
                                <li className="text-sm text-blue-700">Cancellation within 24 hours may incur a fee</li>
                                <li className="text-sm text-blue-700">Tips for workers are optional and appreciated</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BookingPaymentDetails;