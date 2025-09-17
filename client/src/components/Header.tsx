import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, Menu, Search, X, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CategoryDropdown from "./CategoryDropdown";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { user, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm" data-testid="header-main">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center" data-testid="link-home">
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                <span className="text-primary">Velvet</span>
                <span className="text-accent-foreground ml-1">Crumbs</span>
              </h1>
            </Link>

            {/* Main Navigation - Desktop - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8" data-testid="nav-desktop">
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-home-nav">
                Home
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-about">
                About Us
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-services">
                Services
              </Link>
              <Link href="/products?featured=true" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-featured">
                Featured
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-contact">
                Contact Me
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-3">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => {
                  // Toggle search functionality - for now just navigate to products
                  setLocation('/products');
                }}
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Authentication & Cart */}
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-profile"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-login"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-cart-count">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border" data-testid="menu-mobile">
            <nav className="p-4 space-y-4">
              <Link
                href="/"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                About Us
              </Link>
              <Link
                href="/products"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-services-mobile"
              >
                Services
              </Link>
              <Link
                href="/products?featured=true"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-featured-mobile"
              >
                Featured
              </Link>
              <Link
                href="/contact"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                Contact Me
              </Link>
              <div className="pt-4 border-t border-border">
                <form onSubmit={handleSearch} className="flex gap-2" data-testid="form-search-mobile">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    data-testid="input-search-mobile"
                  />
                  <Button type="submit" size="sm" data-testid="button-search-mobile">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </nav>
          </div>
        )}
      </header>

      <CartSidebar />
    </>
  );
}
