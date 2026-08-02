import type { HumanContext } from "@/lib/human-centered-workspace/contracts";
import type {
  HumanContextEvent,
  HumanContextRepository,
} from "@/lib/human-centered-workspace/context-repository";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const CONTEXT_KEY = "cbai-human-contexts-v1";
const EVENT_KEY = "cbai-human-context-events-v1";
const MAX_EVENTS_PER_CONTEXT = 100;

type ContextCollection = Record<string, HumanContext>;
type EventCollection = Record<string, HumanContextEvent[]>;

function browserAvailable(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!browserAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!browserAvailable()) return;
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(value));
}

export class DeviceLocalHumanContextRepository implements HumanContextRepository {
  read(contextId: string): HumanContext | null {
    const contexts = readJson<ContextCollection>(CONTEXT_KEY, {});
    return contexts[contextId] ?? null;
  }

  write(context: HumanContext, event: HumanContextEvent): void {
    const contexts = readJson<ContextCollection>(CONTEXT_KEY, {});
    const current = contexts[context.contextId];
    if (current && context.version <= current.version) {
      throw new Error(
        `Human context version must advance: ${context.contextId} is ${current.version}, received ${context.version}`,
      );
    }
    writeJson(CONTEXT_KEY, { ...contexts, [context.contextId]: context });

    const events = readJson<EventCollection>(EVENT_KEY, {});
    const contextEvents = [...(events[context.contextId] ?? []), event].slice(-MAX_EVENTS_PER_CONTEXT);
    writeJson(EVENT_KEY, { ...events, [context.contextId]: contextEvents });
  }

  readEvents(contextId: string): readonly HumanContextEvent[] {
    return readJson<EventCollection>(EVENT_KEY, {})[contextId] ?? [];
  }

  remove(contextId: string): void {
    const contexts = readJson<ContextCollection>(CONTEXT_KEY, {});
    const events = readJson<EventCollection>(EVENT_KEY, {});
    const { [contextId]: _removedContext, ...remainingContexts } = contexts;
    const { [contextId]: _removedEvents, ...remainingEvents } = events;
    void _removedContext;
    void _removedEvents;
    writeJson(CONTEXT_KEY, remainingContexts);
    writeJson(EVENT_KEY, remainingEvents);
  }
}

export const deviceLocalHumanContextRepository = new DeviceLocalHumanContextRepository();

