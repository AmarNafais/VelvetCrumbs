import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

export default function FeaturedProducts() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "featured"],
    queryFn: () => fetch("/api/products?featured=true").then(res => res.json()),
  });

  const itemWidth = 320; // Approximate width of each product card
  const gap = 24; // gap-6 = 24px
  const itemWidthWithGap = itemWidth + gap;
  const maxOffset = Math.max(0, (products.length - visibleCount) * itemWidthWithGap);

  // Calculate visible items based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (!carouselRef.current) return;
      
      const containerWidth = carouselRef.current.clientWidth;
      const calculated = Math.floor(containerWidth / itemWidthWithGap) || 1;
      setVisibleCount(Math.min(calculated, products.length));
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [products.length, itemWidthWithGap]);

  const slideNext = () => {
    setCurrentOffset(prev => Math.min(prev + itemWidthWithGap, maxOffset));
  };

  const slidePrev = () => {
    setCurrentOffset(prev => Math.max(prev - itemWidthWithGap, 0));
  };

  // Touch/Swipe handlers for mobile with axis lock
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - currentX);
    const deltaY = Math.abs(touchStartY.current - currentY);
    
    // If horizontal movement is greater than vertical, prevent default scrolling
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    const minSwipeDistance = 50;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go to next
        slideNext();
      } else {
        // Swiped right - go to previous
        slidePrev();
      }
    }
    
    // Reset touch positions
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30" data-testid="featured-loading">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">🌟 Featured Delights – Handcrafted with Love</h2>
              <p className="text-muted-foreground">Discover our most popular treats, each one carefully crafted to bring joy to your special moments. ✨</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse" data-testid={`featured-skeleton-${i}`}>
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30" data-testid="featured-section">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="featured-title">
              🌟 Featured Delights – Handcrafted with Love
            </h2>
            <p className="text-muted-foreground" data-testid="featured-description">
              Discover our most popular treats, each one carefully crafted to bring joy to your special moments. ✨
            </p>
          </div>
          <div className="hidden md:flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={slidePrev}
              disabled={currentOffset === 0}
              data-testid="button-featured-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={slideNext}
              disabled={currentOffset >= maxOffset}
              data-testid="button-featured-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden" ref={carouselRef}>
          <div
            className="flex transition-transform duration-300 ease-in-out gap-6 select-none"
            style={{ transform: `translateX(-${currentOffset}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="featured-carousel"
          >
            {products.map((product) => (
              <div key={product.id} className="flex-none w-80" data-testid={`featured-product-${product.id}`}>
                <ProductCard product={product} featured />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
