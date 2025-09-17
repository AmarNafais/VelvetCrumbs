import { 
  type Category, type Product, type CartItem, type ProductImage, type AddOn, type ProductAddOn, type Order, type OrderItem, type OrderItemAddOn, type User,
  type InsertCategory, type InsertProduct, type InsertCartItem, type InsertProductImage, type InsertAddOn, type InsertProductAddOn, type InsertOrder, type InsertOrderItem, type InsertOrderItemAddOn, type InsertUser, type UpdateUserProfile,
  type ProductWithCategory, type CartItemWithProduct, type ProductWithImages, type ProductWithAddOns, type OrderWithItems,
  categories, products, cartItems, productImages, addOns, productAddOns, orders, orderItems, orderItemAddOns, users 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Product Images
  getProductImages(productId: string): Promise<ProductImage[]>;
  createProductImage(image: InsertProductImage): Promise<ProductImage>;
  updateProductImage(id: string, image: Partial<InsertProductImage>): Promise<ProductImage | undefined>;
  deleteProductImage(id: string): Promise<boolean>;
  deleteProductImages(productId: string): Promise<void>;

  // Add-ons
  getAddOns(): Promise<AddOn[]>;
  getAddOnById(id: string): Promise<AddOn | undefined>;
  createAddOn(addOn: InsertAddOn): Promise<AddOn>;
  updateAddOn(id: string, addOn: Partial<InsertAddOn>): Promise<AddOn | undefined>;
  deleteAddOn(id: string): Promise<boolean>;

  // Product Add-ons (Junction table)
  getProductAddOns(productId: string): Promise<AddOn[]>;
  addProductAddOn(productId: string, addOnId: string): Promise<ProductAddOn>;
  removeProductAddOn(productId: string, addOnId: string): Promise<boolean>;
  setProductAddOns(productId: string, addOnIds: string[]): Promise<void>;

  // Orders
  getOrders(): Promise<OrderWithItems[]>;
  getOrderById(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: string, status: 'placed' | 'in_progress' | 'delivered' | 'completed' | 'canceled'): Promise<Order | undefined>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Session store for authentication
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize session store with proper fallback
    if (process.env.DATABASE_URL) {
      // Use PostgreSQL session store in production/development with database
      const PostgresSessionStore = connectPg(session);
      this.sessionStore = new PostgresSessionStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        errorLog: (error: Error) => {
          console.error('Session store error:', error);
        },
      });
    } else {
      // Fallback to MemoryStore for development without database
      console.warn('DATABASE_URL not found, using MemoryStore for sessions (not suitable for production)');
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      });
    }
    
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    try {
      // Check if categories already exist
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) {
        return; // Data already initialized
      }

      console.log("Initializing database with sample data...");

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

      // Insert categories
      const insertedCategories = await db.insert(categories).values(categoriesData).returning();
      console.log(`Inserted ${insertedCategories.length} categories`);

      // Find category IDs
      const premiumCakesId = insertedCategories.find(c => c.slug === "premium-cakes")?.id || "";
      const traditionalSweetsId = insertedCategories.find(c => c.slug === "traditional-sweets")?.id || "";
      const weddingCakesId = insertedCategories.find(c => c.slug === "wedding-cakes")?.id || "";
      const cupcakesId = insertedCategories.find(c => c.slug === "cupcakes")?.id || "";
      const savoriesId = insertedCategories.find(c => c.slug === "savories")?.id || "";
      const cookiesDessertsId = insertedCategories.find(c => c.slug === "cookies-desserts")?.id || "";

      // Initialize products
      const productsData = [
        {
          name: "Premium Chocolate Cake",
          description: "Rich chocolate layers with premium cocoa and silky smooth ganache",
          price: "3500.00",
          originalPrice: null,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          categoryId: premiumCakesId,
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
          categoryId: traditionalSweetsId,
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
          categoryId: weddingCakesId,
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
          categoryId: cupcakesId,
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
          categoryId: savoriesId,
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
          categoryId: premiumCakesId,
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
          categoryId: cupcakesId,
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
          categoryId: cookiesDessertsId,
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
          categoryId: cookiesDessertsId,
          featured: false,
          inStock: true,
          rating: "4.8",
          tags: ["fruit", "tart", "fresh", "sale"]
        }
      ];

      // Insert products
      const insertedProducts = await db.insert(products).values(productsData).returning();
      console.log(`Inserted ${insertedProducts.length} products`);
      console.log("Database initialization completed");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select()
      .from(products)
      .where(
        or(
          ilike(products.name, searchTerm),
          ilike(products.description, searchTerm)
        )
      );
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Product Images
  async getProductImages(productId: string): Promise<ProductImage[]> {
    return await db.select().from(productImages).where(eq(productImages.productId, productId));
  }

  async createProductImage(imageData: InsertProductImage): Promise<ProductImage> {
    const [image] = await db.insert(productImages).values(imageData).returning();
    return image;
  }

  async updateProductImage(id: string, imageData: Partial<InsertProductImage>): Promise<ProductImage | undefined> {
    const [image] = await db
      .update(productImages)
      .set(imageData)
      .where(eq(productImages.id, id))
      .returning();
    return image || undefined;
  }

  async deleteProductImage(id: string): Promise<boolean> {
    const result = await db.delete(productImages).where(eq(productImages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteProductImages(productId: string): Promise<void> {
    await db.delete(productImages).where(eq(productImages.productId, productId));
  }

  // Add-ons
  async getAddOns(): Promise<AddOn[]> {
    return await db.select().from(addOns);
  }

  async getAddOnById(id: string): Promise<AddOn | undefined> {
    const [addOn] = await db.select().from(addOns).where(eq(addOns.id, id));
    return addOn || undefined;
  }

  async createAddOn(addOnData: InsertAddOn): Promise<AddOn> {
    const [addOn] = await db.insert(addOns).values(addOnData).returning();
    return addOn;
  }

  async updateAddOn(id: string, addOnData: Partial<InsertAddOn>): Promise<AddOn | undefined> {
    const [addOn] = await db
      .update(addOns)
      .set(addOnData)
      .where(eq(addOns.id, id))
      .returning();
    return addOn || undefined;
  }

  async deleteAddOn(id: string): Promise<boolean> {
    const result = await db.delete(addOns).where(eq(addOns.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Product Add-ons (Junction table)
  async getProductAddOns(productId: string): Promise<AddOn[]> {
    const result = await db
      .select({ addOn: addOns })
      .from(productAddOns)
      .leftJoin(addOns, eq(productAddOns.addOnId, addOns.id))
      .where(eq(productAddOns.productId, productId));
    
    return result.map(r => r.addOn).filter(Boolean) as AddOn[];
  }

  async addProductAddOn(productId: string, addOnId: string): Promise<ProductAddOn> {
    const [productAddOn] = await db.insert(productAddOns).values({ productId, addOnId }).returning();
    return productAddOn;
  }

  async removeProductAddOn(productId: string, addOnId: string): Promise<boolean> {
    const result = await db
      .delete(productAddOns)
      .where(and(eq(productAddOns.productId, productId), eq(productAddOns.addOnId, addOnId)));
    return (result.rowCount || 0) > 0;
  }

  async setProductAddOns(productId: string, addOnIds: string[]): Promise<void> {
    // Remove existing associations
    await db.delete(productAddOns).where(eq(productAddOns.productId, productId));
    
    // Add new associations
    if (addOnIds.length > 0) {
      await db.insert(productAddOns).values(
        addOnIds.map(addOnId => ({ productId, addOnId }))
      );
    }
  }

  // Orders
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersData = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const ordersWithItems: OrderWithItems[] = [];
    
    for (const order of ordersData) {
      const items = await db
        .select({
          orderItem: orderItems,
          product: products
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      const itemsWithAddOns = [];
      for (const item of items) {
        const itemAddOns = await db
          .select({
            orderItemAddOn: orderItemAddOns,
            addOn: addOns
          })
          .from(orderItemAddOns)
          .leftJoin(addOns, eq(orderItemAddOns.addOnId, addOns.id))
          .where(eq(orderItemAddOns.orderItemId, item.orderItem.id));

        itemsWithAddOns.push({
          ...item.orderItem,
          product: item.product!,
          addOns: itemAddOns.map((a: any) => ({ ...a.orderItemAddOn, addOn: a.addOn }))
        });
      }

      ordersWithItems.push({
        ...order,
        items: itemsWithAddOns as any
      });
    }

    return ordersWithItems;
  }

  async getOrderById(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select({
        orderItem: orderItems,
        product: products
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    const itemsWithAddOns = [];
    for (const item of items) {
      const itemAddOns = await db
        .select({
          orderItemAddOn: orderItemAddOns,
          addOn: addOns
        })
        .from(orderItemAddOns)
        .leftJoin(addOns, eq(orderItemAddOns.addOnId, addOns.id))
        .where(eq(orderItemAddOns.orderItemId, item.orderItem.id));

      itemsWithAddOns.push({
        ...item.orderItem,
        product: item.product!,
        addOns: itemAddOns.map((a: any) => ({ ...a.orderItemAddOn, addOn: a.addOn }))
      });
    }

    return {
      ...order,
      items: itemsWithAddOns as any
    };
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [order] = await db.insert(orders).values(orderData).returning();
    
    const createdOrderItems: any[] = [];
    for (const itemData of items) {
      const [orderItem] = await db.insert(orderItems).values({
        ...itemData,
        orderId: order.id
      }).returning();
      createdOrderItems.push(orderItem);
    }

    return {
      ...order,
      items: createdOrderItems as any
    };
  }

  async updateOrderStatus(id: string, status: 'placed' | 'in_progress' | 'delivered' | 'completed' | 'canceled'): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        sessionId: cartItems.sessionId,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return result.filter(item => item.product !== null) as CartItemWithProduct[];
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.productId, cartItemData.productId),
          eq(cartItems.sessionId, cartItemData.sessionId)
        )
      );

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItemData.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItemData).returning();
      return newItem;
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return undefined;
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();

    return updatedItem || undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();