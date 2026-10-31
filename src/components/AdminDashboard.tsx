"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product, Order, Coupon } from "@/types";
import { SentEmailRecord } from "@/lib/email";
import {
  Package,
  ShoppingBag,
  Mail,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  IndianRupee,
  FileText,
  Upload,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  FileCheck,
  Search,
  TrendingUp,
  Edit3,
  Sparkles,
  Tag,
  Key,
  Lock,
  X,
  MessageSquare,
} from "lucide-react";
import { CustomerMessage } from "@/lib/db";

interface AdminDashboardProps {
  initialProducts: Product[];
  initialOrders: Order[];
  initialEmails: SentEmailRecord[];
  initialCategories?: string[];
  initialCoupons?: Coupon[];
  initialMessages?: CustomerMessage[];
}

export default function AdminDashboard({
  initialProducts,
  initialOrders,
  initialEmails,
  initialCategories,
  initialCoupons,
  initialMessages,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "coupons" | "emails" | "messages"
  >("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [emails] = useState<SentEmailRecord[]>(initialEmails);
  const [messages] = useState<CustomerMessage[]>(initialMessages || []);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons || []);

  // Coupon Creation Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "fixed">("percentage");
  const [newCouponValue, setNewCouponValue] = useState(20);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(0);
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponActionError, setCouponActionError] = useState<string | null>(null);

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>(
    initialCategories || ["Templates", "Code Kits", "Planners", "Creative Resources"]
  );
  const [newCatInput, setNewCatInput] = useState("");
  const [editingCat, setEditingCat] = useState<{ oldName: string; newName: string } | null>(null);
  const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState("");

  // Product Filter & Search
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "live" | "draft">("all");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("all");

  // Orders Filter & Search
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "paid" | "pending_approval" | "refunded">("all");

  // Quick Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState(199);
  const [editShortDesc, setEditShortDesc] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Templates");
  const [newPrice, setNewPrice] = useState(199);
  const [newShortDesc, setNewShortDesc] = useState("");
  const [newFullDesc, setNewFullDesc] = useState("");
  const [newIncludedFiles, setNewIncludedFiles] = useState(
    "1x High-Resolution Printable PDF\n1x Tablet / GoodNotes version"
  );

  // Thumbnail upload state
  const [thumbnailUrl, setThumbnailUrl] = useState("/images/products/student-planner.svg");
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  // Digital product file upload state (PDF, ZIP, etc.)
  const [uploadedVaultFileName, setUploadedVaultFileName] = useState("");
  const [uploadedOriginalName, setUploadedOriginalName] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Admin Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setPasswordFeedback({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordFeedback(null);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newAdminPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordFeedback({ type: "success", text: "Admin password updated successfully!" });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setNewAdminPassword("");
          setPasswordFeedback(null);
        }, 1500);
      } else {
        setPasswordFeedback({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch {
      setPasswordFeedback({ type: "error", text: "Network error updating password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Category Actions
  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
        setNewCatInput("");
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  const handleSaveEditCategory = async () => {
    if (!editingCat || !editingCat.newName.trim()) {
      setEditingCat(null);
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCat),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
        setProducts((prev) =>
          prev.map((p) =>
            p.category === editingCat.oldName
              ? { ...p, category: editingCat.newName.trim() }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    } finally {
      setEditingCat(null);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (
      !confirm(
        `Delete category "${name}"? Existing products in this category will keep their label.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !product.published }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm("Confirm and release digital downloads for this order?")) return;
    try {
      const res = await fetch("/api/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      } else {
        alert(data.error || "Failed to approve order");
      }
    } catch (e) {
      console.error(e);
      alert("Error approving order");
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm("Deactivate access and issue a refund for this order?")) return;
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponActionError(null);
    if (!newCouponCode.trim()) return;

    setIsCreatingCoupon(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          type: newCouponType,
          discount: Number(newCouponValue),
          minOrder: Number(newCouponMinOrder),
          description: newCouponDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create coupon");
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setNewCouponCode("");
      setNewCouponValue(20);
      setNewCouponMinOrder(0);
      setNewCouponDesc("");
    } catch (err: unknown) {
      setCouponActionError(
        err instanceof Error ? err.message : "Error creating coupon"
      );
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? data.coupon : c))
        );
      }
    } catch (err) {
      console.error("Toggle coupon error:", err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete coupon error:", err);
    }
  };

  // Quick Edit Product Modal Handlers
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditPrice(p.price);
    setEditShortDesc(p.shortDescription || "");
    setEditPublished(p.published);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          price: editPrice,
          shortDescription: editShortDesc.trim(),
          published: editPublished,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        setEditingProduct(null);
      } else {
        alert(data.error || "Failed to save product changes");
      }
    } catch (err) {
      console.error("Save product edit error:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Cover / Thumbnail Image File Picker
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setActionError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "thumbnail");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload thumbnail");
      }
      setThumbnailUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setActionError(msg);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Handle Downloadable Product File (PDF, ZIP, etc.)
  const handleProductFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setActionError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "vault_file");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload product file");
      }
      setUploadedVaultFileName(data.filename || data.fileName);
      setUploadedOriginalName(data.originalName || file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "File upload failed";
      setActionError(msg);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const assignedCategory = isAddingCustomCat
      ? customCatName.trim()
      : newCategory;

    if (!newTitle.trim()) {
      setActionError("Product title is required");
      return;
    }
    if (!assignedCategory) {
      setActionError("Please choose or create a category");
      return;
    }
    if (!uploadedVaultFileName) {
      setActionError("Please upload the downloadable product file (PDF, etc.)");
      return;
    }

    setIsSubmitting(true);
    try {
      const includedList = newIncludedFiles
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: newTitle.trim(),
        category: assignedCategory,
        price: Number(newPrice),
        shortDescription: newShortDesc.trim() || newTitle.trim(),
        fullDescription:
          newFullDesc.trim() ||
          newShortDesc.trim() ||
          "Instant digital download. You will receive immediate access after checkout.",
        features: [
          "Instant Digital Download",
          "High Resolution Quality",
          "Lifetime Access",
        ],
        includedFiles:
          includedList.length > 0
            ? includedList
            : [uploadedOriginalName || "Digital Download File (PDF)"],
        compatibility: "All Devices (PDF / Digital)",
        license: "Personal and commercial client use permitted.",
        previewImage: thumbnailUrl || "/images/products/student-planner.svg",
        vaultFile: uploadedVaultFileName,
        published: true,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      setProducts((prev) => [data.product, ...prev]);
      if (!categories.includes(assignedCategory)) {
        setCategories((prev) => [...prev, assignedCategory]);
      }
      setIsModalOpen(false);
      setIsAddingCustomCat(false);
      setCustomCatName("");
      setNewTitle("");
      setNewShortDesc("");
      setNewFullDesc("");
      setUploadedVaultFileName("");
      setUploadedOriginalName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Product creation failed";
      setActionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics calculated strictly from real store data
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.subtotal, 0);
  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;
  const liveProducts = products.filter((p) => p.published);
  const draftProducts = products.filter((p) => !p.published);
  const totalUnitsSold = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);

  // Top performing item
  const bestSeller =
    products.length > 0
      ? [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))[0]
      : null;

  // Filtered Products for view
  const filteredProducts = products.filter((p) => {
    if (productStatusFilter === "live" && !p.published) return false;
    if (productStatusFilter === "draft" && p.published) return false;
    if (productCatFilter !== "all" && p.category !== productCatFilter) return false;
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchCat) return false;
    }
    return true;
  });

  // Filtered Orders for view
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      if (!matchEmail && !matchOrderNum) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E5FF]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7060F5] bg-[#ECE9FF] px-3 py-1 rounded-full">
            STORE MANAGEMENT
          </span>
          <h1 className="text-3xl font-extrabold text-[#22212B] mt-2">
            Store Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsPasswordModalOpen(true);
              setPasswordFeedback(null);
              setNewAdminPassword("");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E9E5FF] hover:border-[#7060F5] text-xs font-bold text-[#7060F5] transition-colors shadow-2xs cursor-pointer"
            title="Change Admin Password"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
          <button
            onClick={() => router.refresh()}
            className="p-2.5 rounded-full border border-[#E9E5FF] bg-white text-[#777486] hover:text-[#22212B] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E9E5FF] hover:border-red-300 text-xs font-bold text-red-600 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Store Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#777486]">
            Total Store Revenue
          </span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-2xl font-extrabold text-[#22212B]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[11px] text-[#777486] mt-1 font-medium">
            From {paidOrdersCount} completed orders
          </span>
        </div>

        {/* Live on Store */}
        <div className="p-5 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#777486]">
            Catalogue Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">
              {liveProducts.length}
            </span>
            <span className="text-sm font-bold text-[#22212B]">Live on Store</span>
          </div>
          <span className="text-[11px] text-[#777486] mt-1 font-medium">
            {draftProducts.length} hidden / draft items
          </span>
        </div>

        {/* Total Units Sold */}
        <div className="p-5 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#777486]">
            Total Units Sold
          </span>
          <div className="flex items-center gap-2 mt-2">
            <FileText className="w-5 h-5 text-[#7060F5]" />
            <span className="text-2xl font-extrabold text-[#22212B]">
              {totalUnitsSold.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[11px] text-[#777486] mt-1 font-medium">
            Across {products.length} listed items
          </span>
        </div>

        {/* Top Seller Spotlight */}
        <div className="p-5 rounded-3xl bg-linear-to-br from-[#FAF9FF] to-[#ECE9FF] border border-[#E9E5FF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7060F5]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Performing Item</span>
          </div>
          {bestSeller && (bestSeller.salesCount || 0) > 0 ? (
            <div className="mt-2">
              <span className="text-sm font-extrabold text-[#22212B] line-clamp-1 block">
                {bestSeller.title}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-600">
                  {bestSeller.salesCount} sold
                </span>
                <span className="text-[11px] text-[#777486]">
                  (₹{((bestSeller.salesCount || 0) * bestSeller.price).toLocaleString("en-IN")})
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#777486]">
              Awaiting first sale
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E5FF] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === "products"
              ? "bg-[#7060F5] text-white"
              : "text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/50"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Books ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === "orders"
              ? "bg-[#7060F5] text-white"
              : "text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === "coupons"
              ? "bg-[#7060F5] text-white"
              : "text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/50"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discount Codes ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("emails")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === "emails"
              ? "bg-[#7060F5] text-white"
              : "text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/50"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Sent Order Receipts ({emails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === "messages"
              ? "bg-[#7060F5] text-white"
              : "text-[#777486] hover:text-[#22212B] hover:bg-[#E9E5FF]/50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Inquiries ({messages.length})</span>
        </button>
      </div>

      {/* ---------------- TAB 1: PRODUCT LIST ---------------- */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#22212B]">
                Catalogue & Sales Breakdown
              </h2>
              <p className="text-xs text-[#777486] mt-0.5">
                Track how each book and template is performing, toggle visibility, and update pricing.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7060F5] text-white font-bold text-xs hover:bg-[#5A48E6] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product (PDF / Download)</span>
            </button>
          </div>

          {/* Search, Filter Pills & Category Dropdown */}
          <div className="p-4 rounded-3xl bg-white border border-[#E9E5FF] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F9F8FF] rounded-2xl border border-[#E9E5FF] overflow-x-auto shrink-0">
              <button
                onClick={() => setProductStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  productStatusFilter === "all"
                    ? "bg-white text-[#22212B] shadow-2xs"
                    : "text-[#777486] hover:text-[#22212B]"
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setProductStatusFilter("live")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  productStatusFilter === "live"
                    ? "bg-white text-emerald-600 shadow-2xs"
                    : "text-[#777486] hover:text-emerald-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Live ({liveProducts.length})</span>
              </button>
              <button
                onClick={() => setProductStatusFilter("draft")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  productStatusFilter === "draft"
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-[#777486] hover:text-amber-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Drafts / Hidden ({draftProducts.length})</span>
              </button>
            </div>

            {/* Category Filter & Search Input */}
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs font-semibold text-[#22212B] outline-none focus:border-[#7060F5] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#777486] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title or slug..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs outline-none focus:border-[#7060F5] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Category Management Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#E9E5FF] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#22212B]">Store Categories</span>
                <p className="text-[11px] text-[#777486]">
                  Click a pill to rename or ✕ to delete. These display as navigation pills across the storefront.
                </p>
              </div>

              {/* Add category input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] text-xs outline-none focus:border-[#7060F5] w-48"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 py-1.5 rounded-xl bg-[#22212B] hover:bg-[#7060F5] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Category Pills List */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E9E5FF] bg-[#F9F8FF] hover:bg-[#ECE9FF] transition-all text-xs font-semibold text-[#22212B]"
                >
                  {editingCat?.oldName === cat ? (
                    <input
                      type="text"
                      value={editingCat.newName}
                      autoFocus
                      onChange={(e) =>
                        setEditingCat({ oldName: cat, newName: e.target.value })
                      }
                      onBlur={handleSaveEditCategory}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEditCategory();
                        if (e.key === "Escape") setEditingCat(null);
                      }}
                      className="px-2 py-0.5 rounded bg-white text-xs border border-[#7060F5] outline-none"
                    />
                  ) : (
                    <>
                      <span
                        onClick={() =>
                          setEditingCat({ oldName: cat, newName: cat })
                        }
                        className="cursor-pointer"
                        title="Click to rename"
                      >
                        {cat}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCat({ oldName: cat, newName: cat })
                        }
                        className="text-[#777486] hover:text-[#7060F5] opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer text-[11px]"
                        title="Rename category"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-[#777486] hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                        title="Delete category"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Products & Books Table with Individual Sales Tracking */}
          <div className="bg-white rounded-3xl border border-[#E9E5FF] overflow-hidden shadow-xs">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-[#777486] text-sm">
                No matching products found. Try adjusting your search query or filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F8FF] border-b border-[#E9E5FF] text-[#777486] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Product / Book</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Copies Sold</th>
                      <th className="py-4 px-6">Revenue Earned</th>
                      <th className="py-4 px-6">Storefront Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0FF]">
                    {filteredProducts.map((p) => {
                      const unitsSold = p.salesCount || 0;
                      const productRevenue = unitsSold * p.price;
                      const isTopSeller =
                        bestSeller &&
                        bestSeller.id === p.id &&
                        unitsSold > 0;

                      return (
                        <tr key={p.id} className="hover:bg-[#F9F8FF]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#F0EEFA] border border-[#E9E5FF] shrink-0">
                                <Image
                                  src={p.previewImage}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#22212B] block">
                                    {p.title}
                                  </span>
                                  {isTopSeller && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#7060F5] bg-[#ECE9FF] px-2 py-0.5 rounded-full">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      #1 Bestseller
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#777486]">
                                  /{p.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-[#7060F5]">
                            {p.category}
                          </td>
                          <td className="py-4 px-6 font-extrabold text-[#22212B]">
                            ₹{p.price}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#22212B]">
                                {unitsSold.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] text-[#777486]">copies</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-emerald-600">
                              ₹{productRevenue.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleTogglePublish(p)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] cursor-pointer transition-colors ${
                                p.published
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              }`}
                              title={
                                p.published
                                  ? "Click to hide from store visitors"
                                  : "Click to publish live on store"
                              }
                            >
                              {p.published ? (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Live on Store</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Hidden / Draft</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg text-[#777486] hover:text-[#7060F5] hover:bg-[#ECE9FF] transition-colors cursor-pointer"
                                title="Edit details & price"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg text-[#777486] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: ORDERS ---------------- */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#22212B]">
                Customer Purchases & Transactions
              </h2>
              <p className="text-xs text-[#777486] mt-0.5">
                Real-time record of all orders placed by customers across the storefront.
              </p>
            </div>

            {/* Order status filters */}
            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as "all" | "paid" | "pending_approval" | "refunded")}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E9E5FF] text-xs font-semibold text-[#22212B] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending_approval">Needs Approval</option>
                <option value="paid">Paid Only</option>
                <option value="refunded">Refunded Only</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#777486] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer email..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E9E5FF] text-xs outline-none focus:border-[#7060F5]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9E5FF] overflow-hidden shadow-xs">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-[#777486] text-sm">
                No customer orders match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F8FF] border-b border-[#E9E5FF] text-[#777486] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Order #</th>
                      <th className="py-4 px-6">Customer Email</th>
                      <th className="py-4 px-6">Item Purchased</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0FF]">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#F9F8FF]/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#22212B]">
                          {o.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-[#22212B] block">
                            {o.customerEmail}
                          </span>
                          <span className="text-[11px] text-[#777486]">
                            {new Date(o.createdAt).toLocaleDateString()} at{" "}
                            {new Date(o.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {o.items.map((item) => (
                            <div key={item.productId} className="font-medium text-[#22212B]">
                              {item.productTitle}
                            </div>
                          ))}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-[#22212B]">
                          ₹{o.subtotal}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              o.status === "paid"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : o.status === "pending_approval"
                                ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                          >
                            {o.status === "pending_approval" ? "Needs Approval" : o.status}
                          </span>
                          {o.utr && (
                            <div className="text-[10px] font-mono text-[#777486] mt-1">
                              UTR: {o.utr}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.status === "pending_approval" && (
                              <button
                                onClick={() => handleApproveOrder(o.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                              >
                                ✓ Approve & Release
                              </button>
                            )}
                            {o.status === "paid" && (
                              <button
                                onClick={() => handleRefundOrder(o.id)}
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                              >
                                Revoke & Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: DISCOUNT COUPONS ---------------- */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#22212B]">
                Discount Codes & Promo Coupons
              </h2>
              <p className="text-xs text-[#777486] mt-0.5">
                Create promotional discount codes for marketing campaigns, seasonal sales, and student offers.
              </p>
            </div>
          </div>

          {/* Create Coupon Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E9E5FF] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#22212B]">
              + Create New Coupon Code
            </h3>

            {couponActionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {couponActionError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end">
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE30"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Discount Type
                </label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as "percentage" | "fixed")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] font-medium cursor-pointer"
                >
                  <option value="percentage">% Percentage Off</option>
                  <option value="fixed">₹ Flat Rupee Off</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={newCouponType === "percentage" ? "50 (%)" : "100 (₹)"}
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Min. Order (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingCoupon}
                className="py-2.5 px-4 rounded-xl bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 h-[38px] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingCoupon ? "Saving..." : "Add Coupon"}</span>
              </button>
            </form>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-[#E9E5FF] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F8FF] border-b border-[#E9E5FF] text-[#777486] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-6">Discount</th>
                    <th className="py-4 px-6">Min Order</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F0FF]">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F9F8FF]/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#7060F5] text-sm">
                        {c.code}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-[#22212B]">
                        {c.type === "percentage" ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                      </td>
                      <td className="py-4 px-6 text-[#777486]">
                        {c.minOrder ? `₹${c.minOrder}` : "No minimum"}
                      </td>
                      <td className="py-4 px-6 text-[#777486]">
                        {c.description || "Active promotion"}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleCoupon(c.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer ${
                            c.active
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {c.active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 rounded-lg text-[#777486] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: SENT EMAILS ---------------- */}
      {activeTab === "emails" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#22212B]">
            Delivered Purchase Receipts
          </h2>
          <div className="space-y-4">
            {emails.length === 0 ? (
              <div className="p-12 text-center text-[#777486] text-sm bg-white rounded-3xl border border-[#E9E5FF]">
                No receipts sent yet. Receipts will appear here whenever orders complete.
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  className="p-6 rounded-3xl bg-white border border-[#E9E5FF] space-y-2 text-xs"
                >
                  <div className="flex justify-between font-bold text-[#22212B]">
                    <span>
                      To: {email.to} ({email.orderNumber})
                    </span>
                    <span className="text-[#777486]">
                      {new Date(email.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold text-[#7060F5]">{email.subject}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: CUSTOMER MESSAGES ---------------- */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#22212B]">
                Customer Inquiries & Messages
              </h2>
              <p className="text-xs text-[#777486]">
                Incoming messages from your Contact / Help Desk form
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-12 text-center text-[#777486] text-sm bg-white rounded-3xl border border-[#E9E5FF]">
                No customer messages received yet. Inquiries submitted via the Contact page will appear here.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-6 rounded-3xl bg-white border border-[#E9E5FF] space-y-3 text-xs shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F0FF] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#22212B]">{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}?subject=Re:%20Inquiry%20regarding%20SWANWORKS`}
                        className="text-[#7060F5] font-semibold hover:underline bg-[#ECE9FF] px-2.5 py-0.5 rounded-full"
                      >
                        {msg.email}
                      </a>
                      {msg.orderNumber && (
                        <span className="text-[11px] font-mono font-bold text-[#777486] bg-[#F9F8FF] border border-[#E9E5FF] px-2 py-0.5 rounded-md">
                          Order #{msg.orderNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[#777486] text-[11px]">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9F8FF] text-[#22212B] text-xs leading-relaxed font-medium">
                    &ldquo;{msg.message}&rdquo;
                  </div>

                  <div className="flex justify-end pt-1">
                    <a
                      href={`mailto:${msg.email}?subject=Re:%20Inquiry%20to%20SWANWORKS`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- QUICK EDIT PRODUCT MODAL ---------------- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#22212B]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E9E5FF] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#F3F0FF] bg-white">
              <div>
                <h3 className="text-base font-bold text-[#22212B]">
                  Edit Product Details
                </h3>
                <p className="text-xs text-[#777486]">
                  Update title, category, price, or visibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-[#F9F8FF] hover:bg-[#ECE9FF] text-[#777486] hover:text-[#22212B] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#22212B] mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#22212B] mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={editShortDesc}
                  onChange={(e) => setEditShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPublishedCheck"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7060F5] focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="editPublishedCheck"
                  className="text-xs font-bold text-[#22212B] cursor-pointer"
                >
                  Live on Storefront (visible to buyers)
                </label>
              </div>

              <div className="pt-3 border-t border-[#F3F0FF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-full border border-[#E9E5FF] text-[#777486] hover:text-[#22212B] font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD PRODUCT MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#22212B]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E9E5FF] shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#F3F0FF] shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#22212B]">
                  Add a Digital Product / Book
                </h3>
                <p className="text-xs text-[#777486]">
                  Upload your file (PDF, etc.), cover image, and set your price.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F9F8FF] hover:bg-[#ECE9FF] text-[#777486] hover:text-[#22212B] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="addProductForm"
              onSubmit={handleCreateProduct}
              className="p-6 overflow-y-auto space-y-4 text-xs flex-1"
            >
              {actionError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Product Title */}
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Product / Book Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Daily Student Planner 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#22212B]">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCat(!isAddingCustomCat)}
                      className="text-[11px] font-bold text-[#7060F5] hover:underline cursor-pointer"
                    >
                      {isAddingCustomCat ? "Pick Existing" : "+ New Category"}
                    </button>
                  </div>

                  {isAddingCustomCat ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wallpapers, E-Books, Presets"
                      value={customCatName}
                      onChange={(e) => setCustomCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#7060F5] outline-none text-xs font-medium"
                    />
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        if (e.target.value === "__NEW__") {
                          setIsAddingCustomCat(true);
                        } else {
                          setNewCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] cursor-pointer text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW__">+ Add Custom Category...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-[#22212B] mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="199"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Uploads Grid: Thumbnail + Downloadable File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. PRODUCT COVER IMAGE / THUMBNAIL */}
                <div className="p-3.5 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] flex flex-col justify-between">
                  <div>
                    <label className="block font-bold text-[#22212B] mb-1">
                      Product Cover Thumbnail
                    </label>
                    <p className="text-[11px] text-[#777486] mb-2.5">
                      Card preview for the store (PNG, JPG, SVG).
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#E9E5FF] shrink-0">
                      <Image
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E9E5FF] text-[#22212B] hover:border-[#7060F5] font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#7060F5]" />
                      <span>{isUploadingThumb ? "Uploading..." : "Choose Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. REAL DOWNLOADABLE FILE UPLOAD (PDF, ZIP, ETC.) */}
                <div className="p-3.5 rounded-2xl bg-[#F9F8FF] border border-[#E9E5FF] flex flex-col justify-between">
                  <div>
                    <label className="block font-bold text-[#22212B] mb-1">
                      Downloadable File (PDF, etc.) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-[#777486] mb-2.5">
                      The file customers receive upon purchase.
                    </p>
                  </div>
                  <div>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingFile ? "Uploading File..." : "Choose PDF / File"}</span>
                      <input
                        type="file"
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleProductFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadedVaultFileName && (
                      <div className="mt-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold truncate">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {uploadedOriginalName || uploadedVaultFileName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Short Summary */}
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Short Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="One sentence overview shown on the product card..."
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain what the product contains and how buyers can use it..."
                  value={newFullDesc}
                  onChange={(e) => setNewFullDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium resize-none"
                />
              </div>

              {/* What's Included */}
              <div>
                <label className="block font-bold text-[#22212B] mb-1">
                  What&apos;s Included (one item per line)
                </label>
                <textarea
                  rows={2}
                  value={newIncludedFiles}
                  onChange={(e) => setNewIncludedFiles(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] outline-none focus:border-[#7060F5] text-xs font-medium resize-none"
                  placeholder="1x Printable PDF Guide&#10;1x Notion Workspace Template"
                />
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="px-6 py-3.5 border-t border-[#F3F0FF] bg-[#FAF9FF] shrink-0 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-full border border-[#E9E5FF] bg-white text-[#777486] hover:text-[#22212B] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="addProductForm"
                disabled={isSubmitting || isUploadingFile || isUploadingThumb}
                className="px-5 py-2.5 rounded-full bg-[#22212B] hover:bg-[#7060F5] text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? "Publishing..." : "Publish Product to Store"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#22212B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E5FF] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#777486] hover:text-[#22212B] rounded-full hover:bg-[#F3F0FF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-[#ECE9FF] text-[#7060F5]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#22212B]">Change Admin Password</h3>
                <p className="text-xs text-[#777486]">Sets a new password for dashboard login</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#22212B] block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F9F8FF] border border-[#E9E5FF] focus:border-[#7060F5] outline-none text-sm font-medium"
                />
              </div>

              {passwordFeedback && (
                <div
                  className={`text-xs p-3 rounded-xl font-medium ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {passwordFeedback.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E9E5FF] text-xs font-semibold text-[#777486] hover:text-[#22212B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-full bg-[#7060F5] hover:bg-[#5A48E6] text-white text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isUpdatingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
