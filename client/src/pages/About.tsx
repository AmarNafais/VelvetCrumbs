import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, Users, Clock, Sparkles, ChefHat } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every product is handcrafted with genuine care and attention to detail, ensuring each bite brings joy to your special moments."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We use only the finest ingredients sourced locally and internationally to create exceptional taste experiences."
    },
    {
      icon: Users,
      title: "Family Tradition",
      description: "Our recipes are passed down through generations, combining traditional techniques with modern innovation."
    },
    {
      icon: Clock,
      title: "Fresh Daily",
      description: "All our products are made fresh to order with 24-48 hours notice to ensure peak quality and taste."
    }
  ];

  const values = [
    "Handcrafted Excellence",
    "Premium Ingredients",
    "Customer Satisfaction", 
    "Traditional Recipes",
    "Fresh Quality",
    "Personalized Service"
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="about-page">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="about-title">
              About Velvet Crumbs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="about-subtitle">
              Handcrafted delights for every occasion. We believe that every celebration deserves a touch of homemade charm, made with love and the finest ingredients.
            </p>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="space-y-6" data-testid="story-section">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a passion for creating memorable moments through exceptional baked goods, Velvet Crumbs began as a dream to bring authentic, handcrafted treats to Sri Lankan celebrations. Our journey started in a small kitchen with traditional family recipes and has grown into a trusted name for premium cakes, traditional sweets, and custom creations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What sets us apart is our commitment to quality and personalization. Every product is made to order, ensuring freshness and allowing us to customize each creation to perfectly match your vision. From intimate family gatherings to grand celebrations, we're here to make your special moments even sweeter.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Velvet Crumbs serves customers across Sri Lanka, combining traditional Sri Lankan flavors with international techniques to create unique treats that celebrate both heritage and innovation.
              </p>
            </div>
            <div className="relative" data-testid="story-image">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Velvet Crumbs Kitchen"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-xl"></div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20" data-testid="features-section">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">What Makes Us Special</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow" data-testid={`feature-${index}`}>
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3" data-testid={`feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`feature-description-${index}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-muted/30 rounded-2xl p-12 mb-20" data-testid="values-section">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do, from selecting ingredients to delivering your perfect treat.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {values.map((value, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  data-testid={`value-${index}`}
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  {value}
                </Badge>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-20" data-testid="team-section">
            <h2 className="text-3xl font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Our talented team of bakers, decorators, and customer service specialists work together to bring your sweetest dreams to life.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="team-member-1">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Head Baker</h3>
                  <p className="text-muted-foreground text-sm">
                    Master of traditional recipes and innovative flavor combinations
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="team-member-2">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Decoration Specialist</h3>
                  <p className="text-muted-foreground text-sm">
                    Artistic expert bringing your custom cake visions to life
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="team-member-3">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Customer Care</h3>
                  <p className="text-muted-foreground text-sm">
                    Dedicated to ensuring your perfect experience from order to delivery
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quality Promise */}
          <Card className="bg-primary text-primary-foreground" data-testid="quality-promise">
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-6">Our Quality Promise</h2>
              <p className="text-lg opacity-90 max-w-3xl mx-auto leading-relaxed">
                We guarantee that every product leaving our kitchen meets our highest standards of quality, freshness, and taste. 
                If you're not completely satisfied with your order, we'll make it right. Your celebration deserves nothing less than perfection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
