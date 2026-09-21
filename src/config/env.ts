import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  apiPrefix: process.env.API_PREFIX ?? "/api/v1",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "",
  jwtIssuer: process.env.JWT_ISSUER ?? "auth-service",
  jwtAudience: process.env.JWT_AUDIENCE ?? "auth-api",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}
