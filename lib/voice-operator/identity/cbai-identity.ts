/**
 * Voice / FAQ identity adapter over the canonical brand registry.
 *
 * All founder, platform, and product facts come from
 * `lib/brand/canonical-identity.ts`. This module preserves the previous
 * FAQ surface used by Voice Operator tests and instructions.
 */

import {
  CANONICAL_BRAND_FACTS,
  CANONICAL_BRAND_VERSION,
  answerBrandFaq,
  getBrandLocaleCopy,
  getCanonicalBrand,
  getOperatorIntroduction,
  getShortOperatorIdentity,
  resolveBrandLocale,
  type BrandLocale,
} from "@/lib/brand/canonical-identity";

export const CBAI_IDENTITY_VERSION = CANONICAL_BRAND_VERSION;

export type CbaiIdentityLocale = BrandLocale;

export type CbaiIdentityCopy = {
  readonly positioningComparison: string;
  readonly brandFormula: string;
  readonly definition: string;
  readonly slogan: string;
  readonly creationEngine: string;
  readonly creatorAttribution: string;
  readonly firstRunIntro: string;
  readonly faqWhatIs: string;
  readonly faqCreator: string;
  readonly faqPurpose: string;
  readonly faqEssence: string;
  readonly faqServes: string;
  readonly faqVision: string;
  readonly faqIsHuman: string;
  readonly faqIsChatbot: string;
  readonly faqVsGoogleChatgpt: string;
  readonly faqMakesDecisions: string;
  readonly publicPlatformName: string;
  readonly productSystemName: string;
  readonly founderName: string;
  readonly shortOperatorIdentity: string;
};

function buildLocaleCopy(locale: BrandLocale): CbaiIdentityCopy {
  const brand = getCanonicalBrand(locale);
  const facts = CANONICAL_BRAND_FACTS;
  return {
    publicPlatformName: facts.publicPlatformName,
    productSystemName: facts.productSystemName,
    founderName: facts.founderName,
    shortOperatorIdentity: brand.shortOperatorIdentity,
    positioningComparison:
      locale === "uz"
        ? "Google ma'lumotni topishga yordam beradi. ChatGPT savollarga javob olishga yordam beradi. CheckBalanceAI.Global esa CBAI Intelligence Operating System orqali g'oya yoki muammoni dalillarga tayangan ish va natijaga aylantirishga yordam beradi."
        : locale === "ru"
          ? "Google помогает находить информацию. ChatGPT помогает получать ответы. CheckBalanceAI.Global с помощью CBAI Intelligence Operating System помогает превратить идею или проблему в работу и результат на основе доказательств."
          : locale === "tr"
            ? "Google bilgi bulmaya yardımcı olur. ChatGPT sorulara yanıt almaya yardımcı olur. CheckBalanceAI.Global ise CBAI Intelligence Operating System ile bir fikri veya sorunu kanıta dayalı işe ve sonuca dönüştürmeye yardımcı olur."
            : "Google helps you find information. ChatGPT helps you get answers. CheckBalanceAI.Global, powered by the CBAI Intelligence Operating System, helps you turn an idea or problem into evidence-based work and outcomes.",
    brandFormula:
      locale === "uz"
        ? "Google — qidiruv. ChatGPT — javob. CheckBalanceAI.Global / CBAI — yaratish va amalga oshirish tizimi."
        : locale === "ru"
          ? "Google — поиск. ChatGPT — ответы. CheckBalanceAI.Global / CBAI — система создания и исполнения."
          : locale === "tr"
            ? "Google — arama. ChatGPT — yanıt. CheckBalanceAI.Global / CBAI — yaratma ve uygulama sistemi."
            : "Google — search. ChatGPT — answers. CheckBalanceAI.Global / CBAI — creation and execution.",
    definition: brand.answerWhatIsCbai,
    slogan:
      locale === "uz"
        ? "CheckBalanceAI.Global — fikrdan natijagacha."
        : locale === "ru"
          ? "CheckBalanceAI.Global — от мысли к результату."
          : locale === "tr"
            ? "CheckBalanceAI.Global — düşünceden sonuca."
            : "CheckBalanceAI.Global — from thought to outcome.",
    creationEngine: brand.mission,
    creatorAttribution: brand.ownershipOriginStatement,
    firstRunIntro: `${brand.operatorIntroduction} ${brand.roleDiscoveryPrompt}`,
    faqWhatIs: brand.answerWhatIsCbai,
    faqCreator: brand.answerWhoCreated,
    faqPurpose: brand.mission,
    faqEssence: brand.completeDescription,
    faqServes: brand.shortDescription,
    faqVision: brand.mission,
    faqIsHuman: brand.answerIsAi,
    faqIsChatbot:
      locale === "uz"
        ? "Yo‘q. Suhbat — CheckBalanceAI.Global bilan ishlash usullaridan biri. Platforma tadqiqot, dalil, loyiha va operatsion obyektlarni bir tizimda boshqarishga yordam beradi."
        : locale === "ru"
          ? "Нет. Разговор — один из способов работы с CheckBalanceAI.Global. Платформа помогает управлять исследованиями, доказательствами, проектами и операционными объектами в одной системе."
          : locale === "tr"
            ? "Hayır. Sohbet, CheckBalanceAI.Global ile çalışmanın yollarından biridir. Platform; araştırma, kanıt, proje ve operasyonel nesneleri tek sistemde yönetmeye yardımcı olur."
            : "No. Conversation is one way to work with CheckBalanceAI.Global. The platform also helps manage research, evidence, projects, and operational objects in one system.",
    faqVsGoogleChatgpt:
      locale === "uz"
        ? "Google asosan ma'lumot topishga, ChatGPT savollarga javob olishga yordam beradi. CheckBalanceAI.Global / CBAI esa g'oya yoki muammoni dalillarga tayangan boshqariladigan ishga aylantirishga yordam beradi."
        : locale === "ru"
          ? "Google в основном помогает находить информацию, ChatGPT — получать ответы. CheckBalanceAI.Global / CBAI помогает превратить идею или проблему в управляемую работу на основе доказательств."
          : locale === "tr"
            ? "Google çoğunlukla bilgi bulmaya, ChatGPT yanıtlara yardımcı olur. CheckBalanceAI.Global / CBAI bir fikri veya sorunu kanıta dayalı yönetilebilir işe dönüştürmeye yardımcı olur."
            : "Google mainly helps find information; ChatGPT helps get answers. CheckBalanceAI.Global / CBAI helps turn an idea or problem into evidence-based, governed work.",
    faqMakesDecisions: brand.humanDecisionAuthority,
  };
}

export const CBAI_IDENTITY: Readonly<Record<CbaiIdentityLocale, CbaiIdentityCopy>> = {
  en: buildLocaleCopy("en"),
  uz: buildLocaleCopy("uz"),
  ru: buildLocaleCopy("ru"),
  tr: buildLocaleCopy("tr"),
};

export function resolveIdentityLocale(language: string): CbaiIdentityLocale {
  return resolveBrandLocale(language);
}

export function getCbaiIdentity(language: string): CbaiIdentityCopy {
  return CBAI_IDENTITY[resolveIdentityLocale(language)];
}

export type CbaiIdentityFaqKind =
  | "what_is"
  | "creator"
  | "purpose"
  | "essence"
  | "serves"
  | "vision"
  | "is_human"
  | "is_chatbot"
  | "vs_google_chatgpt"
  | "makes_decisions"
  | "what_is_platform"
  | "who_founded";

export function answerCbaiIdentityFaq(kind: CbaiIdentityFaqKind, language: string): string {
  const id = getCbaiIdentity(language);
  switch (kind) {
    case "what_is":
      return id.faqWhatIs;
    case "creator":
      return id.faqCreator;
    case "who_founded":
      return answerBrandFaq("who_founded", language);
    case "what_is_platform":
      return answerBrandFaq("what_is_platform", language);
    case "purpose":
      return id.faqPurpose;
    case "essence":
      return id.faqEssence;
    case "serves":
      return id.faqServes;
    case "vision":
      return id.faqVision;
    case "is_human":
      return id.faqIsHuman;
    case "is_chatbot":
      return id.faqIsChatbot;
    case "vs_google_chatgpt":
      return id.faqVsGoogleChatgpt;
    case "makes_decisions":
      return id.faqMakesDecisions;
  }
}

export {
  getOperatorIntroduction,
  getShortOperatorIdentity,
  getBrandLocaleCopy,
  CANONICAL_BRAND_FACTS,
};
