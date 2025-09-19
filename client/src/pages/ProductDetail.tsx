import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus } from "lucide-react";
import RatingDisplay from "@/components/RatingDisplay";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: () => fetch(`/api/products/${id}`).then(res => {
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    }),
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product.id, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: string) => {
    return `LKR ${parseFloat(price).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="product-loading">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="w-full h-96 bg-muted rounded-xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-12 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background" data-testid="product-error">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/products")} data-testid="button-back-products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = parseFloat(product.rating || "5.0");
  const isCustomProduct = product.name.includes("Custom");

  return (
    <div className="min-h-screen bg-background" data-testid="product-detail-page">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
                data-testid="product-detail-image"
              />
              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white" data-testid="badge-sale">
                  Sale
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="product-detail-name">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <RatingDisplay productId={product.id} size="md" className="mr-4" />
                  <span className="text-muted-foreground" data-testid="product-detail-stock">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {product.originalPrice ? (
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary" data-testid="product-detail-price">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xl text-muted-foreground line-through" data-testid="product-detail-original-price">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        {Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}% OFF
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-primary" data-testid="product-detail-price">
                      {isCustomProduct ? `From ${formatPrice(product.price)}` : formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="product-detail-description">
                  {product.description}
                </p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" data-testid={`tag-${tag}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity Selector (only for non-custom products) */}
              {!isCustomProduct && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center" data-testid="product-quantity">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isCustomProduct ? "Customize & Order" : "Pre-Order Now"}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  data-testid="button-wishlist"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Additional Info */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-3" data-testid="product-info">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>Premium Baked Goods</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preparation Time:</span>
                  <span>24-48 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shelf Life:</span>
                  <span>3-5 days refrigerated</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serving Size:</span>
                  <span>{isCustomProduct ? "Variable" : "6-8 people"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
                <TabsTrigger value="write-review" data-testid="tab-write-review">Write a Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
                    <ReviewsList productId={product.id} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="write-review" className="mt-6">
                <div className="max-w-2xl">
                  <ReviewForm productId={product.id} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
