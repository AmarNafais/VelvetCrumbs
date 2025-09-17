import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize form with user data if logged in
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerAddress: user?.address || '',
  });

  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const deliveryFee = 500;
  const total = cartTotal + (cartItems.length > 0 ? deliveryFee : 0);

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }
    if (!customerInfo.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email";
    }
    if (!customerInfo.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    }
    if (!customerInfo.customerAddress.trim()) {
      newErrors.customerAddress = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: CustomerInfo) => {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal: (parseFloat(item.product.price) * item.quantity).toFixed(2)
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderData,
          total: total.toFixed(2),
          items: orderItems
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.id} has been placed. We'll contact you within 24 hours.`,
      });
      setLocation(`/order-success/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      placeOrderMutation.mutate(customerInfo);
    }
  };

  // Redirect to cart if empty
  if (cartItems.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-testid="checkout-page">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/cart")}
              className="mb-4"
              data-testid="button-back-to-cart"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
            <h1 className="text-4xl font-bold text-foreground" data-testid="checkout-title">
              Checkout
            </h1>
            <p className="text-muted-foreground mt-2">
              {user ? "Review your information and place your order" : "Please fill in your details to complete your order"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div data-testid="customer-info-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {user ? "Delivery Information" : "Your Information"}
                  </CardTitle>
                  {user && (
                    <p className="text-sm text-muted-foreground">
                      Information from your profile. You can edit it below.
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4" data-testid="checkout-form">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          value={customerInfo.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          placeholder="Enter your full name"
                          className={errors.customerName ? "border-destructive" : ""}
                          data-testid="input-customer-name"
                        />
                        {errors.customerName && (
                          <p className="text-sm text-destructive mt-1">{errors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerEmail">Email Address *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={customerInfo.customerEmail}
                          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                          placeholder="Enter your email"
                          className={errors.customerEmail ? "border-destructive" : ""}
                          data-testid="input-customer-email"
                        />
                        {errors.customerEmail && (
                          <p className="text-sm text-destructive mt-1">{errors.customerEmail}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerPhone">Phone Number *</Label>
                        <Input
                          id="customerPhone"
                          value={customerInfo.customerPhone}
                          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                          placeholder="+94 76 059 9559"
                          className={errors.customerPhone ? "border-destructive" : ""}
                          data-testid="input-customer-phone"
                        />
                        {errors.customerPhone && (
                          <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerAddress">Delivery Address *</Label>
                        <Textarea
                          id="customerAddress"
                          value={customerInfo.customerAddress}
                          onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                          placeholder="Enter your complete address with city and postal code"
                          rows={3}
                          className={errors.customerAddress ? "border-destructive" : ""}
                          data-testid="input-customer-address"
                        />
                        {errors.customerAddress && (
                          <p className="text-sm text-destructive mt-1">{errors.customerAddress}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={placeOrderMutation.isPending}
                        data-testid="button-place-order"
                      >
                        {placeOrderMutation.isPending ? (
                          "Placing Order..."
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Place Order ({formatPrice(total)})
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div data-testid="order-summary-section">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3" data-testid={`order-item-${item.id}`}>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(parseFloat(item.product.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span data-testid="checkout-subtotal">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span data-testid="checkout-delivery">{formatPrice(deliveryFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary" data-testid="checkout-total">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Delivery Information</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 24-48 hours advance notice required</li>
                      <li>• Free delivery for orders over LKR 5,000</li>
                      <li>• Available island-wide in Sri Lanka</li>
                      <li>• We'll contact you to confirm delivery time</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}