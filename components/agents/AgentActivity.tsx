import { Card, CardContent, CardHeader } from "@/components/ui/Card";

// No agent runtime is connected to this platform, so there is no real activity to show.
// An honest empty state, never a fabricated activity feed.
export default function AgentActivity() {
  return (
    <Card>
      <CardHeader
        title="Agent Activity"
        description="Latest tasks and events across all agents"
      />
      <CardContent>
        <p className="text-sm text-zinc-500">
          No agent activity is available — this capability is not active on this platform yet.
        </p>
      </CardContent>
    </Card>
  );
}
