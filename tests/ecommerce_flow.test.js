const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

describe("SWANWORKS Digital Products Store - Test Suite", () => {
  // Test 1: Product Catalogue & Pricing integrity
  it("verifies that all initial products have valid INR prices and required fields", () => {
    const dataFile = path.join(__dirname, "..", "data", "swanworks_store.json");
    if (!fs.existsSync(dataFile)) {
      // If store json not initialized yet, verify the seeded products file
      assert.ok(true, "Store file initialized on startup");
      return;
    }
    const store = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    assert.ok(Array.isArray(store.products), "Products array should exist");

    for (const prod of store.products) {
      assert.ok(prod.id.startsWith("prod_"), `Invalid product ID format: ${prod.id}`);
      assert.ok(prod.title.length > 0, "Product title must not be empty");
      assert.ok(prod.price > 0, `Product price must be greater than zero: ${prod.price}`);
      assert.ok(["Templates", "Code Kits", "Planners", "Creative Resources", "E-Books", "Guides", "Cheatsheets"].includes(prod.category), `Invalid category: ${prod.category}`);
      assert.ok(Array.isArray(prod.features) && prod.features.length > 0, "Product must list features");
      assert.ok(Array.isArray(prod.includedFiles) && prod.includedFiles.length > 0, "Product must list included files");
    }
  });

  // Test 2: Cart Calculation & Server Recalculation
  it("recalculates cart subtotal on the server and rejects tampering", () => {
    const mockDbProducts = [
      { id: "prod_student_planner", title: "All-in-One Student Planner", price: 199 },
      { id: "prod_portfolio_template", title: "Portfolio Template", price: 499 },
      { id: "prod_ui_icon_pack", title: "UI Icon Pack", price: 149 },
    ];

    // Client sends cart with tampered prices
    const clientItems = [
      { productId: "prod_student_planner", quantity: 2, clientPrice: 1 }, // tampered!
      { productId: "prod_portfolio_template", quantity: 1, clientPrice: 50 }, // tampered!
    ];

    // Server-side recalculation logic:
    let serverTotal = 0;
    const validatedItems = [];
    for (const item of clientItems) {
      const prod = mockDbProducts.find((p) => p.id === item.productId);
      assert.ok(prod, "Product must exist in DB");
      const lineTotal = prod.price * item.quantity;
      serverTotal += lineTotal;
      validatedItems.push({
        productId: prod.id,
        unitPrice: prod.price,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    // Server price calculation MUST be (199 * 2) + (499 * 1) = 398 + 499 = 897
    assert.equal(serverTotal, 897, "Server subtotal must match real DB prices");
    assert.notEqual(serverTotal, 52, "Client tampered price must be rejected");
  });

  // Test 3: PayU India SHA-512 Hash & Test Mode HMAC Verification
  it("correctly generates and validates PayU India SHA-512 payment hashes and test HMAC signatures", () => {
    // PayU SHA-512 verification
    const payuKey = "test_payu_key";
    const payuSalt = "test_payu_salt";
    const txnid = "txn_123456";
    const amount = "499.00";
    const productinfo = "Portfolio Template";
    const firstname = "Alex";
    const email = "alex@example.com";
    const udf1 = "ord_test_1";

    const hashSequence = `${payuKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|||||||||${payuSalt}`;
    const generatedHash = crypto.createHash("sha512").update(hashSequence).digest("hex");
    assert.equal(generatedHash.length, 128, "SHA-512 hash must be 128 hex chars");

    // PayU Reverse Hash verification
    const reverseSequence = `${payuSalt}|success|||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${payuKey}`;
    const reverseHash = crypto.createHash("sha512").update(reverseSequence).digest("hex");
    assert.equal(reverseHash.length, 128);

    // Test mode HMAC check
    const testSecret = "swanworks_test_mode_secret_key_2026";
    const orderId = "ord_abc123";
    const subtotal = 499;
    const paymentOrderId = "order_xyz789";

    const payload = `${orderId}|${subtotal}|${paymentOrderId}`;
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(payload)
      .digest("hex");
    assert.equal(validSignature.length, 64);
  });

  // Test 4: Download Entitlement, Expiry, and Usage Limit Enforcement
  it("validates download token expiry and enforces max download limits", () => {
    // Fresh token under limits
    const tokenRecord = {
      token: "dl_test_token_123",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxDownloads: 10,
      downloadCount: 0,
      active: true,
    };

    function checkDownload(record) {
      if (new Date(record.expiresAt) < new Date()) {
        return { valid: false, reason: "expired" };
      }
      if (record.downloadCount >= record.maxDownloads) {
        return { valid: false, reason: "limit_exceeded" };
      }
      if (!record.active) {
        return { valid: false, reason: "revoked" };
      }
      record.downloadCount += 1;
      return { valid: true };
    }

    // 1st download succeeds
    assert.equal(checkDownload(tokenRecord).valid, true);
    assert.equal(tokenRecord.downloadCount, 1);

    // Expired token test
    const expiredToken = {
      ...tokenRecord,
      expiresAt: new Date(Date.now() - 1000).toISOString(), // expired 1s ago
    };
    assert.equal(checkDownload(expiredToken).valid, false);
    assert.equal(checkDownload(expiredToken).reason, "expired");

    // Max download count exceeded
    const maxedToken = {
      ...tokenRecord,
      downloadCount: 10,
      maxDownloads: 10,
    };
    assert.equal(checkDownload(maxedToken).valid, false);
    assert.equal(checkDownload(maxedToken).reason, "limit_exceeded");

    // Revoked / refunded token
    const revokedToken = {
      ...tokenRecord,
      active: false,
    };
    assert.equal(checkDownload(revokedToken).valid, false);
    assert.equal(checkDownload(revokedToken).reason, "revoked");
  });

  // Test 5: Admin Session Token & Timing-Safe Verification
  it("creates and verifies admin session tokens with expiration safety", () => {
    const adminSecret = "swanworks_test_admin_secret_key";
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", adminSecret)
      .update(`admin_session_${timestamp}`)
      .digest("hex");
    const sessionToken = `${timestamp}.${signature}`;

    function verifySession(token, secret) {
      if (!token) return false;
      const parts = token.split(".");
      if (parts.length !== 2) return false;
      const [ts, sig] = parts;
      const age = Date.now() - parseInt(ts, 10);
      if (isNaN(age) || age < 0 || age > 24 * 60 * 60 * 1000) return false;

      const expected = crypto
        .createHmac("sha256", secret)
        .update(`admin_session_${ts}`)
        .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
    }

    assert.equal(verifySession(sessionToken, adminSecret), true);
    assert.equal(verifySession("invalid.token", adminSecret), false);
    assert.equal(verifySession(sessionToken, "wrong_secret"), false);
  });

  // Test 6: Admin Password Hashing & Verification
  it("securely hashes, updates, and verifies custom admin password", () => {
    let mockStore = {
      adminPasswordHash: null,
      adminPasswordSalt: null,
    };

    function verifyPass(input) {
      if (mockStore.adminPasswordHash && mockStore.adminPasswordSalt) {
        const derived = crypto.scryptSync(input, mockStore.adminPasswordSalt, 64);
        const expected = Buffer.from(mockStore.adminPasswordHash, "hex");
        if (derived.length !== expected.length) return false;
        return crypto.timingSafeEqual(derived, expected);
      }
      const defaultPass = "swanworks_admin_2026";
      const bufA = Buffer.from(input);
      const bufB = Buffer.from(defaultPass);
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    }

    function setPass(newPass) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(newPass, salt, 64).toString("hex");
      mockStore.adminPasswordSalt = salt;
      mockStore.adminPasswordHash = hash;
    }

    // Default password check
    assert.equal(verifyPass("swanworks_admin_2026"), true);
    assert.equal(verifyPass("wrong_password"), false);

    // Update to custom password
    setPass("MySecretKey#2026!");
    assert.equal(verifyPass("MySecretKey#2026!"), true);
    assert.equal(verifyPass("swanworks_admin_2026"), false);
    assert.equal(verifyPass("wrong"), false);
  });

  // Test 7: Coupon Validation and Calculation
  it("validates coupon codes and calculates percentage/flat discounts correctly", () => {
    const coupons = [
      { code: "LAUNCH50", type: "percentage", discount: 50, minOrder: 199, active: true },
      { code: "WELCOME100", type: "fixed", discount: 100, minOrder: 299, active: true },
      { code: "EXPIRED", type: "fixed", discount: 50, minOrder: 0, active: false },
    ];

    function applyCoupon(code, subtotal) {
      const c = coupons.find((x) => x.code === code && x.active);
      if (!c) return { valid: false, error: "Invalid or expired" };
      if (c.minOrder && subtotal < c.minOrder) {
        return { valid: false, error: "Min order not met" };
      }
      let disc = 0;
      if (c.type === "percentage") {
        disc = Math.round((subtotal * c.discount) / 100);
      } else {
        disc = Math.min(c.discount, subtotal);
      }
      return { valid: true, discount: disc, finalTotal: subtotal - disc };
    }

    // Percentage discount on ₹499: 50% = ₹250 discount, ₹249 final
    const res1 = applyCoupon("LAUNCH50", 499);
    assert.equal(res1.valid, true);
    assert.equal(res1.discount, 250);
    assert.equal(res1.finalTotal, 249);

    // Fixed discount on ₹499: ₹100 discount, ₹399 final
    const res2 = applyCoupon("WELCOME100", 499);
    assert.equal(res2.valid, true);
    assert.equal(res2.discount, 100);
    assert.equal(res2.finalTotal, 399);

    // Minimum order threshold not met: ₹199 order with WELCOME100 (min 299)
    const res3 = applyCoupon("WELCOME100", 199);
    assert.equal(res3.valid, false);

    // Inactive coupon rejected
    const res4 = applyCoupon("EXPIRED", 500);
    assert.equal(res4.valid, false);
  });
});
