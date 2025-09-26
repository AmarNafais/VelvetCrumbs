import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { ShoppingCart, Menu, Search, X, User, LogIn, UserPlus, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CategoryDropdown from "./CategoryDropdown";
import CartSidebar from "./CartSidebar";
import WishlistSidebar from "./WishlistSidebar";

export default function Header() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { user, logoutMutation } = useAuth();
  const { wishlistItems } = useWishlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" data-testid="header-main">
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
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-semibold" data-testid="link-home-nav">
                home
              </Link>
              <div className="font-semibold">
                <CategoryDropdown />
              </div>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors font-semibold" data-testid="link-about">
                about
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-semibold" data-testid="link-contact">
                contact
              </Link>
              {user?.isAdmin && (
                <Link href="/admin/dashboard" className="text-foreground hover:text-primary transition-colors font-semibold" data-testid="link-dashboard">
                  dashboard
                </Link>
              )}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Search Icon - Hidden on very small screens */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden xs:flex p-1 sm:p-2"
                onClick={() => {
                  // Toggle search functionality - for now just navigate to products
                  setLocation('/products');
                }}
                data-testid="button-search"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Authentication & Cart */}
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex px-2 sm:px-4 py-1 sm:py-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-account"
                  >
                    account
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden p-1"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-account-mobile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex p-2"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex px-2 sm:px-4 py-1 sm:py-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm"
                    onClick={() => setLocation("/auth")}
                    data-testid="button-login"
                  >
                    login
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden p-1"
                    onClick={() => setLocation("/auth")}
                    data-testid="button-login-mobile"
                  >
                    <LogIn className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Wishlist Button - Only for logged users */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-1 sm:p-2"
                  onClick={() => setIsWishlistOpen(true)}
                  data-testid="button-wishlist"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center" data-testid="text-wishlist-count">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                className="relative p-1 sm:p-2"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center" data-testid="text-cart-count">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-1 sm:p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                className="block text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                home
              </Link>
              <Link
                href="/products"
                className="block text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-categories-mobile"
              >
                categories
              </Link>
              <Link
                href="/about"
                className="block text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                about
              </Link>
              <Link
                href="/contact"
                className="block text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                contact
              </Link>
              {user?.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="block text-foreground hover:text-primary transition-colors font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="link-dashboard-mobile"
                >
                  dashboard
                </Link>
              )}
              {/* Mobile Authentication Actions */}
              {user && (
                <div className="pt-2 border-t border-border sm:hidden">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:text-primary transition-colors font-semibold"
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    logout
                  </Button>
                </div>
              )}
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
      <WishlistSidebar isOpen={isWishlistOpen} setIsOpen={setIsWishlistOpen} />
    </>
  );
}
