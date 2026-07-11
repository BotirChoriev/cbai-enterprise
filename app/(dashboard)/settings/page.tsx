import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import AssistantSettingsForm from "@/components/assistant/AssistantSettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your Personal Intelligence Assistant — saved to this browser.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Your Personal Intelligence Assistant — saved to this browser."
      />
      <AssistantSettingsForm />
    </div>
  );
}
