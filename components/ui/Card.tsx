type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/50 ${className}`}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
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
