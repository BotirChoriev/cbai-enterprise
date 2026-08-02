import type { EventEnvelope, HumanContext } from "@/lib/human-centered-workspace/contracts";

export type HumanContextEvent = EventEnvelope<{
  readonly contextId: string;
  readonly contextVersion: number;
  readonly changedKeys: readonly string[];
}>;

export interface HumanContextRepository {
  read(contextId: string): HumanContext | null;
  write(context: HumanContext, event: HumanContextEvent): void;
  readEvents(contextId: string): readonly HumanContextEvent[];
  remove(contextId: string): void;
}

