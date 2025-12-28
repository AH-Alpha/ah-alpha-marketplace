import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createEmailVerificationToken, verifyEmailCode, createSellerProfile, getSellerProfile } from "../db";
import { sendVerificationEmail } from "../_core/email";
import { TRPCError } from "@trpc/server";

// Helper function to generate 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRouter = router({
  // Placeholder for other auth methods
  sendVerificationCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const code = generateVerificationCode();
        await createEmailVerificationToken(input.email, code, 15); // 15 minutes expiry
        await sendVerificationEmail(input.email, code);

        return {
          success: true,
          message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        };
      } catch (error) {
        console.error("Error sending verification code:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل إرسال رمز التحقق",
        });
      }
    }),

  // Verify email code
  verifyEmailCode: publicProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      try {
        const isValid = await verifyEmailCode(input.email, input.code);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "رمز التحقق غير صحيح أو منتهي الصلاحية",
          });
        }

        return {
          success: true,
          message: "تم التحقق من البريد الإلكتروني بنجاح",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error verifying email code:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل التحقق من الرمز",
        });
      }
    }),

  // Create seller profile
  createSellerProfile: publicProcedure
    .input(z.object({
      userId: z.number(),
      storeName: z.string().min(3).max(255),
      storeDescription: z.string().optional(),
      phoneNumber: z.string().min(10),
      address: z.string().min(5),
      governorate: z.string().min(2),
      storeLogoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Check if profile already exists
        const existingProfile = await getSellerProfile(input.userId);
        if (existingProfile) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "ملف البائع موجود بالفعل",
          });
        }

        await createSellerProfile(input.userId, {
          storeName: input.storeName,
          storeDescription: input.storeDescription || null,
          phoneNumber: input.phoneNumber,
          address: input.address,
          governorate: input.governorate,
          storeLogoUrl: input.storeLogoUrl || null,
        } as any);

        return {
          success: true,
          message: "تم إنشاء ملف البائع بنجاح",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating seller profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل إنشاء ملف البائع",
        });
      }
    }),

  // Get seller profile
  getSellerProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const profile = await getSellerProfile(input.userId);
        return profile || null;
      } catch (error) {
        console.error("Error getting seller profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل جلب ملف البائع",
        });
      }
    }),
});
