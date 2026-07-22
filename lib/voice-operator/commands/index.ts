/**
 * Voice Command Orchestrator — public API.
 *
 * Architecture decision (documented):
 * Prefer Realtime `execute_platform_action` tool calls when the model emits them (A),
 * but always validate and also resolve final user transcripts locally (B).
 * The local typed resolver is authoritative because model-generated arbitrary URLs
 * and mutation payloads must never execute. Tool calls and transcript paths share
 * the same platform-actions registry + policy + dedupe layer.
 */

export * from "@/lib/voice-operator/commands/voice-command-types";
export * from "@/lib/voice-operator/commands/voice-command-registry";
export * from "@/lib/voice-operator/commands/voice-command-parser";
export * from "@/lib/voice-operator/commands/voice-command-resolver";
export * from "@/lib/voice-operator/commands/voice-command-executor";
export * from "@/lib/voice-operator/commands/voice-command-policy";
export * from "@/lib/voice-operator/commands/voice-command-context";
