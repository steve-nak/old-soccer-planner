import { readFile } from "node:fs/promises";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function GET() {
  const html = await readFile(new URL("./api-docs.html", import.meta.url), "utf8");

  const response = new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });

  return addCorsHeaders(response);
}
