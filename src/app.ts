import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { authenticate } from "./middleware/authenticate";
const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/health", (_req, res) =>
  res.json({ success: true, service: "rental-management-backend" }),
);
app.use(env.apiPrefix, authenticate, routes);
app.use(errorMiddleware);
export default app;
