"use client";

import LivingProblemHome from "@/components/platform/LivingProblemHome";

/**
 * CBAI Living Problem Canvas.
 * A human opens the situation first; contextual engines are suggested only
 * when the material and goal require them. No consequential action bypasses
 * the existing Operational Object human-confirmation composer.
 */
export default function PlatformHome() {
  return <LivingProblemHome />;
}
