export type ProductCategory = string;

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  shortDescription: string;
  fullDescription: string;
  price: number; // in INR
  badge?: "Bestseller" | "New" | "Featured" | "Popular";
  previewImage: string;
  features: string[];
  includedFiles: string[];
  compatibility: string;
  license: string;
  vaultFile: string; // filename in private digital_vault
  published: boolean;
  salesCount: number;
  sampleUrl?: string; // Optional free sample/preview PDF or URL
  rating?: number; // Average review rating 1-5
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "pending" | "pending_approval" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  currency: "INR";
  status: OrderStatus;
  paymentProvider: "payu" | "test_mode" | "upi_direct";
  paymentId?: string;
  paymentOrderId?: string;
  paymentSignature?: string;
  utr?: string;
  downloadEntitlementId?: string;
  createdAt: string;
  paidAt?: string;
  refundedAt?: string;
}

export interface DownloadEntitlement {
  id: string;
  orderId: string;
  customerEmail: string;
  productIds: string[];
  active: boolean;
  createdAt: string;
}

export interface DownloadToken {
  token: string;
  entitlementId: string;
  orderId: string;
  productId: string;
  customerEmail: string;
  expiresAt: string; // ISO string
  maxDownloads: number;
  downloadCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number; // e.g. 50 (50%) or 100 (₹100)
  minOrder?: number;
  active: boolean;
  description: string;
  createdAt: string;
}

export interface Bundle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  productIds: string[];
  discountPrice: number;
  originalPrice: number;
  badge: string;
  features: string[];
  previewImage: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verified: boolean;
}
