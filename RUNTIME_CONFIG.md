# Runtime Configuration Guide

This application now supports **runtime environment variable configuration**, meaning you can change settings without rebuilding the application.

## How It Works

1. Environment variables are read from the server process when it starts
2. The `/api/config` endpoint exposes these values to the client
3. Client-side code fetches configuration at startup via `getRuntimeConfig()`

## Environment Variables

### `SEARCH_API_URL`
Backend search API endpoint. Leave empty to use built-in mock API.

```bash
SEARCH_API_URL=https://api.example.gov.uk
```

### `ENABLE_FILTERS`
Feature flag to show/hide filters on results page.

```bash
ENABLE_FILTERS=true
```

## Usage Examples

### Local Development

Create `.env.local`:
```bash
SEARCH_API_URL=https://my-api.example.com/search
ENABLE_FILTERS=true
```

Then start the server:
```bash
npm run dev
```

### Docker

#### Using docker run:
```bash
docker run \
  -e SEARCH_API_URL=https://api.example.com \
  -e ENABLE_FILTERS=true \
  -p 3000:3000 \
  your-image-name
```

#### Using docker-compose:
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SEARCH_API_URL=https://api.example.gov.uk
      - ENABLE_FILTERS=true
```

### Kubernetes

In your deployment YAML:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gov-route-library
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-image:latest
        env:
        - name: SEARCH_API_URL
          value: "https://api.example.gov.uk"
        - name: ENABLE_FILTERS
          value: "true"
```

Or using ConfigMap:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  SEARCH_API_URL: "https://api.example.gov.uk"
  ENABLE_FILTERS: "true"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gov-route-library
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - configMapRef:
            name: app-config
```

## Benefits

- **No rebuild required**: Change configuration by restarting the container
- **Environment-specific settings**: Use the same image across dev/staging/prod
- **Easy rollback**: Revert by changing env vars instead of rebuilding
- **Kubernetes-friendly**: Works with ConfigMaps and Secrets

## Migration from Build-Time Variables

If you're currently using `NEXT_PUBLIC_SEARCH_API_URL` or `NEXT_PUBLIC_ENABLE_FILTERS`:

1. Replace with `SEARCH_API_URL` and `ENABLE_FILTERS` respectively
2. Old variables still work for backwards compatibility
3. New variables take precedence if both are set

## Architecture

```
┌─────────────────┐
│  Server Process │
│  (Node.js)      │
│                 │
│  Reads env vars │
│  at startup     │
└────────┬────────┘
         │
         │ Serves
         ▼
┌─────────────────┐
│  /api/config    │
│  endpoint       │
└────────┬────────┘
         │
         │ Fetched by
         ▼
┌─────────────────┐
│  Client Code    │
│  (Browser)      │
│                 │
│  getRuntimeConfig()
└─────────────────┘
```

## Files Changed

- `src/app/api/config/route.ts` - New API endpoint for runtime config
- `src/lib/config.ts` - Runtime config client library
- `src/lib/api.ts` - Updated to use runtime config
- `src/app/page.tsx` - Updated to fetch config on mount
- `.env.example` - Updated with new variable names
- `Dockerfile` - Uses runtime variables
- `docker-compose.yml` - Example runtime config
- `CLAUDE.md` - Updated documentation
