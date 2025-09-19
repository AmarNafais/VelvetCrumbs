import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { WishlistWithProduct } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

type WishlistContextType = {
  wishlistItems: WishlistWithProduct[] | null | undefined;
  isLoading: boolean;
  error: Error | null;
  addToWishlistMutation: UseMutationResult<any, Error, string>;
  removeFromWishlistMutation: UseMutationResult<void, Error, string>;
  isProductInWishlist: (productId: string) => boolean;
  checkWishlistStatus: (productId: string) => Promise<boolean>;
};

export const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: wishlistItems,
    error,
    isLoading,
  } = useQuery<WishlistWithProduct[] | null, Error>({
    queryKey: ["/api/wishlist"],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include",
        });
        if (response.status === 401) {
          return null; // User not authenticated
        }
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        return await response.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user, // Only run query if user is authenticated
    retry: false,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("POST", "/api/wishlist", { productId });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate wishlist query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      // Invalidate wishlist query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isProductInWishlist = (productId: string): boolean => {
    if (!wishlistItems) return false;
    return wishlistItems.some(item => item.productId === productId);
  };

  const checkWishlistStatus = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/wishlist/check/${productId}`, {
        credentials: "include",
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.isInWishlist;
    } catch {
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        error,
        addToWishlistMutation,
        removeFromWishlistMutation,
        isProductInWishlist,
        checkWishlistStatus,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}