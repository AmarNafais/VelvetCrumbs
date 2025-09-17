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
              <img 
                src="/attached_assets/web-logo_1757862567145.png" 
                alt="Velvet Crumbs" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Main Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8" data-testid="nav-desktop">
              <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home-nav">
                Home
              </Link>
              <CategoryDropdown />
              <Link href="/about" className="text-foreground hover:text-primary transition-colors" data-testid="link-about">
                About
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors" data-testid="link-contact">
                Contact
              </Link>
            </nav>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Desktop */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-muted rounded-full px-4 py-2" data-testid="form-search">
                <Search className="text-muted-foreground mr-2 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-48 p-0 h-auto focus-visible:ring-0"
                  data-testid="input-search"
                />
              </form>

              {/* Authentication Buttons */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-profile"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline ml-1">{user.firstName || user.username}</span>
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
                    <span className="hidden md:inline ml-1">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setLocation("/auth")}
                    data-testid="button-login"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="hidden md:inline ml-1">Login</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2"
                    onClick={() => setLocation("/auth")}
                    data-testid="button-signup"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span className="hidden md:inline ml-1">Sign Up</span>
                  </Button>
                </div>
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
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-products-mobile"
              >
                Products
              </Link>
              <Link
                href="/about"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                Contact
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
