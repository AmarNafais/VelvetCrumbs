import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/use-auth";
import { WishlistProvider } from "@/hooks/use-wishlist";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCollections from "@/pages/AdminCollections";
import AdminProducts from "@/pages/AdminProducts";
import AdminAddons from "@/pages/AdminAddons";
import AdminOrders from "@/pages/AdminOrders";
import AuthPage from "@/pages/AuthPage";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success/:id" component={OrderSuccess} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/collections" component={AdminCollections} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/addons" component={AdminAddons} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Router />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
