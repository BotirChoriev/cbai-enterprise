import type { Metadata } from "next";
import ModesPageClient from "@/components/user-modes/ModesPageClient";

export const metadata: Metadata = {
  title: "User modes",
  description: "Personal user modes — preference only, not organization RBAC.",
};

export default function ModesPage() {
  return <ModesPageClient />;
}
