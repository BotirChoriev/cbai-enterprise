import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CBAI Enterprise — AI Platform for Modern Organizations",
  description:
    "Secure, scalable enterprise AI infrastructure. Deploy agents, automate workflows, and govern AI across your organization with CBAI Enterprise.",
  keywords: [
    "enterprise AI",
    "AI platform",
    "agent orchestration",
    "AI gateway",
    "CBAI",
  ],
  openGraph: {
    title: "CBAI Enterprise — AI Platform for Modern Organizations",
    description:
      "Secure, scalable enterprise AI infrastructure for modern organizations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}
