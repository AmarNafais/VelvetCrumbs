import { Link } from "wouter";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: string) => {
    return `LKR ${parseFloat(price).toLocaleString()}`;
  };

  const rating = parseFloat(product.rating || "5.0");

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group" data-testid={`product-card-${product.id}`}>
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`product-image-${product.id}`}
          />
        </Link>
        <div className="absolute top-4 left-4">
          {featured && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium" data-testid={`badge-featured-${product.id}`}>
              Featured
            </span>
          )}
          {product.originalPrice && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium ml-2" data-testid={`badge-sale-${product.id}`}>
              Sale
            </span>
          )}
        </div>
        <button 
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-6">
        <Link href={`/product/${product.id}`} className="block mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4" data-testid={`product-description-${product.id}`}>
            {product.description}
          </p>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            {product.originalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary" data-testid={`product-price-${product.id}`}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground line-through" data-testid={`product-original-price-${product.id}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-primary" data-testid={`product-price-${product.id}`}>
                {product.name.includes("Custom") ? `From ${formatPrice(product.price)}` : formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="flex items-center text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1" data-testid={`product-rating-${product.id}`}>
              ({rating})
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleAddToCart}
          data-testid={`button-add-cart-${product.id}`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.name.includes("Custom") ? "Customize Now" : "Pre-Order Now"}
        </Button>
      </div>
    </div>
  );
}
