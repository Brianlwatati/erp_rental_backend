# Production hardening notes

This version adds backend hardening while preserving the existing API shape.

## Security changes

- JWT access secret is required at startup; the service no longer starts with an empty signing secret.
- CORS is allowlisted through `CORS_ORIGIN` instead of allowing every origin.
- JSON/urlencoded request bodies are size-limited.
- Helmet remains enabled and `X-Powered-By` is disabled.
- Request IDs are generated and returned as `X-Request-Id`.
- Error responses include the request ID without exposing database/stack details.
- PostgreSQL errors such as invalid UUIDs, unique conflicts, foreign-key conflicts and constraint violations receive safe HTTP responses.
- Audit identity fields (`createdBy`, `issuedBy`) are taken from the authenticated token rather than trusted from the browser payload.
- Mutating routes now require their specific `create`, `update`, or `delete` permission instead of only the module's `view` permission.

## Reliability changes

- `/health` checks PostgreSQL.
- `/health/live` is a lightweight liveness endpoint.
- `/health/ready` returns `503` when PostgreSQL is unavailable.
- Payment allocation/reversal operations lock payment/invoice rows inside their transactions to reduce concurrent over-allocation races.
- Cross-company references for expenses and maintenance records are validated before writes.
- Invoice `dueDate` accepts the same ISO date string format used by the frontend/API.

## Production environment

Set at minimum:

```env
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_ISSUER=auth-service
JWT_AUDIENCE=auth-api
CORS_ORIGIN=https://your-frontend.example.com
TRUST_PROXY=true
```

Do not commit `.env` files. Use your hosting provider's secret/environment-variable store.

## Recommended next backend phase

The next architectural pass should add cursor/page pagination to every collection endpoint, consistent filtering/sorting, audit-log writes for mutations, automated tests for tenant isolation and financial transactions, and OpenAPI/Swagger documentation. These are intentionally separate from this hardening pass so the current frontend contract remains stable.
