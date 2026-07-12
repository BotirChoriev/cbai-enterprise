import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import AccountForm from "@/components/account/AccountForm";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to keep your own Projects, Bookmarks, and Recent Activity on this device.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageHeader
        title="Account"
        description="A real local account — your Projects, Bookmarks, and Recent Activity stay separate from anyone else using this browser."
      />
      <AccountForm />
    </div>
  );
}
