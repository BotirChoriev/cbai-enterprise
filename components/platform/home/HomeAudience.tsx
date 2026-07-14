import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type AudienceGroup = {
  title: string;
  detail: string;
};

// Grouped intelligently rather than as individual persona cards — every role from the CBAI
// constitution's universal-user list appears somewhere below, without over-emphasizing any one.
const AUDIENCE_GROUPS: readonly AudienceGroup[] = [
  {
    title: "Knowledge creators",
    detail: "Scientists, researchers, and academics turning observation into evidence-backed knowledge.",
  },
  {
    title: "Research and education institutions",
    detail: "Universities, laboratories, research centers, and educators organizing missions and evidence.",
  },
  {
    title: "Engineering and technology teams",
    detail: "Engineers and technologists connecting evidence to real systems and decisions.",
  },
  {
    title: "Companies and R&D organizations",
    detail: "Companies and R&D teams reviewing evidence before committing resources.",
  },
  {
    title: "Governments and public institutions",
    detail: "Governments and public institutions reviewing law, policy, and administration evidence.",
  },
  {
    title: "Economic and investment professionals",
    detail: "Analysts and investment professionals comparing economic evidence and context.",
  },
];

export default function HomeAudience() {
  return (
    <section aria-labelledby="home-audience-heading" className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <p className={cbaiSectionEyebrow}>Who CBAI serves</p>
        <h2
          id="home-audience-heading"
          className="cbai-display text-2xl text-zinc-50 sm:text-3xl"
        >
          Built for the universal process of knowledge
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          CBAI is not built for one profession, discipline, or country. It serves anyone who
          creates, evaluates, connects, or applies knowledge.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIENCE_GROUPS.map((group) => (
          <li key={group.title} className={`${cbaiGlassCard} p-5`}>
            <h3 className="text-sm font-semibold text-zinc-100">{group.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{group.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
