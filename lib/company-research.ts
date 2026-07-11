/**
 * Company ↔ Research topic connection (Companies Intelligence mission).
 *
 * No real data model links a specific company to a specific research topic anywhere in this
 * platform (confirmed by audit — the Research Domain's organization types are disjoint stubs).
 * Rather than fabricate a sponsorship or institutional claim, this surfaces topics that share
 * real subject matter with a company's real, catalog industry classification — the same
 * curated-keyword pattern already used elsewhere in this codebase (lib/search-gateway.ts's
 * SEARCH_TOPICS). Every match is labeled "related by subject matter," never a claimed
 * partnership.
 */

import { companies, type Company } from "@/lib/companies";
import { RESEARCH_TOPICS, type ResearchTopic } from "@/lib/research/research-topics";

const INDUSTRY_KEYWORDS: Record<string, readonly string[]> = {
  Technology: ["technology", "computer", "software", "digital", "data privacy", "distributed systems"],
  "Consumer Electronics": ["electronics", "semiconductor", "hardware", "device", "materials"],
  Automotive: ["automotive", "vehicle", "transport", "battery", "energy storage"],
  "E-Commerce": ["logistics", "commerce", "data privacy", "digital", "cryptography"],
  "Artificial Intelligence": ["artificial intelligence", "ai safety", "machine learning", "algorithm", "interpretability"],
  Semiconductors: ["semiconductor", "materials science", "electronics", "hardware", "chip"],
};

export type CompanyResearchMatch = {
  topic: ResearchTopic;
  matchedKeyword: string;
};

function findMatchedKeyword(topic: ResearchTopic, keywords: readonly string[]): string | null {
  const haystack = `${topic.topicName} ${topic.domain} ${topic.description}`.toLowerCase();
  return keywords.find((keyword) => haystack.includes(keyword.toLowerCase())) ?? null;
}

/** Real research topics sharing subject matter with a company's real industry classification. */
export function getRelatedResearchTopics(company: Company): CompanyResearchMatch[] {
  const keywords = INDUSTRY_KEYWORDS[company.industry] ?? [];
  if (keywords.length === 0) return [];

  const matches: CompanyResearchMatch[] = [];
  for (const topic of RESEARCH_TOPICS) {
    const matchedKeyword = findMatchedKeyword(topic, keywords);
    if (matchedKeyword) {
      matches.push({ topic, matchedKeyword });
    }
  }
  return matches;
}

export type TopicCompanyMatch = {
  company: Company;
  matchedKeyword: string;
};

/** Reverse lookup — real companies sharing subject matter with a research topic, for the topic's own page. */
export function getRelatedCompaniesForTopic(topic: ResearchTopic): TopicCompanyMatch[] {
  const matches: TopicCompanyMatch[] = [];
  for (const company of companies) {
    const keywords = INDUSTRY_KEYWORDS[company.industry] ?? [];
    const matchedKeyword = findMatchedKeyword(topic, keywords);
    if (matchedKeyword) {
      matches.push({ company, matchedKeyword });
    }
  }
  return matches;
}
