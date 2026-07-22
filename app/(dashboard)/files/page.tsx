import type { Metadata } from "next";
import SimpleEmptyWorkspace from "@/components/workspace/SimpleEmptyWorkspace";

export const metadata: Metadata = { title: "Files" };

export default function FilesPage() {
  return <SimpleEmptyWorkspace titleKey="authCollab.filesTitle" />;
}
