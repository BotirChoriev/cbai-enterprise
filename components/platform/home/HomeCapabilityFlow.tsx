import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type FlowStage = {
  label: string;
  detail: string;
};

// The universal capability lifecycle every CBAI ecosystem shares. Order matters — this is one
// sequence, not ten disconnected feature cards, so it renders as a single numbered flow.
const CAPABILITY_FLOW: readonly FlowStage[] = [
  { label: "Observe", detail: "Gather what official and verifiable sources report." },
  { label: "Measure", detail: "Track change over time using consistent, documented methods." },
  { label: "Analyze", detail: "Break evidence down into comparable, explainable parts." },
  { label: "Identify", detail: "Surface gaps, risks, and problems the evidence reveals." },
  { label: "Connect", detail: "Link related evidence, entities, and events together." },
  { label: "Explain", detail: "Show how each conclusion traces back to its sources." },
  { label: "Compare", detail: "Present alternatives side by side, not one forced answer." },
  { label: "Recommend", detail: "Offer evidence-supported options — never a command." },
  { label: "Consequences", detail: "Describe possible outcomes and limitations of each option." },
  { label: "Human Decision", detail: "The person or organization decides. CBAI never does." },
];

export default function HomeCapabilityFlow() {
  return (
    <section aria-labelledby="home-capability-flow-heading" className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <p className={cbaiSectionEyebrow}>The Intelligence Core</p>
        <h2
          id="home-capability-flow-heading"
          className="cbai-display text-2xl text-zinc-50 sm:text-3xl"
        >
          One capability flow, every ecosystem
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Research, Governance, and Economic Intelligence all move through the same sequence —
          from raw evidence to a human decision.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CAPABILITY_FLOW.map((stage, index) => (
          <li key={stage.label} className={`${cbaiGlassCard} p-4`}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-[11px] font-semibold text-teal-300">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-zinc-100">{stage.label}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{stage.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
