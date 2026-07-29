import type { Metadata } from "next";
import OrganizationPageClient from "@/components/organization/OrganizationPageClient";
import DecisionJourneyHero from "@/components/experience/DecisionJourneyHero";

export const metadata: Metadata = {
  title: "Organization",
  description: "Organization workspace — membership, missions, and evidence context.",
};

export default function OrganizationPage() {
  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <DecisionJourneyHero
        variant="collaboration"
        experienceId="company-collaborative-intelligence-os"
        content={{
          en: {
            eyebrow: "Company Intelligence OS",
            title: "Turn an organization into a shared thinking system.",
            description:
              "Connect people, operating problems, verified evidence, human approvals, and continuous monitoring without handing decision authority to AI.",
            primary: "Configure company workspace",
            primaryHref: "#create-org-heading",
            core: "Company problem",
            nodes: [
              ["People", "Roles and accountable owners"],
              ["Evidence", "Verified shared context"],
              ["Scenarios", "Comparable operating paths"],
              ["Approval", "The authorized human decides"],
            ],
          },
          uz: {
            eyebrow: "Kompaniya Intelligence OS",
            title: "Tashkilotni umumiy fikrlash tizimiga aylantiring.",
            description:
              "Qaror vakolatini AI’ga bermasdan odamlar, operatsion muammolar, tekshirilgan dalillar, inson tasdig‘i va uzluksiz monitoringni bog‘lang.",
            primary: "Kompaniya ish maydonini sozlash",
            primaryHref: "#create-org-heading",
            core: "Kompaniya muammosi",
            nodes: [
              ["Odamlar", "Rol va javobgar egalar"],
              ["Dalillar", "Tekshirilgan umumiy kontekst"],
              ["Ssenariylar", "Taqqoslanadigan operatsion yo‘llar"],
              ["Tasdiq", "Vakolatli inson qaror beradi"],
            ],
          },
        }}
      />
      <OrganizationPageClient />
    </div>
  );
}
