# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GOV Route Library - A component discovery and search tool for government design system components. Built with Next.js 16, TypeScript, and Tailwind CSS 4.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (default: http://localhost:3000)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No test framework configured yet.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint 9 with Next.js config
- **Package Manager**: npm

## Project Structure

```
src/
  app/              # App Router pages and layouts
    api/search/     # Search API route handler
    layout.tsx      # Root layout
    page.tsx        # Home page with search UI
    globals.css     # Global styles and Tailwind directives
  components/       # React components
    AISummary.tsx        # AI-generated summary display
    ComponentCard.tsx    # Component display card
    Filters.tsx          # Filter controls (feature flagged)
    SearchHeader.tsx     # Search header with gradient
  lib/              # Utility functions
    api.ts          # API client for search
  types/            # TypeScript type definitions
    api.ts          # API types (SearchRequest, SearchResponse, Component)
```

## Environment Variables

The application uses **runtime configuration** - environment variables are read when the server starts, not at build time. This means you can change configuration without rebuilding.

Copy `.env.example` to `.env.local` and configure:

### Runtime Variables (Read at Server Startup)

- **SEARCH_API_URL**: Backend search API URL
  - Leave empty to use built-in mock API at `/api/search`
  - Set to external URL (e.g., `https://api.example.gov.uk`) to use a different backend
  - Can be changed at runtime without rebuilding

- **ENABLE_FILTERS**: Feature flag for filters on results page
  - Set to `true` to enable the filters component
  - Set to `false` (default) to hide filters
  - Can be changed at runtime without rebuilding

### Docker Runtime Configuration

When running in Docker, set environment variables at container startup:

```bash
docker run -e SEARCH_API_URL=https://api.example.com -e ENABLE_FILTERS=true -p 3000:3000 app
```

Or in docker-compose.yml:

```yaml
environment:
  - SEARCH_API_URL=https://api.example.gov.uk
  - ENABLE_FILTERS=true
```

### Legacy Build-Time Variables

For backwards compatibility, `NEXT_PUBLIC_SEARCH_API_URL` and `NEXT_PUBLIC_ENABLE_FILTERS` are still supported but are embedded at build time. Use the new `SEARCH_API_URL` and `ENABLE_FILTERS` variables for runtime configuration.

## TypeScript Configuration

- **Path aliases**: `@/*` maps to `src/*`
- **Target**: ES2017
- **Module resolution**: bundler
- **Strict mode**: enabled
- Files use `.tsx` for components, `.ts` for utilities

## Styling Approach

- **Tailwind CSS 4**: Configured via PostCSS plugin
- **No Tailwind config file**: Using default Tailwind 4 setup with @tailwindcss/postcss
- **Fonts**: Geist Sans (primary) and Geist Mono, loaded via next/font/google
- Dark mode support is implemented via Tailwind's `dark:` variant

## Next.js Specifics

- **App Router**: All routes in `src/app/` directory
- **React 19**: Latest version with React Server Components
- **Image Optimization**: Use `next/image` for all images
- **Metadata**: Define in layout.tsx or page.tsx using Next.js Metadata API
- **Configuration**: next.config.ts for Next.js settings

## API Integration

### Search API Contract

The application expects a POST `/search` endpoint with:

**Request:**
```json
{
  "message": "Natural language query"
}
```

**Response:**
```json
{
  "message": "Response message",
  "components": [
    {
      "title": "Component name",
      "url": "Component URL",
      "description": "Description",
      "parent": "Design system name",
      "accessability": "AA/AAA",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp",
      "has_research": true/false,
      "views": 123
    }
  ]
}
```

Types defined in `src/types/api.ts`: `SearchRequest`, `SearchResponse`, `Component`

## Code Conventions

- Use named exports for components unless there's a specific reason for default export
- Server Components by default; add 'use client' directive only when needed
- TypeScript strict mode - all types must be explicit or inferrable
- CSS classes use Tailwind utility-first approach
