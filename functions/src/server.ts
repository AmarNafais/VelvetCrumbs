import express from "express";
import { registerRoutes } from "./routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Firebase Cloud Functions  
app.set("trust proxy", true);

// Setup all routes (includes auth setup)
registerRoutes(app);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Velvet Crumbs API is running on Firebase!", 
    timestamp: new Date().toISOString() 
  });
});

export default app;