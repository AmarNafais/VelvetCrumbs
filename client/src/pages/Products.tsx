import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const searchParams = useSearch();
  const [sortBy, setSortBy] = useState("name");
  
  // Extract category from URL
  const categorySlug = location.split("/products/")[1] || "";
  const urlParams = new URLSearchParams(searchParams);
  const searchQuery = urlParams.get("search") || "";

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const currentCategory = categories.find(cat => cat.slug === categorySlug);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", categorySlug, searchQuery],
    queryFn: () => {
      let url = "/api/products";
      const params = new URLSearchParams();
      
      if (categorySlug) {
        params.append("category", categorySlug);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      return fetch(`${url}?${params.toString()}`).then(res => res.json());
    },
  });

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (currentCategory) {
      return currentCategory.name;
    }
    return "All Products";
  };

  const getPageDescription = () => {
    if (searchQuery) {
      return `Found ${products.length} products matching "${searchQuery}"`;
    }
    if (currentCategory) {
      return currentCategory.description;
    }
    return "Discover our complete collection of handcrafted delights";
  };

  return (
    <div className="min-h-screen bg-background" data-testid="products-page">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="products-title">
              {getPageTitle()}
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="products-description">
              {getPageDescription()}
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground" data-testid="products-count">
                {isLoading ? "Loading..." : `${products.length} products found`}
              </span>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-loading">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse" data-testid={`product-skeleton-${i}`}>
                  <div className="w-full h-64 bg-muted" />
                  <div className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-4" />
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16" data-testid="no-products">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No products match your search for "${searchQuery}"`
                  : "This category is currently empty"
                }
              </p>
              <Button onClick={() => window.history.back()} data-testid="button-go-back">
                Go Back
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
