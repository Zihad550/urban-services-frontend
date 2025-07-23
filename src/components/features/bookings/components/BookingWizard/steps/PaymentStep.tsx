import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../BookingWizard';
import { Service } from '@/types/service';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Banknote, Building, Wallet, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentStepProps {
    form: UseFormReturn<BookingFormData>;
    service: Service;
}

const PaymentStep = ({ form, service }: PaymentStepProps) => {
    const [showCardForm, setShowCardForm] = useState(form.getValues('paymentMethod') === 'card');
    const [cardDetails, setCardDetails] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });

    // Calculate total based on service price and any additional fees
    const basePrice = service.basePrice;
    const serviceFee = basePrice * 0.05; // 5% service fee
    const taxRate = 0.08; // 8% tax
    const taxes = basePrice * taxRate;
    const total = basePrice + serviceFee + taxes;

    // Handle payment method change
    const handlePaymentMethodChange = (value: string) => {
        form.setValue('paymentMethod', value as any);
        setShowCardForm(value === 'card');
    };

    // Handle card detail changes
    const handleCardDetailChange = (field: keyof typeof cardDetails, value: string) => {
        setCardDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Payment Details</h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                    <span>Service Price</span>
                    <span>${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Taxes</span>
                    <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={handlePaymentMethodChange}
                                defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {showCardForm && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Card Details</h4>
                            <div className="flex items-center text-sm text-gray-500">
                                <Shield className="h-4 w-4 mr-1" />
                                Secure Payment
                            </div>
                        </div>

                        <Tabs defaultValue="new-card">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="new-card">New Card</TabsTrigger>
                                <TabsTrigger value="saved-cards">Saved Cards</TabsTrigger>
                            </TabsList>
                            <TabsContent value="new-card" className="space-y-4 mt-4">
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

                                <FormField
                                    control={form.control}
                                    name="savePaymentMethod"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <Label htmlFor="savePaymentMethod">
                                                    Save this card for future payments
                                                </Label>
                                                <FormDescription>
                                                    Your card information will be securely stored for future bookings.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                            <TabsContent value="saved-cards" className="mt-4">
                                <div className="text-center py-8 text-gray-500">
                                    <p>No saved cards found</p>
                                    <p className="text-sm mt-1">Add a new card to save it for future use</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Payment Policy</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li className="text-sm text-blue-700">Payment is processed after service completion</li>
                    <li className="text-sm text-blue-700">Cancellation within 24 hours may incur a fee</li>
                    <li className="text-sm text-blue-700">Tips for workers are optional and appreciated</li>
                </ul>
            </div>
        </div>
    );
};

export default PaymentStep;