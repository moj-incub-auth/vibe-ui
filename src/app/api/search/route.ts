import { NextRequest, NextResponse } from "next/server";
import type { SearchRequest, SearchResponse, Component } from "@/types/api";

// Mock data for demonstration
const mockComponents: Component[] = [
  {
    title: "Service renewal notification",
    url: "https://design-system.service.gov.uk/components/service-renewal",
    description:
      "Use this component to help show users how to renew their service.",
    parent: "GOV.UK Design System",
    accessability: "AA",
    created_at: "2026-01-15T10:30:00",
    updated_at: "2026-03-10T14:20:00",
    has_research: true,
    views: 245,
  },
  {
    title: "Session expiry warning modal",
    url: "https://design-system.service.gov.uk/components/session-expiry",
    description:
      "Use this component to alert users when their session is about to expire.",
    parent: "GOV.UK Design System",
    accessability: "AA",
    created_at: "2025-11-20T09:15:00",
    updated_at: "2026-02-28T16:45:00",
    has_research: false,
    views: 412,
  },
  {
    title: "Timeout banner patterns",
    url: "https://design.tax.service.gov.uk/patterns/timeout-banner",
    description:
      "Use this component to show timeout warnings and session management.",
    parent: "HMRC Design Patterns",
    accessability: "AA",
    created_at: "2025-12-05T11:00:00",
    updated_at: "2026-03-01T10:30:00",
    has_research: false,
    views: 189,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Mock AI response - in production, this would call an AI service
    const response: SearchResponse = {
      message: `Found ${mockComponents.length} components relevant to: "${body.message}"`,
      components: mockComponents,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
