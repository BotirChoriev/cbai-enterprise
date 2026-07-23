import type { EvidenceGapRecord } from "@/lib/evidence-gap";
import MissingSourceStatusCard from "@/components/enterprise/MissingSourceStatusCard";

type EvidenceGapCardProps = {
  gap: EvidenceGapRecord;
};

export default function EvidenceGapCard({ gap }: EvidenceGapCardProps) {
  return <MissingSourceStatusCard gap={gap} />;
}
