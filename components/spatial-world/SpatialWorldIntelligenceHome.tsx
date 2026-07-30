"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import ActivationExperience from "@/components/activation/ActivationExperience";
import OperatorOrb from "@/components/shared/OperatorOrb";
import { useVoiceOperator } from "@/components/voice-operator/VoiceOperatorProvider";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useTranslation } from "@/lib/i18n/use-translation";
import { loadProjects } from "@/lib/project/project-store";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { myWorkHrefForMission } from "@/lib/intelligence-os/mission-operating-context";
import type { GlobeCountryPoint } from "@/lib/spatial-world/globe-geography";
import PersonalWorkspaceGateway from "@/components/personal-workspace/PersonalWorkspaceGateway";

const InteractiveIntelligenceGlobe = dynamic(
  () => import("@/components/spatial-world/InteractiveIntelligenceGlobe"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-[#07101f] text-sm text-slate-400">
        …
      </div>
    ),
  },
);

const HOME_COPY = {
  en: {
    eyebrow: "Collaborative Intelligence Operating System",
    title: "Open a problem. Work it through with AI. You decide.",
    subtitle:
      "CBAI gathers evidence, exposes contradictions, tracks unknowns, and compares scenarios. It never replaces human judgment.",
    operator: "Voice Operator",
    operatorBody: "Navigate, investigate, compare, and review the decision flow naturally.",
    operatorReady: "Ready to work with you",
    operatorAction: "Open Voice Operator",
    boundary: "AI investigates and structures. Humans evaluate and decide.",
    workflow: "One problem. One shared thinking process.",
    stages: ["Problem", "Evidence", "Contradictions", "Scenarios", "Human decision", "Monitoring"],
    stageNotes: [
      "Define what must change",
      "Verify sources and claims",
      "Surface conflicts and gaps",
      "Compare consequences",
      "Record human judgment",
      "Watch what changes",
    ],
    work: "Continue your work",
    empty: "No active problem yet.",
    openProblems: "Open Problem Space",
    openWork: "Open My Work",
    evidence: "Evidence workspace",
    evidenceBody: "Review sources, unknowns, provenance, and counter-evidence.",
    openEvidence: "Open Evidence",
    explore: "Explore intelligence sources",
    exploreBody: "Countries, research, organizations, and the world map support a problem; they are not the starting point.",
    mapTitle: "World intelligence map",
    mapHint: "Select a country only when geographic context is relevant to your problem.",
    mapReset: "Reset view",
    mapFallbackTitle: "Map unavailable",
    mapFallbackHint: "Open Countries to continue.",
    mapKeyboard: "Arrow keys rotate. +/− zoom. Enter opens a country.",
  },
  uz: {
    eyebrow: "Hamkorlikdagi intellekt operatsion tizimi",
    title: "Muammoni oching. AI bilan birga ishlang. Qarorni siz bering.",
    subtitle:
      "CBAI dalillarni yig‘adi, qarama-qarshiliklarni ko‘rsatadi, noma’lumlarni kuzatadi va ssenariylarni taqqoslaydi. Inson hukmini almashtirmaydi.",
    operator: "Ovozli operator",
    operatorBody: "Tabiiy ovoz orqali yo‘naling, tekshiring, taqqoslang va qaror jarayonini ko‘rib chiqing.",
    operatorReady: "Siz bilan ishlashga tayyor",
    operatorAction: "Ovozli operatorni ochish",
    boundary: "AI tekshiradi va tizimlaydi. Inson baholaydi va qaror beradi.",
    workflow: "Bitta muammo. Bitta umumiy fikrlash jarayoni.",
    stages: ["Muammo", "Dalillar", "Qarama-qarshiliklar", "Ssenariylar", "Inson qarori", "Monitoring"],
    stageNotes: [
      "Nima o‘zgarishi kerakligini aniqlang",
      "Manba va da’volarni tekshiring",
      "Ziddiyat va bo‘shliqlarni ko‘ring",
      "Oqibatlarni taqqoslang",
      "Inson hukmini qayd eting",
      "O‘zgarishlarni kuzating",
    ],
    work: "Ishni davom ettirish",
    empty: "Hali faol muammo yo‘q.",
    openProblems: "Muammo maydonini ochish",
    openWork: "Mening ishlarim",
    evidence: "Dalillar maydoni",
    evidenceBody: "Manbalar, noma’lumlar, kelib chiqish va qarshi dalillarni ko‘rib chiqing.",
    openEvidence: "Dalillarni ochish",
    explore: "Intellekt manbalarini ko‘rish",
    exploreBody: "Mamlakatlar, tadqiqotlar, tashkilotlar va dunyo xaritasi muammoni qo‘llab-quvvatlaydi; ular boshlanish nuqtasi emas.",
    mapTitle: "Dunyo intellekt xaritasi",
    mapHint: "Geografik kontekst muammo uchun zarur bo‘lgandagina mamlakatni tanlang.",
    mapReset: "Ko‘rinishni tiklash",
    mapFallbackTitle: "Xarita mavjud emas",
    mapFallbackHint: "Davom etish uchun Mamlakatlarni oching.",
    mapKeyboard: "Yo‘nalish tugmalari aylantiradi. +/− masshtab. Enter mamlakatni ochadi.",
  },
  ru: {
    eyebrow: "Операционная система совместного интеллекта",
    title: "Откройте проблему. Работайте вместе с ИИ. Решение принимаете вы.",
    subtitle:
      "CBAI собирает доказательства, показывает противоречия, отслеживает неизвестное и сравнивает сценарии. Человеческое суждение не заменяется.",
    operator: "Голосовой оператор",
    operatorBody: "Навигация, проверка, сравнение и обзор решения естественным голосом.",
    operatorReady: "Готов работать вместе с вами",
    operatorAction: "Открыть голосового оператора",
    boundary: "ИИ исследует и структурирует. Человек оценивает и решает.",
    workflow: "Одна проблема. Один совместный процесс мышления.",
    stages: ["Проблема", "Доказательства", "Противоречия", "Сценарии", "Решение человека", "Мониторинг"],
    stageNotes: [
      "Определите требуемое изменение",
      "Проверьте источники и утверждения",
      "Выявите конфликты и пробелы",
      "Сравните последствия",
      "Зафиксируйте решение человека",
      "Следите за изменениями",
    ],
    work: "Продолжить работу",
    empty: "Активной проблемы пока нет.",
    openProblems: "Открыть пространство проблем",
    openWork: "Открыть мою работу",
    evidence: "Пространство доказательств",
    evidenceBody: "Проверяйте источники, неизвестное, происхождение и контрдоказательства.",
    openEvidence: "Открыть доказательства",
    explore: "Изучить источники интеллекта",
    exploreBody: "Страны, исследования, организации и карта мира поддерживают проблему, но не являются точкой старта.",
    mapTitle: "Карта мирового интеллекта",
    mapHint: "Выбирайте страну, только если географический контекст важен для проблемы.",
    mapReset: "Сбросить вид",
    mapFallbackTitle: "Карта недоступна",
    mapFallbackHint: "Откройте раздел стран.",
    mapKeyboard: "Стрелки вращают. +/− масштаб. Enter открывает страну.",
  },
  tr: {
    eyebrow: "İşbirlikçi Zekâ İşletim Sistemi",
    title: "Bir problem açın. Yapay zekâyla birlikte çalışın. Kararı siz verin.",
    subtitle:
      "CBAI kanıt toplar, çelişkileri görünür kılar, bilinmeyenleri izler ve senaryoları karşılaştırır. İnsan muhakemesinin yerini almaz.",
    operator: "Sesli Operatör",
    operatorBody: "Doğal sesle gezin, araştırın, karşılaştırın ve karar akışını inceleyin.",
    operatorReady: "Sizinle çalışmaya hazır",
    operatorAction: "Sesli Operatörü aç",
    boundary: "Yapay zekâ araştırır ve yapılandırır. İnsan değerlendirir ve karar verir.",
    workflow: "Tek problem. Tek ortak düşünme süreci.",
    stages: ["Problem", "Kanıt", "Çelişkiler", "Senaryolar", "İnsan kararı", "İzleme"],
    stageNotes: [
      "Neyin değişmesi gerektiğini tanımlayın",
      "Kaynakları ve iddiaları doğrulayın",
      "Çatışmaları ve boşlukları görün",
      "Sonuçları karşılaştırın",
      "İnsan kararını kaydedin",
      "Değişiklikleri izleyin",
    ],
    work: "Çalışmaya devam et",
    empty: "Henüz aktif problem yok.",
    openProblems: "Problem Alanını aç",
    openWork: "Çalışmalarımı aç",
    evidence: "Kanıt alanı",
    evidenceBody: "Kaynakları, bilinmeyenleri, kökeni ve karşı kanıtları inceleyin.",
    openEvidence: "Kanıtları aç",
    explore: "Zekâ kaynaklarını keşfet",
    exploreBody: "Ülkeler, araştırmalar, kuruluşlar ve dünya haritası problemi destekler; başlangıç noktası değildir.",
    mapTitle: "Dünya zekâ haritası",
    mapHint: "Yalnızca coğrafi bağlam probleminizle ilgiliyse bir ülke seçin.",
    mapReset: "Görünümü sıfırla",
    mapFallbackTitle: "Harita kullanılamıyor",
    mapFallbackHint: "Devam etmek için Ülkeleri açın.",
    mapKeyboard: "Ok tuşları döndürür. +/− yakınlaştırır. Enter ülkeyi açar.",
  },
} as const;

export default function SpatialWorldIntelligenceHome() {
  const { language, t } = useTranslation();
  const copy = HOME_COPY[language as keyof typeof HOME_COPY] ?? HOME_COPY.en;
  const voice = useVoiceOperator();
  const operationalObjects = useOperationalObjectsOptional();
  const hydrated = useHydrated();
  const { mission } = useMissionContext();
  const [selectedCountry, setSelectedCountry] = useState<GlobeCountryPoint | null>(null);
  const projects = useMemo(() => (hydrated ? loadProjects().slice(0, 3) : []), [hydrated]);
  const hasExistingWork =
    hydrated && (projects.length > 0 || (operationalObjects?.objects.length ?? 0) > 0);

  const handleSelectCountry = useCallback((point: GlobeCountryPoint | null) => {
    setSelectedCountry(point);
  }, []);

  return (
    <main className="relative w-full overflow-hidden px-3 pb-10 pt-4 sm:px-5 lg:px-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_72%_12%,rgba(45,212,191,0.13),transparent_42%),radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.09),transparent_34%)]" />

      <div className="relative mx-auto max-w-[1480px] space-y-5">
        <header className="max-w-4xl pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-300/80">{copy.eyebrow}</p>
          <h1 className="cbai-display mt-3 max-w-4xl text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl xl:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{copy.subtitle}</p>
        </header>

        <PersonalWorkspaceGateway />

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ActivationExperience
            variant={hasExistingWork ? "compact" : "hero"}
            showLanguageSelector={false}
          />

          <button
            type="button"
            onClick={voice.openDock}
            className="group relative self-start overflow-hidden rounded-2xl border border-teal-300/30 bg-[linear-gradient(145deg,rgba(13,148,136,0.24),rgba(8,15,30,0.94)_58%)] p-5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.25)] transition hover:border-teal-200/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
          >
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-300/10 blur-3xl transition group-hover:bg-teal-300/20" />
            <div className="relative flex items-center gap-4">
              <OperatorOrb state={voice.dockOpen ? "listening" : "present"} size={76} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/80">{copy.operatorReady}</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{copy.operator}</h2>
              </div>
            </div>
            <p className="relative mt-5 text-sm leading-6 text-slate-300">{copy.operatorBody}</p>
            <span className="relative mt-6 inline-flex min-h-11 items-center rounded-full bg-teal-300 px-5 text-sm font-semibold text-slate-950">
              {copy.operatorAction}
            </span>
            <p className="relative mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">{copy.boundary}</p>
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 sm:p-5" aria-labelledby="thinking-flow-title">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="thinking-flow-title" className="text-lg font-semibold text-white">{copy.workflow}</h2>
            <p className="text-xs text-slate-400">{copy.boundary}</p>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            {copy.stages.map((stage, index) => (
              <li key={stage} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <span className="text-[10px] font-semibold tabular-nums text-teal-300/70">0{index + 1}</span>
                <p className="mt-2 text-sm font-semibold text-slate-100">{stage}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">{copy.stageNotes[index]}</p>
              </li>
            ))}
          </ol>
        </section>

        {mission ? (
          <Link
            href={myWorkHrefForMission(mission)}
            className="block rounded-xl border border-teal-300/25 bg-teal-950/30 px-4 py-3 text-sm font-medium text-teal-100 hover:border-teal-300/45"
          >
            {copy.work} →
          </Link>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.work}</p>
            {projects.length ? (
              <ul className="mt-4 space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/my-work?project=${project.id}`} className="text-sm font-medium text-teal-200 hover:text-teal-100">
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-400">{copy.empty}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
              <Link href="/problems" className="text-teal-200 hover:text-teal-100">{copy.openProblems}</Link>
              <Link href="/my-work" className="text-slate-300 hover:text-white">{copy.openWork}</Link>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.evidence}</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{copy.evidenceBody}</p>
            <Link href="/evidence" className="mt-5 inline-flex text-sm font-medium text-teal-200 hover:text-teal-100">
              {copy.openEvidence} →
            </Link>
          </article>
        </section>

        <details className="group rounded-2xl border border-white/10 bg-[#07101f]/65">
          <summary className="cursor-pointer list-none p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">{copy.explore}</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">{copy.exploreBody}</p>
              </div>
              <span className="text-xl text-teal-300 transition-transform group-open:rotate-45">+</span>
            </div>
          </summary>
          <div className="border-t border-white/10 p-3 sm:p-5">
            <InteractiveIntelligenceGlobe
              labels={{
                title: copy.mapTitle,
                hint: copy.mapHint,
                reset: copy.mapReset,
                fallbackTitle: copy.mapFallbackTitle,
                fallbackHint: copy.mapFallbackHint,
                keyboardHint: copy.mapKeyboard,
              }}
              selectedCountryId={selectedCountry?.country.id ?? null}
              onSelectCountry={handleSelectCountry}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["/countries", t("navigation.countries")],
                ["/research", t("navigation.research")],
                ["/companies", t("navigation.companies")],
                ["/universities", t("navigation.universities")],
                ["/graph", t("navigation.knowledgeGraph")],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 hover:border-teal-300/35 hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
