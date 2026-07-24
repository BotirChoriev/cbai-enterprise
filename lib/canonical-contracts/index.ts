/**
 * Stage 1 canonical contracts — types, ownership, and adapter stubs only.
 * No store writes, migrations, or user-visible behavior.
 *
 * @see docs/architecture/product-census/stage-0/14-canonical-ownership-decisions.md
 * @see docs/architecture/product-census/stage-1/README.md
 */

export * from "@/lib/canonical-contracts/ownership";
export * from "@/lib/canonical-contracts/dependency-rules";
export * from "@/lib/canonical-contracts/identity";
export * from "@/lib/canonical-contracts/locale";
export * from "@/lib/canonical-contracts/actions";
export * from "@/lib/canonical-contracts/work-relationships";
export * from "@/lib/canonical-contracts/evidence";
export * from "@/lib/canonical-contracts/graph";
export * from "@/lib/canonical-contracts/trust";
export * from "@/lib/canonical-contracts/quarantine";
export * from "@/lib/canonical-contracts/adapters";
