import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your cloud account.",
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageHeader title="Reset Password" description="Complete a cloud account password reset." />
      <ResetPasswordForm />
    </div>
  );
}
