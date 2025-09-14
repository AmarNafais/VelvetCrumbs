import { Link } from "wouter";
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

export default function ProductCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-background" data-testid="categories-loading">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-8 animate-pulse" data-testid={`category-skeleton-${i}`}>
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4" />
                <div className="h-3 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background" data-testid="categories-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="categories-title">
            Our Product Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="categories-description">
            Explore our carefully curated selection of handcrafted delights, each category filled with treats made with love and the finest ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="bg-card rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer border border-border"
              data-testid={`category-${category.slug}`}
            >
              <div className={`w-16 h-16 ${index % 2 === 0 ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-accent/10 group-hover:bg-accent/20'} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
                <span className={`text-2xl ${index % 2 === 0 ? 'text-primary' : 'text-accent'}`}>
                  {iconMap[category.icon] || "📦"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`category-name-${category.slug}`}>
                {category.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4" data-testid={`category-description-${category.slug}`}>
                {category.description}
              </p>
              <span className="text-primary font-medium" data-testid={`category-count-${category.slug}`}>
                {category.itemCount > 0 ? `${category.itemCount} Items` : "Custom Options"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
