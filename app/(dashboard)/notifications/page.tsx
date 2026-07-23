import type { Metadata } from "next";
import NotificationCenter from "@/components/enterprise-collaboration/NotificationCenter";

export const metadata: Metadata = {
  title: "Notification Center",
  description: "In-app notifications and mentions for your account.",
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
