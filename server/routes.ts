import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema, insertCategorySchema, insertAddOnSchema, insertProductImageSchema, insertProductAddOnSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { sendOrderNotification } from "./emailService";

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up user authentication system
  setupAuth(app);

  // Admin status endpoint - now uses proper authentication
  app.get("/api/admin/status", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ 
          isAdmin: false,
          message: "Not authenticated" 
        });
      }
      
      res.json({ 
        isAdmin: !!req.user.isAdmin,
        adminEmail: req.user.isAdmin ? req.user.email : null
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking admin status: " + error.message });
    }
  });

  // Protected Admin CRUD Routes

  // Categories/Collections Management
  app.get("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating category: " + error.message });
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating category: " + error.message });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting category: " + error.message });
    }
  });

  // Products Management
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating product: " + error.message });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  // Add-ons Management
  app.get("/api/admin/addons", requireAdmin, async (req, res) => {
    try {
      const addons = await storage.getAddOns();
      res.json(addons);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching add-ons: " + error.message });
    }
  });

  app.post("/api/admin/addons", requireAdmin, async (req, res) => {
    try {
      const addonData = insertAddOnSchema.parse(req.body);
      const addon = await storage.createAddOn(addonData);
      res.status(201).json(addon);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating add-on: " + error.message });
    }
  });

  app.put("/api/admin/addons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const addonData = insertAddOnSchema.partial().parse(req.body);
      const addon = await storage.updateAddOn(id, addonData);
      if (!addon) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      res.json(addon);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating add-on: " + error.message });
    }
  });

  app.delete("/api/admin/addons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAddOn(id);
      if (!deleted) {
        return res.status(404).json({ message: "Add-on not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting add-on: " + error.message });
    }
  });

  // Product Images Management
  app.get("/api/admin/product-images/:productId", requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const images = await storage.getProductImages(productId);
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product images: " + error.message });
    }
  });

  app.post("/api/admin/product-images", requireAdmin, async (req, res) => {
    try {
      const imageData = insertProductImageSchema.parse(req.body);
      const image = await storage.createProductImage(imageData);
      res.status(201).json(image);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating product image: " + error.message });
    }
  });

  app.delete("/api/admin/product-images/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProductImage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product image not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product image: " + error.message });
    }
  });

  // Product Add-ons Management
  app.get("/api/admin/product-addons/:productId", requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const associations = await storage.getProductAddOns(productId);
      res.json(associations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product add-ons: " + error.message });
    }
  });

  app.post("/api/admin/product-addons", requireAdmin, async (req, res) => {
    try {
      const associationData = insertProductAddOnSchema.parse(req.body);
      const association = await storage.addProductAddOn(associationData.productId, associationData.addOnId);
      res.status(201).json(association);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating product add-on association: " + error.message });
    }
  });

  app.delete("/api/admin/product-addons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      // For delete by ID, we need to get the association first
      const associations = await storage.getProductAddOns('');
      const association = associations.find((a: any) => a.id === id);
      if (!association) {
        return res.status(404).json({ message: "Product add-on association not found" });
      }
      const deleted = await storage.removeProductAddOn(association.productId, association.addOnId);
      if (!deleted) {
        return res.status(404).json({ message: "Product add-on association not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product add-on association: " + error.message });
    }
  });

  // Users Management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching users: " + error.message });
    }
  });

  // Orders Management
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['placed', 'in_progress', 'delivered', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating order status: " + error.message });
    }
  });
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching category: " + error.message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (featured === "true") {
        products = await storage.getFeaturedProducts();
      } else if (category) {
        const categoryData = await storage.getCategoryBySlug(category as string);
        if (!categoryData) {
          return res.status(404).json({ message: "Category not found" });
        }
        products = await storage.getProductsByCategory(categoryData.id);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || "guest";
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating cart item: " + error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || "guest";
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing cart: " + error.message });
    }
  });

  // Order management
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      // Validate required fields
      if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone || !orderData.customerAddress) {
        return res.status(400).json({ message: "All customer information fields are required" });
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order items are required" });
      }

      // Validate order data structure
      const validatedOrderData = insertOrderSchema.parse(orderData);
      
      // Validate order items (omit orderId since it's assigned by server)
      const orderItemValidationSchema = insertOrderItemSchema.omit({ orderId: true });
      const validatedItems = items.map(item => orderItemValidationSchema.parse(item));
      
      // Create the order
      const order = await storage.createOrder(validatedOrderData, validatedItems);
      console.log('Order created successfully, attempting to send email notification...');
      
      // Send email notification (don't block the response if email fails)
      try {
        console.log('Calling sendOrderNotification...');
        const emailResult = await sendOrderNotification(order as any);
        console.log('Email notification result:', emailResult);
      } catch (emailError) {
        console.error('Failed to send order notification email:', emailError);
        // Continue without failing the order creation
      }
      
      res.status(201).json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log("Order validation error:", JSON.stringify(error.errors, null, 2));
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
