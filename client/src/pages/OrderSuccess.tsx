import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Phone, Mail, Calendar } from "lucide-react";

export default function OrderSuccess() {
  const params = useParams();
  const orderId = params.id;

  return (
    <div className="min-h-screen bg-background" data-testid="order-success-page">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground" data-testid="success-title">
                  Order Placed Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    Thank you for your order! We've received your request.
                  </p>
                  {orderId && (
                    <p className="text-sm text-muted-foreground" data-testid="order-id">
                      Order ID: <span className="font-mono font-semibold">#{orderId}</span>
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-4 h-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">We'll contact you within 24 hours</p>
                        <p>Our team will call to confirm your order details and delivery arrangements.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Order preparation</p>
                        <p>Your delicious treats will be freshly prepared 24-48 hours before delivery.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Delivery confirmation</p>
                        <p>We'll confirm the exact delivery time and ensure everything is perfect.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Need to make changes or have questions about your order?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/contact">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Us
                      </Link>
                    </Button>
                    <Button asChild data-testid="button-continue-shopping">
                      <Link href="/products">
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}