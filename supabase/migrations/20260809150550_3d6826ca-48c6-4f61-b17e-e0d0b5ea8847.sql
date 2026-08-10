ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS next_followup_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS opportunity_label text,
  ADD COLUMN IF NOT EXISTS pipeline_status text;

ALTER TABLE public.lead_lists
  ADD COLUMN IF NOT EXISTS last_run_at timestamp with time zone;