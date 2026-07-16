import type { Metadata } from "next";
import SettingsPageClient from "@/components/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your CBAI Personal Operator — saved to this browser.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
