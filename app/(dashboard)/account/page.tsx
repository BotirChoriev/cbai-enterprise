import type { Metadata } from "next";
import AccountPageClient from "@/components/account/AccountPageClient";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to keep your own Projects, Bookmarks, and Recent Activity on this device.",
};

export default function AccountPage() {
  return <AccountPageClient />;
}
