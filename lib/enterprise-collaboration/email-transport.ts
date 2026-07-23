/**
 * Abstract invitation email transport.
 * Never claims email was sent unless the transport returns delivered.
 */

export type InviteEmailPayload = {
  readonly toEmail: string;
  readonly organizationName: string;
  readonly inviterDisplayName: string;
  readonly role: string;
  readonly acceptUrl: string;
  readonly expiresAt: string;
};

export type InviteEmailResult =
  | { readonly status: "delivered"; readonly providerMessageId?: string }
  | { readonly status: "not_configured"; readonly message: string }
  | { readonly status: "failed"; readonly message: string };

export interface InviteEmailTransport {
  readonly id: string;
  sendInvitation(payload: InviteEmailPayload): Promise<InviteEmailResult>;
}

/** Default transport — honest no-op until RESEND/Pages Function is configured. */
export class UnconfiguredInviteEmailTransport implements InviteEmailTransport {
  readonly id = "unconfigured";
  async sendInvitation(_payload: InviteEmailPayload): Promise<InviteEmailResult> {
    return {
      status: "not_configured",
      message: "Email delivery not configured — invitation record is valid; use Preview copy-link.",
    };
  }
}

let transport: InviteEmailTransport = new UnconfiguredInviteEmailTransport();

export function setInviteEmailTransport(next: InviteEmailTransport): void {
  transport = next;
}

export function getInviteEmailTransport(): InviteEmailTransport {
  return transport;
}

export async function sendOrganizationInvitationEmail(
  payload: InviteEmailPayload,
): Promise<InviteEmailResult> {
  // Prefer same-origin Pages Function when available (Preview / Workers).
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/invite-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = (await res.json()) as InviteEmailResult;
        if (json?.status) return json;
      }
      if (res.status === 404 || res.status === 501) {
        return transport.sendInvitation(payload);
      }
    } catch {
      // fall through to local transport
    }
  }
  return transport.sendInvitation(payload);
}

export function buildInvitationAcceptUrl(rawToken: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "https://preview-voice-research-integ.cbai-enterprise.pages.dev");
  return `${base}/organization?invite=${encodeURIComponent(rawToken)}`;
}

export function isPreviewOrDevHost(hostname?: string): boolean {
  const host =
    hostname ?? (typeof window !== "undefined" ? window.location.hostname : "localhost");
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".pages.dev") ||
    host.includes("preview")
  );
}
