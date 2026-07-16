import type { Metadata } from "next";
import AboutPageClient from "@/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "What CBAI is, why it exists, and the principles it holds itself to — connecting evidence across research, economics, and governance so people can decide with clearer understanding.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
