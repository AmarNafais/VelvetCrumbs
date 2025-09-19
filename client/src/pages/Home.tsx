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
import type { Product, ReviewWithUser } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: valueProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "value"],
    queryFn: () => fetch("/api/products").then(res => res.json().then(products =>
      products.filter((p: Product) => p.originalPrice).slice(0, 4)
    )),
  });

  const { data: randomReviews = [], isLoading: reviewsLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews/random"],
    queryFn: () => fetch("/api/reviews/random?limit=2").then(res => res.json()),
  });

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden" data-testid="home-page">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 bg-background overflow-hidden" data-testid="hero-section">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center min-h-[85vh] max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 lg:pl-8" data-testid="hero-content">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium" data-testid="hero-tagline">
                  ENDLESS DISCOVERY OF DELICIOUS
                </p>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-primary leading-none" data-testid="hero-title">
                  bakery
                </h1>
              </div>

              <div className="space-y-4 max-w-lg">
                <p className="text-lg text-foreground leading-relaxed" data-testid="hero-description">
                  Velvet Crumbs offers homemade delights for every craving. From decadent cakes and pastries to savory treats and wholesome meals, our kitchen brings you comfort and joy. Discover a world of flavors, all crafted with love and the finest ingredients.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6" data-testid="hero-actions">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground px-6 sm:px-8 py-3 hover:bg-primary/90 transition-colors rounded-full w-full sm:w-auto"
                  onClick={() => setLocation("/products")}
                  data-testid="button-view-all-products"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  view all products
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 sm:px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-full w-full sm:w-auto"
                  onClick={() => setLocation("/about")}
                  data-testid="button-learn-more"
                >
                  Learn more
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:justify-self-center lg:pr-8" data-testid="hero-image">
              <div className="relative w-full max-w-lg mx-auto">
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
            {reviewsLoading ? (
              // Loading skeleton
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-8 shadow-sm animate-pulse" data-testid={`review-skeleton-${i}`}>
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-muted rounded" />
                      ))}
                    </div>
                    <div className="w-8 h-4 bg-muted rounded ml-2" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-muted rounded-full mr-4" />
                    <div>
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : randomReviews.length > 0 ? (
              // Real reviews
              randomReviews.map((review, index) => (
                <div key={review.id} className="bg-card rounded-xl p-8 shadow-sm" data-testid={`testimonial-${index + 1}`}>
                  <div className="flex items-center mb-4 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'stroke-current fill-transparent'}`} />
                    ))}
                    <span className="text-foreground font-semibold ml-2">{review.rating}/5</span>
                  </div>
                  <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6">
                    "{review.reviewText}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary font-semibold text-lg">
                        {review.user.firstName ? review.user.firstName[0] : review.user.username[0].toUpperCase()}
                        {review.user.lastName ? review.user.lastName[0] : ''}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {review.user.firstName && review.user.lastName
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : review.user.username}
                      </h4>
                      <p className="text-sm text-muted-foreground">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback testimonials when no reviews exist
              [
                {
                  rating: 5,
                  text: "I ordered cakes and savories from Velvet Crumbs for my daughter's birthday, and everything was perfect. The team was attentive, and the treats were beautifully decorated and delicious. Our guests couldn't stop raving about the flavors. Velvet Crumbs made our celebration special, and I'll definitely order from them again. Highly recommend!",
                  name: "Haseena Ibrahim",
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b742?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                },
                {
                  rating: 5,
                  text: "Velvet Crumbs made my anniversary celebration truly unforgettable. The cake was a work of art, both visually and taste-wise. The team was incredibly attentive, accommodating all my special requests with ease. The savories were equally impressive, adding a delicious variety to our spread. Our guests kept asking where we got the treats from, and I was happy to recommend Velvet Crumbs.",
                  name: "Shama Wahid",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                }
              ].map((testimonial, index) => (
                <div key={`fallback-${index}`} className="bg-card rounded-xl p-8 shadow-sm" data-testid={`testimonial-fallback-${index + 1}`}>
                  <div className="flex items-center mb-4 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="text-foreground font-semibold ml-2">{testimonial.rating}/5</span>
                  </div>
                  <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))
            )}
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
