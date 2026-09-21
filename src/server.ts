import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

const server = app.listen(env.port, () => {
  console.log(`Rental management API listening on port ${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(async (err?: Error) => {
    if (err) {
      console.error("Error while closing HTTP server", err);
      process.exitCode = 1;
    }
    try {
      await pool.end();
    } catch (poolErr) {
      console.error("Error while closing database pool", poolErr);
    }
    process.exit();
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
