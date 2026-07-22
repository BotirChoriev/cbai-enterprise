import type { Metadata } from "next";
import SimpleEmptyWorkspace from "@/components/workspace/SimpleEmptyWorkspace";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <SimpleEmptyWorkspace titleKey="authCollab.notificationsTitle" />;
}
