import { NextRequest } from "next/server";

import { getActiveMatchesPage } from "@/services/match-service";
import { createErrorResponse, createJsonResponse, parsePositiveInteger, requireApiUser } from "@/lib/api";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const pageSize = parsePositiveInteger(searchParams.get("pageSize"), 10);

  if (pageSize > 100) {
    return createErrorResponse("pageSize cannot be greater than 100.", 400);
  }

  const result = await getActiveMatchesPage(page, pageSize);

  return createJsonResponse({
    page: result.page,
    pageSize: result.pageSize,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
    items: result.items,
  });
}
