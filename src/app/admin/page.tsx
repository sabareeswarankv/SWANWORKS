import React from "react";
import { redirect } from "next/navigation";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAllProductsAsync, getAllOrdersAsync, getAllCategories, getAllCoupons, getAllMessagesAsync } from "@/lib/db";
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
  const categories = getAllCategories();
  const coupons = getAllCoupons();
  const messages = await getAllMessagesAsync();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminDashboard
        initialProducts={products}
        initialOrders={orders}
        initialEmails={emails}
        initialCategories={categories}
        initialCoupons={coupons}
        initialMessages={messages}
      />
    </div>
  );
}
