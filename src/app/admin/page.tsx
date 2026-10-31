import React from "react";
import { redirect } from "next/navigation";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import {
  getAllProductsAsync,
  getAllOrdersAsync,
  getAllCategoriesAsync,
  getAllCouponsAsync,
  getAllMessagesAsync,
} from "@/lib/db";
import { isNeonConfigured } from "@/lib/neonDb";
import { getDispatchedEmails } from "@/lib/email";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const isAuth = await isAuthenticatedAdmin();

  if (!isAuth) {
    redirect("/admin/login");
  }

  const products = await getAllProductsAsync(true);
  const orders = await getAllOrdersAsync();
  const emails = getDispatchedEmails();
  const categories = await getAllCategoriesAsync();
  const coupons = await getAllCouponsAsync();
  const messages = await getAllMessagesAsync();
  const dbConnected = isNeonConfigured();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminDashboard
        initialProducts={products}
        initialOrders={orders}
        initialEmails={emails}
        initialCategories={categories}
        initialCoupons={coupons}
        initialMessages={messages}
        dbConnected={dbConnected}
      />
    </div>
  );
}
