import type { Metadata } from "next";
import ReviewCenter from "@/components/enterprise-collaboration/ReviewCenter";

export const metadata: Metadata = {
  title: "Review Center",
  description: "Assigned collaboration reviews in organizations you can access.",
};

export default function ReviewsPage() {
  return <ReviewCenter />;
}
