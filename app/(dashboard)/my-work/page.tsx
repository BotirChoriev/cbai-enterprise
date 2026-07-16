import type { Metadata } from "next";
import MyWorkPageClient from "@/components/my-work/MyWorkPageClient";

export const metadata: Metadata = {
  title: "My Work",
  description: "Continue research, evidence reviews, and reports in progress.",
};

export default function MyWorkPage() {
  return <MyWorkPageClient />;
}
