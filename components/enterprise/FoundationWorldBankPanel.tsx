"use client";

import { useCallback, useEffect, useState } from "react";
import type { ValidatedObservation } from "@/lib/official-connector-foundation/types";
import type { MissingSourceFallback } from "@/lib/official-connector-foundation/types";
import {
  fetchWorldBankWdiForCountry,
  foundationWdiStore,
  getWorldBankRuntimeStatus,
  resetWorldBankRuntimeForTests,
} from "@/lib/official-connector-foundation/index";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";

type FoundationWdiResponse = {
  ok: boolean;
  connected?: boolean;
  connectionStatus?: string;
  observations?: ValidatedObservation[];
  fallback?: MissingSourceFallback;
  error?: string;
};

type Props = {
  entityId?: string;
};

export default function FoundationWorldBankPanel({ entityId = "usa" }: Props) {
  const [observations, setObservations] = useState<ValidatedObservation[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("planned");
  const [fallback, setFallback] = useState<MissingSourceFallback | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"api" | "browser-foundation">("api");

  const load = useCallback(
    async (refresh: boolean) => {
      setStatus("loading");
      setError(null);
      try {
        const params = new URLSearchParams({ entityId });
        if (refresh) params.set("refresh", "1");
        const response = await fetch(`/api/foundation-wdi?${params.toString()}`, {
          method: refresh ? "POST" : "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = (await response.json()) as FoundationWdiResponse;
          if (!data.ok) {
            setStatus("error");
            setError(data.error ?? "Foundation WDI request failed");
            return;
          }
          setObservations([...(data.observations ?? [])]);
          setConnectionStatus(data.connectionStatus ?? "planned");
          setFallback(data.fallback ?? null);
          setMode("api");
          setStatus("ready");
          return;
        }

        // Browser foundation path when Pages Function is unavailable — still uses foundation adapter.
        foundationWdiStore.clear();
        resetWorldBankRuntimeForTests();
        const result = await fetchWorldBankWdiForCountry(entityId);
        if (result.ok) {
          setObservations([...result.observations]);
          setConnectionStatus("connected");
          setFallback(null);
        } else {
          setObservations([]);
          setConnectionStatus(getWorldBankRuntimeStatus().status);
          setFallback(result.fallback);
        }
        setMode("browser-foundation");
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [entityId],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  return (
    <section className="space-y-4" aria-labelledby="foundation-wdi-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Official Connector Foundation</p>
          <h3 id="foundation-wdi-heading" className="mt-1 text-base font-semibold text-zinc-100">
            World Bank WDI
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            First live connector. Status stays Planned until a verified observation is retrieved.
            {mode === "browser-foundation" ? " Browser foundation path active." : null}
          </p>
        </div>
        <button type="button" className={cbaiBtnSecondary} onClick={() => void load(true)}>
          Refresh World Bank WDI
        </button>
      </div>

      <div className={`${cbaiGlassCard} px-4 py-3 text-sm text-zinc-400`}>
        Connector status:{" "}
        <span className="text-zinc-100">
          {connectionStatus === "connected" ? "Connected" : "Planned"}
        </span>
        {" · "}
        Unrelated connectors remain Planned.
      </div>

      {status === "loading" ? <p className="text-sm text-zinc-500">Retrieving World Bank WDI…</p> : null}
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}

      {observations.length === 0 && status === "ready" ? (
        <p className="text-sm text-zinc-500">
          {fallback
            ? `${fallback.status}: ${fallback.reason}`
            : "Missing / Planned / Awaiting official source — no verified WDI observation yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {observations.map((item) => (
            <li key={item.id} className={`${cbaiGlassCard} p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.indicatorName}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.entityLabel} · {item.referencePeriod} · {item.provenance.sourceName}
                  </p>
                </div>
                <p className="font-mono text-sm text-teal-300">
                  {typeof item.value === "number"
                    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(item.value)
                    : String(item.value)}{" "}
                  <span className="text-zinc-500">{item.unit}</span>
                </p>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Source</dt>
                  <dd>{item.provenance.sourceName}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Publication period</dt>
                  <dd>{item.referencePeriod}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Retrieved</dt>
                  <dd>{item.provenance.retrievedAt}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Last checked</dt>
                  <dd>{item.provenance.lastCheckedAt}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Freshness</dt>
                  <dd>{item.provenance.freshnessState}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider text-zinc-600">Confidence basis</dt>
                  <dd>
                    Official World Bank WDI API value with foundation provenance retained (
                    {item.provenance.verificationState}).
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="uppercase tracking-wider text-zinc-600">Official source URL</dt>
                  <dd className="truncate">
                    <a
                      href={item.provenance.datasetOrEndpoint}
                      className="text-teal-400 hover:text-teal-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.provenance.datasetOrEndpoint}
                    </a>
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
