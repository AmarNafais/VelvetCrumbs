import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

const iconMap: Record<string, string> = {
  "fas fa-birthday-cake": "🎂",
  "fas fa-cookie": "🍪",
  "fas fa-palette": "🎨",
  "fas fa-cupcake": "🧁",
  "fas fa-bread-slice": "🍞",
  "fas fa-cookie-bite": "🍪",
  "fas fa-heart": "❤️",
  "fas fa-gift": "🎁",
};

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="relative group" data-testid="dropdown-categories">
      <button
        className="flex items-center text-foreground hover:text-primary transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        data-testid="button-categories"
      >
        Categories
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          data-testid="menu-categories"
        >
          <div className="p-4 grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="flex items-center p-2 rounded hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
                data-testid={`link-category-${category.slug}`}
              >
                <span className="mr-2 text-primary">
                  {iconMap[category.icon] || "📦"}
                </span>
                <div>
                  <div className="text-sm font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {category.itemCount} items
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
