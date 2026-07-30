import type { Metadata } from "next";
import RootProviders from "@/components/platform/RootProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CBAI — Universal Intelligence Operating System",
    template: "%s — CBAI",
  },
  description:
    "CBAI connects evidence, measures change, and explains options and consequences across research, governance, and economics — so people and organizations can make informed, human decisions.",
  keywords: [
    "intelligence operating system",
    "evidence intelligence",
    "research intelligence",
    "governance intelligence",
    "economic intelligence",
    "decision support",
    "CBAI",
  ],
  openGraph: {
    title: "CBAI — Universal Intelligence Operating System",
    description:
      "Connects evidence, measures change, and explains options and consequences across research, governance, and economics. Humans decide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
