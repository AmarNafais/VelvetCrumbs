import { X, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface WishlistSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function WishlistSidebar({ isOpen, setIsOpen }: WishlistSidebarProps) {
  const { wishlistItems, removeFromWishlistMutation } = useWishlist();
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const formatPrice = (price: string) => {
    return `LKR ${parseFloat(price).toLocaleString()}`;
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId, 1);
    toast({
      title: "Added to cart",
      description: `${productName} has been added to your cart.`,
    });
  };

  const handleGoToProduct = (productId: string) => {
    setIsOpen(false);
    setLocation(`/product/${productId}`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          data-testid="wishlist-overlay"
        />
      )}

      {/* Wishlist Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-card shadow-2xl z-50 transition-transform duration-300 border-l border-border ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} data-testid="wishlist-sidebar">
        <div className="flex flex-col h-full">
          {/* Wishlist Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground" data-testid="wishlist-title">
              My Wishlist
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-muted"
              data-testid="button-close-wishlist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {!wishlistItems || wishlistItems.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-wishlist">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h4>
                <p className="text-muted-foreground mb-6">Save your favorite products to see them here!</p>
                <Button 
                  onClick={() => {
                    setIsOpen(false);
                    setLocation("/products");
                  }}
                  data-testid="button-browse-products"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="wishlist-items">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-muted/30 rounded-lg p-4" data-testid={`wishlist-item-${item.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                      onClick={() => handleGoToProduct(item.product.id)}
                      data-testid={`wishlist-item-image-${item.id}`}
                    />
                    <div className="flex-1">
                      <h4 
                        className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleGoToProduct(item.product.id)}
                        data-testid={`wishlist-item-name-${item.id}`}
                      >
                        {item.product.name}
                      </h4>
                      <p className="text-primary font-semibold" data-testid={`wishlist-item-price-${item.id}`}>
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handleAddToCart(item.product.id, item.product.name)}
                        data-testid={`button-add-to-cart-${item.id}`}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 h-8 px-3"
                        onClick={() => handleRemoveFromWishlist(item.product.id)}
                        disabled={removeFromWishlistMutation.isPending}
                        data-testid={`button-remove-wishlist-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Footer */}
          {wishlistItems && wishlistItems.length > 0 && (
            <div className="border-t border-border p-6 bg-muted/20">
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    setLocation("/products");
                  }}
                  data-testid="button-continue-shopping-wishlist"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}