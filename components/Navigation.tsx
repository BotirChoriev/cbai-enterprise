"use client";

import { useState } from "react";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "AI Capabilities", href: "#ai" },
  { label: "Features", href: "#features" },
  { label: "Enterprise", href: "#enterprise" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-zinc-50">
            CBAI{" "}
            <span className="font-normal text-zinc-400">Enterprise</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-50"
          >
            Sign in
          </a>
          <a
            href="#"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            Request Demo
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 md:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-zinc-800 px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-zinc-400 transition-colors hover:text-zinc-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4">
            <a
              href="#"
              className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-zinc-300"
            >
              Sign in
            </a>
            <a
              href="#"
              className="rounded-lg bg-sky-500 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Request Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
