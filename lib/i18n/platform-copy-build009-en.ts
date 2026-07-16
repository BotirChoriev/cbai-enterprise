/** BUILD-009 — full About page, governance principles, reports subsection copy, graph UI gaps. */

export const ABOUT_PAGE_BUILD009_EN = {
  audiencesServesEyebrow: "Who CBAI serves",
  audiencesHeadline: "Different work. The same standard of evidence.",
  workflowHeadline: "Five real stages. No step skipped, no step fabricated.",
  ecosystemsHeadline:
    "Research, economics, and governance — one evidence core underneath all three.",
  whatIsBodyExtra:
    "One evidence core, three ways to work with it — research, economics, and governance — because in the world these questions come from, they were never really separate.",
  whyProblems: [
    {
      title: "Information overload",
      body: "More is published every day than any one person, or team, can responsibly read — let alone verify.",
    },
    {
      title: "Disconnected knowledge",
      body: "A finding in a lab, a fact in a treaty, and a figure in a market report describe the same world, but rarely reference each other.",
    },
    {
      title: "Fragmented evidence",
      body: "Evidence for the same question is scattered across sources with no shared status — what's verified, what's pending, what's missing.",
    },
    {
      title: "Research silos",
      body: "Fields that depend on each other's findings often have no structured way to see what the other has already established.",
    },
    {
      title: "Policy silos",
      body: "Institutions publish evidence in isolation from the economic and research context a policy decision actually depends on.",
    },
    {
      title: "Economic silos",
      body: "Investment and country decisions are made on partial pictures, assembled under deadline, rarely revisited as new evidence arrives.",
    },
  ] as const,
  whyClosingExtended:
    "None of these are new problems. What's new is treating them as one problem — building a single place where evidence is connected once and reused everywhere it's relevant, instead of re-assembled from scratch every time someone needs to understand something.",
  principles: [
    {
      title: "Evidence before opinion",
      description:
        "A position is only as strong as the evidence connected to it. CBAI states what is known, what is missing, and never fills the gap with confidence it hasn't earned.",
    },
    {
      title: "Transparency before confidence",
      description:
        "A number without a method is a guess wearing a costume. Every figure in CBAI traces back to a documented source and a stated methodology, or it is not shown at all.",
    },
    {
      title: "Understanding before decisions",
      description:
        "CBAI is built to slow the moment before a decision down by exactly the amount needed to understand it — never to rush a conclusion, never to substitute for one.",
    },
    {
      title: "Knowledge belongs together",
      description:
        "A research finding, a country's institutions, and a company's exposure to that research are not separate stories. CBAI connects them because reality already does.",
    },
    {
      title: "Technology should assist thinking, not replace it",
      description:
        "CBAI organizes, connects, and explains. It does not conclude on a person's behalf. The reasoning stays visible so the thinking stays yours.",
    },
    {
      title: "Humans remain responsible",
      description:
        "Every output CBAI produces carries a human-decision-required principle. Judgment, accountability, and consequence belong to the person using the platform — always, without exception.",
    },
    {
      title: "Uncertainty is a fact, not a failure",
      description:
        "When evidence is insufficient, CBAI says so directly, in full sentences, in the same place a confident answer would have gone. An honest gap is more useful than a fabricated fill.",
    },
    {
      title: "Sources outrank summaries",
      description:
        "A summary is a convenience. A source is the truth it was built from. CBAI keeps the path between them open, always one click from claim back to citation.",
    },
    {
      title: "Alternatives, not verdicts",
      description:
        "Real decisions rarely have one right answer. CBAI presents options side by side, with their real trade-offs, rather than forcing a single recommendation dressed as certainty.",
    },
    {
      title: "History is preserved, not overwritten",
      description:
        "Understanding changes as evidence changes. CBAI keeps that history intact, so nothing that was once believed simply disappears without a trace.",
    },
    {
      title: "Neutrality is a discipline",
      description:
        "CBAI does not have a political position. It has a method. The same evidentiary standard applies whether the subject is popular, unpopular, or uncomfortable.",
    },
    {
      title: "Explain, always",
      description:
        "Every classification, every status, every gap comes with a plain-language reason. Nothing in CBAI is color-coded and left unexplained.",
    },
  ] as const,
  differentiators: [
    {
      from: "Search",
      to: "Intelligence",
      description:
        "Search returns pages that mention a word. Intelligence connects what those pages actually say to the entity, question, or decision a person is working on.",
    },
    {
      from: "Documents",
      to: "Evidence",
      description:
        "A document is a file. Evidence is a document with a source, a status, and a stated confidence — attached to the specific claim it supports.",
    },
    {
      from: "Data",
      to: "Understanding",
      description:
        "Data is a number in a table. Understanding is knowing where that number came from, what it doesn't cover yet, and what would change if it did.",
    },
    {
      from: "Reports",
      to: "Decision Support",
      description:
        "A report describes a moment. Decision support carries a real next step, a real open question, and a real trail back to the evidence behind it.",
    },
    {
      from: "Knowledge",
      to: "Connected Knowledge",
      description:
        "Isolated knowledge answers one question. Connected knowledge lets a country's institutions, a company's exposure, and a research field inform each other.",
    },
  ] as const,
  audiences: [
    { role: "Student", need: "A place to learn how evidence actually supports a claim — not just what the claim is." },
    {
      role: "Professor / Researcher",
      need: "A structured way to track open questions, connect evidence, and keep a research review honest and traceable.",
    },
    {
      role: "Scientist / Academic",
      need: "A workspace where a hypothesis, its evidence, and its gaps stay attached to each other from first question to final report.",
    },
    {
      role: "Engineer",
      need: "A way to assess a technology or a market against real, sourced evidence before committing engineering time to it.",
    },
    {
      role: "Investor / Business Leader",
      need: "Company and country intelligence built from registry facts and connected sources — never a market score CBAI cannot defend.",
    },
    {
      role: "Government Leader / Policy Analyst",
      need: "Institutional and policy evidence organized by domain, with missing information named rather than silently absent.",
    },
    {
      role: "Economist",
      need: "Country and company evidence structured for comparison, with methodology stated before any figure is shown.",
    },
    {
      role: "Legal Professional",
      need: "A verification model and an audit trail that make the provenance of every fact inspectable, not just presentable.",
    },
    {
      role: "Citizen",
      need: "Direct access to the same evidence institutions use, explained in plain language, with no login wall on public understanding.",
    },
    {
      role: "Research Organization",
      need: "One place to hold a research topic's full evidence lifecycle — literature, gaps, review, and report — without losing history.",
    },
    {
      role: "University",
      need: "A shared, transparent standard for how evidence is connected and reviewed across departments and disciplines.",
    },
    {
      role: "Public Institution",
      need: "A working model for evidence-based transparency — what is known, what is missing, and why — that a citizen can actually read.",
    },
  ] as const,
  workflowSteps: [
    {
      step: "Search",
      detail:
        "Ask a question or name an entity — a country, a company, a university, a research topic. CBAI finds every real profile that matches, grouped, not buried.",
    },
    {
      step: "Evidence",
      detail:
        "Every profile shows what is connected, what is missing, and why — a real source, a real status, never a fabricated one.",
    },
    {
      step: "Projects",
      detail: "Turn a question into a workspace: objectives, notes, evidence, and open questions held together in one place.",
    },
    {
      step: "Reports",
      detail:
        "Compile what the project actually found — overview, evidence, methodology, and limitations — into one traceable document.",
    },
    {
      step: "Better Understanding",
      detail:
        "Not a verdict. A clearer view of what is known, what isn't, and what a person is now equipped to decide for themselves.",
    },
  ] as const,
  ecosystems: [
    {
      name: "Research Intelligence",
      description:
        "A catalog of real research topics — from life sciences to materials science to governance studies — each with its own evidence lifecycle: open questions, connected sources, and a review workspace that keeps human judgment in the loop before any finding is treated as settled.",
    },
    {
      name: "Economic Intelligence",
      description:
        "Country and company profiles built from registry facts and connected official sources — institutions, indicators, and relationships — organized for comparison, never scored into a false sense of certainty.",
    },
    {
      name: "Governance Intelligence",
      description:
        "Institutional and policy evidence organized by domain — governance, budget transparency, public services, judicial systems — so what a government has published, and what it hasn't yet, is equally visible.",
    },
  ] as const,
  ecosystemsClosing:
    "None of the three stand alone. A country's institutions inform how its economy is understood. A company's industry connects it to the research shaping its future. A policy question rarely resolves without evidence from both of the others. CBAI keeps them on one evidence core precisely so a person working in one doesn't lose the other two.",
  exploreArrow: "Explore →",
  trustEyebrow: "Trust",
  trustHeadline: "What CBAI does. What CBAI refuses to do. Stated plainly, not implied.",
  trustDoesHeading: "What CBAI does",
  trustDoes: [
    "Connects real evidence to real profiles, with a source and a status on every claim.",
    "States plainly when evidence is missing, and what would need to be connected to close that gap.",
    "Shows options and their trade-offs side by side, never a single forced answer.",
    "Keeps a visible trail from every summary back to the source it was built from.",
  ] as const,
  trustNeverHeading: "What CBAI never does",
  trustNever: [
    "CBAI never replaces human judgment. The decision, and its consequences, remain yours.",
    "CBAI never invents evidence. An unconnected source stays unconnected — never guessed at.",
    "CBAI never hides uncertainty. A gap is stated as a gap, not smoothed into a score.",
    "CBAI never blends verified evidence with missing information without separating the two.",
  ] as const,
  trustClosingBefore:
    "This isn't a policy written for a legal page. It's the actual verification model running underneath every profile, project, and report on this platform — the full methodology, evidence policy, and constitution are documented in the ",
  trustClosingLink: "Trust Center",
  trustClosingAfter: ", not summarized here and hidden there.",
  visionEyebrow: "Our vision",
  visionHeadline: "A world where understanding keeps pace with information.",
  visionItems: [
    "Knowledge is connected — not scattered across systems that never learn from each other.",
    "Research is transparent — its evidence, its gaps, and its open questions visible to whoever needs them.",
    "Governments explain their evidence — what is verified, what is planned, what is missing, and why.",
    "Universities collaborate across disciplines, because the evidence connecting them is visible for the first time.",
    "Companies innovate responsibly, informed by the research and policy context their decisions actually sit inside.",
    "Citizens access the same trusted knowledge institutions use — explained, not gatekept.",
  ] as const,
  manifestoTitle: "The CBAI Manifesto",
  manifestoItems: [
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
  ] as const,
  limitationsEyebrow: "Limitations",
  limitationsHeadline: "What CBAI does not claim to do today — stated before you rely on it.",
  limitationsItems: [
    "No live API integration with external databases — connection status reflects the local catalog and declared sources only.",
    "No automated report export (PDF, CSV, or API) until readiness criteria and governance release review are satisfied.",
    "Projects and local assistant profiles save to this browser unless you sign in with a connected cloud account.",
    "Voice commands use deterministic phrase matching, not open-ended natural language understanding.",
    "Deep profile narrative bodies may remain English when a source has not been translated — entity names stay as registered.",
    "Governance rules are registered declaratively — automated enforcement and CI gates are future work.",
  ] as const,
  roadmapEyebrow: "Roadmap maturity",
  roadmapHeadline: "Real capabilities by maturity state — not a marketing timeline.",
  roadmapItems: [
    {
      name: "Country, company, and university registries",
      statusKey: "live" as const,
      detail: "Local catalog profiles with evidence status, comparables, and relationship panels.",
    },
    {
      name: "Research topic catalog",
      statusKey: "partial" as const,
      detail: "Structured topics with review workspace — live scientific databases not connected yet.",
    },
    {
      name: "Knowledge Graph",
      statusKey: "partial" as const,
      detail: "Verified local catalog edges only — extended entity and relationship types prepared, not connected.",
    },
    {
      name: "Reports Center",
      statusKey: "partial" as const,
      detail: "Readiness model and in-profile reports — bulk export formats planned, not available.",
    },
    {
      name: "Governance Intelligence routes",
      statusKey: "preview" as const,
      detail: "Institutional framing and domain organization — full policy evidence sources not connected.",
    },
    {
      name: "Multilingual voice recognition",
      statusKey: "partial" as const,
      detail: "Text command fallback works in four languages — live microphone accuracy varies by browser.",
    },
  ] as const,
  closingHeadline:
    "The future will not belong to those with the most information. It will belong to those who understand it.",
  closingBody:
    "That is the work CBAI exists to do — one connected piece of evidence at a time. Welcome in.",
  readTrustCenter: "Read the Trust Center →",
  startProject: "Start a Project →",
} as const;

export const GOVERNANCE_PRINCIPLES_EN = {
  "evidence-first": {
    title: "Evidence First",
    description: "No intelligence claim without traceable evidence or an explicit unavailable label.",
  },
  "political-neutrality": {
    title: "Political Neutrality",
    description: "No partisan framing, national favoritism, or ideological scoring.",
  },
  "zero-demo-policy": {
    title: "Zero Demo Policy",
    description:
      "No fabricated scores, percentages, rankings, confidence bars, or AI summaries on user-facing routes.",
  },
  "methodology-before-metrics": {
    title: "Methodology Before Metrics",
    description: "Documented methodology and source attribution before any metric or score is shown.",
  },
  "separation-of-evidence-and-judgment": {
    title: "Separation of Evidence and Judgment",
    description: "Evidence presentation never substitutes for human decision responsibility.",
  },
  "no-social-sentiment-scoring": {
    title: "No Social Sentiment Scoring",
    description: "No Twitter-style sentiment, popularity, or viral metrics as intelligence.",
  },
  "official-source-priority": {
    title: "Official Source Priority",
    description:
      "United Nations, World Bank, NSO, and other official sources take precedence — no scraped or social data as intelligence.",
  },
  reproducibility: {
    title: "Reproducibility",
    description:
      "Module IDs, source slugs, and methodology versions must be traceable for audit and research.",
  },
  "governance-before-release": {
    title: "Governance Before Release",
    description:
      "New modules pass standards, evidence, persona, and accessibility checks before release — no silent policy changes.",
  },
} as const;

export const REPORTS_MODEL_BUILD009_EN = {
  exportFutureDescription:
    "Planned export formats — not available until report readiness criteria are satisfied.",
  constitutionalCompliance: "Constitutional compliance",
  noFakeAnalyticsBody:
    "Reports Center does not generate charts, KPIs, usage statistics, or growth metrics. No report is produced unless connected evidence and documented methodology exist. When data is missing, labels read Evidence Source Not Connected or Insufficient Evidence.",
  personasSectionDescription: "Which report types each audience will find useful when evidence connects.",
  trustSectionDescription: "Principles governing future report generation on CBAI.",
} as const;

export const ENTITY_INTELLIGENCE_BUILD009_EN = {
  reportsBodySingle:
    "This profile's own report is available directly below (Generate report). Reports Center has other report types across profiles.",
  reportsBodyPlural:
    "This profile's own report is available directly below (Generate report). Reports Center has more report types across profiles.",
  openReportsCenterSr: "for this {entityLabel}",
  benchmarkUniversity:
    "Benchmark this university against others in the registry before reading the full profile.",
  partnerClaimsNotShownExtended:
    "Not shown — evidence source not connected. CBAI does not infer commercial relationships without verified sources.",
  researchPartnershipsNotShownExtended:
    "Not shown — requires connected affiliation evidence. CBAI does not infer rankings or employability scores.",
} as const;

export const GRAPH_UI_BUILD009_EN = {
  noSelectionConnections:
    "Evidence relationships and neighbor entities appear here after you select a node on the graph.",
  futureEvidenceDefault:
    "Partnership verification, collaboration contracts, and extended neighbor types require connected evidence sources.",
  plannedTypesSummary:
    "{entityCount} future entity types · {relationshipCount} relationship types not connected",
  sourceAdapterCountry: "Country adapter",
  sourceAdapterCompany: "Company adapter",
  sourceAdapterUniversity: "University adapter",
  canvasHint: "Select a node · Scroll to pan · {nodes} nodes · {edges} edges",
  zoomControlsAria: "Graph zoom controls",
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  zoomReset: "Reset",
} as const;
