CREATE TABLE rental_job_runs (
  job_name VARCHAR(100) NOT NULL,
  run_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('RUNNING', 'SUCCEEDED', 'FAILED')),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  PRIMARY KEY (job_name, run_date)
);