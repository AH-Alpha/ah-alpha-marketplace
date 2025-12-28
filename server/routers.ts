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
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  getUserConversations,
  markMessagesAsRead,
  createAuction,
  getAuctionById,
  getActiveAuctions,
  placeBid,
  getBidsByAuctionId,
  getUserBids,
  endAuction,
  checkUsernameAvailable,
  updateUsername,
  createOrder,
  getOrderById,
  updateOrderStatus,
  clearCart,
} from "./db";
import { products, orders, orderItems, ratings, categories, transactions, cart, users, conversations, messages, auctions, bids } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { authRouter } from "./routers/auth";

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
    sendVerificationCode: authRouter.sendVerificationCode,
    verifyEmailCode: authRouter.verifyEmailCode,
    createSellerProfile: authRouter.createSellerProfile,
    getSellerProfile: authRouter.getSellerProfile,
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
      .query(({ ctx, input }) => getUserOrders(ctx.user.id, input.isBuyer ? "buyer" : "seller")),
    
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
    
    addTrialBalance: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if user already has balance
      const existingBalance = await getUserBalance(ctx.user.id);
      if (existingBalance > 0) {
        throw new Error("لقد استخدمت المبلغ التجريبي بالفعل");
      }
      
      // Add 5000 IQD trial balance as bonus
      await db.insert(transactions).values({
        userId: ctx.user.id,
        type: "bonus",
        amount: 5000,
        description: "مبلغ تجريبي ترحيبي",
      });
      
      return { success: true, amount: 5000 };
    }),

    checkUsername: publicProcedure
      .input(z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/))
      .query(async ({ input }) => {
        const available = await checkUsernameAvailable(input);
        return { available };
      }),

    setUsername: protectedProcedure
      .input(z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/))
      .mutation(async ({ ctx, input }) => {
        await updateUsername(ctx.user.id, input);
        return { success: true, username: input };
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
  
  messaging: router({
    getOrCreateConversation: protectedProcedure
      .input(z.object({
        sellerId: z.number(),
        productId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await getOrCreateConversation(ctx.user.id, input.sellerId, input.productId);
        return conversation;
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        receiverId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const message = await sendMessage(input.conversationId, ctx.user.id, input.receiverId, input.content);
        return message;
      }),
    
    getConversationMessages: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getConversationMessages(input);
      }),
    
    getUserConversations: protectedProcedure
      .query(async ({ ctx }) => {
        const convos = await getUserConversations(ctx.user.id);
        const db = await getDb();
        if (!db) return [];
        
        const enriched = await Promise.all(
          convos.map(async (convo) => {
            const otherUserId = convo.buyerId === ctx.user.id ? convo.sellerId : convo.buyerId;
            const otherUser = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);
            
            let product = null;
            if (convo.productId) {
              const productData = await db.select().from(products).where(eq(products.id, convo.productId)).limit(1);
              product = productData.length > 0 ? productData[0] : null;
            }
            
            return {
              ...convo,
              otherUser: otherUser.length > 0 ? otherUser[0] : null,
              product,
            };
          })
        );
        
        return enriched;
      }),
    
    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        await markMessagesAsRead(input, ctx.user.id);
        return { success: true };
      }),
  }),
  auction: router({
    // Create a new auction
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        startPrice: z.number().positive(),
        durationHours: z.enum(["12", "24", "36", "48", "72"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.productId);
        if (!product || product.sellerId !== ctx.user.id) {
          throw new Error("Product not found or you are not the seller");
        }

        const endTime = new Date();
        endTime.setHours(endTime.getHours() + parseInt(input.durationHours));

        const result = await createAuction({
          productId: input.productId,
          sellerId: ctx.user.id,
          startPrice: input.startPrice,
          currentHighestBid: input.startPrice,
          startTime: new Date(),
          endTime,
          status: "active",
        });

        return result;
      }),

    // Get auction by ID
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const auction = await getAuctionById(input);
        if (!auction) return null;

        const bids = await getBidsByAuctionId(input);
        const product = await getProductById(auction.productId);
        const seller = await getDb().then(db => db?.select().from(users).where(eq(users.id, auction.sellerId)).limit(1));

        return {
          ...auction,
          product,
          seller: seller && seller.length > 0 ? seller[0] : null,
          bids: bids.length,
          bidHistory: bids.map(b => ({
            amount: b.bidAmount,
            time: b.createdAt,
          })),
        };
      }),

    // Get all active auctions
    getActive: publicProcedure
      .query(async () => {
        const activeAuctions = await getActiveAuctions();
        return activeAuctions;
      }),

    // Place a bid
    placeBid: protectedProcedure
      .input(z.object({
        auctionId: z.number(),
        bidAmount: z.number().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        const auction = await getAuctionById(input.auctionId);
        if (!auction) throw new Error("Auction not found");
        if (auction.status !== "active") throw new Error("Auction is not active");
        if (input.bidAmount <= auction.currentHighestBid) {
          throw new Error("Bid must be higher than current highest bid");
        }

        await placeBid({
          auctionId: input.auctionId,
          bidderId: ctx.user.id,
          bidAmount: input.bidAmount,
          status: "active",
        });

        // Update auction with new highest bid
        const db = await getDb();
        if (db) {
          await db.update(auctions)
            .set({
              currentHighestBid: input.bidAmount,
              highestBidderId: ctx.user.id,
              totalBids: auction.totalBids + 1,
            })
            .where(eq(auctions.id, input.auctionId));
        }

        return { success: true };
      }),

    // Get user's bids
    getUserBids: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserBids(ctx.user.id);
      }),

    // End auction (seller only)
    end: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const auction = await getAuctionById(input);
        if (!auction) throw new Error("Auction not found");
        if (auction.sellerId !== ctx.user.id) throw new Error("You are not the seller");

        await endAuction(input);
        return { success: true };
      }),
  }),

  order: router({
    create: protectedProcedure
      .input(z.object({
        sellerId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          priceAtPurchase: z.number(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderId = await createOrder({
          buyerId: ctx.user.id,
          sellerId: input.sellerId,
          items: input.items,
        });
        
        // Clear cart after order
        await clearCart(ctx.user.id);
        
        return { success: true, orderId };
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getOrderById(input);
      }),

    myOrders: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserOrders(ctx.user.id, "buyer");
      }),

    mySales: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserOrders(ctx.user.id, "seller");
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "disputed"]),
        trackingCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.orderId, input.status, input.trackingCode);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
