"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const suggestedPrompts = [
  {
    label: "Analyze a country",
    prompt: "Analyze the economic and political landscape of a target country for market entry.",
  },
  {
    label: "Build a business strategy",
    prompt: "Build a comprehensive business strategy based on our current market position and goals.",
  },
  {
    label: "Summarize documents",
    prompt: "Summarize the key findings from recently indexed documents in our knowledge base.",
  },
  {
    label: "Create an automation",
    prompt: "Design an automation workflow to streamline our recurring operational tasks.",
  },
  {
    label: "Explain dashboard data",
    prompt: "Explain the current dashboard metrics and highlight any anomalies or trends.",
  },
];

export default function CommandBox() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitted(true);
  }

  function handlePromptSelect(prompt: string) {
    setInput(prompt);
    setSubmitted(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="AI Command"
          description="Enter a command or select a suggested prompt"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSubmitted(false);
                }}
                placeholder="Ask CBAI anything — analyze data, route to agents, or orchestrate workflows..."
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePromptSelect(item.prompt)}
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-600">
                Commands are routed through the secure AI gateway
              </p>
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                Send Command
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="AI Response"
          description={
            submitted
              ? "Awaiting backend integration"
              : "Response will appear here"
          }
        />
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500">
                    Command received
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{input}</p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
                  <svg
                    className="h-5 w-5 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-400">
                  Agent processing...
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  AI response streaming will be enabled once the backend is
                  connected.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Submit a command to see the AI response here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
