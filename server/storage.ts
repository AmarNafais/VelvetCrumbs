import { type Category, type Product, type CartItem, type InsertCategory, type InsertProduct, type InsertCartItem, type ProductWithCategory, type CartItemWithProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private cartItems: Map<string, CartItem> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const categoriesData = [
      { name: "Premium Cakes", description: "Luxury cakes for special celebrations", icon: "fas fa-birthday-cake", slug: "premium-cakes", itemCount: 24 },
      { name: "Traditional Sweets", description: "Authentic Sri Lankan delicacies", icon: "fas fa-cookie", slug: "traditional-sweets", itemCount: 18 },
      { name: "Custom Cakes", description: "Personalized designs for any occasion", icon: "fas fa-palette", slug: "custom-cakes", itemCount: 0 },
      { name: "Cupcakes", description: "Individual treats perfect for sharing", icon: "fas fa-cupcake", slug: "cupcakes", itemCount: 15 },
      { name: "Savories", description: "Delicious baked goods for any time", icon: "fas fa-bread-slice", slug: "savories", itemCount: 12 },
      { name: "Cookies & Desserts", description: "Sweet treats and bite-sized delights", icon: "fas fa-cookie-bite", slug: "cookies-desserts", itemCount: 20 },
      { name: "Wedding Cakes", description: "Elegant cakes for your special day", icon: "fas fa-heart", slug: "wedding-cakes", itemCount: 8 },
      { name: "Gift Hampers", description: "Curated collections of sweet treats", icon: "fas fa-gift", slug: "gift-hampers", itemCount: 6 }
    ];

    categoriesData.forEach(cat => {
      const id = randomUUID();
      const category: Category = { ...cat, id, description: cat.description || null };
      this.categories.set(id, category);
    });

    // Initialize products
    const productsData = [
      {
        name: "Premium Chocolate Cake",
        description: "Rich chocolate layers with premium cocoa and silky smooth ganache",
        price: "3500.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "premium-cakes")?.id || "",
        featured: true,
        inStock: true,
        rating: "4.9",
        tags: ["chocolate", "premium", "celebration"]
      },
      {
        name: "Traditional Kokis",
        description: "Authentic Sri Lankan sweet treats made with traditional recipes",
        price: "1200.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "traditional-sweets")?.id || "",
        featured: true,
        inStock: true,
        rating: "4.8",
        tags: ["traditional", "sri-lankan", "festive"]
      },
      {
        name: "Custom Wedding Cake",
        description: "Elegant three-tier design for your special day, fully customizable",
        price: "15000.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "wedding-cakes")?.id || "",
        featured: true,
        inStock: true,
        rating: "5.0",
        tags: ["wedding", "custom", "elegant"]
      },
      {
        name: "Gourmet Cupcakes (Box of 6)",
        description: "Assorted flavors with premium toppings and beautiful decorations",
        price: "2400.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "cupcakes")?.id || "",
        featured: true,
        inStock: true,
        rating: "4.7",
        tags: ["cupcakes", "assorted", "gourmet"]
      },
      {
        name: "Savory Pastries Mix",
        description: "Variety pack of freshly baked savories including rolls and patties",
        price: "1800.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "savories")?.id || "",
        featured: true,
        inStock: true,
        rating: "4.6",
        tags: ["savory", "variety", "fresh"]
      },
      {
        name: "Classic Vanilla Cake",
        description: "Light and fluffy vanilla sponge with buttercream frosting",
        price: "2000.00",
        originalPrice: "2500.00",
        image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "premium-cakes")?.id || "",
        featured: false,
        inStock: true,
        rating: "4.5",
        tags: ["vanilla", "classic", "sale"]
      },
      {
        name: "Chocolate Cupcakes (4 Pack)",
        description: "Rich chocolate cupcakes with vanilla buttercream frosting",
        price: "1275.00",
        originalPrice: "1500.00",
        image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "cupcakes")?.id || "",
        featured: false,
        inStock: true,
        rating: "4.4",
        tags: ["chocolate", "cupcakes", "sale"]
      },
      {
        name: "Cookie Assortment",
        description: "Mix of chocolate chip, oatmeal, and sugar cookies",
        price: "900.00",
        originalPrice: "1200.00",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "cookies-desserts")?.id || "",
        featured: false,
        inStock: true,
        rating: "4.3",
        tags: ["cookies", "assorted", "sale"]
      },
      {
        name: "Fresh Fruit Tart",
        description: "Buttery pastry base with pastry cream and seasonal fresh fruits",
        price: "1750.00",
        originalPrice: "2500.00",
        image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "cookies-desserts")?.id || "",
        featured: false,
        inStock: true,
        rating: "4.8",
        tags: ["fruit", "tart", "fresh", "sale"]
      }
    ];

    productsData.forEach(prod => {
      const id = randomUUID();
      const product: Product = { 
        ...prod, 
        id, 
        createdAt: new Date(),
        featured: prod.featured ?? false,
        inStock: prod.inStock ?? true,
        rating: prod.rating ?? "5.0",
        originalPrice: prod.originalPrice ?? null,
        tags: prod.tags ?? []
      };
      this.products.set(id, product);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...categoryData, 
      id, 
      description: categoryData.description || null,
      itemCount: categoryData.itemCount ?? 0
    };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...productData, 
      id, 
      createdAt: new Date(),
      featured: productData.featured ?? false,
      inStock: productData.inStock ?? true,
      rating: productData.rating ?? "5.0",
      originalPrice: productData.originalPrice ?? null,
      tags: productData.tags ?? []
    };
    this.products.set(id, product);
    return product;
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    const result: CartItemWithProduct[] = [];
    
    for (const cartItem of cartItems) {
      const product = this.products.get(cartItem.productId);
      if (product) {
        result.push({ ...cartItem, product });
      }
    }
    
    return result;
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.productId === cartItemData.productId && item.sessionId === cartItemData.sessionId
    );

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + (cartItemData.quantity ?? 1) };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    } else {
      // Create new cart item
      const id = randomUUID();
      const cartItem: CartItem = { 
        ...cartItemData, 
        id, 
        createdAt: new Date(),
        quantity: cartItemData.quantity ?? 1
      };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }

    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([, item]) => item.sessionId === sessionId)
      .map(([id]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }
}

export const storage = new MemStorage();
