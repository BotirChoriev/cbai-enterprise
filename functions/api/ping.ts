/** Health probe for Pages Functions deployment. */
type PagesFunction = (context: { request: Request }) => Response | Promise<Response>;

export const onRequest: PagesFunction = async () =>
  new Response(JSON.stringify({ ok: true, service: "cbai-preview-functions" }), {
    headers: { "content-type": "application/json" },
  });
