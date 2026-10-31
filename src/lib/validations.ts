import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerEmail: z.string().email("Please provide a valid email address."),
  customerName: z.string().optional(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive().max(10),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().optional(),
  paymentOrderId: z.string().optional(),
  signature: z.string().min(1, "Signature is required"),
  provider: z.enum(["payu", "test_mode", "upi_direct"]),
  utr: z.string().optional(),
});

export const RetrieveOrderSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const AdminLoginSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateProductSchema = z.object({
  title: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  category: z.string().min(1, "Please provide a category").default("Templates"),
  shortDescription: z.string().optional().default("Digital Resource"),
  fullDescription: z.string().optional().default(""),
  price: z.coerce.number().positive("Price must be greater than zero"),
  badge: z.enum(["Bestseller", "New", "Featured", "Popular"]).optional(),
  previewImage: z.string().optional().default("/images/products/student-planner.svg"),
  features: z.array(z.string()).optional().default(["Instant Digital Download"]),
  includedFiles: z.array(z.string()).optional().default([]),
  compatibility: z.string().optional().default("All Devices (PDF / Digital)"),
  license: z.string().optional().default("Personal and commercial use permitted"),
  vaultFile: z.string().min(1, "Please choose a downloadable product file"),
  published: z.boolean().default(true),
});
