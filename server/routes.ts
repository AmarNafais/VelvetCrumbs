import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

// Extend session type for admin authentication
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
    adminEmail?: string;
  }
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin Authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Hardcoded admin credentials as specified
      const ADMIN_EMAIL = "admin@velvetcrumbs.lk";
      const ADMIN_PASSWORD = "@Imaan23";
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Regenerate session to prevent session fixation attacks
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Session regeneration failed" });
          }
          
          req.session.isAdmin = true;
          req.session.adminEmail = email;
          req.session.save((err) => {
            if (err) {
              return res.status(500).json({ success: false, message: "Session save failed" });
            }
            res.json({ success: true, message: "Admin login successful" });
          });
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Login error: " + error.message });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      // Properly destroy session and clear cookie
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Logout error: " + err.message });
        }
        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({ success: true, message: "Admin logout successful" });
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Logout error: " + error.message });
    }
  });

  app.get("/api/admin/status", async (req, res) => {
    try {
      res.json({ 
        isAdmin: !!req.session.isAdmin,
        adminEmail: req.session.adminEmail 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking admin status: " + error.message });
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

  const httpServer = createServer(app);
  return httpServer;
}
