import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import MyWork from "@/components/my-work/MyWork";

export const metadata: Metadata = {
  title: "My Work",
  description: "Continue research, evidence reviews, and reports in progress.",
};

export default function MyWorkPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My Work"
        description="Continue research, evidence reviews, and reports in progress."
      />
      <MyWork />
    </div>
  );
}
