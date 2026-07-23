/**
 * Cloudflare Pages Function — invitation email transport.
 * Returns not_configured when RESEND_API_KEY is absent. Never claims delivery falsely.
 */

type Env = {
  RESEND_API_KEY?: string;
  INVITE_EMAIL_FROM?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type PagesFunction<E> = (context: PagesContext & { env: E }) => Response | Promise<Response>;

type Payload = {
  toEmail?: string;
  organizationName?: string;
  inviterDisplayName?: string;
  role?: string;
  acceptUrl?: string;
  expiresAt?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: Payload;
  try {
    body = (await context.request.json()) as Payload;
  } catch {
    return Response.json({ status: "failed", message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.toEmail || !body.acceptUrl || !body.organizationName) {
    return Response.json({ status: "failed", message: "Missing invitation fields." }, { status: 400 });
  }

  const apiKey = context.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({
      status: "not_configured",
      message: "Email delivery not configured — invitation record is valid; use Preview copy-link.",
    });
  }

  const from = context.env.INVITE_EMAIL_FROM?.trim() || "CBAI <noreply@checkbalanceai.global>";
  const subject = `Invitation to join ${body.organizationName} on CBAI`;
  const text = [
    `${body.inviterDisplayName ?? "A teammate"} invited you to join ${body.organizationName} as ${body.role ?? "member"}.`,
    "",
    `Accept: ${body.acceptUrl}`,
    body.expiresAt ? `Expires: ${body.expiresAt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [body.toEmail],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return Response.json(
        {
          status: "failed",
          message: `Email provider error (${res.status}).`,
          detail: detail.slice(0, 200),
        },
        { status: 502 },
      );
    }
    const json = (await res.json()) as { id?: string };
    return Response.json({ status: "delivered", providerMessageId: json.id });
  } catch (error) {
    return Response.json(
      {
        status: "failed",
        message: error instanceof Error ? error.message : "Email send failed.",
      },
      { status: 502 },
    );
  }
};
