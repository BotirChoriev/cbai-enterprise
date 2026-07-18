/** Europe PMC REST response (subset). */

export type EuropePmcResult = {
  readonly id?: string;
  readonly source?: string;
  readonly title?: string;
  readonly authorString?: string;
  readonly journalTitle?: string;
  readonly pubYear?: string;
  readonly doi?: string;
  readonly abstractText?: string;
};

export type EuropePmcSearchResponse = {
  readonly resultList?: { result?: readonly EuropePmcResult[] };
  readonly hitCount?: number;
};
