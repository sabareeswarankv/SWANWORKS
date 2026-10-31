import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Product,
  Order,
  DownloadEntitlement,
  DownloadToken,
  Coupon,
  Bundle,
  Review,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "swanworks_store.json");

export interface CustomerMessage {
  id: string;
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  version: number;
  products: Product[];
  orders: Order[];
  entitlements: DownloadEntitlement[];
  downloadTokens: DownloadToken[];
  categories?: string[];
  coupons?: Coupon[];
  bundles?: Bundle[];
  reviews?: Review[];
  adminPasswordHash?: string;
  adminPasswordSalt?: string;
  messages?: CustomerMessage[];
}

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coup_launch50",
    code: "LAUNCH50",
    type: "percentage",
    discount: 50,
    minOrder: 199,
    active: true,
    description: "Launch special: 50% discount on all orders above ₹199",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "coup_welcome100",
    code: "WELCOME100",
    type: "fixed",
    discount: 100,
    minOrder: 299,
    active: true,
    description: "Welcome offer: Flat ₹100 OFF on orders above ₹299",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const DEFAULT_BUNDLES: Bundle[] = [
  {
    id: "bundle_all_access",
    slug: "creator-and-developer-all-access-pass",
    title: "All-in-One Creator & Developer Bundle",
    subtitle: "Get every template, developer boilerplate, and planning kit in one master bundle.",
    productIds: ["prod_student_planner", "prod_portfolio_template", "prod_ui_icon_pack"],
    discountPrice: 499,
    originalPrice: 847,
    badge: "Save 41% (Best Value)",
    previewImage: "/images/products/portfolio-template.svg",
    features: [
      "All-in-One Student & Notion Productivity Planner",
      "Next.js Portfolio Template (TypeScript + Tailwind)",
      "UI Icon Pack (Vector SVG & Figma)",
      "Lifetime updates and instant downloads",
    ],
  },
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev_1",
    productId: "prod_student_planner",
    authorName: "Ananya S.",
    rating: 5,
    comment: "Extremely well organized planner. Saved me so much time preparing for semester exams!",
    createdAt: "2026-02-14T10:00:00.000Z",
    verified: true,
  },
  {
    id: "rev_2",
    productId: "prod_portfolio_template",
    authorName: "Rahul M.",
    rating: 5,
    comment: "Clean code, beautiful layout, deployed in literally 5 minutes on Vercel. 10/10.",
    createdAt: "2026-03-01T14:30:00.000Z",
    verified: true,
  },
  {
    id: "rev_3",
    productId: "prod_saas_starter_kit",
    authorName: "Karthik D.",
    rating: 5,
    comment: "Saved me at least 3 weeks of boilerplate setup. Auth and database worked out of the box.",
    createdAt: "2026-03-10T16:00:00.000Z",
    verified: true,
  },
];

export const DEFAULT_CATEGORIES = [
  "Templates",
  "Code Kits",
  "Planners",
  "Creative Resources",
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_student_planner",
    slug: "all-in-one-student-planner",
    title: "All-in-One Student Planner",
    category: "Templates",
    shortDescription:
      "A complete semester, assignment, exam, and daily routine tracker designed for focused academic success.",
    fullDescription:
      "Designed specifically for modern students and lifelong learners. The All-in-One Student Planner brings order to chaotic semester schedules with a structured course hub, deadline countdowns, exam revision matrices, spaced repetition schedules, and printable PDF companions. Duplicate it in seconds to your Notion workspace or print the clean sheets.",
    price: 199,
    badge: "Bestseller",
    previewImage: "/images/products/student-planner.svg",
    features: [
      "Master Semester & Course Hub with GPA calculator",
      "Automated assignment countdowns & submission tracker",
      "Spaced repetition exam revision calendar",
      "Daily focus & habit tracker with reflection prompts",
      "Includes printable PDF format (A4 & US Letter)",
    ],
    includedFiles: [
      "Notion Template Share Link (Instant duplication)",
      "Printable Study Planner Bundle (PDF, 18 Pages)",
      "Quick-Start Setup Guide & Video Walkthrough",
    ],
    compatibility: "Notion (Free or Plus plan), GoodNotes, Apple Notes, Print",
    license: "Personal and single-user commercial use permitted.",
    vaultFile: "all-in-one-student-planner.txt",
    published: true,
    salesCount: 428,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "prod_portfolio_template",
    slug: "portfolio-template",
    title: "Portfolio Template",
    category: "Templates",
    shortDescription:
      "A high-converting, lightning-fast developer & designer portfolio built with Next.js 14 and Tailwind CSS.",
    fullDescription:
      "Stand out in recruitment and freelance pitches. The SWANWORKS Portfolio Template is crafted with clean modern typography, bento-grid layouts, subtle micro-interactions, dark/light mode toggle, and zero bloat. Easily customize with your own case studies, testimonials, and contact links.",
    price: 499,
    badge: "Bestseller",
    previewImage: "/images/products/portfolio-template.svg",
    features: [
      "Next.js App Router & React 19 architecture",
      "Tailwind CSS with responsive design system",
      "Bento-grid project gallery with case study modals",
      "SEO & OpenGraph social sharing meta tags preconfigured",
      "100/100 Lighthouse performance score",
    ],
    includedFiles: [
      "Complete Next.js TypeScript repository (.zip)",
      "Tailwind theme config & design tokens",
      "Figma layout file (.fig)",
      "One-click Vercel deployment documentation",
    ],
    compatibility: "Next.js 14+, React 18/19, Node.js 18+",
    license: "Unlimited personal and client web projects.",
    vaultFile: "portfolio-template.txt",
    published: true,
    salesCount: 312,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
  },
  {
    id: "prod_ui_icon_pack",
    slug: "ui-icon-pack",
    title: "UI Icon Pack",
    category: "Creative Resources",
    shortDescription:
      "180+ clean, hand-crafted vector icons in SVG and Figma formats for modern web & mobile applications.",
    fullDescription:
      "Carefully crafted on a strict 24px grid with consistent optical weights. The SWANWORKS UI Icon Pack includes all essential application categories: navigation, media, commerce, devices, social, and alerts. Each icon is cleanly named, export-ready, and optimized for featherweight rendering.",
    price: 149,
    badge: "Popular",
    previewImage: "/images/products/ui-icon-pack.svg",
    features: [
      "180+ unique vector icons on a 24px grid",
      "Clean SVG code with customizable stroke-width and color",
      "Figma component library with auto-layout variants",
      "React / JSX copy-paste ready code snippets",
      "Pixel-perfect optical alignment across all glyphs",
    ],
    includedFiles: [
      "Figma Component Library (.fig)",
      "Individual SVG files categorized into folders",
      "High-res PNG renders @1x, @2x, @3x",
      "Icon reference cheat sheet PDF",
    ],
    compatibility: "Figma, Sketch, Adobe XD, Illustrator, React, HTML/CSS",
    license: "Commercial use in unlimited apps, websites and digital products.",
    vaultFile: "ui-icon-pack.txt",
    published: true,
    salesCount: 589,
    createdAt: "2026-02-01T09:30:00.000Z",
    updatedAt: "2026-02-01T09:30:00.000Z",
  },
  {
    id: "prod_notion_productivity",
    slug: "notion-productivity-kit",
    title: "Notion Productivity Kit",
    category: "Planners",
    shortDescription:
      "A complete Second Brain operating system for projects, knowledge, habits, and weekly reviews.",
    fullDescription:
      "Eliminate mental clutter and transform messy to-do lists into an organized life operating system. Built upon Tiago Forte's PARA framework and agile personal sprints, this kit integrates task management, knowledge repositories, recurring habit logs, and weekly executive reviews into one cohesive workspace.",
    price: 299,
    badge: "Bestseller",
    previewImage: "/images/products/notion-productivity.svg",
    features: [
      "Full PARA organization framework (Projects, Areas, Resources, Archive)",
      "Weekly review & retrospective dashboard",
      "Interactive habit tracker with weekly completion percentages",
      "Digital bookshelf & article read-it-later vault",
      "Mobile-optimized quick capture widgets",
    ],
    includedFiles: [
      "Instant 1-Click Notion Template Share Link",
      "PARA setup guide & onboarding cheat sheet",
      "Productivity methodology PDF handbook (24 pages)",
    ],
    compatibility: "Notion on Desktop, Web, iOS, Android",
    license: "Personal use and single workspace deployment.",
    vaultFile: "notion-productivity-kit.txt",
    published: true,
    salesCount: 640,
    createdAt: "2026-02-10T14:15:00.000Z",
    updatedAt: "2026-02-10T14:15:00.000Z",
  },
  {
    id: "prod_saas_starter_kit",
    slug: "nextjs-saas-starter-kit",
    title: "Next.js SaaS Starter Kit",
    category: "Code Kits",
    shortDescription:
      "Production-ready boilerplate with Auth, Stripe/Razorpay billing, PostgreSQL ORM, and Tailwind UI components.",
    fullDescription:
      "Skip weeks of repetitive setup. This production-ready starter kit includes authentication, role-based access control, billing subscription webhooks, email verification, dark mode, and an administrative panel. Ship your software idea this weekend.",
    price: 999,
    badge: "Featured",
    previewImage: "/images/products/saas-starter.svg",
    features: [
      "Full Next.js App Router codebase with TypeScript",
      "Server actions & Zod input validation",
      "Dual payment provider connectors (Razorpay + Stripe)",
      "Pre-built Auth & User profile management",
      "Complete admin analytics dashboard views",
    ],
    includedFiles: [
      "Full Source Code Repository (.zip)",
      "Database schema & migration scripts",
      "Postman API test collections",
      "Production deployment documentation",
    ],
    compatibility: "Node.js 18+, Next.js 14/15, PostgreSQL, Tailwind CSS",
    license: "Build unlimited commercial SaaS applications.",
    vaultFile: "portfolio-template.txt",
    published: true,
    salesCount: 184,
    createdAt: "2026-02-14T11:00:00.000Z",
    updatedAt: "2026-02-14T11:00:00.000Z",
  },
  {
    id: "prod_brand_deck",
    slug: "minimalist-brand-and-deck-kit",
    title: "Minimalist Brand & Deck Kit",
    category: "Creative Resources",
    shortDescription:
      "35+ modern, editorial pitch deck and brand guideline slide templates in Figma and Keynote formats.",
    fullDescription:
      "Present your ideas, design systems, or startup pitches with editorial elegance. Designed with spacious typography, balanced grids, and versatile data charts. Suitable for client proposals, brand identities, and investor pitch presentations.",
    price: 399,
    badge: "New",
    previewImage: "/images/products/brand-deck.svg",
    features: [
      "35+ uniquely designed slides with 16:9 widescreen ratio",
      "Figma vector components with text styles and auto-layout",
      "Editable vector device mockups (iPhone, MacBook, Browser)",
      "Clean slide hierarchy: Problem, Solution, Traction, Financials",
      "Keynote & PowerPoint .pptx export presets",
    ],
    includedFiles: [
      "Figma Master Presentation File (.fig)",
      "Keynote template (.key)",
      "PowerPoint presentation (.pptx)",
      "Free font download list & styling guide",
    ],
    compatibility: "Figma, Keynote, Microsoft PowerPoint, Google Slides",
    license: "Commercial use for client and internal presentations.",
    vaultFile: "ui-icon-pack.txt",
    published: true,
    salesCount: 94,
    createdAt: "2026-03-01T16:00:00.000Z",
    updatedAt: "2026-03-01T16:00:00.000Z",
  },
];

import { getCloudDatabaseAsync, saveCloudDatabaseAsync } from "./neonDb";

let cachedDb: DatabaseSchema | null = null;
let lastCacheTime = 0;
let isNeonSyncing = false;

function hasDbUrl(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL
  );
}

// Background hydration from Neon PostgreSQL if available
if (hasDbUrl()) {
  getCloudDatabaseAsync<DatabaseSchema>()
    .then((cloudData) => {
      if (cloudData && typeof cloudData === "object" && Array.isArray((cloudData as DatabaseSchema).products)) {
        cachedDb = cloudData;
        lastCacheTime = Date.now();
        // Keep local file in sync if in writable environment
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          fs.writeFileSync(DB_FILE, JSON.stringify(cloudData, null, 2), "utf8");
        } catch {
          // Read-only environment like Vercel serverless
        }
      } else {
        // Neon database was just created or empty: seed it from local database!
        const local = getDatabase();
        saveCloudDatabaseAsync(local).catch(() => {});
      }
    })
    .catch(() => {});
}

function getDatabase(): DatabaseSchema {
  const now = Date.now();
  if (cachedDb && now - lastCacheTime < 10000) {
    return cachedDb;
  }

  // Trigger background cloud fetch to ensure freshness across Vercel lambdas
  if (hasDbUrl() && !isNeonSyncing && now - lastCacheTime >= 10000) {
    isNeonSyncing = true;
    lastCacheTime = now; // Mark time immediately to prevent continuous duplicate requests
    getCloudDatabaseAsync<DatabaseSchema>()
      .then((cloud) => {
        if (cloud && typeof cloud === "object" && Array.isArray((cloud as DatabaseSchema).products)) {
          cachedDb = cloud;
          lastCacheTime = Date.now();
        }
      })
      .catch(() => {})
      .finally(() => {
        isNeonSyncing = false;
      });
  }

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Vercel serverless read-only filesystem
    }
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      version: 1,
      products: INITIAL_PRODUCTS,
      orders: [],
      entitlements: [],
      downloadTokens: [],
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    } catch {
      // Vercel serverless
    }
    cachedDb = initialDb;
    lastCacheTime = now;
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    cachedDb = JSON.parse(raw) as DatabaseSchema;
    lastCacheTime = now;
    return cachedDb;
  } catch (err) {
    console.error("Error reading database file, restoring backup:", err);
    return cachedDb || {
      version: 1,
      products: INITIAL_PRODUCTS,
      orders: [],
      entitlements: [],
      downloadTokens: [],
    };
  }
}

export async function saveDatabaseAsync(data?: DatabaseSchema): Promise<void> {
  const toSave = data || getDatabase();
  cachedDb = toSave;
  lastCacheTime = Date.now();
  if (hasDbUrl()) {
    await saveCloudDatabaseAsync(toSave);
  }
}

function saveDatabase(data: DatabaseSchema): void {
  cachedDb = data;
  lastCacheTime = Date.now();

  // 1. Permanent Neon Cloud PostgreSQL write
  if (hasDbUrl()) {
    saveCloudDatabaseAsync(data).catch((err) => {
      console.error("Async Neon database sync error:", err);
    });
  }

  // 2. Local disk write (with error catch for serverless read-only filesystems)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (fsErr) {
    // Vercel lambda is read-only, Neon cloud persistence handles the persistence
  }
}

// ---------------- Product Repository ----------------

export function getAllProducts(includeUnpublished = false): Product[] {
  const db = getDatabase();
  if (includeUnpublished) {
    return db.products;
  }
  return db.products.filter((p) => p.published);
}

export async function getAllProductsAsync(includeUnpublished = false): Promise<Product[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.products)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {
      // ignore
    }
  }
  return getAllProducts(includeUnpublished);
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDatabase();
  return db.products.find((p) => p.slug === slug && p.published) || null;
}

export function getProductById(id: string): Product | null {
  const db = getDatabase();
  return db.products.find((p) => p.id === id) || null;
}

export function createProduct(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "salesCount" | "slug"> & { slug?: string }
): Product {
  const db = getDatabase();
  const id = `prod_${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();

  const baseSlug = (productData.slug || productData.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = baseSlug || `resource-${id}`;

  const newProduct: Product = {
    ...productData,
    id,
    slug,
    salesCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.products.unshift(newProduct);
  if (productData.category) {
    const cats = getAllCategories();
    if (!cats.includes(productData.category)) {
      db.categories = [...cats, productData.category];
    }
  }
  saveDatabase(db);
  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>
): Product | null {
  const db = getDatabase();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.products[index] = {
    ...db.products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.products[index];
}

export function deleteProduct(id: string): boolean {
  const db = getDatabase();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function createProductAsync(
  productData: Parameters<typeof createProduct>[0]
): Promise<Product> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.products)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const prod = createProduct(productData);
  await saveDatabaseAsync();
  return prod;
}

export async function updateProductAsync(
  id: string,
  updates: Parameters<typeof updateProduct>[1]
): Promise<Product | null> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.products)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const updated = updateProduct(id, updates);
  if (updated) {
    await saveDatabaseAsync();
  }
  return updated;
}

export async function deleteProductAsync(id: string): Promise<boolean> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.products)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const deleted = deleteProduct(id);
  if (deleted) {
    await saveDatabaseAsync();
  }
  return deleted;
}

// ---------------- Category Repository ----------------

export function getAllCategories(): string[] {
  const db = getDatabase();
  if (Array.isArray(db.categories)) {
    return db.categories;
  }
  return [];
}

export async function getAllCategoriesAsync(): Promise<string[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.categories)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
        return cloud.categories;
      }
    } catch {}
  }
  return getAllCategories();
}

export function addCategory(name: string): string[] {
  const db = getDatabase();
  const trimmed = name.trim();
  if (!trimmed) return getAllCategories();

  const current = getAllCategories();
  if (!current.includes(trimmed)) {
    db.categories = [...current, trimmed];
    saveDatabase(db);
    return db.categories;
  }
  return current;
}

export async function addCategoryAsync(name: string): Promise<string[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && typeof cloud === "object") {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const cats = addCategory(name);
  await saveDatabaseAsync();
  return cats;
}

export function updateCategory(oldName: string, newName: string): string[] {
  const db = getDatabase();
  const trimmedNew = newName.trim();
  if (!trimmedNew) return getAllCategories();

  const current = getAllCategories();
  db.categories = current.map((c) => (c === oldName ? trimmedNew : c));

  db.products.forEach((p) => {
    if (p.category === oldName) {
      p.category = trimmedNew;
    }
  });

  saveDatabase(db);
  return db.categories;
}

export async function updateCategoryAsync(oldName: string, newName: string): Promise<string[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && typeof cloud === "object") {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const cats = updateCategory(oldName, newName);
  await saveDatabaseAsync();
  return cats;
}

export function deleteCategory(name: string): string[] {
  const db = getDatabase();
  const current = getAllCategories();
  db.categories = current.filter((c) => c !== name);

  const fallback = db.categories[0] || "General";
  db.products.forEach((p) => {
    if (p.category === name) {
      p.category = fallback;
    }
  });

  saveDatabase(db);
  return db.categories;
}

export async function deleteCategoryAsync(name: string): Promise<string[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && typeof cloud === "object") {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }
  const cats = deleteCategory(name);
  await saveDatabaseAsync();
  return cats;
}

// ---------------- Order & Entitlement Repository ----------------

export function createOrder(
  data: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">
): Order {
  const db = getDatabase();
  const id = `ord_${crypto.randomBytes(8).toString("hex")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `SW-${new Date().getFullYear()}-${randomSuffix}`;
  const now = new Date().toISOString();

  const order: Order = {
    ...data,
    id,
    orderNumber,
    status: "pending",
    createdAt: now,
  };

  db.orders.unshift(order);
  saveDatabase(db);
  return order;
}

export async function createOrderAsync(
  data: Omit<Order, "id" | "orderNumber" | "status" | "createdAt">
): Promise<Order> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.orders)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {
      // ignore
    }
  }
  const order = createOrder(data);
  await saveDatabaseAsync();
  return order;
}

export function getOrderById(id: string): Order | null {
  const db = getDatabase();
  return db.orders.find((o) => o.id === id) || null;
}

export async function getOrderByIdAsync(id: string): Promise<Order | null> {
  const local = getOrderById(id);
  if (local) return local;

  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.orders)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
        const found = cloud.orders.find((o) => o.id === id);
        if (found) return found;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function getOrderByOrderNumber(orderNumber: string): Order | null {
  const db = getDatabase();
  return db.orders.find((o) => o.orderNumber === orderNumber) || null;
}

export function getAllOrders(): Order[] {
  const db = getDatabase();
  return db.orders;
}

export async function getAllOrdersAsync(): Promise<Order[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.orders)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
        return cloud.orders;
      }
    } catch {
      // ignore
    }
  }
  return getAllOrders();
}

/**
 * Idempotently marks order as paid, updates inventory/sales counts,
 * and creates digital download entitlements and tokens.
 */
export function markOrderAsPaid(
  orderId: string,
  paymentDetails: {
    paymentId: string;
    paymentOrderId?: string;
    paymentSignature?: string;
    provider?: "payu" | "test_mode" | "upi_direct";
    utr?: string;
  }
): { order: Order; entitlement: DownloadEntitlement; tokens: DownloadToken[] } | null {
  const db = getDatabase();
  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const existingOrder = db.orders[orderIndex];

  // Idempotency: if already paid, return existing entitlement
  if (existingOrder.status === "paid" && existingOrder.downloadEntitlementId) {
    const existingEntitlement =
      db.entitlements.find((e) => e.id === existingOrder.downloadEntitlementId) || null;
    const existingTokens = db.downloadTokens.filter(
      (t) => t.orderId === existingOrder.id
    );
    if (existingEntitlement) {
      return {
        order: existingOrder,
        entitlement: existingEntitlement,
        tokens: existingTokens,
      };
    }
  }

  const now = new Date().toISOString();

  // Create entitlement
  const entitlementId = `ent_${crypto.randomBytes(8).toString("hex")}`;
  const productIds = existingOrder.items.map((i) => i.productId);

  const entitlement: DownloadEntitlement = {
    id: entitlementId,
    orderId: existingOrder.id,
    customerEmail: existingOrder.customerEmail,
    productIds,
    active: true,
    createdAt: now,
  };

  // Generate secure download tokens for each product in order
  // Token validity: 7 days, max downloads: 10
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const newTokens: DownloadToken[] = productIds.map((pid) => ({
    token: `dl_${crypto.randomBytes(24).toString("hex")}`,
    entitlementId,
    orderId: existingOrder.id,
    productId: pid,
    customerEmail: existingOrder.customerEmail,
    expiresAt,
    maxDownloads: 10,
    downloadCount: 0,
    createdAt: now,
  }));

  // Update order
  db.orders[orderIndex] = {
    ...existingOrder,
    status: "paid",
    paidAt: now,
    paymentId: paymentDetails.paymentId,
    paymentOrderId: paymentDetails.paymentOrderId,
    paymentSignature: paymentDetails.paymentSignature,
    paymentProvider: paymentDetails.provider || existingOrder.paymentProvider,
    utr: paymentDetails.utr || existingOrder.utr,
    downloadEntitlementId: entitlementId,
  };

  // Increment product sales counts
  for (const item of existingOrder.items) {
    const pIndex = db.products.findIndex((p) => p.id === item.productId);
    if (pIndex !== -1) {
      db.products[pIndex].salesCount =
        (db.products[pIndex].salesCount || 0) + item.quantity;
    }
  }

  db.entitlements.unshift(entitlement);
  db.downloadTokens.push(...newTokens);

  saveDatabase(db);

  return {
    order: db.orders[orderIndex],
    entitlement,
    tokens: newTokens,
  };
}

export function markOrderPendingApproval(
  orderId: string,
  utr?: string
): Order | null {
  const db = getDatabase();
  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const cleanUtr = utr || `upi_claim_${Date.now()}`;
  db.orders[orderIndex] = {
    ...db.orders[orderIndex],
    status: "pending_approval",
    utr: cleanUtr,
    paymentId: `upi_${cleanUtr}`,
  };

  saveDatabase(db);
  return db.orders[orderIndex];
}

export async function markOrderPendingApprovalAsync(
  orderId: string,
  utr?: string
): Promise<Order | null> {
  let updated = markOrderPendingApproval(orderId, utr);
  if (!updated && hasDbUrl()) {
    const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
    if (cloud) {
      cachedDb = cloud;
      lastCacheTime = Date.now();
      updated = markOrderPendingApproval(orderId, utr);
    }
  }
  if (updated && hasDbUrl()) {
    await saveDatabaseAsync();
  }
  return updated;
}

export function refundOrder(orderId: string): Order | null {
  const db = getDatabase();
  const orderIndex = db.orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const now = new Date().toISOString();
  db.orders[orderIndex].status = "refunded";
  db.orders[orderIndex].refundedAt = now;

  // Revoke entitlement if present
  if (db.orders[orderIndex].downloadEntitlementId) {
    const entIndex = db.entitlements.findIndex(
      (e) => e.id === db.orders[orderIndex].downloadEntitlementId
    );
    if (entIndex !== -1) {
      db.entitlements[entIndex].active = false;
    }
  }

  saveDatabase(db);
  return db.orders[orderIndex];
}

// ---------------- Digital Delivery & Token Verification ----------------

export function verifyAndConsumeDownloadToken(
  tokenString: string
): {
  valid: boolean;
  reason?: string;
  product?: Product;
  token?: DownloadToken;
} {
  const db = getDatabase();
  const tokenRecord = db.downloadTokens.find((t) => t.token === tokenString);

  if (!tokenRecord) {
    return { valid: false, reason: "This download link is not valid or has expired." };
  }

  // Check expiration
  if (new Date(tokenRecord.expiresAt) < new Date()) {
    return {
      valid: false,
      reason: "This download link has expired. Please contact support to renew your link.",
    };
  }

  // Check download limits
  if (tokenRecord.downloadCount >= tokenRecord.maxDownloads) {
    return {
      valid: false,
      reason: `Maximum download limit (${tokenRecord.maxDownloads} downloads) reached. Please reach out to support for re-issuance.`,
    };
  }

  // Check entitlement status
  const entitlement = db.entitlements.find(
    (e) => e.id === tokenRecord.entitlementId
  );
  if (!entitlement || !entitlement.active) {
    return {
      valid: false,
      reason: "This purchase has been refunded or cancelled.",
    };
  }

  // Get product
  const product = db.products.find((p) => p.id === tokenRecord.productId);
  if (!product) {
    return { valid: false, reason: "Product file could not be found." };
  }

  // Increment download count safely
  tokenRecord.downloadCount += 1;
  saveDatabase(db);

  return {
    valid: true,
    product,
    token: tokenRecord,
  };
}

export async function verifyAndConsumeDownloadTokenAsync(
  tokenString: string
): Promise<{
  valid: boolean;
  reason?: string;
  product?: Product;
  token?: DownloadToken;
}> {
  let res = verifyAndConsumeDownloadToken(tokenString);
  if (!res.valid && hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
        res = verifyAndConsumeDownloadToken(tokenString);
      }
    } catch {
      // ignore
    }
  }
  if (res.valid && hasDbUrl()) {
    await saveDatabaseAsync();
  }
  return res;
}

export function getTokensForOrder(orderId: string): DownloadToken[] {
  const db = getDatabase();
  return db.downloadTokens.filter((t) => t.orderId === orderId);
}

// ---------------- Admin Credentials ----------------

export function verifyAdminPassword(inputPassword: string): boolean {
  // 1. Direct environment variable support (set in .env.local or Vercel Environment Variables)
  if (process.env.ADMIN_PASSWORD && inputPassword === process.env.ADMIN_PASSWORD) {
    return true;
  }

  const db = getDatabase();
  if (!db.adminPasswordHash || !db.adminPasswordSalt) {
    return false;
  }

  try {
    const derivedKey = crypto.scryptSync(inputPassword, db.adminPasswordSalt, 64);
    const expectedKey = Buffer.from(db.adminPasswordHash, "hex");
    if (derivedKey.length !== expectedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

export function setAdminPassword(newPassword: string): boolean {
  const db = getDatabase();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(newPassword, salt, 64).toString("hex");
  db.adminPasswordSalt = salt;
  db.adminPasswordHash = hash;
  saveDatabase(db);
  return true;
}

// ---------------- Discount Coupons ----------------

export function getAllCoupons(): Coupon[] {
  const db = getDatabase();
  if (Array.isArray(db.coupons)) {
    return db.coupons;
  }
  return [];
}

export function getCouponByCode(code: string): Coupon | null {
  const coupons = getAllCoupons();
  const trimmed = code.trim().toUpperCase();
  return coupons.find((c) => c.code.toUpperCase() === trimmed && c.active) || null;
}

export function createCoupon(
  couponData: Omit<Coupon, "id" | "createdAt">
): Coupon {
  const db = getDatabase();
  const id = `coup_${crypto.randomBytes(5).toString("hex")}`;
  const now = new Date().toISOString();
  const newCoupon: Coupon = {
    ...couponData,
    id,
    code: couponData.code.trim().toUpperCase(),
    createdAt: now,
  };

  const current = getAllCoupons();
  db.coupons = [newCoupon, ...current];
  saveDatabase(db);
  return newCoupon;
}

export function deleteCoupon(id: string): boolean {
  const db = getDatabase();
  const current = getAllCoupons();
  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length !== current.length) {
    db.coupons = filtered;
    saveDatabase(db);
    return true;
  }
  return false;
}

export function toggleCouponActive(id: string): Coupon | null {
  const db = getDatabase();
  const current = getAllCoupons();
  const idx = current.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  current[idx].active = !current[idx].active;
  db.coupons = current;
  saveDatabase(db);
  return current[idx];
}

export function validateAndApplyCoupon(
  code: string,
  subtotal: number
): {
  valid: boolean;
  discount: number;
  finalTotal: number;
  message?: string;
  coupon?: Coupon;
} {
  const coupon = getCouponByCode(code);
  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      finalTotal: subtotal,
      message: "Invalid or expired coupon code.",
    };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      finalTotal: subtotal,
      message: `Minimum order of ₹${coupon.minOrder} required for this coupon.`,
    };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.round((subtotal * coupon.discount) / 100);
  } else {
    discount = Math.min(coupon.discount, subtotal);
  }

  const finalTotal = Math.max(0, subtotal - discount);
  return {
    valid: true,
    discount,
    finalTotal,
    coupon,
    message: `Coupon applied: ₹${discount} saved!`,
  };
}

// ---------------- Product Bundles & Pack Deals ----------------

export function getAllBundles(): Bundle[] {
  const db = getDatabase();
  if (Array.isArray(db.bundles)) {
    return db.bundles;
  }
  return [];
}

export function getBundleById(id: string): Bundle | null {
  const bundles = getAllBundles();
  return bundles.find((b) => b.id === id || b.slug === id) || null;
}

// ---------------- Customer Reviews & Star Ratings ----------------

export function getReviewsForProduct(productId: string): Review[] {
  const db = getDatabase();
  const allReviews = Array.isArray(db.reviews) ? db.reviews : DEFAULT_REVIEWS;
  return allReviews.filter((r) => r.productId === productId);
}

export function addReview(
  reviewData: Omit<Review, "id" | "createdAt">
): Review {
  const db = getDatabase();
  const id = `rev_${crypto.randomBytes(5).toString("hex")}`;
  const now = new Date().toISOString();
  const newReview: Review = {
    ...reviewData,
    id,
    createdAt: now,
  };

  const allReviews = Array.isArray(db.reviews) ? db.reviews : DEFAULT_REVIEWS;
  db.reviews = [newReview, ...allReviews];
  saveDatabase(db);
  return newReview;
}

export function getProductRating(productId: string): {
  average: number;
  count: number;
} {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) {
    return { average: 5.0, count: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((sum / reviews.length) * 10) / 10;
  return { average, count: reviews.length };
}

// ---------------- Customer Messages (Contact Form) ----------------

export function getAllMessages(): CustomerMessage[] {
  const db = getDatabase();
  return Array.isArray(db.messages) ? db.messages : [];
}

export async function getAllMessagesAsync(): Promise<CustomerMessage[]> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && Array.isArray(cloud.messages)) {
        cachedDb = cloud;
        lastCacheTime = Date.now();
        return cloud.messages;
      }
    } catch {}
  }
  return getAllMessages();
}

export async function addCustomerMessageAsync(
  msg: Omit<CustomerMessage, "id" | "createdAt">
): Promise<CustomerMessage> {
  if (hasDbUrl()) {
    try {
      const cloud = await getCloudDatabaseAsync<DatabaseSchema>();
      if (cloud && typeof cloud === "object") {
        cachedDb = cloud;
        lastCacheTime = Date.now();
      }
    } catch {}
  }

  const db = getDatabase();
  if (!Array.isArray(db.messages)) {
    db.messages = [];
  }

  const newMsg: CustomerMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  db.messages.unshift(newMsg);
  await saveDatabaseAsync();
  return newMsg;
}
