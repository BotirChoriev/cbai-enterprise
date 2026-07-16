import {
  EXPERIMENT_EXPECTED_METADATA_LABELS,
  listExpectedExperimentMetadataFields,
  listExperimentTypes,
} from "@/lib/research/experiments";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export default function ExperimentLayerOverview() {
  const experimentTypes = listExperimentTypes();
  const metadataFields = listExpectedExperimentMetadataFields();

  return (
    <div className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Experiments layer</p>
        <h3 className="text-base font-semibold text-zinc-100">Experiment records readiness</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Experiments are a core research evidence type. Experiment records and metadata are not
          connected yet — this section describes future integration only.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${cbaiGlassCard} p-4`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-teal-400/90">
            Supported future experiment types
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {experimentTypes.map((experimentType) => (
              <li
                key={experimentType}
                className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xs text-zinc-400"
              >
                {experimentType}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-600">Not connected yet — future integration.</p>
        </div>

        <div className={`${cbaiGlassCard} p-4`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-teal-400/90">
            Expected metadata
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {metadataFields.map((field) => (
              <li key={field} className="text-xs text-zinc-400">
                {EXPERIMENT_EXPECTED_METADATA_LABELS[field]}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-600">Metadata not available today.</p>
        </div>
      </div>
    </div>
  );
}
