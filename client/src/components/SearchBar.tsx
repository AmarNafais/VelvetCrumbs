import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function SearchBar({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className={className} data-testid="search-form">
      <div className="flex items-center">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-r-none"
          data-testid="input-search"
        />
        <Button 
          type="submit" 
          size="icon"
          className="rounded-l-none"
          data-testid="button-search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
