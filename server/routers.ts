import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getProductsByCategory,
  getProductById,
  getSellerProducts,
  getUserOrders,
  getOrderDetails,
  getOrderItems,
  getUserBalance,
  getProductRatings,
  getSellerRating,
  getCategories,
  getSubcategories,
  getDb,
  getUserByOpenId,
} from "./db";
import { products, orders, orderItems, ratings, categories, transactions, cart, users } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Marketplace routers
  products: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        if (input.categoryId) {
          return getProductsByCategory(input.categoryId, input.limit, input.offset);
        }
        const db = await getDb();
        if (!db) return [];
        return db.select().from(products).limit(input.limit).offset(input.offset);
      }),
    
    detail: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductById(input)),
    
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        condition: z.enum(["new", "used"]),
        quantity: z.number().default(1),
        imageUrls: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(products).values({
          sellerId: ctx.user.id,
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          price: input.price,
          condition: input.condition,
          quantity: input.quantity,
          imageUrls: input.imageUrls,
        });
        
        return { success: true };
      }),
    
    sellerProducts: publicProcedure
      .input(z.number())
      .query(({ input }) => getSellerProducts(input)),
  }),

  orders: router({
    list: protectedProcedure
      .input(z.object({
        isBuyer: z.boolean().default(true),
      }))
      .query(({ ctx, input }) => getUserOrders(ctx.user.id, input.isBuyer)),
    
    detail: publicProcedure
      .input(z.number())
      .query(({ input }) => getOrderDetails(input)),
    
    items: publicProcedure
      .input(z.number())
      .query(({ input }) => getOrderItems(input)),
    
    create: protectedProcedure
      .input(z.object({
        sellerId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          priceAtPurchase: z.number(),
        })),
        totalPrice: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const commission = Math.round(input.totalPrice * 0.025); // 2.5% commission
        
        const orderResult = await db.insert(orders).values({
          buyerId: ctx.user.id,
          sellerId: input.sellerId,
          totalPrice: input.totalPrice,
          commission: commission,
        });
        
        // Get the last inserted order ID (simplified approach)
        const lastOrder = await db.select().from(orders).orderBy(desc(orders.id)).limit(1);
        const orderId = lastOrder.length > 0 ? lastOrder[0].id : 0;
        
        // Insert order items
        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId: orderId,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          });
        }
        
        return { success: true, orderId };
      }),
  }),

  ratings: router({
    list: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductRatings(input)),
    
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        productId: z.number(),
        sellerId: z.number(),
        productRating: z.number().min(1).max(5),
        packagingRating: z.number().min(1).max(5),
        shippingRating: z.number().min(1).max(5),
        serviceRating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(ratings).values({
          orderId: input.orderId,
          buyerId: ctx.user.id,
          sellerId: input.sellerId,
          productId: input.productId,
          productRating: input.productRating,
          packagingRating: input.packagingRating,
          shippingRating: input.shippingRating,
          serviceRating: input.serviceRating,
          comment: input.comment,
        });
        
        return { success: true };
      }),
  }),

  categories: router({
    list: publicProcedure.query(() => getCategories()),
    
    subcategories: publicProcedure
      .input(z.number())
      .query(({ input }) => getSubcategories(input)),
  }),

  user: router({
    balance: protectedProcedure.query(({ ctx }) => getUserBalance(ctx.user.id)),
    
    profile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        userType: z.enum(["buyer", "seller", "both"]).optional(),
        sellerName: z.string().optional(),
        sellerDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.userType) updateData.userType = input.userType;
        if (input.sellerName) updateData.sellerName = input.sellerName;
        if (input.sellerDescription) updateData.sellerDescription = input.sellerDescription;
        
        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
  }),

  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(cart).where(eq(cart.userId, ctx.user.id));
    }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(cart).values({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
        
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(cart).where(eq(cart.id, input));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
