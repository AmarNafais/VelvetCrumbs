import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, insertUserSchema, loginUserSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
    },
    // Additional security options
    rolling: true, // Reset session expiry on activity
    proxy: process.env.NODE_ENV === "production", // Trust proxy in production
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'usernameOrEmail' }, async (usernameOrEmail, password, done) => {
      try {
        // Try to find user by username first, then by email
        let user = await storage.getUserByUsername(usernameOrEmail);
        if (!user) {
          user = await storage.getUserByEmail(usernameOrEmail);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // SECURITY: Log and block privilege escalation attempts
      if (req.body.hasOwnProperty('isAdmin')) {
        console.warn(`SECURITY WARNING: Privilege escalation attempt detected in registration from IP: ${req.ip || req.connection.remoteAddress}`, {
          timestamp: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          requestBody: { ...req.body, password: '[REDACTED]' }
        });
      }

      // Validate and sanitize input using Zod schema
      // Explicitly exclude isAdmin to prevent privilege escalation
      const registrationSchema = insertUserSchema.omit({ isAdmin: true }).extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
        email: z.string().email("Invalid email format"),
        username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long")
      });
      
      const validatedData = registrationSchema.parse(req.body);
      const { username, email, password, firstName, lastName, phone, address, dateOfBirth } = validatedData;

      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create new user with secure defaults
      const hashedPassword = await hashPassword(password);
      
      // SECURITY: Explicitly force isAdmin to false - no client input can override this
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth,
        isAdmin: false, // CRITICAL: Force false - cannot be overridden by client
      });

      // SECURITY: Double-check user was created without admin privileges
      if (user.isAdmin) {
        console.error(`CRITICAL SECURITY BREACH: User created with admin privileges despite safeguards! User ID: ${user.id}`);
        throw new Error("User creation security violation");
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Log in the user automatically
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      // Validate login credentials using Zod schema
      const validatedCredentials = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: UserType | false, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid username or password" });
        }

        req.login(user, (err) => {
          if (err) {
            return next(err);
          }

          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;
          
          // Check if user is admin and redirect accordingly
          if (user.isAdmin) {
            res.json({ 
              ...userWithoutPassword, 
              redirectTo: "/admin/dashboard" 
            });
          } else {
            res.json({ 
              ...userWithoutPassword, 
              redirectTo: "/" 
            });
          }
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      next(error);
    }
  });

  // User logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Update user profile endpoint
  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // SECURITY: Log and block privilege escalation attempts in profile updates
      if (req.body.hasOwnProperty('isAdmin') || req.body.hasOwnProperty('username') || req.body.hasOwnProperty('password')) {
        console.warn(`SECURITY WARNING: Privilege escalation/sensitive field modification attempt in profile update from user ${req.user.id} (${req.user.username}) from IP: ${req.ip || req.connection.remoteAddress}`, {
          timestamp: new Date().toISOString(),
          userId: req.user.id,
          username: req.user.username,
          userAgent: req.get('User-Agent'),
          suspiciousFields: Object.keys(req.body).filter(key => ['isAdmin', 'username', 'password'].includes(key))
        });
      }

      // Validate profile update data using Zod schema
      // updateUserProfileSchema already excludes sensitive fields (username, password, isAdmin)
      const profileUpdateSchema = updateUserProfileSchema.extend({
        email: z.string().email("Invalid email format").optional(),
        firstName: z.string().max(100, "First name too long").optional(),
        lastName: z.string().max(100, "Last name too long").optional(),
        phone: z.string().max(20, "Phone number too long").optional(),
        address: z.string().max(500, "Address too long").optional(),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
      });
      
      const validatedData = profileUpdateSchema.parse(req.body);
      const { firstName, lastName, email, phone, address, dateOfBirth } = validatedData;
      
      // Check if email is being changed and if it's already taken
      if (email && email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      const updatedUser = await storage.updateUserProfile(req.user.id, {
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // SECURITY: Verify that sensitive fields weren't modified during update
      if (updatedUser.isAdmin !== req.user.isAdmin || updatedUser.username !== req.user.username) {
        console.error(`CRITICAL SECURITY BREACH: Sensitive fields modified during profile update! User ID: ${req.user.id}`, {
          before: { isAdmin: req.user.isAdmin, username: req.user.username },
          after: { isAdmin: updatedUser.isAdmin, username: updatedUser.username }
        });
        throw new Error("Profile update security violation");
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}