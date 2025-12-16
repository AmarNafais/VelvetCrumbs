import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, int, decimal, boolean, timestamp, unique, index, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Order status enum for data integrity
export const orderStatusEnum = mysqlEnum('order_status', ['placed', 'in_progress', 'delivered', 'completed', 'canceled']);

// Users table for authentication and profile management
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: text("date_of_birth"), // Store as text for simplicity (YYYY-MM-DD format)
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  usernameIdx: unique("users_username_unique").on(table.username),
  emailIdx: unique("users_email_unique").on(table.email),
}));

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  coverImage: text("cover_image"), // Added for admin panel
  slug: text("slug").notNull(),
  itemCount: int("item_count").notNull().default(0),
}, (table) => ({
  slugIdx: unique("categories_slug_unique").on(table.slug),
}));

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(), // Keep as primary image
  duration: text("duration"), // Added for admin panel (e.g. "15 min prep time")
  categoryId: varchar("category_id", { length: 36 }).notNull().references(() => categories.id),
  featured: boolean("featured").default(false),
  inStock: boolean("in_stock").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  tags: text("tags"), // Stores JSON array as string
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("products_category_id_idx").on(table.categoryId),
}));

export const cartItems = mysqlTable("cart_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  quantity: int("quantity").notNull().default(1),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"), // For guest users only
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userProductUnique: unique("cart_user_product_unique").on(table.userId, table.productId),
  sessionProductUnique: unique("cart_session_product_unique").on(table.sessionId, table.productId),
  userIdx: index("cart_items_user_id_idx").on(table.userId),
  sessionIdx: index("cart_items_session_id_idx").on(table.sessionId),
}));

// Multiple images for products
export const productImages = mysqlTable("product_images", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: int("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productIdx: index("product_images_product_id_idx").on(table.productId),
  productPositionUnique: unique("product_images_product_position_unique").on(table.productId, table.position),
}));

// Add-ons management
export const addOns = mysqlTable("add_ons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Many-to-many relationship between products and add-ons
export const productAddOns = mysqlTable("product_add_ons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  addOnId: varchar("add_on_id", { length: 36 }).notNull().references(() => addOns.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productAddOnUnique: unique("product_add_on_unique").on(table.productId, table.addOnId),
}));

// Orders management
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("placed"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusIdx: index("orders_status_idx").on(table.status),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

// Order items
export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "restrict" }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(), // Total for this line item including add-ons
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orderIdx: index("order_items_order_id_idx").on(table.orderId),
}));

// Order item add-ons (proper relational model)
export const orderItemAddOns = mysqlTable("order_item_add_ons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderItemId: varchar("order_item_id", { length: 36 }).notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  addOnId: varchar("add_on_id", { length: 36 }).references(() => addOns.id, { onDelete: "restrict" }), // Nullable for deleted add-ons
  addOnName: text("add_on_name").notNull(), // Snapshot at purchase time
  addOnPrice: decimal("add_on_price", { precision: 10, scale: 2 }).notNull(), // Snapshot at purchase time
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orderItemIdx: index("order_item_add_ons_order_item_id_idx").on(table.orderItemId),
}));

// Wishlist table for logged-in users
export const wishlists = mysqlTable("wishlists", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userProductUnique: unique("wishlist_user_product_unique").on(table.userId, table.productId),
  userIdx: index("wishlists_user_id_idx").on(table.userId),
  productIdx: index("wishlists_product_id_idx").on(table.productId),
}));

// Reviews table for user product reviews and ratings
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userProductUnique: unique("review_user_product_unique").on(table.userId, table.productId),
  userIdx: index("reviews_user_id_idx").on(table.userId),
  productIdx: index("reviews_product_id_idx").on(table.productId),
  ratingIdx: index("reviews_rating_idx").on(table.rating),
}));

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  images: many(productImages),
  addOns: many(productAddOns),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  reviews: many(reviews),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const addOnsRelations = relations(addOns, ({ many }) => ({
  products: many(productAddOns),
}));

export const productAddOnsRelations = relations(productAddOns, ({ one }) => ({
  product: one(products, {
    fields: [productAddOns.productId],
    references: [products.id],
  }),
  addOn: one(addOns, {
    fields: [productAddOns.addOnId],
    references: [addOns.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlists: many(wishlists),
  reviews: many(reviews),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.customerEmail],
    references: [users.email],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  addOns: many(orderItemAddOns),
}));

export const orderItemAddOnsRelations = relations(orderItemAddOns, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemAddOns.orderItemId],
    references: [orderItems.id],
  }),
  addOn: one(addOns, {
    fields: [orderItemAddOns.addOnId],
    references: [addOns.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});

export const insertAddOnSchema = createInsertSchema(addOns).omit({
  id: true,
  createdAt: true,
});

export const insertProductAddOnSchema = createInsertSchema(productAddOns).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemAddOnSchema = createInsertSchema(orderItemAddOns).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters").optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User login schema - accepts either username or email
export const loginUserSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// User profile update schema (excludes sensitive fields, all fields optional)
export const updateUserProfileSchema = insertUserSchema.omit({
  username: true,
  password: true,
  isAdmin: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

export type InsertAddOn = z.infer<typeof insertAddOnSchema>;
export type AddOn = typeof addOns.$inferSelect;

export type InsertProductAddOn = z.infer<typeof insertProductAddOnSchema>;
export type ProductAddOn = typeof productAddOns.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertOrderItemAddOn = z.infer<typeof insertOrderItemAddOnSchema>;
export type OrderItemAddOn = typeof orderItemAddOns.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type LoginUser = z.infer<typeof loginUserSchema>;

// Extended types for frontend
export type ProductWithCategory = Product & { category: Category };
export type ProductWithImages = Product & { images: ProductImage[] };
export type ProductWithAddOns = Product & { addOns: (ProductAddOn & { addOn: AddOn })[] }; // Fixed type
export type CartItemWithProduct = CartItem & { product: Product };
export type OrderWithItems = Order & { items: (OrderItem & { 
  product: Product; 
  addOns: (OrderItemAddOn & { addOn: AddOn | null })[];
})[] };
export type OrderItemWithAddOns = OrderItem & { 
  addOns: (OrderItemAddOn & { addOn: AddOn | null })[];
};
export type WishlistWithProduct = Wishlist & { product: Product };
export type ReviewWithUser = Review & { user: User };
