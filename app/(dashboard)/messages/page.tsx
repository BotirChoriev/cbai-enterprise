import type { Metadata } from "next";
import SimpleEmptyWorkspace from "@/components/workspace/SimpleEmptyWorkspace";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return <SimpleEmptyWorkspace titleKey="authCollab.messagesTitle" />;
}
