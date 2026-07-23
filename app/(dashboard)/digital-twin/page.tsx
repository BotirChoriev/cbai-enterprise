import type { Metadata } from "next";
import DigitalTwinPageClient from "@/components/digital-twin/DigitalTwinPageClient";

export const metadata: Metadata = {
  title: "Enterprise Digital Twin",
  description:
    "Organization digital twin registry — Not Connected / Planned until real sources exist. No fabricated metrics or camera feeds.",
};

export default function DigitalTwinPage() {
  return <DigitalTwinPageClient />;
}
