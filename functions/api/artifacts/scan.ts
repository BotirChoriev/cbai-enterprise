/**
 * Cloudflare Pages Function — POST /api/artifacts/scan
 * Authenticated artifact owner -> private ClamAV scanner -> processor-owned result.
 */

import {
  handleArtifactScanRequest,
  type ArtifactScanProcessorEnv,
} from "../../../lib/artifact-workspace/artifact-scan-processor";

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
}) => Response | Promise<Response>;

export const onRequest: PagesFunction<ArtifactScanProcessorEnv> = (context) =>
  handleArtifactScanRequest(context.request, context.env);
