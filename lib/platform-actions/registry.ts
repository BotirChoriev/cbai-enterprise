/** Canonical platform action registry — allowlist only, no arbitrary routes. */

import type { PlatformActionDefinition, PlatformActionId } from "@/lib/platform-actions/types";

const NAV_ALIASES = {
  home: [
    "open home", "go home", "home page", "home",
    "bosh sahifani och", "bosh sahifa", "bosh sahifaga qayt", "uyga qayt",
    "открой главную", "главная", "на главную",
    "ana sayfayı aç", "ana sayfa", "ana sayfaya dön",
  ],
  myWork: [
    "my work", "open my work", "my projects", "open projects",
    "mening ishlarim", "mening ishlarimni ko'rsat", "mening ishlarimni och", "loyihalarim", "loyihalarimni och",
    "моя работа", "мои проекты", "открой мою работу",
    "çalışmalarım", "projelerim", "projelerimi aç",
  ],
  search: [
    "open search", "search intelligence", "search",
    "qidiruvni och", "qidiruv", "qidir",
    "открой поиск", "поиск",
    "aramayı aç", "arama",
  ],
  countries: [
    "open countries", "country dashboard", "countries", "open country",
    "davlatlarni och", "davlatlar", "mamlakatlar",
    "открой страны", "страны",
    "ülkeleri aç", "ülkeler",
  ],
  companies: [
    "open companies", "open company", "companies",
    "kompaniyalarni och", "kompaniyalar",
    "открой компании", "компании",
    "şirketleri aç", "şirketler",
  ],
  universities: [
    "open universities", "open university", "universities",
    "universitetlarni och", "universitetlar",
    "открой университеты", "университеты",
    "üniversiteleri aç", "üniversiteler",
  ],
  research: [
    "open research", "research", "continue research",
    "tadqiqotni och", "tadqiqot", "tadqiqot sahifasini och", "tadqiqot sahifasi", "ilmiy ish",
    "открой исследования", "исследования",
    "araştırmayı aç", "araştırma",
  ],
  evidence: [
    "open evidence", "evidence", "sources", "show missing evidence", "show evidence",
    "dalillarni och", "dalillar", "dalillarni ko'rsat", "manbalar",
    "открой доказательства", "доказательства", "покажи доказательства",
    "kanıtları aç", "kanıtlar", "kanıtları göster",
  ],
  graph: [
    "open knowledge graph", "knowledge graph", "open graph",
    "bilim grafigini och", "bilim grafigi", "aloqalar xaritasi",
    "открой граф знаний", "граф знаний",
    "bilgi grafiğini aç", "bilgi grafiği",
  ],
  reports: [
    "open reports", "reports", "generate report",
    "hisobotlarni och", "hisobotlar",
    "открой отчёты", "отчёты",
    "raporları aç", "raporlar",
  ],
  investor: [
    "open investor", "investor workspace", "investor",
    "investor ish maydonini och", "investor",
    "инвестор", "инвесторский",
    "yatırımcı", "yatırımcı alanı",
  ],
  government: [
    "open government", "government workspace", "government",
    "hukumat", "davlat boshqaruvi", "davlat boshqaruvi dalillarini ko'rsat",
    "государство", "госуправление",
    "hükümet", "devlet yönetimi",
  ],
  governance: [
    "open governance", "governance control", "governance",
    "boshqaruv qoidalari", "nazorat", "standartlar", "platforma qoidalarini ko'rsat",
    "управление", "стандарты", "надзор",
    "yönetişim", "standartlar", "denetim",
  ],
  trust: [
    "open trust", "trust center", "privacy policy", "privacy",
    "ishonch", "maxfiylik siyosatini och", "maxfiylik",
    "доверие", "конфиденциальность",
    "güven", "gizlilik",
  ],
  settings: [
    "open settings", "settings",
    "sozlamalarni och", "sozlamalar",
    "настройки", "открой настройки",
    "ayarlar", "ayarları aç",
  ],
  about: [
    "about cbai", "open about", "about",
    "cbai haqida", "platforma haqida",
    "о cbai", "о платформе",
    "cbai hakkında",
  ],
  workspace: [
    "open workspace", "personal workspace", "my profile",
    "shaxsiy ish maydoni", "mening profilim",
    "личное пространство", "мой профиль",
    "kişisel alan", "profilim",
  ],
  scientificDocuments: [
    "scientific documents", "open scientific documents", "document intake", "upload phd", "upload dissertation",
    "ilmiy hujjatlar", "ilmiy hujjatlarni och", "ilmiy hujjatlarimni och", "phd yukla", "dissertatsiya",
    "научные документы", "загрузить диссертацию",
    "bilimsel belgeler", "doktora yükle",
  ],
  files: [
    "open files", "my files", "fayllar", "fayllarimni och", "mening fayllarimni och",
    "файлы", "открыть файлы", "dosyalar", "dosyaları aç",
  ],
  teams: [
    "open teams", "my teams", "jamoalar", "jamoani och", "jamoalarimni och", "mening jamoalarimni och",
    "команды", "открыть команды", "ekipler", "ekipleri aç",
  ],
  messages: [
    "open messages", "messages", "xabarlar", "xabarlarni och", "mening xabarlarimni och",
    "сообщения", "mesajlar", "mesajları aç",
  ],
  notifications: [
    "open notifications", "notifications", "bildirishnomalar",
    "уведомления", "bildirimler",
  ],
  publications: [
    "open publications", "publications", "nashrlar", "nashrlarimni och", "mening nashrlarimni och",
    "публикации", "yayınlar",
  ],
  back: [
    "go back", "back", "orqaga qayt",
    "назад", "вернуться",
    "geri dön", "geri",
  ],
  voiceStop: [
    "stop microphone", "stop mic", "stop listening",
    "mikrofonni to'xtat", "to'xtat", "tinglashni to'xtat",
    "останови микрофон", "остановить",
    "mikrofonu durdur",
  ],
  voiceClose: [
    "close conversation", "close voice", "close dock", "close operator",
    "suhbatni yop", "operatorni yop",
    "закрой разговор", "закрыть",
    "sohbeti kapat",
  ],
  transcriptShow: ["show transcript", "transkriptni ko'rsat", "покажи транскрипт", "transkripti göster"],
  transcriptHide: ["hide transcript", "transkriptni yashir", "скрой транскрипт", "transkripti gizle"],
} as const;

function navDef(
  id: PlatformActionId,
  aliases: readonly string[],
  successKey: string,
  analyticsClass: string,
): PlatformActionDefinition {
  return {
    id,
    readOnly: true,
    mutationKind: "none",
    successMessageKey: successKey,
    failureMessageKey: "platformAction.failureNavigate",
    analyticsClass,
    aliases,
  };
}

function mutationDef(
  id: PlatformActionId,
  aliases: readonly string[],
  successKey: string,
  analyticsClass: string,
): PlatformActionDefinition {
  return {
    id,
    readOnly: false,
    mutationKind: "draft",
    successMessageKey: successKey,
    failureMessageKey: "platformAction.failureMutation",
    analyticsClass,
    aliases,
  };
}

export const PLATFORM_ACTION_REGISTRY: Record<PlatformActionId, PlatformActionDefinition> = {
  "navigate.home": navDef("navigate.home", NAV_ALIASES.home, "platformAction.successHome", "nav_home"),
  "navigate.my_work": navDef("navigate.my_work", NAV_ALIASES.myWork, "platformAction.successMyWork", "nav_my_work"),
  "navigate.search": navDef("navigate.search", NAV_ALIASES.search, "platformAction.successSearch", "nav_search"),
  "navigate.countries": navDef("navigate.countries", NAV_ALIASES.countries, "platformAction.successCountries", "nav_countries"),
  "navigate.companies": navDef("navigate.companies", NAV_ALIASES.companies, "platformAction.successCompanies", "nav_companies"),
  "navigate.universities": navDef("navigate.universities", NAV_ALIASES.universities, "platformAction.successUniversities", "nav_universities"),
  "navigate.research": navDef("navigate.research", NAV_ALIASES.research, "platformAction.successResearch", "nav_research"),
  "navigate.evidence": navDef("navigate.evidence", NAV_ALIASES.evidence, "platformAction.successEvidence", "nav_evidence"),
  "navigate.graph": navDef("navigate.graph", NAV_ALIASES.graph, "platformAction.successGraph", "nav_graph"),
  "navigate.reports": navDef("navigate.reports", NAV_ALIASES.reports, "platformAction.successReports", "nav_reports"),
  "navigate.investor": navDef("navigate.investor", NAV_ALIASES.investor, "platformAction.successInvestor", "nav_investor"),
  "navigate.government": navDef("navigate.government", NAV_ALIASES.government, "platformAction.successGovernment", "nav_government"),
  "navigate.governance": navDef("navigate.governance", NAV_ALIASES.governance, "platformAction.successGovernance", "nav_governance"),
  "navigate.trust": navDef("navigate.trust", NAV_ALIASES.trust, "platformAction.successTrust", "nav_trust"),
  "navigate.settings": navDef("navigate.settings", NAV_ALIASES.settings, "platformAction.successSettings", "nav_settings"),
  "navigate.about": navDef("navigate.about", NAV_ALIASES.about, "platformAction.successAbout", "nav_about"),
  "navigate.back": navDef("navigate.back", NAV_ALIASES.back, "platformAction.successBack", "nav_back"),
  "navigate.workspace": navDef("navigate.workspace", NAV_ALIASES.workspace, "platformAction.successWorkspace", "nav_workspace"),
  "navigate.scientific_documents": navDef(
    "navigate.scientific_documents",
    NAV_ALIASES.scientificDocuments,
    "platformAction.successScientificDocuments",
    "nav_scientific_documents",
  ),
  "navigate.files": navDef("navigate.files", NAV_ALIASES.files, "platformAction.successFiles", "nav_files"),
  "navigate.teams": navDef("navigate.teams", NAV_ALIASES.teams, "platformAction.successTeams", "nav_teams"),
  "navigate.messages": navDef("navigate.messages", NAV_ALIASES.messages, "platformAction.successMessages", "nav_messages"),
  "navigate.notifications": navDef(
    "navigate.notifications",
    NAV_ALIASES.notifications,
    "platformAction.successNotifications",
    "nav_notifications",
  ),
  "navigate.publications": navDef(
    "navigate.publications",
    NAV_ALIASES.publications,
    "platformAction.successPublications",
    "nav_publications",
  ),
  "entity.open_country": navDef("entity.open_country", [], "platformAction.successCountry", "entity_country"),
  "entity.open_company": navDef("entity.open_company", [], "platformAction.successCompany", "entity_company"),
  "entity.open_university": navDef("entity.open_university", [], "platformAction.successUniversity", "entity_university"),
  "research.open_topic": navDef("research.open_topic", [], "platformAction.successResearchTopic", "research_topic"),
  "mission.resume": navDef("mission.resume", ["continue mission", "resume mission", "missiyani davom ettir"], "platformAction.successMission", "mission_resume"),
  "project.open": navDef("project.open", ["open project", "open projects", "loyihani och"], "platformAction.successProject", "project_open"),
  "transcript.show": navDef("transcript.show", NAV_ALIASES.transcriptShow, "platformAction.successTranscriptShow", "transcript_show"),
  "transcript.hide": navDef("transcript.hide", NAV_ALIASES.transcriptHide, "platformAction.successTranscriptHide", "transcript_hide"),
  "voice.stop": navDef("voice.stop", NAV_ALIASES.voiceStop, "platformAction.successVoiceStop", "voice_stop"),
  "voice.close": navDef("voice.close", NAV_ALIASES.voiceClose, "platformAction.successVoiceClose", "voice_close"),
  "operational_object.compose": mutationDef("operational_object.compose", [], "platformAction.successDraftOpen", "oo_compose"),
  "operational_object.confirm_create": mutationDef("operational_object.confirm_create", [], "platformAction.successDraftConfirm", "oo_confirm"),
  "project.compose": mutationDef("project.compose", ["create project", "new project", "yangi loyiha"], "platformAction.successProjectDraft", "project_compose"),
  "mission.compose": mutationDef("mission.compose", ["start mission", "new mission", "yangi missiya"], "platformAction.successMissionDraft", "mission_compose"),
  "report.compose": mutationDef(
    "report.compose",
    ["create report", "generate report", "hisobot yaratmoqchiman", "hisobot yarat"],
    "platformAction.successReportDraft",
    "report_compose",
  ),
  "evidence_request.compose": mutationDef("evidence_request.compose", [], "platformAction.successEvidenceDraft", "evidence_compose"),
  "scientific_intake.compose": mutationDef(
    "scientific_intake.compose",
    [
      "upload phd",
      "upload dissertation",
      "scientific intake",
      "ilmiy hujjat yukla",
      "phd yukla",
      "menda 400 sahifalik phd",
      "400 sahifalik phd",
      "qayerga yuboraman",
      "where do i upload",
      "загрузить phd",
      "doktora yükle",
    ],
    "platformAction.successScientificIntake",
    "scientific_intake",
  ),
  "team.compose": mutationDef(
    "team.compose",
    ["create team", "new team", "jamoa yarat", "создать команду", "ekip oluştur"],
    "platformAction.successTeamDraft",
    "team_compose",
  ),
  "team.invite": mutationDef(
    "team.invite",
    ["invite member", "invite to team", "a'zoni taklif", "пригласить", "üye davet"],
    "platformAction.successTeamInvite",
    "team_invite",
  ),
  "object.share": mutationDef(
    "object.share",
    [
      "share with team",
      "share this",
      "jamoa bilan bo'lish",
      "ushbu ishni jamoam bilan",
      "поделиться с командой",
      "ekiple paylaş",
    ],
    "platformAction.successShareDraft",
    "object_share",
  ),
  "publication.prepare": mutationDef(
    "publication.prepare",
    [
      "publish my work",
      "prepare publication",
      "ilmiy ishimni ommaga chiqar",
      "ommaga chiqar",
      "опубликовать",
      "yayınla",
    ],
    "platformAction.successPublicationPrepare",
    "publication_prepare",
  ),
  "engine.research.start": mutationDef(
    "engine.research.start",
    [
      "kimyo bo'yicha yangi tadqiqot boshlamoqchiman",
      "start research",
      "new research",
      "tadqiqot boshla",
      "yangi tadqiqot",
      "начать исследование",
      "araştırma başlat",
    ],
    "forwardDeployedEngineAction.successResearchEngine",
    "engine_research",
  ),
  "engine.evidence.start": mutationDef(
    "engine.evidence.start",
    [
      "mavjud dalillarni ko'rsat",
      "show evidence",
      "evidence map",
      "dalillarni ko'rsat",
      "показать доказательства",
      "kanıtları göster",
    ],
    "forwardDeployedEngineAction.successEvidenceEngine",
    "engine_evidence",
  ),
  "engine.country.start": mutationDef(
    "engine.country.start",
    [
      "mamlakat bo'yicha dalil",
      "country intelligence",
      "mamlakat razvedkasi",
      "разведка по стране",
      "ülke istihbaratı",
    ],
    "forwardDeployedEngineAction.successCountryEngine",
    "engine_country",
  ),
  "engine.organization.start": mutationDef(
    "engine.organization.start",
    [
      "dalil yetishmayotgan joylarni top",
      "organization intelligence",
      "tashkilot razvedkasi",
      "разведка по организации",
      "kuruluş istihbaratı",
    ],
    "forwardDeployedEngineAction.successOrganizationEngine",
    "engine_organization",
  ),
  "engine.mission.start": mutationDef(
    "engine.mission.start",
    ["start mission engine", "missiya dvigateli", "görev motoru"],
    "forwardDeployedEngineAction.successMissionEngine",
    "engine_mission",
  ),
  "engine.governance.start": mutationDef(
    "engine.governance.start",
    [
      "governance tekshiruvidan o'tkaz",
      "governance review",
      "boshqaruv tekshiruvi",
      "обзор управления",
      "yönetişim incelemesi",
    ],
    "forwardDeployedEngineAction.successGovernanceEngine",
    "engine_governance",
  ),
  "engine.meeting.start": mutationDef(
    "engine.meeting.start",
    ["multilingual meeting", "ko'p tilli uchrashuv", "многоязычная встреча"],
    "forwardDeployedEngineAction.successMeetingEngine",
    "engine_meeting",
  ),
  "engine.research.confirm": mutationDef("engine.research.confirm", ["confirm research plan"], "forwardDeployedEngineAction.confirmationRequired", "engine_research_confirm"),
  "engine.evidence.confirm": mutationDef("engine.evidence.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_evidence_confirm"),
  "engine.country.confirm": mutationDef("engine.country.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_country_confirm"),
  "engine.organization.confirm": mutationDef("engine.organization.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_organization_confirm"),
  "engine.mission.confirm": mutationDef("engine.mission.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_mission_confirm"),
  "engine.governance.confirm": mutationDef("engine.governance.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_governance_confirm"),
  "engine.meeting.confirm": mutationDef("engine.meeting.confirm", [], "forwardDeployedEngineAction.confirmationRequired", "engine_meeting_confirm"),
};

export const PLATFORM_ACTION_IDS = Object.keys(PLATFORM_ACTION_REGISTRY) as PlatformActionId[];

export function getPlatformActionDefinition(actionId: string): PlatformActionDefinition | null {
  if (actionId in PLATFORM_ACTION_REGISTRY) {
    return PLATFORM_ACTION_REGISTRY[actionId as PlatformActionId];
  }
  return null;
}

export const ALLOWED_NAVIGATION_HREFS = new Set([
  "/",
  "/my-work",
  "/search",
  "/countries",
  "/companies",
  "/universities",
  "/research",
  "/knowledge",
  "/graph",
  "/reports",
  "/investor",
  "/government",
  "/governance",
  "/trust",
  "/settings",
  "/about",
  "/account",
  "/reasoning",
  "/research/canvas",
  "/workspace",
  "/scientific-documents",
  "/files",
  "/teams",
  "/messages",
  "/notifications",
  "/publications",
  "/organization",
]);

export function isAllowedNavigationHref(href: string): boolean {
  if (!href.startsWith("/")) return false;
  const path = href.split("?")[0] ?? href;
  if (ALLOWED_NAVIGATION_HREFS.has(path)) return true;
  if (path.startsWith("/research/")) return true;
  if (path.startsWith("/countries?")) return true;
  if (path.startsWith("/companies?")) return true;
  if (path.startsWith("/universities?")) return true;
  if (path.startsWith("/search?")) return true;
  return false;
}

export function hrefForAction(actionId: PlatformActionId, params: { entityId?: string; topicId?: string; query?: string }): string | null {
  switch (actionId) {
    case "navigate.home":
      return "/";
    case "navigate.my_work":
    case "mission.resume":
    case "project.open":
      return "/my-work";
    case "navigate.search":
      return params.query ? `/search?q=${encodeURIComponent(params.query)}` : "/search";
    case "navigate.countries":
      return params.entityId ? `/countries?country=${params.entityId}` : "/countries";
    case "navigate.companies":
      return params.entityId ? `/companies?company=${params.entityId}` : "/companies";
    case "navigate.universities":
      return params.entityId ? `/universities?university=${params.entityId}` : "/universities";
    case "navigate.research":
      return params.topicId ? `/research/${params.topicId}` : params.query ? `/research?q=${encodeURIComponent(params.query)}` : "/research";
    case "navigate.evidence":
      return "/knowledge";
    case "navigate.graph":
      return "/graph";
    case "navigate.reports":
      return "/reports";
    case "navigate.investor":
      return "/investor";
    case "navigate.government":
      return "/government";
    case "navigate.governance":
      return "/governance";
    case "navigate.trust":
      return "/trust";
    case "navigate.settings":
      return "/settings";
    case "navigate.about":
      return "/about";
    case "navigate.workspace":
      return "/workspace";
    case "navigate.scientific_documents":
    case "scientific_intake.compose":
      return "/scientific-documents";
    case "navigate.files":
      return "/files";
    case "navigate.teams":
    case "team.compose":
    case "team.invite":
      return "/teams";
    case "navigate.messages":
      return "/messages";
    case "navigate.notifications":
      return "/notifications";
    case "navigate.publications":
    case "publication.prepare":
    case "object.share":
      return "/publications";
    case "entity.open_country":
      return params.entityId ? `/countries?country=${params.entityId}` : null;
    case "entity.open_company":
      return params.entityId ? `/companies?company=${params.entityId}` : null;
    case "entity.open_university":
      return params.entityId ? `/universities?university=${params.entityId}` : null;
    case "research.open_topic":
      return params.topicId ? `/research/${params.topicId}` : null;
    default:
      return null;
  }
}
