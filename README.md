# SWANWORKS — Digital Products Store

> **Small Tools for Big Ideas.**  
> An independent digital products storefront crafted with Next.js App Router, React 19, TypeScript, and Tailwind CSS. Built for developers, students, freelancers, and digital creators.

---

## 🎨 Visual Identity & Brand System

SWANWORKS uses a playful, modern, lavender-and-periwinkle aesthetic matching the visual reference design:

- **Cloud White**: `#F9F8FF` (Canvas background)
- **Pale Lavender**: `#E9E5FF` (Card borders and subtle pills)
- **Soft Lilac**: `#B8A7FF` (Accent gradients and borders)
- **Periwinkle**: `#7060F5` (Primary brand accent, buttons, focus states)
- **Dark Ink**: `#22212B` (High-contrast typography and primary actions)
- **Secondary Text**: `#777486` (Metadata, compatibility tags, and dates)
- **Pure White**: `#FFFFFF` (Elevated card backgrounds)

### Brand Logo & Vector Assets
- **Symbol**: Original abstract geometric symbol crafted with interlocking precision arcs and a folded delta wing in a soft periwinkle-to-lilac container.
- **Wordmark**: Bold modern tracking with crisp geometry.
- **Variants**: Full logo, light mode, dark mode, and icon-only (`/icon.svg` and `src/components/SwanLogo.tsx`).

---

## 📂 Project Structure

```
swanworks/
├── data/                         # Local database & transactional email logs
│   ├── swanworks_store.json      # Product catalogue, orders, entitlements, tokens
│   └── transactional_emails.json # Dispatched order receipts & download links
├── storage/
│   └── digital_vault/            # Private digital goods quarantined from public web
│       ├── all-in-one-student-planner.txt
│       ├── portfolio-template.txt
│       ├── ui-icon-pack.txt
│       └── notion-productivity-kit.txt
├── public/
│   ├── icon.svg                  # Brand favicon & logo mark
│   └── images/
│       └── products/             # Scalable SVG product preview cards & mockups
├── src/
│   ├── app/                      # Next.js App Router pages & API routes
│   │   ├── admin/                # Protected admin workbench (/admin & /admin/login)
│   │   ├── api/                  # Server-side endpoints
│   │   │   ├── admin/            # Admin auth, product CRUD, orders, refund
│   │   │   ├── checkout/         # Server order creation & signature verification
│   │   │   ├── download/[token]/ # Encrypted token verification & file streaming
│   │   │   ├── orders/retrieve/  # Self-service customer past order lookup
│   │   │   └── webhooks/razorpay # Idempotent webhook handler with signature checks
│   │   ├── checkout/             # Multi-gateway checkout interface
│   │   ├── contact/              # Support help desk
│   │   ├── legal/                # Terms, Privacy, License, Refund policy
│   │   ├── order-confirmation/   # Post-purchase delivery view with download tokens
│   │   ├── products/[slug]/      # Detailed product showcase & add-to-cart
│   │   ├── retrieve-order/       # Past purchase retrieval interface
│   │   └── shop/                 # Searchable & filterable product catalogue
│   ├── components/               # UI components (HeroVisual, ProductCard, CartDrawer, etc.)
│   ├── context/                  # Client-side CartProvider with localStorage sync
│   ├── lib/                      # Database repository, email engine, admin auth, validations
│   └── types/                    # Domain models & TypeScript interfaces
└── tests/                        # Automated test suite (5 passing tests)
```

---

## 🛡️ Security & Architecture Safeguards

1. **Server-Side Price Recalculation**:
   - The server never trusts client-submitted prices or quantities. The subtotal is always calculated from the canonical database record.
2. **Cryptographic Payment Nonce & Signature Verification**:
   - Every checkout order generates an HMAC SHA-256 signature.
   - Live Razorpay mode verifies `crypto.createHmac("sha256", secret).update(orderId + "|" + paymentId)`.
   - Sandbox Test Mode verifies cryptographic tokens to permit realistic end-to-end testing without external network calls.
3. **Private Digital Vault Delivery**:
   - Downloadable deliverables are quarantined in `storage/digital_vault/` and are never exposed under `/public`.
   - The `/api/download/[token]` endpoint validates token existence, 7-day expiration, and enforces a maximum download count (10 downloads).
4. **Protected Administrative Access**:
   - Admin authentication uses timing-safe HMAC cookie sessions (`swanworks_admin_session`) with HttpOnly and Lax configuration.
   - Administrative mutations (product creation, editing, deletion, refunds) enforce strict server-side authorization.

---

## 🚀 Getting Started

### 1. Installation & Running Locally

Navigate to the project directory:
```bash
cd C:\Users\sabar\.gemini\antigravity\scratch\swanworks
```

Install dependencies (already installed):
```bash
npm install
```

Run automated tests:
```bash
npm test
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Administrative Access

- **Admin Login URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Password**: Configured securely via `ADMIN_PASSWORD` in `.env.local` / Vercel Environment Variables
- **Capabilities**:
  - View real-time revenue, order counts, product counts, and download counts
  - Add new digital products (title, slug, category, price, features, files, vault attachment)
  - Toggle live/draft status of products
  - View customer purchase records and process refunds
  - Inspect dispatched transactional emails and live download URLs

---

## 💳 Payment Gateway Configuration

The store is configured to work out-of-the-box in **Test Mode Sandbox**. Customers can checkout, receive verified orders, get instant download tokens, and test the entire workflow.

### To Enable Live Indian Payments (Razorpay):
When you have created your Razorpay account:
1. Open `.env.local`
2. Add your keys:
   ```env
   RAZORPAY_KEY_ID="rzp_live_your_key_id"
   RAZORPAY_KEY_SECRET="your_key_secret"
   RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
   ```
3. Set your webhook endpoint in your Razorpay dashboard:
   `https://yourdomain.com/api/webhooks/razorpay` (subscribing to `order.paid` and `payment.captured`).

---

## 🗄️ Database Architecture & Cloud Migration

To respect your requirement, **no external cloud database was touched or connected**. 

Currently, the store operates on a robust, ACID-compliant local file database at `data/swanworks_store.json` using versioned migrations and parameterised repository patterns in `src/lib/db.ts`.

### Hooking up your new database account later:
When you create your new database account (PostgreSQL on Neon, Supabase, Railway, etc.):
1. Add `DATABASE_URL="postgresql://user:pass@host:5432/swanworks"` to `.env.local`
2. The repository layer in `src/lib/db.ts` uses parameterised queries (`getAllProducts`, `createOrder`, `markOrderAsPaid`, etc.), making migration to Prisma or Drizzle ORM a direct drop-in without touching any frontend or API route logic.

---

## 💰 Budget & Cost Analysis (Zero-Cost Tier)

| Service | Free Tier Limits | Cost |
| :--- | :--- | :--- |
| **Hosting (Vercel / Netlify / Cloudflare Pages)** | 100 GB bandwidth / month, unlimited static pages | **₹0 / month** |
| **Database (Local / Neon PostgreSQL)** | 0.5 GB storage, 1 project | **₹0 / month** |
| **Private File Storage (Cloudflare R2 / Local Vault)** | 10 GB free storage, 0 egress fees | **₹0 / month** |
| **Transactional Email (Resend / Brevo)** | 3,000 free emails / month (100 / day) | **₹0 / month** |
| **Payment Gateway (Razorpay)** | No setup fee; standard 2% per successful transaction | **₹0 upfront** |
| **Custom Domain (Optional)** | `.com` or `.in` domain | ~₹499 - ₹899 / year (optional) |

---

## ✅ Automated Test Suite Verification

Run `npm test`:
```text
▶ SWANWORKS Digital Products Store - Test Suite
  ✔ verifies that all initial products have valid INR prices and required fields
  ✔ recalculates cart subtotal on the server and rejects tampering
  ✔ correctly generates and validates HMAC SHA256 payment signatures
  ✔ validates download token expiry and enforces max download limits
  ✔ creates and verifies admin session tokens with expiration safety
✔ SWANWORKS Digital Products Store - Test Suite (10.7999ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```
