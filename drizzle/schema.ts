import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "seller"]).default("user").notNull(),
  // Marketplace fields
  userType: mysqlEnum("userType", ["buyer", "seller", "both"]).default("buyer").notNull(),
  balance: int("balance").default(5000).notNull(), // in IQD, starts with 5000 welcome bonus
  totalSales: int("totalSales").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  sellerName: text("sellerName"), // For sellers
  sellerDescription: text("sellerDescription"),
  profilePicture: text("profilePicture"), // Profile picture URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  parentId: int("parentId"), // For subcategories
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // in IQD
  condition: mysqlEnum("condition", ["new", "used"]).default("new").notNull(),
  quantity: int("quantity").default(1).notNull(),
  imageUrls: text("imageUrls"), // JSON array of image URLs
  status: mysqlEnum("status", ["active", "sold", "removed"]).default("active").notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  totalPrice: int("totalPrice").notNull(), // in IQD (includes commission)
  commission: int("commission").notNull(), // 2.5% of total
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "disputed"]).default("pending").notNull(),
  trackingCode: varchar("trackingCode", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order Items table
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  priceAtPurchase: int("priceAtPurchase").notNull(), // in IQD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Ratings table
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  productId: int("productId").notNull(),
  productRating: int("productRating").notNull(), // 1-5
  packagingRating: int("packagingRating").notNull(), // 1-5
  shippingRating: int("shippingRating").notNull(), // 1-5
  serviceRating: int("serviceRating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

// Transactions table (for balance history)
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "commission", "refund", "bonus"]).notNull(),
  amount: int("amount").notNull(), // in IQD
  description: text("description"),
  relatedOrderId: int("relatedOrderId"), // For commission transactions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Cart table
export const cart = mysqlTable("cart", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Cart = typeof cart.$inferSelect;
export type InsertCart = typeof cart.$inferInsert;

// Conversations table (for messaging threads)
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  productId: int("productId"), // Optional: link to a specific product
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages table
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Auctions table
export const auctions = mysqlTable("auctions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId").notNull(),
  startPrice: int("startPrice").notNull(),
  currentHighestBid: int("currentHighestBid").notNull(),
  highestBidderId: int("highestBidderId"),
  startTime: timestamp("startTime").defaultNow().notNull(),
  endTime: timestamp("endTime").notNull(),
  status: mysqlEnum("status", ["active", "ended", "cancelled"]).default("active").notNull(),
  totalBids: int("totalBids").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = typeof auctions.$inferInsert;

// Bids table
export const bids = mysqlTable("bids", {
  id: int("id").autoincrement().primaryKey(),
  auctionId: int("auctionId").notNull(),
  bidderId: int("bidderId").notNull(),
  bidAmount: int("bidAmount").notNull(),
  status: mysqlEnum("status", ["active", "outbid", "won"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bid = typeof bids.$inferSelect;
export type InsertBid = typeof bids.$inferInsert;

// TODO: Add your tables here