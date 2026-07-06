type HomeSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function HomeSection({
  id,
  title,
  description,
  children,
}: HomeSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-6 space-y-5"
    >
      <div className="space-y-1">
        <h2
          id={`${id}-heading`}
          className="text-lg font-semibold tracking-tight text-zinc-50"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
