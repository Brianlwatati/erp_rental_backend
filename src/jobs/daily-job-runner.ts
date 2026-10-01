import { pool } from "../config/database";

export interface DailyJob {
  name: string;
  run: (runDate: string) => Promise<void>;
}

async function runDailyJob(job: DailyJob, runDate: string) {
  const client = await pool.connect();
  let lockAcquired = false;

  try {
    const lock = await client.query(
      "SELECT pg_try_advisory_lock(hashtext($1), hashtext($2)) AS acquired",
      [job.name, runDate],
    );
    lockAcquired = lock.rows[0].acquired;
    if (!lockAcquired) return;

    const priorRun = await client.query(
      "SELECT status FROM rental_job_runs WHERE job_name=$1 AND run_date=$2",
      [job.name, runDate],
    );
    if (priorRun.rows[0]?.status === "SUCCEEDED") return;

    await client.query(
      `INSERT INTO rental_job_runs(job_name, run_date, status, attempts, started_at)
       VALUES($1, $2, 'RUNNING', 1, NOW())
       ON CONFLICT (job_name, run_date) DO UPDATE SET
         status='RUNNING', attempts=rental_job_runs.attempts+1,
         started_at=NOW(), finished_at=NULL, error_message=NULL`,
      [job.name, runDate],
    );

    try {
      await job.run(runDate);
      await client.query(
        `UPDATE rental_job_runs SET status='SUCCEEDED', finished_at=NOW(), error_message=NULL
         WHERE job_name=$1 AND run_date=$2`,
        [job.name, runDate],
      );
    } catch (error) {
      await client.query(
        `UPDATE rental_job_runs SET status='FAILED', finished_at=NOW(), error_message=$3
         WHERE job_name=$1 AND run_date=$2`,
        [job.name, runDate, String(error).slice(0, 4000)],
      );
      throw error;
    }
  } finally {
    if (lockAcquired) {
      try {
        await client.query(
          "SELECT pg_advisory_unlock(hashtext($1), hashtext($2))",
          [job.name, runDate],
        );
      } catch (error) {
        console.error(
          `Failed to release daily job lock for ${job.name}`,
          error,
        );
      }
    }
    client.release();
  }
}

export function startDailyJobs(
  jobs: readonly DailyJob[],
  pollIntervalMs = 60_000,
) {
  let running: Promise<void> | undefined;

  const runDueJobs = async () => {
    const runDate = new Date().toISOString().slice(0, 10);
    for (const job of jobs) {
      try {
        await runDailyJob(job, runDate);
      } catch (error) {
        console.error(`Daily job ${job.name} failed for ${runDate}`, error);
      }
    }
  };

  const tick = () => {
    if (running) return;
    running = runDueJobs().finally(() => {
      running = undefined;
    });
  };

  tick();
  const timer = setInterval(tick, pollIntervalMs);
  timer.unref();

  return async () => {
    clearInterval(timer);
    await running;
  };
}
