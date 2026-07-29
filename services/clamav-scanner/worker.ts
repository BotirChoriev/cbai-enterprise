import { Container } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

type ScannerEnv = {
  readonly CLAMAV_CONTAINER: DurableObjectNamespace<ClamAvContainer>;
  readonly SCANNER_TOKEN: string;
  readonly ALLOWED_DOWNLOAD_ORIGIN: string;
};

export class ClamAvContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";
  envVars = {
    SCANNER_TOKEN: env.SCANNER_TOKEN,
    ALLOWED_DOWNLOAD_ORIGIN: env.ALLOWED_DOWNLOAD_ORIGIN,
    MAX_SCAN_BYTES: "209715200",
  };
}

export default {
  async fetch(request: Request, runtimeEnv: ScannerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (
      !(
        (request.method === "GET" && url.pathname === "/healthz")
        || (request.method === "POST" && url.pathname === "/v1/scan-url")
      )
    ) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    const scanner = runtimeEnv.CLAMAV_CONTAINER.getByName("preview-primary");
    return scanner.fetch(request);
  },
};
