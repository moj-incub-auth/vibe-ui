import { NextRequest, NextResponse } from "next/server";
import type { SearchRequest, SearchResponse, Component } from "@/types/api";

// Mock data for demonstration
const mockComponents: Component[] = [
  {
    title: "Search component",
    url: "https://design-system.service.gov.uk/components/search",
    description:
      "Use this component to help users search for information within your service.",
    parent: "GOV.UK Design System",
    category: "component",
    accessability: "AA",
    created_at: "2025-10-12T09:00:00",
    updated_at: "2026-03-15T11:30:00",
    has_research: true,
    views: 892,
  },
  {
    title: "Filter pattern",
    url: "https://design-system.service.gov.uk/patterns/filter",
    description:
      "Help users find what they're looking for by filtering results.",
    parent: "GOV.UK Design System",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-11-05T14:20:00",
    updated_at: "2026-02-20T10:15:00",
    has_research: true,
    views: 654,
  },
  {
    title: "Search results",
    url: "https://design.tax.service.gov.uk/patterns/search-results",
    description:
      "Display search results in a clear and accessible format for users.",
    parent: "HMRC Design Patterns",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-12-01T08:45:00",
    updated_at: "2026-03-10T16:00:00",
    has_research: true,
    views: 421,
  },
  {
    title: "Site search",
    url: "https://service-manual.nhs.uk/design-system/components/site-search",
    description:
      "Allow users to search across your entire service or website.",
    parent: "NHS Design System",
    category: "component",
    accessability: "AAA",
    created_at: "2025-09-18T11:30:00",
    updated_at: "2026-01-25T13:45:00",
    has_research: true,
    views: 738,
  },
  {
    title: "Autocomplete search",
    url: "https://design-system.service.gov.uk/components/autocomplete",
    description:
      "Help users complete their search query with suggestions as they type.",
    parent: "GOV.UK Design System",
    category: "component",
    accessability: "AA",
    created_at: "2025-11-20T09:15:00",
    updated_at: "2026-02-28T16:45:00",
    has_research: false,
    views: 567,
  },
  {
    title: "Advanced search form",
    url: "https://design.homeoffice.gov.uk/patterns/advanced-search",
    description:
      "Enable users to refine searches with multiple criteria and filters.",
    parent: "Home Office Design System",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-10-30T10:00:00",
    updated_at: "2026-03-05T14:30:00",
    has_research: false,
    views: 345,
  },
  {
    title: "Saved searches",
    url: "https://moj-design-system.herokuapp.com/patterns/saved-searches",
    description:
      "Let users save and reuse their search queries for future sessions.",
    parent: "Ministry of Justice Design System",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-12-10T13:20:00",
    updated_at: "2026-03-12T09:50:00",
    has_research: true,
    views: 289,
  },
  {
    title: "DWP benefits search",
    url: "https://design-system.dwp.gov.uk/patterns/benefits-search",
    description:
      "A search pattern for finding benefit entitlement information quickly.",
    parent: "DWP Design System",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-09-23T10:00:00",
    updated_at: "2026-02-22T10:10:00",
    has_research: true,
    views: 510,
  },
  {
    title: "NHS service navigation",
    url: "https://service-manual.nhs.uk/design-system/components/service-navigation",
    description:
      "A component for service-level navigation that prioritises key tasks.",
    parent: "NHS Design System",
    category: "component",
    accessability: "AAA",
    created_at: "2025-08-25T09:30:00",
    updated_at: "2026-03-01T12:40:00",
    has_research: true,
    views: 420,
  },
  {
    title: "Search analytics",
    url: "https://design.tax.service.gov.uk/patterns/search-analytics",
    description:
      "Track and analyze user search behavior to improve your service.",
    parent: "HMRC Design Patterns",
    category: "pattern",
    accessability: "AA",
    created_at: "2025-11-15T15:40:00",
    updated_at: "2026-02-18T11:25:00",
    has_research: false,
    views: 198,
  },
  {
    title: "Voice search",
    url: "https://design-system.service.gov.uk/patterns/voice-search",
    description:
      "Allow users to search using voice input for improved accessibility.",
    parent: "GOV.UK Design System",
    category: "pattern",
    accessability: "AAA",
    created_at: "2025-12-20T10:10:00",
    updated_at: "2026-03-08T15:20:00",
    has_research: false,
    views: 156,
  },
];

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Mock AI response - in production, this would call an AI service
    const response: SearchResponse = {
      message: body.message
        ? `Found ${mockComponents.length} reusable building blocks across government departments. The Ministry of Justice and HMRC both maintain mature implementations following GDS accessibility standards.`
        : "",
      components: mockComponents,
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
