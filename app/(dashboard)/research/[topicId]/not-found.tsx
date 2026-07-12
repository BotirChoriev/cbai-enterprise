import SystemPageShell from "@/components/system/SystemPageShell";

export default function ResearchTopicNotFound() {
  return (
    <SystemPageShell
      eyebrow="Not Found"
      title="Research topic not found"
      message="This topic is not in the Research catalog — it may have been renamed or the link may be out of date. Browse available topics to find what you're looking for."
    />
  );
}
