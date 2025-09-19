import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Clock, MessageSquare, Calendar, Facebook, Instagram } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit form data to API
      const response = await apiRequest('POST', '/api/contact', formData);
      
      if (!response.ok) {
        // Handle server errors
        const errorData = await response.json().catch(() => ({ message: 'Server error occurred' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Message sent successfully!",
        description: result.message || "We'll get back to you within 24 hours to discuss your order.",
      });

      // Reset form only on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        guestCount: "",
        message: ""
      });
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      content: "+94 76 059 9559",
      description: "Mon-Sat, 9 AM - 6 PM"
    },
    {
      icon: Mail,
      title: "Email Us",
      content: "info@velvetcrumbs.lk",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Colombo, Sri Lanka",
      description: "Island-wide delivery available"
    },
    {
      icon: Clock,
      title: "Order Notice",
      content: "24-48 Hours",
      description: "Advance notice required"
    }
  ];

  const eventTypes = [
    "Birthday Party",
    "Wedding",
    "Anniversary", 
    "Corporate Event",
    "Baby Shower",
    "Graduation",
    "Religious Ceremony",
    "Other Special Occasion"
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="contact-page">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="contact-title">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="contact-subtitle">
              Ready to make your celebration sweeter? Let's discuss your perfect treat. We're here to help bring your vision to life with our handcrafted delights.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" data-testid="contact-info-grid">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow" data-testid={`contact-info-${index}`}>
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`contact-info-title-${index}`}>
                    {info.title}
                  </h3>
                  <p className="text-primary font-medium mb-1" data-testid={`contact-info-content-${index}`}>
                    {info.content}
                  </p>
                  <p className="text-muted-foreground text-sm" data-testid={`contact-info-description-${index}`}>
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div data-testid="contact-form-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="form-title">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Pre-Order Inquiry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email Address *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Phone Number *
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+94 76 059 9559"
                          required
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Event Type
                        </label>
                        <Select onValueChange={(value) => handleSelectChange("eventType", value)}>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Event Date
                        </label>
                        <Input
                          name="eventDate"
                          type="date"
                          value={formData.eventDate}
                          onChange={handleInputChange}
                          min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          data-testid="input-event-date"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Number of Guests
                        </label>
                        <Input
                          name="guestCount"
                          type="number"
                          value={formData.guestCount}
                          onChange={handleInputChange}
                          placeholder="Approximate guest count"
                          min="1"
                          data-testid="input-guest-count"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Tell us about your requirements
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your cake design, flavors, dietary requirements, delivery preferences, or any special requests..."
                        rows={4}
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      data-testid="button-submit"
                    >
                      {isSubmitting ? "Sending..." : "Send Inquiry"}
                      <Calendar className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      * Required fields. We'll respond within 24 hours to discuss your order details and pricing.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="space-y-8" data-testid="additional-info-section">
              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="faq-title">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div data-testid="faq-item-1">
                    <h4 className="font-semibold text-foreground mb-2">How far in advance should I place my order?</h4>
                    <p className="text-muted-foreground text-sm">
                      We require 24-48 hours notice for most items. Custom cakes and large orders may need more time. Contact us to discuss your timeline.
                    </p>
                  </div>
                  <div data-testid="faq-item-2">
                    <h4 className="font-semibold text-foreground mb-2">Do you offer delivery?</h4>
                    <p className="text-muted-foreground text-sm">
                      Yes! We deliver island-wide across Sri Lanka. Delivery fees vary by location. Free delivery for orders over LKR 5,000 in Colombo.
                    </p>
                  </div>
                  <div data-testid="faq-item-3">
                    <h4 className="font-semibold text-foreground mb-2">Can you accommodate dietary restrictions?</h4>
                    <p className="text-muted-foreground text-sm">
                      Absolutely! We can create sugar-free, gluten-free, vegan, and other specialized options. Please mention your requirements when ordering.
                    </p>
                  </div>
                  <div data-testid="faq-item-4">
                    <h4 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h4>
                    <p className="text-muted-foreground text-sm">
                      We accept cash on delivery, bank transfers, and online payments. A 50% deposit is typically required for custom orders.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Operating Hours */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="hours-title">Operating Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between" data-testid="hours-weekday">
                      <span className="text-muted-foreground">Monday - Friday:</span>
                      <span className="text-foreground font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between" data-testid="hours-saturday">
                      <span className="text-muted-foreground">Saturday:</span>
                      <span className="text-foreground font-medium">9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between" data-testid="hours-sunday">
                      <span className="text-muted-foreground">Sunday:</span>
                      <span className="text-foreground font-medium">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    *Orders can be placed online 24/7. We'll respond during business hours.
                  </p>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="social-title">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Stay updated with our latest creations and special offers!
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" data-testid="button-facebook">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-instagram">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
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
