import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  try {
    const adminEmail = "admin@velvetcrumbs.lk";
    const adminPassword = "Complex123@";
    
    // Hash the password
    const hashedPassword = await hashPassword(adminPassword);
    
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      // Update existing admin user to ensure correct credentials and admin status
      await db
        .update(users)
        .set({
          username: "admin",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          isAdmin: true,
        })
        .where(eq(users.email, adminEmail));
      
      console.log("Admin user updated successfully:");
      console.log("Email:", adminEmail);
      console.log("Username: admin");
      console.log("Admin privileges: true");
    } else {
      // Create new admin user
      await db
        .insert(users)
        .values({
          username: "admin",
          email: adminEmail,
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          isAdmin: true,
        })
        .returning();
      
      console.log("Admin user created successfully:");
      console.log("Email:", adminEmail);
      console.log("Username: admin");
      console.log("Admin privileges: true");
    }
    
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

// Run the seeder
seedAdmin()
  .then(() => {
    console.log("Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });