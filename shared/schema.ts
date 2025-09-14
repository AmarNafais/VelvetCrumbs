import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, unique, index, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Order status enum for data integrity
export const orderStatusEnum = pgEnum('order_status', ['placed', 'in_progress', 'delivered', 'completed', 'canceled']);

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  coverImage: text("cover_image"), // Added for admin panel
  slug: text("slug").notNull().unique(),
  itemCount: integer("item_count").notNull().default(0),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(), // Keep as primary image
  duration: text("duration"), // Added for admin panel (e.g. "15 min prep time")
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  featured: boolean("featured").default(false),
  inStock: boolean("in_stock").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("products_category_id_idx").on(table.categoryId),
}));

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionProductUnique: unique("cart_session_product_unique").on(table.sessionId, table.productId),
  sessionIdx: index("cart_items_session_id_idx").on(table.sessionId),
}));

// Multiple images for products
export const productImages = pgTable("product_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productIdx: index("product_images_product_id_idx").on(table.productId),
  productPositionUnique: unique("product_images_product_position_unique").on(table.productId, table.position),
}));

// Add-ons management
export const addOns = pgTable("add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Many-to-many relationship between products and add-ons
export const productAddOns = pgTable("product_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  addOnId: varchar("add_on_id").notNull().references(() => addOns.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  productAddOnUnique: unique("product_add_on_unique").on(table.productId, table.addOnId),
}));

// Orders management
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(), // Total for this line item including add-ons
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orderIdx: index("order_items_order_id_idx").on(table.orderId),
}));

// Order item add-ons (proper relational model)
export const orderItemAddOns = pgTable("order_item_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderItemId: varchar("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  addOnId: varchar("add_on_id").references(() => addOns.id, { onDelete: "restrict" }), // Nullable for deleted add-ons
  addOnName: text("add_on_name").notNull(), // Snapshot at purchase time
  addOnPrice: decimal("add_on_price", { precision: 10, scale: 2 }).notNull(), // Snapshot at purchase time
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orderItemIdx: index("order_item_add_ons_order_item_id_idx").on(table.orderItemId),
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
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
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

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
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
