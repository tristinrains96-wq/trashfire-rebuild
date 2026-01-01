-- Migration: Create jobs table for RunPod keyframe generation tracking
-- Run this SQL against your PostgreSQL database

CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR PRIMARY KEY,
    celery_task_id VARCHAR,
    runpod_job_id VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'pending',
    result_urls JSON,
    error_message VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_celery_task_id ON jobs(celery_task_id);
CREATE INDEX IF NOT EXISTS idx_jobs_runpod_job_id ON jobs(runpod_job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Add check constraint for status
ALTER TABLE jobs ADD CONSTRAINT check_status 
    CHECK (status IN ('pending', 'running', 'completed', 'failed'));

