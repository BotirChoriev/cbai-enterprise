import { Card, CardContent } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

export default function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-zinc-500",
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
              {value}
            </p>
            {change && (
              <p className={`mt-1 text-xs ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sky-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
