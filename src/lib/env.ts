import { z } from "zod";

const envSchema = z
  .object({
    DEMO_MODE: z.enum(["true", "false"]).default("false"),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.string().optional(),
    AUTH_TWITCH_ID: z.string().optional(),
    AUTH_TWITCH_SECRET: z.string().optional(),
    INTERNAL_API_KEY: z.string().min(32).optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRO_PRICE_ID: z.string().optional(),
    STRIPE_BUSINESS_PRICE_ID: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.DEMO_MODE === "true") {
      return;
    }

    if (!value.AUTH_TWITCH_ID) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_TWITCH_ID"],
        message: "AUTH_TWITCH_ID is required outside demo mode."
      });
    }

    if (!value.AUTH_TWITCH_SECRET) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_TWITCH_SECRET"],
        message: "AUTH_TWITCH_SECRET is required outside demo mode."
      });
    }
  });

export const env = envSchema.parse(process.env);

export const isDemoMode = env.DEMO_MODE === "true";
