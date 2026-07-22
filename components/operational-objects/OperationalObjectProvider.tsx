"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  OperationalObject,
  OperationalObjectDraft,
  OperationalObjectProvenance,
} from "@/lib/operational-objects/operational-object.types";
import {
  confirmOperationalObject,
  loadOperationalObjects,
  saveOperationalDraft,
} from "@/lib/operational-objects/operational-object-store";
import { interpretCommand, type CommandIntent } from "@/lib/operational-objects/command-interpreter";
import { routeOperationalObject, myWorkHrefForObject } from "@/lib/operational-objects/operational-object-routing";
import { resolveVoiceAction, type VoiceResolverContext } from "@/lib/voice/voice-action-resolver";
import { executeVoiceAction } from "@/lib/voice/execute-voice-action";
import { useTranslation } from "@/lib/i18n/use-translation";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";

type OperationalObjectContextValue = {
  readonly objects: readonly OperationalObject[];
  readonly composerOpen: boolean;
  readonly draft: OperationalObjectDraft | null;
  readonly inferredFields: readonly string[];
  readonly source: OperationalObjectProvenance["source"];
  readonly successMessage: string | null;
  readonly clarifyIntent: CommandIntent | null;
  refresh: () => void;
  openComposer: (
    draft: OperationalObjectDraft,
    inferredFields?: readonly string[],
    source?: OperationalObjectProvenance["source"],
  ) => void;
  closeComposer: () => void;
  updateDraft: (patch: Partial<OperationalObjectDraft>) => void;
  saveDraft: () => OperationalObject | null;
  confirmDraft: () => OperationalObject | null;
  submitCommand: (
    text: string,
    voiceContext: VoiceResolverContext,
    executeDeps: Parameters<typeof executeVoiceAction>[1],
    source?: OperationalObjectProvenance["source"],
    mode?: "full" | "creation_only",
  ) => boolean;
  dismissClarify: () => void;
  selectClarifyOption: (optionId: string) => void;
};

const OperationalObjectContext = createContext<OperationalObjectContextValue | null>(null);

export function useOperationalObjects(): OperationalObjectContextValue {
  const ctx = useContext(OperationalObjectContext);
  if (!ctx) {
    throw new Error("useOperationalObjects must be used within OperationalObjectProvider");
  }
  return ctx;
}

export function useOperationalObjectsOptional(): OperationalObjectContextValue | null {
  return useContext(OperationalObjectContext);
}

type OperationalObjectProviderProps = {
  readonly children: ReactNode;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
};

export default function OperationalObjectProvider({
  children,
  missionId = null,
  projectId = null,
}: OperationalObjectProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [objects, setObjects] = useState<OperationalObject[]>(() =>
    typeof window !== "undefined" ? loadOperationalObjects() : [],
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<OperationalObjectDraft | null>(null);
  const [inferredFields, setInferredFields] = useState<readonly string[]>([]);
  const [source, setSource] = useState<OperationalObjectProvenance["source"]>("manual");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clarifyIntent, setClarifyIntent] = useState<CommandIntent | null>(null);
  const [pendingCommand, setPendingCommand] = useState<string>("");

  const refresh = useCallback(() => {
    setObjects(loadOperationalObjects());
  }, []);

  useEffect(() => {
    const onStorage = () => setObjects(loadOperationalObjects());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("cbai-op-composer-open", composerOpen);
    return () => document.body.classList.remove("cbai-op-composer-open");
  }, [composerOpen]);

  const openComposer = useCallback(
    (
      nextDraft: OperationalObjectDraft,
      nextInferred: readonly string[] = [],
      nextSource: OperationalObjectProvenance["source"] = "manual",
    ) => {
      setDraft(nextDraft);
      setInferredFields(nextInferred);
      setSource(nextSource);
      setComposerOpen(true);
      setClarifyIntent(null);
      setSuccessMessage(null);
    },
    [],
  );

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setDraft(null);
    setInferredFields([]);
  }, []);

  const updateDraft = useCallback((patch: Partial<OperationalObjectDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const saveDraft = useCallback((): OperationalObject | null => {
    if (!draft) return null;
    const saved = saveOperationalDraft({ ...draft, status: "draft" });
    refresh();
    notifyMissionDataChanged("project");
    setSuccessMessage(t("operationalObject.draftSaved"));
    setDraft(saved);
    return saved;
  }, [draft, refresh, t]);

  const confirmDraft = useCallback((): OperationalObject | null => {
    if (!draft) return null;
    const confirmed = confirmOperationalObject(draft);
    refresh();
    setComposerOpen(false);
    setDraft(null);
    setSuccessMessage(t("operationalObject.createdSuccess"));
    const route = routeOperationalObject(confirmed);
    router.push(`${route.href}?from=${encodeURIComponent(confirmed.id)}`);
    return confirmed;
  }, [draft, refresh, router, t]);

  const submitCommand = useCallback(
    (
      text: string,
      voiceContext: VoiceResolverContext,
      executeDeps: Parameters<typeof executeVoiceAction>[1],
      commandSource: OperationalObjectProvenance["source"] = "typed_command",
      mode: "full" | "creation_only" = "full",
    ): boolean => {
      const intent = interpretCommand(text, voiceContext, {
        locale: language,
        pathname,
        missionId,
        projectId,
      });

      setPendingCommand(text);

      if (intent.kind === "open_composer") {
        openComposer(
          {
            ...intent.draft,
            provenance: {
              ...intent.draft.provenance,
              source: commandSource,
            },
          },
          intent.inferredFields,
          commandSource,
        );
        return true;
      }

      if (mode === "creation_only") return false;

      if (intent.kind === "navigate") {
        const message = executeVoiceAction(intent.proposal, executeDeps);
        if (message) setSuccessMessage(message);
        return true;
      }

      if (intent.kind === "search") {
        router.push(`/search?q=${encodeURIComponent(intent.query)}`);
        return true;
      }

      if (intent.kind === "clarify" || intent.kind === "ambiguous") {
        setClarifyIntent(intent);
        return true;
      }

      if (intent.kind === "informational") {
        setSuccessMessage(t(intent.messageKey));
        return true;
      }

      return false;
    },
    [language, missionId, openComposer, pathname, projectId, router, t],
  );

  const dismissClarify = useCallback(() => {
    setClarifyIntent(null);
    setPendingCommand("");
  }, []);

  const selectClarifyOption = useCallback(
    (optionId: string) => {
      const base = pendingCommand.trim();
      if (optionId === "create") {
        const intent = interpretCommand(
          base ? `create ${base}` : "create work plan",
          { relationshipFocus: null, operatorName: "", focusedEntityName: undefined },
          { locale: language, pathname, missionId, projectId },
        );
        if (intent.kind === "open_composer") {
          openComposer(intent.draft, intent.inferredFields, "typed_command");
        }
      } else if (optionId === "search") {
        router.push(`/search?q=${encodeURIComponent(base || "")}`);
      } else if (optionId === "navigate") {
        const proposal = resolveVoiceAction(base, {
          relationshipFocus: null,
          operatorName: "",
          focusedEntityName: undefined,
        });
        if (proposal.status === "known" && proposal.href) {
          router.push(proposal.href);
        }
      }
      setClarifyIntent(null);
    },
    [language, missionId, openComposer, pathname, pendingCommand, projectId, router],
  );

  const value = useMemo(
    () => ({
      objects,
      composerOpen,
      draft,
      inferredFields,
      source,
      successMessage,
      clarifyIntent,
      refresh,
      openComposer,
      closeComposer,
      updateDraft,
      saveDraft,
      confirmDraft,
      submitCommand,
      dismissClarify,
      selectClarifyOption,
    }),
    [
      objects,
      composerOpen,
      draft,
      inferredFields,
      source,
      successMessage,
      clarifyIntent,
      refresh,
      openComposer,
      closeComposer,
      updateDraft,
      saveDraft,
      confirmDraft,
      submitCommand,
      dismissClarify,
      selectClarifyOption,
    ],
  );

  return (
    <OperationalObjectContext.Provider value={value}>{children}</OperationalObjectContext.Provider>
  );
}

export { myWorkHrefForObject };
