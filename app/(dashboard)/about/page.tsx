import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnPrimary, cbaiBtnSecondary } from "@/components/brand/brand-classes";

export const metadata: Metadata = {
  title: "About",
  description:
    "What CBAI is, why it exists, and the principles it holds itself to — connecting evidence across research, economics, and governance so people can decide with clearer understanding.",
};

const PRINCIPLES = [
  {
    title: "Evidence before opinion",
    description: "A position is only as strong as the evidence connected to it. CBAI states what is known, what is missing, and never fills the gap with confidence it hasn't earned.",
  },
  {
    title: "Transparency before confidence",
    description: "A number without a method is a guess wearing a costume. Every figure in CBAI traces back to a documented source and a stated methodology, or it is not shown at all.",
  },
  {
    title: "Understanding before decisions",
    description: "CBAI is built to slow the moment before a decision down by exactly the amount needed to understand it — never to rush a conclusion, never to substitute for one.",
  },
  {
    title: "Knowledge belongs together",
    description: "A research finding, a country's institutions, and a company's exposure to that research are not separate stories. CBAI connects them because reality already does.",
  },
  {
    title: "Technology should assist thinking, not replace it",
    description: "CBAI organizes, connects, and explains. It does not conclude on a person's behalf. The reasoning stays visible so the thinking stays yours.",
  },
  {
    title: "Humans remain responsible",
    description: "Every output CBAI produces carries a human-decision-required principle. Judgment, accountability, and consequence belong to the person using the platform — always, without exception.",
  },
  {
    title: "Uncertainty is a fact, not a failure",
    description: "When evidence is insufficient, CBAI says so directly, in full sentences, in the same place a confident answer would have gone. An honest gap is more useful than a fabricated fill.",
  },
  {
    title: "Sources outrank summaries",
    description: "A summary is a convenience. A source is the truth it was built from. CBAI keeps the path between them open, always one click from claim back to citation.",
  },
  {
    title: "Alternatives, not verdicts",
    description: "Real decisions rarely have one right answer. CBAI presents options side by side, with their real trade-offs, rather than forcing a single recommendation dressed as certainty.",
  },
  {
    title: "History is preserved, not overwritten",
    description: "Understanding changes as evidence changes. CBAI keeps that history intact, so nothing that was once believed simply disappears without a trace.",
  },
  {
    title: "Neutrality is a discipline",
    description: "CBAI does not have a political position. It has a method. The same evidentiary standard applies whether the subject is popular, unpopular, or uncomfortable.",
  },
  {
    title: "Explain, always",
    description: "Every classification, every status, every gap comes with a plain-language reason. Nothing in CBAI is color-coded and left unexplained.",
  },
];

const DIFFERENTIATORS = [
  {
    from: "Search",
    to: "Intelligence",
    description: "Search returns pages that mention a word. Intelligence connects what those pages actually say to the entity, question, or decision a person is working on.",
  },
  {
    from: "Documents",
    to: "Evidence",
    description: "A document is a file. Evidence is a document with a source, a status, and a stated confidence — attached to the specific claim it supports.",
  },
  {
    from: "Data",
    to: "Understanding",
    description: "Data is a number in a table. Understanding is knowing where that number came from, what it doesn't cover yet, and what would change if it did.",
  },
  {
    from: "Reports",
    to: "Decision Support",
    description: "A report describes a moment. Decision support carries a real next step, a real open question, and a real trail back to the evidence behind it.",
  },
  {
    from: "Knowledge",
    to: "Connected Knowledge",
    description: "Isolated knowledge answers one question. Connected knowledge lets a country's institutions, a company's exposure, and a research field inform each other.",
  },
];

const AUDIENCES = [
  { role: "Student", need: "A place to learn how evidence actually supports a claim — not just what the claim is." },
  { role: "Professor / Researcher", need: "A structured way to track open questions, connect evidence, and keep a research review honest and traceable." },
  { role: "Scientist / Academic", need: "A workspace where a hypothesis, its evidence, and its gaps stay attached to each other from first question to final report." },
  { role: "Engineer", need: "A way to assess a technology or a market against real, sourced evidence before committing engineering time to it." },
  { role: "Investor / Business Leader", need: "Company and country intelligence built from registry facts and connected sources — never a market score CBAI cannot defend." },
  { role: "Government Leader / Policy Analyst", need: "Institutional and policy evidence organized by domain, with missing information named rather than silently absent." },
  { role: "Economist", need: "Country and company evidence structured for comparison, with methodology stated before any figure is shown." },
  { role: "Legal Professional", need: "A verification model and an audit trail that make the provenance of every fact inspectable, not just presentable." },
  { role: "Citizen", need: "Direct access to the same evidence institutions use, explained in plain language, with no login wall on public understanding." },
  { role: "Research Organization", need: "One place to hold a research topic's full evidence lifecycle — literature, gaps, review, and report — without losing history." },
  { role: "University", need: "A shared, transparent standard for how evidence is connected and reviewed across departments and disciplines." },
  { role: "Public Institution", need: "A working model for evidence-based transparency — what is known, what is missing, and why — that a citizen can actually read." },
];

const WORKFLOW_STEPS = [
  { step: "Search", detail: "Ask a question or name an entity — a country, a company, a university, a research topic. CBAI finds every real profile that matches, grouped, not buried." },
  { step: "Evidence", detail: "Every profile shows what is connected, what is missing, and why — a real source, a real status, never a fabricated one." },
  { step: "Projects", detail: "Turn a question into a workspace: objectives, notes, evidence, and open questions held together in one place." },
  { step: "Reports", detail: "Compile what the project actually found — overview, evidence, methodology, and limitations — into one traceable document." },
  { step: "Better Understanding", detail: "Not a verdict. A clearer view of what is known, what isn't, and what a person is now equipped to decide for themselves." },
];

const ECOSYSTEMS = [
  {
    name: "Research Intelligence",
    href: "/research",
    description:
      "A catalog of real research topics — from life sciences to materials science to governance studies — each with its own evidence lifecycle: open questions, connected sources, and a review workspace that keeps human judgment in the loop before any finding is treated as settled.",
  },
  {
    name: "Economic Intelligence",
    href: "/companies",
    description:
      "Country and company profiles built from registry facts and connected official sources — institutions, indicators, and relationships — organized for comparison, never scored into a false sense of certainty.",
  },
  {
    name: "Governance Intelligence",
    href: "/government",
    description:
      "Institutional and policy evidence organized by domain — governance, budget transparency, public services, judicial systems — so what a government has published, and what it hasn't yet, is equally visible.",
  },
];

const MANIFESTO = [
  "We believe knowledge should be connected, not scattered across silos that never speak to each other.",
  "We believe evidence creates trust — not confidence, not authority, not repetition.",
  "We believe transparency creates confidence, and that confidence without transparency is just a claim.",
  "We believe technology should help people think, not think for them.",
  "We believe better understanding creates better decisions — not faster ones, better ones.",
  "We believe a gap in the evidence is worth stating plainly, every time.",
  "We believe a source is not optional decoration. It is the claim's only foundation.",
  "We believe neutrality is a method, applied the same way regardless of the subject.",
  "We believe history should be kept, not quietly overwritten by whatever is convenient today.",
  "We believe a person deserves to see the reasoning, not just the result.",
  "We believe research, economics, and governance were never meant to be separate conversations.",
  "We believe a citizen and a minister should be able to read the same evidence.",
  "We believe explanation is not optional. A color or a badge is never the whole answer.",
  "We believe comparison is more honest than a single forced recommendation.",
  "We believe uncertainty, stated clearly, is more valuable than false precision.",
  "We believe responsibility for a decision cannot be delegated to software.",
  "We believe a platform should be judged by what it admits it doesn't know.",
  "We believe intelligence is not information at scale. It is understanding, earned.",
  "We believe trust is built one traceable fact at a time, never claimed in advance.",
  "We believe the work of connecting knowledge is never finished — only ever more honest.",
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="About" description="What CBAI is, why it exists, and the principles it holds itself to." />

      {/* SECTION 1 — Who we are: purpose first, never company history */}
      <section aria-labelledby="about-purpose-heading" className={`${cbaiGlassCard} relative overflow-hidden p-8 sm:p-12`}>
        <svg aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-[#005810] opacity-[0.06]" viewBox="0 0 200 200" fill="none">
          <g stroke="currentColor" strokeWidth="1">
            <path d="M20 40 L90 20 L150 60 L110 130 L40 110 Z" />
            <path d="M90 20 L110 130" />
            <path d="M20 40 L150 60" />
            <path d="M150 60 L180 150" />
          </g>
          <g fill="currentColor">
            <circle cx="20" cy="40" r="3" />
            <circle cx="90" cy="20" r="3" />
            <circle cx="150" cy="60" r="4" />
            <circle cx="110" cy="130" r="3" />
            <circle cx="40" cy="110" r="2.5" />
            <circle cx="180" cy="150" r="2.5" />
          </g>
        </svg>
        <div className="relative flex flex-col items-start gap-6">
          <OperatorOrb state="idle" size={64} />
          <p className={cbaiSectionEyebrow}>Who we are</p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
            Access to information has stopped being the hard part.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            Understanding it hasn&apos;t. Anyone can find a thousand documents about a country&apos;s
            economy, a company&apos;s exposure, or a field of research in seconds. Almost no one can
            tell, from that pile, what is actually known, what is missing, and what a decision built
            on it would really be standing on. That gap — between having information and understanding
            it — is the problem CBAI exists to close.
          </p>
        </div>
      </section>

      {/* SECTION 2 — What is CBAI */}
      <section aria-labelledby="about-what-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-what-heading">What is CBAI</p>
        <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          CBAI is an Intelligence Operating System — it connects evidence, tracks what is known and
          what is missing, and helps people reach clearer, better-supported decisions across research,
          economics, and governance.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
          Not a search engine that returns pages. Not a chat window that generates an answer. CBAI is a
          working environment: real country, company, university, and research profiles; a real
          evidence system that separates what is verified from what isn&apos;t; real projects that hold
          a question and its findings together; and real reports that show the reasoning, not just the
          conclusion. One evidence core, three ways to work with it — research, economics, and
          governance — because in the world these questions come from, they were never really separate.
        </p>
      </section>

      {/* SECTION 3 — Why CBAI exists */}
      <section aria-labelledby="about-why-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-why-heading">Why CBAI exists</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          The problem was never too little information. It was too much of it, disconnected.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "Information overload", body: "More is published every day than any one person, or team, can responsibly read — let alone verify." },
            { title: "Disconnected knowledge", body: "A finding in a lab, a fact in a treaty, and a figure in a market report describe the same world, but rarely reference each other." },
            { title: "Fragmented evidence", body: "Evidence for the same question is scattered across sources with no shared status — what's verified, what's pending, what's missing." },
            { title: "Research silos", body: "Fields that depend on each other's findings often have no structured way to see what the other has already established." },
            { title: "Policy silos", body: "Institutions publish evidence in isolation from the economic and research context a policy decision actually depends on." },
            { title: "Economic silos", body: "Investment and country decisions are made on partial pictures, assembled under deadline, rarely revisited as new evidence arrives." },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-zinc-900/50 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
          None of these are new problems. What&apos;s new is treating them as one problem — building a
          single place where evidence is connected once and reused everywhere it&apos;s relevant, instead
          of re-assembled from scratch every time someone needs to understand something.
        </p>
      </section>

      {/* SECTION 4 — Our philosophy: 12 real principles */}
      <section aria-labelledby="about-philosophy-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-philosophy-heading">Our philosophy</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Twelve principles CBAI holds itself to — not slogans, working rules.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <div key={principle.title} className="relative overflow-hidden rounded-lg bg-zinc-900/50 px-5 py-4 pl-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#005810] opacity-60" />
              <p className="font-mono text-[11px] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{principle.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — What makes CBAI different: concept comparisons, not competitor names */}
      <section aria-labelledby="about-different-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-different-heading">What makes CBAI different</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Not a better version of what exists. A different category of tool.
        </h2>
        <div className="space-y-3">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.from} className="flex flex-col gap-3 rounded-lg bg-zinc-900/50 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex shrink-0 items-center gap-3 sm:w-64">
                <span className="text-sm text-zinc-500 line-through decoration-zinc-700">{d.from}</span>
                <span aria-hidden="true" className="text-[#2fbf71]">→</span>
                <span className="text-sm font-semibold text-zinc-100">{d.to}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — Who CBAI serves */}
      <section aria-labelledby="about-audience-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-audience-heading">Who CBAI serves</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Different work. The same standard of evidence.
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div key={a.role} className="rounded-lg bg-zinc-900/50 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-100">{a.role}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{a.need}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — How CBAI works: a real visual flow */}
      <section aria-labelledby="about-workflow-heading" className={`${cbaiGlassCard} space-y-8 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-workflow-heading">How CBAI works</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Five real stages. No step skipped, no step fabricated.
        </h2>
        <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
          {WORKFLOW_STEPS.map((s, index) => (
            <div key={s.step} className="flex flex-1 flex-col items-center gap-3 sm:flex-row">
              <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-zinc-900/50 px-4 py-5 text-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#005810]/40 text-xs font-semibold text-[#2fbf71]">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-zinc-100">{s.step}</p>
                <p className="text-xs leading-relaxed text-zinc-500">{s.detail}</p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <span aria-hidden="true" className="hidden shrink-0 text-zinc-700 sm:block">→</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/search" className={cbaiBtnSecondary}>Try Search →</Link>
          <Link href="/my-work" className={cbaiBtnSecondary}>Start a Project →</Link>
        </div>
      </section>

      {/* SECTION 8 — The three intelligence ecosystems */}
      <section aria-labelledby="about-ecosystems-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-ecosystems-heading">The three intelligence ecosystems</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Research, economics, and governance — one evidence core underneath all three.
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {ECOSYSTEMS.map((e) => (
            <Link
              key={e.name}
              href={e.href}
              className="group flex flex-col gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-[#2fbf71]/40 hover:bg-zinc-900"
            >
              <p className="text-sm font-semibold text-zinc-100">{e.name}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{e.description}</p>
              <span className="mt-auto pt-2 text-xs font-medium text-[#2fbf71] opacity-0 transition-opacity group-hover:opacity-100">
                Explore →
              </span>
            </Link>
          ))}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          None of the three stand alone. A country&apos;s institutions inform how its economy is
          understood. A company&apos;s industry connects it to the research shaping its future. A
          policy question rarely resolves without evidence from both of the others. CBAI keeps them
          on one evidence core precisely so a person working in one doesn&apos;t lose the other two.
        </p>
      </section>

      {/* SECTION 9 — Trust: the most important section */}
      <section aria-labelledby="about-trust-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-trust-heading">Trust</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          What CBAI does. What CBAI refuses to do. Stated plainly, not implied.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
            <p className="text-sm font-semibold text-[#2fbf71]">What CBAI does</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>Connects real evidence to real profiles, with a source and a status on every claim.</li>
              <li>States plainly when evidence is missing, and what would need to be connected to close that gap.</li>
              <li>Shows options and their trade-offs side by side, never a single forced answer.</li>
              <li>Keeps a visible trail from every summary back to the source it was built from.</li>
            </ul>
          </div>
          <div className="rounded-lg bg-zinc-900/50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-400">What CBAI never does</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>CBAI never replaces human judgment. The decision, and its consequences, remain yours.</li>
              <li>CBAI never invents evidence. An unconnected source stays unconnected — never guessed at.</li>
              <li>CBAI never hides uncertainty. A gap is stated as a gap, not smoothed into a score.</li>
              <li>CBAI never blends verified evidence with missing information without separating the two.</li>
            </ul>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          This isn&apos;t a policy written for a legal page. It&apos;s the actual verification model
          running underneath every profile, project, and report on this platform — the full
          methodology, evidence policy, and constitution are documented in the{" "}
          <Link href="/trust" className="font-medium text-[#2fbf71] hover:underline">
            Trust Center
          </Link>
          , not summarized here and hidden there.
        </p>
      </section>

      {/* SECTION 10 — Our vision */}
      <section aria-labelledby="about-vision-heading" className={`${cbaiGlassCard} space-y-6 p-8 sm:p-12`}>
        <p className={cbaiSectionEyebrow} id="about-vision-heading">Our vision</p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          A world where understanding keeps pace with information.
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Knowledge is connected — not scattered across systems that never learn from each other.",
            "Research is transparent — its evidence, its gaps, and its open questions visible to whoever needs them.",
            "Governments explain their evidence — what is verified, what is planned, what is missing, and why.",
            "Universities collaborate across disciplines, because the evidence connecting them is visible for the first time.",
            "Companies innovate responsibly, informed by the research and policy context their decisions actually sit inside.",
            "Citizens access the same trusted knowledge institutions use — explained, not gatekept.",
          ].map((line) => (
            <p key={line} className="rounded-lg bg-zinc-900/50 px-5 py-4 text-sm leading-relaxed text-zinc-400">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* SECTION 11 — The CBAI Manifesto: a deliberately distinct, high-contrast moment */}
      <section
        aria-labelledby="about-manifesto-heading"
        className="relative overflow-hidden rounded-xl border border-[#005810]/20 bg-[#0b1f3a] px-8 py-12 sm:p-16"
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 400 300" fill="none">
          <g stroke="#2fbf71" strokeWidth="0.75">
            <path d="M20 40 L120 20 L220 70 L160 180 L60 150 Z" />
            <path d="M220 70 L340 40 L380 160 L260 200" />
            <path d="M120 20 L160 180" />
            <path d="M60 150 L20 40" />
          </g>
          <g fill="#2fbf71">
            <circle cx="20" cy="40" r="2.5" /><circle cx="120" cy="20" r="2.5" />
            <circle cx="220" cy="70" r="3" /><circle cx="160" cy="180" r="2.5" />
            <circle cx="60" cy="150" r="2" /><circle cx="340" cy="40" r="2.5" />
            <circle cx="380" cy="160" r="2" /><circle cx="260" cy="200" r="2.5" />
          </g>
        </svg>
        <div className="relative mx-auto max-w-3xl space-y-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#6fe3a4]">
            The CBAI Manifesto
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            What we believe.
          </h2>
          <ul className="space-y-4 text-left sm:columns-2 sm:gap-x-10">
            {MANIFESTO.map((line) => (
              <li key={line} className="break-inside-avoid text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 12 — Final message */}
      <section aria-labelledby="about-closing-heading" className={`${cbaiGlassCard} space-y-6 p-8 text-center sm:p-16`}>
        <div className="mx-auto flex justify-center">
          <OperatorOrb state="greeting" size={56} />
        </div>
        <h2 id="about-closing-heading" className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          The future will not belong to those with the most information. It will belong to those who
          understand it.
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-500">
          That is the work CBAI exists to do — one connected piece of evidence at a time. Welcome in.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/" className={cbaiBtnPrimary}>Enter CBAI →</Link>
          <Link href="/trust" className={cbaiBtnSecondary}>Read the Trust Center →</Link>
        </div>
      </section>
    </div>
  );
}
