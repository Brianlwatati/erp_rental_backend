import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const value = raw == null ? fallback : Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: positiveInt("PORT", 5000),
  apiPrefix: process.env.API_PREFIX?.trim() || "/api/v1",
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtIssuer: process.env.JWT_ISSUER?.trim() || "auth-service",
  jwtAudience: process.env.JWT_AUDIENCE?.trim() || "auth-api",
  corsOrigins,
  jsonBodyLimit: process.env.JSON_BODY_LIMIT?.trim() || "1mb",
  rateLimitWindowMs: positiveInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  rateLimitMax: positiveInt("RATE_LIMIT_MAX", 300),
  trustProxy: process.env.TRUST_PROXY === "true",
  dbPoolMax: positiveInt("DB_POOL_MAX", 10),
  dbConnectionTimeoutMs: positiveInt("DB_CONNECTION_TIMEOUT_MS", 10_000),
  dbIdleTimeoutMs: positiveInt("DB_IDLE_TIMEOUT_MS", 30_000),
};

if (env.isProduction && corsOrigins.includes("*")) {
  throw new Error("CORS_ORIGIN must not contain * in production");
}
