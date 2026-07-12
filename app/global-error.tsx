"use client";

import { useEffect } from "react";

/**
 * The last-resort boundary — only renders if the root layout itself fails, so unlike every other
 * system page it cannot assume Tailwind, fonts, or the router are available. Deliberately plain,
 * inline-styled HTML with a real, working link home — never a blank screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#050810",
          color: "#f4f4f5",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#22d3ee" }}>
          CBAI — Unexpected Error
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa", maxWidth: "28rem", lineHeight: 1.6 }}>
          The platform ran into a problem it couldn&apos;t recover from on this page. Nothing you&apos;ve
          saved was lost — it stays in this browser. Try again, or return home.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "2.5rem",
              padding: "0 1.25rem",
              borderRadius: "0.5rem",
              backgroundColor: "#f4f4f5",
              color: "#020617",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces the
              root layout on a crash there, so it must not assume next/link's router context works */}
          <a
            href="/"
            style={{
              minHeight: "2.5rem",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #3f3f46",
              color: "#22d3ee",
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
