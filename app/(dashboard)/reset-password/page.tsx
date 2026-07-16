import type { Metadata } from "next";
import ResetPasswordPageClient from "@/components/account/ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your cloud account.",
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
