import type { Metadata } from "next";
import GlobalUpdatesClient from "@/components/notifications/GlobalUpdatesClient";

export const metadata: Metadata = { title: "Global updates and watches" };

export default function NotificationsPage() {
  return <GlobalUpdatesClient />;
}
