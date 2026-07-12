type EntityNotFoundNoticeProps = {
  requestedId: string;
  entityLabel: string;
  fallbackName: string;
};

/**
 * A real, honest notice for when a URL asks for a specific entity id that doesn't exist in the
 * registry — explains what happened, why, and what's shown instead, rather than silently
 * substituting a different profile with no explanation.
 */
export default function EntityNotFoundNotice({ requestedId, entityLabel, fallbackName }: EntityNotFoundNoticeProps) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
      We couldn&apos;t find a {entityLabel} matching &quot;{requestedId}&quot; — the link may be out of
      date. Showing {fallbackName} instead; use search or the list below to find the right one.
    </div>
  );
}
