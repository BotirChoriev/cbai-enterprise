import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const contextItems = [
  {
    label: "Organization",
    value: "Acme Corp",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    ),
  },
  {
    label: "Active Model",
    value: "cbai-enterprise-v2",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
      />
    ),
  },
  {
    label: "Data Sources",
    value: "Knowledge Base · CRM · Analytics",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
      />
    ),
  },
  {
    label: "Security Mode",
    value: "Enterprise — Strict",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
    highlight: true,
  },
];

export default function SystemContext() {
  return (
    <Card>
      <CardHeader
        title="System Context"
        description="Active environment configuration for this session"
      />
      <CardContent className="space-y-3">
        {contextItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {item.icon}
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {item.label}
              </p>
              <p
                className={`mt-0.5 text-sm font-medium ${
                  item.highlight ? "text-emerald-400" : "text-zinc-200"
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
