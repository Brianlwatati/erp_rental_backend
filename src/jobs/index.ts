import { startDailyJobs, type DailyJob } from "./daily-job-runner";
import { expireEndedLeases } from "./lease-expiration.job";

const dailyJobs: DailyJob[] = [
  { name: "expire-ended-leases", run: expireEndedLeases },
];

export const startScheduledJobs = () => startDailyJobs(dailyJobs);
