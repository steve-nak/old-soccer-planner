import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/api";

export const runtime = "nodejs";

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function GET() {
  const html = readFileSync(path.join(process.cwd(), "src/app/api/docs/api-docs.html"), "utf8");

  const response = new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });

  return addCorsHeaders(response);
}
