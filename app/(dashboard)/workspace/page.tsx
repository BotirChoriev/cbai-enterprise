import type { Metadata } from "next";
import PersonalWorkspaceHome from "@/components/workspace/PersonalWorkspaceHome";

export const metadata: Metadata = { title: "Personal workspace" };

export default function WorkspacePage() {
  return <PersonalWorkspaceHome />;
}
