import type { Metadata } from "next";
import BillingPageClient from "@/components/billing/BillingPageClient";

export const metadata: Metadata = {
  title: "Billing (test mode)",
  description: "Simulated billing plans and usage — TEST MODE ONLY, never charges.",
};

export default function BillingPage() {
  return <BillingPageClient />;
}
