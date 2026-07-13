import { cbaiGlassCard } from "@/components/brand/brand-classes";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

// Platform Completion mission, Phase 1/2: this used to be a second, visually-different card
// system (`border-zinc-800 bg-zinc-900/50`, no blur, no glow) alongside `cbaiGlassCard` — used by
// ~30 files (Methodology/Trust sections across Country/Company/University and elsewhere). Rather
// than touch every call site, this one file now renders the exact same shared token, so every
// existing `<Card>` usage automatically gets the one real card style used everywhere else.
export function Card({ children, className = "" }: CardProps) {
  return <div className={`${cbaiGlassCard} ${className}`}>{children}</div>;
}

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-50">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
