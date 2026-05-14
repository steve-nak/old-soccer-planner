import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

export async function GET() {
  const html = await readFile(new URL("./api-docs.html", import.meta.url), "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
