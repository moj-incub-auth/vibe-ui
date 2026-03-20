import { NextResponse } from "next/server";

// Force dynamic rendering to read env vars at request time
export const dynamic = "force-dynamic";

export async function GET() {
  // Read server-side environment variables at runtime
  return NextResponse.json({
    searchApiUrl: process.env.SEARCH_API_URL || process.env.NEXT_PUBLIC_SEARCH_API_URL || "",
    enableFilters: (process.env.ENABLE_FILTERS || process.env.NEXT_PUBLIC_ENABLE_FILTERS) === "true",
  });
}
