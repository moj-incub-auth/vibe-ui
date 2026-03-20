import type { SearchRequest, SearchResponse } from "@/types/api";
import { getRuntimeConfig } from "@/lib/config";

export async function searchComponents(
  query: string
): Promise<SearchResponse> {
  const request: SearchRequest = {
    message: query,
  };

  // Get runtime config (reads from server-side env vars)
  const config = await getRuntimeConfig();
  const apiUrl = config.searchApiUrl;

  if (!apiUrl) {
    throw new Error("Search API URL not configured");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Search request failed");
  }

  return response.json();
}
