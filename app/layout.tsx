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
  title: "CBAI — Universal Intelligence Operating System",
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
