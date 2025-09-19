import { X, Minus, Plus, Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CartSidebar() {
  const { 
    cartItems, 
    cartTotal, 
    cartCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    isCartOpen, 
    setIsCartOpen 
  } = useCart();
  
  const [, setLocation] = useLocation();

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const deliveryFee = 500;
  const total = cartTotal + (cartItems.length > 0 ? deliveryFee : 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setLocation("/cart");
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
          data-testid="cart-overlay"
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 max-w-md bg-card shadow-2xl z-50 cart-sidebar transition-transform duration-300 border-l border-border ${isCartOpen ? 'open' : ''}`} data-testid="cart-sidebar">
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground" data-testid="cart-title">
              Shopping Cart
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="rounded-full bg-muted"
              data-testid="button-close-cart"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-cart">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h4>
                <p className="text-muted-foreground mb-6">Add some delicious treats to get started!</p>
                <Button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setLocation("/products");
                  }}
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-muted/30 rounded-lg p-3 sm:p-4" data-testid={`cart-item-${item.id}`}>
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        data-testid={`cart-item-image-${item.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm sm:text-base leading-tight break-words" data-testid={`cart-item-name-${item.id}`}>
                          {item.product.name}
                        </h4>
                        <p className="text-primary font-semibold text-sm mt-1" data-testid={`cart-item-price-${item.id}`}>
                          {formatPrice(parseFloat(item.product.price))}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-sm" data-testid={`cart-item-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-border p-4 sm:p-6 bg-muted/20">
              {/* Order Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground" data-testid="cart-subtotal">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="text-foreground" data-testid="cart-delivery">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary" data-testid="cart-total">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                    setLocation("/products");
                  }}
                  data-testid="button-continue-shopping-footer"
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
