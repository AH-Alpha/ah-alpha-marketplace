import { eq, and, or, like, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, orderItems, ratings, categories, transactions, cart, conversations, messages, InsertMessage, InsertConversation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Marketplace queries

export async function getProductsByCategory(categoryId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId)).limit(limit).offset(offset);
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  // Simple search by product name
  return db.select().from(products).where(
    query ? undefined : undefined // Placeholder for actual search implementation
  ).limit(limit).offset(offset);
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSellerProducts(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.sellerId, sellerId));
}

export async function getUserOrders(userId: number, isBuyer = true) {
  const db = await getDb();
  if (!db) return [];
  if (isBuyer) {
    return db.select().from(orders).where(eq(orders.buyerId, userId));
  } else {
    return db.select().from(orders).where(eq(orders.sellerId, userId));
  }
}

export async function getOrderDetails(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getUserBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0].balance : 0;
}

export async function getProductRatings(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings).where(eq(ratings.productId, productId));
}

export async function getSellerRating(sellerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
  return result.length > 0 ? result[0].averageRating : undefined;
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getSubcategories(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.parentId, parentId));
}

// Messaging functions
export async function getOrCreateConversation(buyerId: number, sellerId: number, productId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Check if conversation exists
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.buyerId, buyerId),
        eq(conversations.sellerId, sellerId),
        productId ? eq(conversations.productId, productId) : undefined
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new conversation
  const result = await db.insert(conversations).values({
    buyerId,
    sellerId,
    productId,
  });
  
  const newConversation = await db.select().from(conversations).where(eq(conversations.buyerId, buyerId)).orderBy(conversations.createdAt).limit(1);
  return newConversation.length > 0 ? newConversation[0] : undefined;
}

export async function sendMessage(conversationId: number, senderId: number, receiverId: number, content: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.insert(messages).values({
    conversationId,
    senderId,
    receiverId,
    content,
  });
  
  // Update conversation's lastMessageAt
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, conversationId));
  
  const newMessage = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt).limit(1);
  return newMessage.length > 0 ? newMessage[0] : undefined;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get conversations where user is buyer or seller
  const result = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId)
      )
    )
    .orderBy(conversations.lastMessageAt);
  
  return result;
}

export async function markMessagesAsRead(conversationId: number, receiverId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.receiverId, receiverId),
        eq(messages.isRead, false)
      )
    );
}
