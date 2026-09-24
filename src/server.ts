import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/database";

const server = app.listen(env.port, () => {
  console.log(`Rental management API listening on port ${env.port} (${env.nodeEnv})`);
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 5_000;

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out; forcing exit.");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async (err?: Error) => {
    if (err) console.error("Error while closing HTTP server", err);
    try {
      await pool.end();
    } catch (poolErr) {
      console.error("Error while closing database pool", poolErr);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExit);
      process.exit();
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
