type HomeSectionProps = {
  id: string;
  title: string;
  description?: string | readonly string[];
  children: React.ReactNode;
};

export default function HomeSection({
  id,
  title,
  description,
  children,
}: HomeSectionProps) {
  const descriptions = description
    ? Array.isArray(description)
      ? description
      : [description]
    : [];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="home-section scroll-mt-10"
    >
      <div className="home-section-header">
        <h2 id={`${id}-heading`} className="home-section-title">
          {title}
        </h2>
        {descriptions.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="home-section-description">
            {paragraph}
          </p>
        ))}
      </div>
      {children}
    </section>
  );
}
