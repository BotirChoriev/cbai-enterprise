type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
