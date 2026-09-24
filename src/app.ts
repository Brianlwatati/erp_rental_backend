import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { pool } from "./config/database";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { authenticate } from "./middleware/authenticate";
import { requestId } from "./middleware/request-id";

const app = express();

app.disable("x-powered-by");
if (env.trustProxy) app.set("trust proxy", 1);

app.use(requestId);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, mobile native clients, health probes) may
      // omit Origin entirely. Browser origins must be explicitly allowlisted.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: env.jsonBodyLimit }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || req.path === "/health/live",
  }),
);

app.get("/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, status: "ok", service: "rental-management-backend" });
  } catch (error) {
    next(error);
  }
});

app.get("/health/live", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ success: true, status: "ok" });
});

app.get("/health/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, status: "ready" });
  } catch {
    res.status(503).json({ success: false, status: "not_ready" });
  }
});

app.use(env.apiPrefix, authenticate, routes);
app.use(errorMiddleware);

export default app;
