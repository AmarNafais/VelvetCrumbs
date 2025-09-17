import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  const deliveryFee = 500;
  const total = cartTotal + (cartItems.length > 0 ? deliveryFee : 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background" data-testid="cart-empty">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
              <h1 className="text-4xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover our delicious treats and start filling your cart!
              </p>
              <Link href="/products">
                <Button size="lg" data-testid="button-shop-now">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="cart-page">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="cart-title">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground" data-testid="cart-subtitle">
                Review your items before checkout
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" data-testid="button-continue-shopping">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearCart}
                    data-testid="button-clear-cart"
                  >
                    Clear All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg" data-testid={`cart-item-${item.id}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        data-testid={`cart-item-image-${item.id}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground" data-testid={`cart-item-name-${item.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`cart-item-description-${item.id}`}>
                          {item.product.description.length > 80 
                            ? `${item.product.description.substring(0, 80)}...` 
                            : item.product.description
                          }
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-semibold text-primary" data-testid={`cart-item-price-${item.id}`}>
                            {formatPrice(parseFloat(item.product.price))}
                          </span>
                          {item.product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2" data-testid={`cart-item-original-price-${item.id}`}>
                              {formatPrice(parseFloat(item.product.originalPrice))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium" data-testid={`cart-item-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground" data-testid={`cart-item-total-${item.id}`}>
                          {formatPrice(parseFloat(item.product.price) * item.quantity)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 mt-2"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6" data-testid="order-summary">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span data-testid="order-subtotal">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span data-testid="order-delivery">{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary" data-testid="order-total">{formatPrice(total)}</span>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => setLocation("/checkout")}
                      data-testid="button-checkout"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Secure checkout with SSL encryption
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input placeholder="Enter promo code" data-testid="input-promo-code" />
                    <Button variant="outline" data-testid="button-apply-promo">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• 24-48 hours advance notice required</p>
                  <p>• Free delivery for orders over LKR 5,000</p>
                  <p>• Available island-wide in Sri Lanka</p>
                  <p>• Contact us for custom delivery arrangements</p>
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
