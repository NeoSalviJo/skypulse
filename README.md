# SkyPulse

Weather dashboard monorepo: Vite React front end, Express API, shared API clients, OpenAPI, and database helpers.

## Quick start

```bash
pnpm install
```

Front end only:

```bash
pnpm run dev
```

API and web together (run the API first in one terminal or use `dev:all`):

```bash
pnpm run dev:all
```

Full typecheck and build:

```bash
pnpm run build
```

## Repo layout

- `artifacts/skypulse` – SkyPulse web app
- `artifacts/api-server` – Weather API service
- `lib/` – Shared packages (`api-client-react`, `api-spec`, `api-zod`, `db`)

## Author

NeoSalviJo  
GitHub: [github.com/NeoSalviJo](https://github.com/NeoSalviJo)
