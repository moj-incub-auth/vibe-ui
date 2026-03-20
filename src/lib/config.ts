// Runtime configuration that reads from server at startup
export interface RuntimeConfig {
  searchApiUrl: string;
  enableFilters: boolean;
}

let configCache: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch("/api/config", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch runtime config");
    }

    configCache = await response.json();
    return configCache!;
  } catch (error) {
    console.error("Error fetching runtime config:", error);
    // Fallback to build-time env vars if runtime config fails
    return {
      searchApiUrl: process.env.NEXT_PUBLIC_SEARCH_API_URL || "",
      enableFilters: process.env.NEXT_PUBLIC_ENABLE_FILTERS === "true",
    };
  }
}

// Reset cache (useful for testing or forcing a refresh)
export function resetConfigCache() {
  configCache = null;
}
