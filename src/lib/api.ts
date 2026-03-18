import type { SearchRequest, SearchResponse } from "@/types/api";

// Get the search API URL from environment variable, default to local API
const getSearchApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SEARCH_API_URL;
  return envUrl || "/api/search";
};

export async function searchComponents(
  query: string
): Promise<SearchResponse> {
  const request: SearchRequest = {
    message: query,
  };

  const apiUrl = getSearchApiUrl();

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
