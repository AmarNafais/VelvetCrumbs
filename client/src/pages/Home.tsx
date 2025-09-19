import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCategories from "@/components/ProductCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Star, Clock, Award, Calendar, Phone, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import spiralPastryImage from "@assets/stock_images/spiral_cinnamon_roll_fc442a28.jpg";
import type { Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: valueProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "value"],
    queryFn: () => fetch("/api/products").then(res => res.json().then(products =>
      products.filter((p: Product) => p.originalPrice).slice(0, 4)
    )),
  });

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-background overflow-hidden" data-testid="hero-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Content */}
            <div className="space-y-8" data-testid="hero-content">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium" data-testid="hero-tagline">
                  ENDLESS DISCOVERY OF DELICIOUS
                </p>
                <h1 className="text-6xl md:text-8xl font-bold text-primary leading-none" data-testid="hero-title">
                  bakery
                </h1>
              </div>

              <div className="space-y-4 max-w-md">
                <p className="text-foreground leading-relaxed" data-testid="hero-description">
                  Velvet Crumbs offers homemade delights for every craving. From decadent cakes and pastries to savory treats and wholesome meals, our kitchen brings you comfort and joy. Discover a world of flavors, all crafted with love and the finest ingredients.
                </p>
              </div>

              <div className="flex items-center gap-4" data-testid="hero-actions">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors rounded-full"
                  onClick={() => setLocation("/products")}
                  data-testid="button-view-all-products"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  view all products
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-full"
                  onClick={() => setLocation("/about")}
                  data-testid="button-learn-more"
                >
                  Learn more
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:justify-self-end" data-testid="hero-image">
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={spiralPastryImage}
                  alt="Spiral pastry bakery item"
                  className="w-full h-auto object-cover rounded-full shadow-2xl"
                  data-testid="img-spiral-pastry"
                />
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full opacity-60"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-secondary rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCategories />
      <FeaturedProducts />

      {/* Value Section */}
      <section className="py-20 bg-background" data-testid="value-section">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="value-title">
                Value Delights
              </h2>
              <p className="text-muted-foreground" data-testid="value-description">
                Delicious and affordable treats, perfect for any occasion without breaking the budget.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30" data-testid="testimonials-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="testimonials-title">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="testimonials-subtitle">
              Our average customer rating is 4.8 / 5
            </p>
            <div className="flex items-center justify-center mt-4 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-xl p-8 shadow-sm" data-testid="testimonial-1">
              <div className="flex items-center mb-4 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="text-foreground font-semibold ml-2">5/5</span>
              </div>
              <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6">
                "I ordered cakes and savories from Velvet Crumbs for my daughter's birthday, and everything was perfect. The team was attentive, and the treats were beautifully decorated and delicious. Our guests couldn't stop raving about the flavors. Velvet Crumbs made our celebration special, and I'll definitely order from them again. Highly recommend!"
              </blockquote>
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b742?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                  alt="Haseena Ibrahim"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-foreground">Haseena Ibrahim</h4>
                  <p className="text-sm text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm" data-testid="testimonial-2">
              <div className="flex items-center mb-4 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="text-foreground font-semibold ml-2">5/5</span>
              </div>
              <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6">
                "Velvet Crumbs made my anniversary celebration truly unforgettable. The cake was a work of art, both visually and taste-wise. The team was incredibly attentive, accommodating all my special requests with ease. The savories were equally impressive, adding a delicious variety to our spread. Our guests kept asking where we got the treats from, and I was happy to recommend Velvet Crumbs."
              </blockquote>
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                  alt="Shama Wahid"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-foreground">Shama Wahid</h4>
                  <p className="text-sm text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="cta-section">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="cta-title">
              From Our Kitchen to Your Heart
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="cta-description">
              Preordering is essential to ensure the freshest and most personalized experience. Contact us today to discuss your event needs and secure your spot on our baking schedule. Let's make your occasion unforgettable with the magic of Velvet Crumbs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                data-testid="button-pre-order"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Pre-Order Now
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                onClick={() => setLocation("/contact")}
                data-testid="button-contact"
              >
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>24-48 Hours Notice</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                <span>4.8/5 Customer Rating</span>
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
