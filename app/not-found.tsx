import SystemPageShell from "@/components/system/SystemPageShell";

export default function NotFound() {
  return (
    <SystemPageShell
      eyebrow="404"
      title="Page not found"
      message="This page doesn't exist — it may have moved, or the link may be out of date. Everything else on CBAI is still one click away."
    />
  );
}
