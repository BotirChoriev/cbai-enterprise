import type { Problem } from "@/lib/problems/problem.types";

export function buildProblemVoiceSummary(problem: Problem, locale: string): string {
  const brief = problem.briefs.find((item) => item.version === problem.currentBriefVersion);
  if (!brief) {
    return locale === "uz"
      ? "Muammo topildi, lekin tasdiqlangan Problem Brief mavjud emas."
      : "The Problem exists, but no confirmed Problem Brief is available.";
  }
  const supported = problem.claims.filter((claim) => claim.status === "supported").length;
  const disputed = problem.claims.filter((claim) => claim.status === "disputed").length;
  const openUnknowns = problem.unknownRegister.filter((item) => item.status === "open").length;
  const unresolved = problem.contradictions.filter((item) => item.status === "unresolved").length;

  if (locale === "uz") {
    return [
      `Muammo: ${brief.title}.`,
      `Problem Brief: ${brief.problemStatement}.`,
      `Claimlar: ${problem.claims.length} ta; tasdiqlangan dalil bilan qo'llab-quvvatlangan ${supported} ta; disputed ${disputed} ta.`,
      `Bog'langan Evidence Passportlar: ${problem.evidencePassportIds.length} ta.`,
      `Ochiq unknownlar: ${openUnknowns} ta. Yechilmagan contradictions: ${unresolved} ta.`,
      `Readiness holati: ${problem.readinessCheckpoint.status}. Yakuniy qaror insonniki.`,
    ].join(" ");
  }

  return [
    `Problem: ${brief.title}.`,
    `Problem Brief: ${brief.problemStatement}.`,
    `Claims: ${problem.claims.length}; supported by human-confirmed evidence: ${supported}; disputed: ${disputed}.`,
    `Linked Evidence Passports: ${problem.evidencePassportIds.length}.`,
    `Open unknowns: ${openUnknowns}. Unresolved contradictions: ${unresolved}.`,
    `Readiness: ${problem.readinessCheckpoint.status}. The final decision remains human.`,
  ].join(" ");
}
