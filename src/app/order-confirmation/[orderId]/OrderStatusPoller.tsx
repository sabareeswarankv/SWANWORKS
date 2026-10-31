"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Check order status every 4 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "paid") {
            // Instantly refresh the page to show downloads
            router.refresh();
          }
        }
      } catch {
        // silent retry
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}
