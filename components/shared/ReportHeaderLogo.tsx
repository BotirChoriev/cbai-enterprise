import { CBAIMark, LOGO_ACCESSIBLE_NAME } from "@/components/brand/CBAILogo";

/**
 * Real CBAI brand presence on every report — printed output hides all normal chrome
 * (`.cbai-no-print` on Sidebar/Topbar; see app/globals.css), so a printed/exported report would
 * otherwise carry no CBAI identity at all. This is deliberately NOT `.cbai-no-print`: it sits
 * inside `.cbai-print-area`, so it appears both on screen and in the printed/PDF output.
 *
 * Uses plain `text-*` classes (not CBAILogo's gradient bg-clip-text wordmark) specifically so the
 * `print:` variant can switch it to solid black — a `background-image` gradient behind
 * `text-transparent` can't be overridden by a plain `print:text-black` class the way a real
 * `color` property can.
 */
export default function ReportHeaderLogo() {
  return (
    <div className="mb-3 flex items-center gap-2 print:mb-2" role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
      <CBAIMark size={22} id="cbai-report" />
      <span aria-hidden="true" className="text-sm font-bold tracking-tight text-teal-300 print:text-black">
        CBAI
      </span>
    </div>
  );
}
