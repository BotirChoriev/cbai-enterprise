import type { Metadata } from "next";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseReportBuilderClient from "@/components/reports/EnterpriseReportBuilderClient";

export const metadata: Metadata = {
  title: "Report builder",
  description: "Build enterprise reports from authorized device and organization stores.",
};

export default function ReportBuilderPage() {
  return (
    <OperatingPageShell title="Report builder" showOperator={false} missionContextVariant="compact">
      <EnterpriseReportBuilderClient />
    </OperatingPageShell>
  );
}
